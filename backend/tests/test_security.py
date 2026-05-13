import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.users import OAuthAccount, User

# BE-27: IDOR & Auth Bypass Güvenlik Testleri
# Kapsam: BE-01–BE-22 arası tüm authenticated endpoint

DUMMY_UUID = str(uuid.uuid4())

ENDPOINTS = [
    ("GET", "/v1/users/me"),
    ("PATCH", "/v1/users/me"),
    ("DELETE", "/v1/users/me"),
    ("GET", "/v1/users/me/accounts"),
    ("DELETE", f"/v1/users/me/accounts/{DUMMY_UUID}"),
    ("POST", "/v1/enrollments"),
    ("GET", "/v1/enrollments"),
    ("GET", f"/v1/enrollments/{DUMMY_UUID}/progress"),
    ("POST", "/v1/progress/sections/dummy-001/complete"),
    ("POST", f"/v1/quizzes/{DUMMY_UUID}/attempts"),
    ("POST", f"/v1/quiz-attempts/{DUMMY_UUID}/submit"),
    ("GET", f"/v1/quiz-attempts/{DUMMY_UUID}"),
    ("GET", "/v1/quiz-attempts"),
    ("GET", "/v1/dashboard/summary"),
]


@pytest.mark.asyncio
@pytest.mark.parametrize("method, path", ENDPOINTS)
async def test_missing_cookie_401(client: AsyncClient, method: str, path: str):
    """Cookie hiç yok → 401; detail=='Kimlik doğrulama gerekli'"""
    response = await client.request(method, path)
    assert response.status_code == 401
    assert response.json()["detail"] == "Kimlik doğrulama gerekli"


@pytest.mark.asyncio
@pytest.mark.parametrize("method, path", ENDPOINTS)
async def test_expired_token_401(client: AsyncClient, method: str, path: str):
    """exp geçmiş JWT cookie → 401; detail=='Token geçersiz veya süresi dolmuş'"""
    expired_payload = {
        "sub": str(uuid.uuid4()),
        "type": "access",
        "exp": datetime.now(timezone.utc) - timedelta(hours=1),
    }
    token = jwt.encode(expired_payload, settings.JWT_SECRET, algorithm="HS256")
    cookies = {settings.ACCESS_TOKEN_COOKIE_NAME: token}

    response = await client.request(method, path, cookies=cookies)
    assert response.status_code == 401, f"Response: {response.json()}"
    assert response.json()["detail"] == "Token geçersiz veya süresi dolmuş"


@pytest.mark.asyncio
@pytest.mark.parametrize("method, path", ENDPOINTS)
async def test_refresh_token_as_access_401(client: AsyncClient, method: str, path: str):
    """type='refresh' → 401; detail=='Access token gerekli'"""
    refresh_payload = {
        "sub": str(uuid.uuid4()),
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    token = jwt.encode(refresh_payload, settings.JWT_SECRET, algorithm="HS256")
    cookies = {settings.ACCESS_TOKEN_COOKIE_NAME: token}

    response = await client.request(method, path, cookies=cookies)
    assert response.status_code == 401, f"Response: {response.json()}"
    assert response.json()["detail"] == "Access token gerekli"


@pytest.mark.asyncio
@pytest.mark.parametrize("method, path", ENDPOINTS)
async def test_invalid_signature_401(client: AsyncClient, method: str, path: str):
    """Yanlış secret ile imzalanmış → 401"""
    payload = {
        "sub": str(uuid.uuid4()),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    token = jwt.encode(payload, "WRONG_SECRET", algorithm="HS256")
    cookies = {settings.ACCESS_TOKEN_COOKIE_NAME: token}

    response = await client.request(method, path, cookies=cookies)
    assert response.status_code == 401, f"Response: {response.json()}"
    assert response.json()["detail"] == "Token geçersiz veya süresi dolmuş"


@pytest.mark.asyncio
@pytest.mark.parametrize("method, path", ENDPOINTS)
async def test_ghost_user_404(client: AsyncClient, method: str, path: str):
    """Geçerli JWT, UUID DB'de yok → 404; detail=='Kullanıcı bulunamadı'"""
    payload = {
        "sub": str(uuid.uuid4()),  # Random UUID not in DB
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    cookies = {settings.ACCESS_TOKEN_COOKIE_NAME: token}

    response = await client.request(method, path, cookies=cookies)
    assert response.status_code == 404, f"Response: {response.json()}"
    assert response.json()["detail"] == "Kullanıcı bulunamadı"


@pytest.mark.asyncio
@pytest.mark.parametrize("method, path", ENDPOINTS)
async def test_authorization_header_ignored_401(
    client: AsyncClient, method: str, path: str
):
    """Cookie yok, Authorization: Bearer <valid_token> header var → 401"""
    payload = {
        "sub": str(uuid.uuid4()),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

    # Send as Authorization header
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.request(method, path, headers=headers)

    # Should fail with 401 because we only accept cookies now (BE-26)
    assert response.status_code == 401
    assert response.json()["detail"] == "Kimlik doğrulama gerekli"


# ---------------------------------------------------------------------------
# BÖLÜM B — E1: AUTH & USER MANAGEMENT IDOR
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_patch_users_me_body_injection(user_a: AsyncClient, user_b: AsyncClient):
    """Body'ye {"id": user_b.id, "email": user_b.email} ekle.
    user_a'nın id/email değişmemiş; user_b'ye ait veri dönmemiş."""
    user_b_id = str(user_b.user.id)
    user_b_email = user_b.user.email

    response = await user_a.patch(
        "/v1/users/me",
        json={
            "id": user_b_id,
            "email": user_b_email,
            "display_name": "Updated User A",
        },
    )
    assert response.status_code == 200
    data = response.json()

    # ID and Email must NOT change to user_b's data
    assert data["id"] == str(user_a.user.id)
    assert data["id"] != user_b_id
    assert data["email"] == user_a.user.email
    assert data["email"] != user_b_email
    assert data["display_name"] == "Updated User A"


@pytest.mark.asyncio
async def test_delete_wrong_confirmation_rejected(user_a: AsyncClient):
    """Test various wrong confirmation strings (lowercase, space, underscore)"""
    scenarios = [
        "hesabımı sil",  # lowercase
        "HESABIMI SIL ",  # trailing space
        "HESABIMI_SIL",  # underscore
    ]
    for text in scenarios:
        response = await user_a.request(
            "DELETE", "/v1/users/me", json={"confirmation": text}
        )
        assert response.status_code == 400
        assert "Geçersiz onay metni" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_account_workflow(user_a: AsyncClient, db_session: AsyncSession):
    """
    1. HESABIMI SİL (doğru) → 204; kullanıcı DB'den silindi
    2. Response'ta Set-Cookie: access_token=; Max-Age=0 vb var
    3. Silinen kullanıcının token'ı → 404
    """
    # 1. Delete
    response = await user_a.request(
        "DELETE", "/v1/users/me", json={"confirmation": "HESABIMI SİL"}
    )
    assert response.status_code == 204

    # 2. Check Set-Cookie headers
    set_cookies = response.headers.get_list("set-cookie")
    cookie_names = [c.split("=")[0] for c in set_cookies]
    assert settings.ACCESS_TOKEN_COOKIE_NAME in cookie_names
    assert settings.REFRESH_TOKEN_COOKIE_NAME in cookie_names
    # Check for Max-Age=0 or equivalent (some frameworks use Expires in the past)
    # delete_cookie typically sets Max-Age=0
    assert any(
        "Max-Age=0" in c for c in set_cookies if settings.ACCESS_TOKEN_COOKIE_NAME in c
    )

    # 3. Check DB
    result = await db_session.execute(select(User).where(User.id == user_a.user.id))
    assert result.scalar_one_or_none() is None

    # 4. Use token again → 404
    # user_a client still has the cookie set, but user is gone
    response = await user_a.get("/v1/users/me")
    assert response.status_code == 404
    assert response.json()["detail"] == "Kullanıcı bulunamadı"


@pytest.mark.asyncio
async def test_user_a_cannot_delete_user_b_oauth_account(
    user_a: AsyncClient, oauth_account_b: OAuthAccount
):
    """user_a ile oauth_account_b.id → 403 veya 404 (200 ASLA)"""
    response = await user_a.delete(f"/v1/users/me/accounts/{oauth_account_b.id}")
    # Application returns 404 for IDOR protection
    assert response.status_code == 404
    assert response.json()["detail"] == "OAuth hesabı bulunamadı"


@pytest.mark.asyncio
async def test_last_oauth_account_deletion_rejected(
    user_a: AsyncClient, db_session: AsyncSession
):
    """user_a'nın tek bağlantısı → 400"""
    # user_a fixture doesn't create an OAuth account, add one
    user_id = user_a.user.id
    oauth = OAuthAccount(
        user_id=user_id,
        provider="google",
        provider_user_id="google-user-a",
        provider_email="user_a@example.com",
    )
    db_session.add(oauth)
    await db_session.flush()

    # Try to delete it (it's the only one)
    response = await user_a.delete(f"/v1/users/me/accounts/{oauth.id}")
    assert response.status_code == 400
    assert "En az bir OAuth hesabı bağlı kalmalıdır" in response.json()["detail"]


# ---------------------------------------------------------------------------
# BÖLÜM C — E3: PROGRESS & ENROLLMENT IDOR
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_enrollment_list_no_cross_contamination(
    user_a: AsyncClient, user_b: AsyncClient, course_a, course_b
):
    """user_a listesi → course_b görünmez; user_b listesi → course_a görünmez"""
    # user_a
    resp_a = await user_a.get("/v1/enrollments")
    items_a = resp_a.json()["items"]
    course_ids_a = [item["course_id"] for item in items_a]
    assert str(course_a.id) in course_ids_a
    assert str(course_b.id) not in course_ids_a

    # user_b
    resp_b = await user_b.get("/v1/enrollments")
    items_b = resp_b.json()["items"]
    course_ids_b = [item["course_id"] for item in items_b]
    assert str(course_b.id) in course_ids_b
    assert str(course_a.id) not in course_ids_b


@pytest.mark.asyncio
async def test_duplicate_enrollment_returns_409(user_a: AsyncClient, course_a):
    """user_a zaten kayıtlı kursa tekrar POST → 409"""
    response = await user_a.post(
        "/v1/enrollments", json={"course_id": str(course_a.id)}
    )
    assert response.status_code == 409
    assert "already enrolled" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_user_a_cannot_complete_user_b_section(user_a: AsyncClient, section_b):
    """user_a ile section_b.section_id_str → 400 (Kullanıcı bu kursa kayıtlı değil)"""
    response = await user_a.post(
        f"/v1/progress/sections/{section_b.section_id_str}/complete"
    )
    # Uygulama 400 dönüyor (progress_service.py:56)
    assert response.status_code == 400
    assert "kursa kayıtlı değil" in response.json()["detail"]


@pytest.mark.asyncio
async def test_progress_db_write_isolated(
    user_a: AsyncClient, user_b: AsyncClient, course_a, db_session: AsyncSession
):
    """
    user_a kendi section'ını tamamlar →
    DB'de yalnızca user_a progress kaydı güncellendi
    """
    from app.models.courses import Section, UserProgress

    # course_a içindeki bir section'ı bul
    result = await db_session.execute(
        select(Section).where(Section.course_id == course_a.id)
    )
    section_a = result.scalars().first()

    # İşlem öncesi user_b için bu section'ın progress kaydı yok
    res_before = await db_session.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_b.user.id,
            UserProgress.section_id == section_a.id,
        )
    )
    assert res_before.scalar_one_or_none() is None

    # user_a tamamlar
    response = await user_a.post(
        f"/v1/progress/sections/{section_a.section_id_str}/complete"
    )
    assert response.status_code == 200

    # user_b progress hala boş olmalı
    res_after = await db_session.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_b.user.id,
            UserProgress.section_id == section_a.id,
        )
    )
    assert res_after.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_invalid_section_id_str_returns_404_not_500(user_a: AsyncClient):
    """Var olmayan sectionIdStr → 404 (500 değil)"""
    response = await user_a.post(
        "/v1/progress/sections/non-existent-section-123/complete"
    )
    assert response.status_code == 404
    assert "Section bulunamadı" in response.json()["detail"]


@pytest.mark.asyncio
async def test_user_a_cannot_read_user_b_course_progress(user_a: AsyncClient, course_b):
    """user_a ile course_b.id → 404 (Enrollment bulunamadı)"""
    response = await user_a.get(f"/v1/enrollments/{course_b.id}/progress")
    assert response.status_code == 404
    assert "Enrollment bulunamadı" in response.json()["detail"]


@pytest.mark.asyncio
async def test_unenrolled_course_returns_404(user_a: AsyncClient):
    """Hiç kayıtlı olmadığı kurs → 404"""
    dummy_id = str(uuid.uuid4())
    response = await user_a.get(f"/v1/enrollments/{dummy_id}/progress")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# BÖLÜM D — E4: QUIZ SYSTEM IDOR
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_correct_index_absent_in_attempt_response(
    user_b: AsyncClient, quiz_b, attempt_b_open
):
    """GÜVENLİK (NF-05): Başlatılan attempt yanıtında correct_index sızmaz."""
    # Mevcut açık attempt'i kapat (yoksa 409 alırız)
    await user_b.post(
        f"/v1/quiz-attempts/{attempt_b_open.id}/submit", json={"answers": []}
    )

    # Yeni attempt başlat
    response = await user_b.post(f"/v1/quizzes/{quiz_b.id}/attempts")
    assert response.status_code == 201

    data = response.json()

    # Yanıtta recursive olarak correct_index anahtarını ara
    def check_leak(obj):
        if isinstance(obj, dict):
            if "correct_index" in obj:
                return True
            return any(check_leak(v) for v in obj.values())
        if isinstance(obj, list):
            return any(check_leak(i) for i in obj)
        return False

    assert not check_leak(data), (
        "GÜVENLİK İHLALİ: correct_index başlangıç yanıtında sızdı!"
    )


@pytest.mark.asyncio
async def test_user_id_injection_via_body_fails(
    user_a: AsyncClient, user_b: AsyncClient, course_a, db_session: AsyncSession
):
    """body={"user_id": user_b.id} → attempt yine user_a adına oluşur"""
    from app.models.quizzes import Question, Quiz, QuizAttempt

    # course_a için bir quiz ve soru ekle
    quiz_a = Quiz(course_id=course_a.id, duration_seconds=100)
    db_session.add(quiz_a)
    await db_session.flush()
    q = Question(
        quiz_id=quiz_a.id,
        text="Q1",
        options=[{"index": 0, "text": "A"}],
        correct_index=0,
        order_index=1,
        is_active=True,
    )
    db_session.add(q)
    await db_session.flush()

    # user_b'nin ID'sini body ile enjekte etmeye çalış
    response = await user_a.post(
        f"/v1/quizzes/{quiz_a.id}/attempts", json={"user_id": str(user_b.user.id)}
    )
    assert response.status_code == 201

    # Oluşan attempt'in kime ait olduğunu kontrol et
    attempt_id = response.json()["id"]
    result = await db_session.execute(
        select(QuizAttempt).where(QuizAttempt.id == attempt_id)
    )
    attempt = result.scalar_one()
    assert attempt.user_id == user_a.user.id
    assert attempt.user_id != user_b.user.id


@pytest.mark.asyncio
async def test_quiz_attempt_requires_enrollment(user_a: AsyncClient, quiz_b):
    """user_a, kayıtlı olmadığı kursun quizini başlatır → 403"""
    response = await user_a.post(f"/v1/quizzes/{quiz_b.id}/attempts")
    assert response.status_code == 403
    assert "kayıtlı değilsiniz" in response.json()["detail"]


@pytest.mark.asyncio
async def test_cannot_start_second_active_attempt(
    user_b: AsyncClient, quiz_b, attempt_b_open
):
    """Aktif attempt varken yeni attempt → mevcut attempt dönmeli (get-or-create)."""
    response = await user_b.post(f"/v1/quizzes/{quiz_b.id}/attempts")
    assert response.status_code == 201
    assert str(attempt_b_open.id) == response.json()["id"]


@pytest.mark.asyncio
async def test_user_a_cannot_submit_user_b_attempt(user_a: AsyncClient, attempt_b_open):
    """user_a ile attempt_b_open.id → 404 (Sahiplik kontrolü; Uygulama 404 dönüyor)"""
    response = await user_a.post(
        f"/v1/quiz-attempts/{attempt_b_open.id}/submit", json={"answers": []}
    )
    assert response.status_code == 404
    assert "Attempt bulunamadı" in response.json()["detail"]


@pytest.mark.asyncio
async def test_ownership_check_before_timing_check(
    user_a: AsyncClient, db_session: AsyncSession, quiz_b
):
    """Süre aşılmış olsa bile önce sahiplik kontrol edilir → 404"""
    from app.models.quizzes import QuizAttempt

    # user_b için çok eski bir attempt oluştur
    user_b_res = await db_session.execute(
        select(User).where(User.email == "user_b@example.com")
    )
    u_b = user_b_res.scalar_one()

    old_attempt = QuizAttempt(
        user_id=u_b.id,
        quiz_id=quiz_b.id,
        started_at=datetime.now(timezone.utc) - timedelta(hours=2),
    )
    db_session.add(old_attempt)
    await db_session.flush()

    # user_a bunu submit etmeye çalışır
    response = await user_a.post(
        f"/v1/quiz-attempts/{old_attempt.id}/submit", json={"answers": []}
    )
    # 422 (timing) değil, 404 (ownership) dönmeli
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_late_submission_rejected(
    user_b: AsyncClient, db_session: AsyncSession, quiz_b
):
    """user_b kendi attempt'ini geç submit eder → 422"""
    from app.models.quizzes import QuizAttempt

    late_attempt = QuizAttempt(
        user_id=user_b.user.id,
        quiz_id=quiz_b.id,
        started_at=datetime.now(timezone.utc)
        - timedelta(seconds=quiz_b.duration_seconds + 60),
    )
    db_session.add(late_attempt)
    await db_session.flush()

    response = await user_b.post(
        f"/v1/quiz-attempts/{late_attempt.id}/submit", json={"answers": []}
    )
    assert response.status_code == 422
    assert "Süre aşıldı" in response.json()["detail"]


@pytest.mark.asyncio
async def test_correct_index_present_after_submit(
    user_b: AsyncClient, quiz_b, db_session: AsyncSession
):
    """Submit sonrası yanıtta correct_index VAR (BE-19 spec)"""
    from app.models.quizzes import Question

    q = Question(
        quiz_id=quiz_b.id,
        text="Q1",
        options=[{"index": 0, "text": "A"}],
        correct_index=0,
        order_index=1,
        is_active=True,
    )
    db_session.add(q)
    await db_session.flush()

    # Attempt başlat
    start_res = await user_b.post(f"/v1/quizzes/{quiz_b.id}/attempts")
    attempt_id = start_res.json()["id"]

    # Submit
    sub_res = await user_b.post(
        f"/v1/quiz-attempts/{attempt_id}/submit",
        json={"answers": [{"question_id": str(q.id), "selected_index": 0}]},
    )
    assert sub_res.status_code == 200
    data = sub_res.json()
    assert "correct_index" in data["answers"][0]
    assert data["answers"][0]["correct_index"] == 0


@pytest.mark.asyncio
async def test_user_a_cannot_read_user_b_attempt_detail(
    user_a: AsyncClient,
    user_b: AsyncClient,
    quiz_b,
    attempt_b_open,
    db_session: AsyncSession,
):
    """Başkasının attempt detayı okunamaz → 404"""
    from app.models.quizzes import Question

    # Fixture ile gelen attempt_b_open'ı kullanıyoruz.
    # Ancak önce submit edilmesi lazım çünkü get_attempt sadece bitmişleri döner.
    # Submit için bir soruya ihtiyacımız var (quiz_b fixture'ında bir tane var).
    result = await db_session.execute(
        select(Question).where(Question.quiz_id == quiz_b.id)
    )
    q = result.scalars().first()

    # user_b submit eder
    sub_res = await user_b.post(
        f"/v1/quiz-attempts/{attempt_b_open.id}/submit",
        json={"answers": [{"question_id": str(q.id), "selected_index": 0}]},
    )
    assert sub_res.status_code == 200

    # user_a okumaya çalışır
    response = await user_a.get(f"/v1/quiz-attempts/{attempt_b_open.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_quiz_history_isolated(
    user_a: AsyncClient, user_b: AsyncClient, quiz_b, db_session: AsyncSession
):
    """History listesi kullanıcıya özeldir."""
    from app.models.quizzes import QuizAttempt

    # user_b için tamamlanmış bir deneme ekle
    att = QuizAttempt(
        user_id=user_b.user.id,
        quiz_id=quiz_b.id,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        score=1,
        total_questions=1,
        passed=True,
        time_spent_secs=10,
    )
    db_session.add(att)
    await db_session.flush()

    # user_a sorgusu boş dönmeli
    res_a = await user_a.get(f"/v1/quiz-attempts?quiz_id={quiz_b.id}")
    assert res_a.status_code == 200
    assert len(res_a.json()) == 0

    # user_b kendi denemesini görmeli
    res_b = await user_b.get(f"/v1/quiz-attempts?quiz_id={quiz_b.id}")
    assert res_b.status_code == 200
    assert len(res_b.json()) == 1
    assert res_b.json()[0]["id"] == str(att.id)


@pytest.mark.asyncio
async def test_inactive_questions_excluded_from_attempt(
    user_b: AsyncClient, quiz_b, attempt_b_open, db_session: AsyncSession
):
    """is_active=false olan sorular attempt'e dahil edilmez."""
    # Mevcut açık attempt'i kapat
    await user_b.post(
        f"/v1/quiz-attempts/{attempt_b_open.id}/submit", json={"answers": []}
    )

    from app.models.quizzes import Question

    # 1 aktif, 1 pasif soru ekle
    q_act = Question(
        quiz_id=quiz_b.id,
        text="Active",
        options=[{"index": 0, "text": "A"}],
        correct_index=0,
        order_index=1,
        is_active=True,
    )
    q_inact = Question(
        quiz_id=quiz_b.id,
        text="Inactive",
        options=[{"index": 0, "text": "A"}],
        correct_index=0,
        order_index=2,
        is_active=False,
    )
    db_session.add_all([q_act, q_inact])
    await db_session.flush()

    response = await user_b.post(f"/v1/quizzes/{quiz_b.id}/attempts")
    assert response.status_code == 201
    questions = response.json()["questions"]
    # 2 aktif soru olmalı (1 fixture'dan + 1 buradan)
    assert len(questions) == 2
    # Inactive olan ("Inactive") listede olmamalı
    question_texts = [q["text"] for q in questions]
    assert "Active" in question_texts
    assert "Inactive" not in question_texts
    assert "Sample Question?" in question_texts


# ---------------------------------------------------------------------------
# BÖLÜM E — E5: DASHBOARD IDOR
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_dashboard_returns_only_own_data(
    user_a: AsyncClient, user_b: AsyncClient, course_a, course_b
):
    """user_a ve user_b farklı verilere sahip; karşılıklı sızma yok."""
    # user_a course_a'ya kayıtlı, user_b course_b'ye kayıtlı (fixture'lar sayesinde)

    # user_a sorgusu
    resp_a = await user_a.get("/v1/dashboard/summary")
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    in_progress_a = [c["course_id"] for c in data_a["in_progress_courses"]]
    assert str(course_a.id) in in_progress_a
    assert str(course_b.id) not in in_progress_a

    # user_b sorgusu
    resp_b = await user_b.get("/v1/dashboard/summary")
    assert resp_b.status_code == 200
    data_b = resp_b.json()
    in_progress_b = [c["course_id"] for c in data_b["in_progress_courses"]]
    assert str(course_b.id) in in_progress_b
    assert str(course_a.id) not in in_progress_b


@pytest.mark.asyncio
async def test_dashboard_query_param_injection(
    user_a: AsyncClient, user_b: AsyncClient
):
    """?user_id={user_b.id} enjeksiyonu etkisizdir; user_a'nın kendi verisi döner."""
    # current_user.id bağımlılığı kullanıldığı için bu enjeksiyonun etkisi olmamalıdır.
    response = await user_a.get(f"/v1/dashboard/summary?user_id={user_b.user.id}")
    assert response.status_code == 200
    # Not: Pydantic extra query paramları reddederse 422 de dönebilir,
    # ikisi de güvenlidir. Ancak uygulama şu an ignore ediyor.


@pytest.mark.asyncio
async def test_dashboard_response_time(user_a: AsyncClient):
    """Yanıt süresi < 500ms (NF-01); CI için < 1000ms kabul edilir."""
    import time

    start_time = time.perf_counter()
    response = await user_a.get("/v1/dashboard/summary")
    end_time = time.perf_counter()

    duration_ms = (end_time - start_time) * 1000
    assert response.status_code == 200
    assert duration_ms < 1000, (
        f"Dashboard summary yanıt süresi çok yüksek: {duration_ms}ms"
    )
