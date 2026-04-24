import asyncio
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.courses import Course, Enrollment
from app.models.quizzes import Question, Quiz, QuizAttempt
from app.models.users import User
from app.services.jwt_service import create_access_token


def _auth_cookies(user: User) -> dict:
    token = create_access_token(sub=str(user.id))
    return {"access_token": token}


@pytest.fixture
async def test_quiz(db_session: AsyncSession, test_course: Course) -> Quiz:
    """
    4 aktif + 1 pasif soru içeren quiz fixture'ı.
    4 soru ile randomization davranışı gözlemlenebilir.
    """
    quiz = Quiz(course_id=test_course.id, pass_threshold=0.7, duration_seconds=1200)
    db_session.add(quiz)
    await db_session.flush()

    questions = [
        Question(
            quiz_id=quiz.id,
            text="Python nedir?",
            options=[
                {"index": 0, "text": "Programlama dili"},
                {"index": 1, "text": "Yılan"},
                {"index": 2, "text": "Oyun"},
            ],
            correct_index=0,
            explanation="Python, yüksek seviyeli bir programlama dilidir.",
            order_index=1,
            is_active=True,
        ),
        Question(
            quiz_id=quiz.id,
            text="FastAPI hangi dilde yazılmıştır?",
            options=[
                {"index": 0, "text": "Go"},
                {"index": 1, "text": "Python"},
                {"index": 2, "text": "Rust"},
            ],
            correct_index=1,
            explanation="FastAPI Python ile yazılmış modern bir web framework'üdür.",
            order_index=2,
            is_active=True,
        ),
        Question(
            quiz_id=quiz.id,
            text="HTTP 404 ne anlama gelir?",
            options=[
                {"index": 0, "text": "Sunucu hatası"},
                {"index": 1, "text": "Bulunamadı"},
                {"index": 2, "text": "Yetkisiz"},
            ],
            correct_index=1,
            explanation="404 Not Found, kaynağın sunucuda bulunamadığını belirtir.",
            order_index=3,
            is_active=True,
        ),
        Question(
            quiz_id=quiz.id,
            text="SQL injection nedir?",
            options=[
                {"index": 0, "text": "Performans optimizasyonu"},
                {"index": 1, "text": "Güvenlik açığı"},
                {"index": 2, "text": "Veri sıkıştırma"},
            ],
            correct_index=1,
            explanation="SQL injection, zararlı kodun sorguya enjekte edilmesidir.",
            order_index=4,
            is_active=True,
        ),
        # Pasif soru — response'ta görünmemeli, total_questions'a sayılmamalı
        Question(
            quiz_id=quiz.id,
            text="Bu soru hatalı (pasif)",
            options=[
                {"index": 0, "text": "A"},
                {"index": 1, "text": "B"},
            ],
            correct_index=0,
            order_index=5,
            is_active=False,
        ),
    ]
    db_session.add_all(questions)
    await db_session.flush()
    return quiz


@pytest.mark.asyncio
async def test_create_quiz_attempt_quiz_not_found_returns_404(
    client: AsyncClient, test_user: User
):
    fake_uuid = uuid4()
    resp = await client.post(
        f"/v1/quizzes/{fake_uuid}/attempts", cookies=_auth_cookies(test_user)
    )
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Quiz bulunamadı"


@pytest.fixture
async def quiz_with_no_active_questions(
    db_session: AsyncSession, test_course: Course
) -> Quiz:
    """Tüm soruları pasif olan quiz fixture'ı."""
    quiz = Quiz(course_id=test_course.id, pass_threshold=0.7, duration_seconds=600)
    db_session.add(quiz)
    await db_session.flush()

    question = Question(
        quiz_id=quiz.id,
        text="Pasif soru",
        options=[{"index": 0, "text": "A"}, {"index": 1, "text": "B"}],
        correct_index=0,
        order_index=1,
        is_active=False,
    )
    db_session.add(question)
    await db_session.flush()
    return quiz


@pytest.mark.asyncio
async def test_create_quiz_attempt_no_active_questions_returns_400(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    quiz_with_no_active_questions: Quiz,
):
    enrollment = Enrollment(
        user_id=test_user.id, course_id=quiz_with_no_active_questions.course_id
    )
    db_session.add(enrollment)
    await db_session.commit()

    resp = await client.post(
        f"/v1/quizzes/{quiz_with_no_active_questions.id}/attempts",
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Bu quizde aktif soru bulunmuyor"


@pytest.mark.asyncio
async def test_create_quiz_attempt_no_enrollment_returns_403(
    client: AsyncClient, test_user: User, test_quiz: Quiz
):
    # User is not enrolled in the course
    resp = await client.post(
        f"/v1/quizzes/{test_quiz.id}/attempts", cookies=_auth_cookies(test_user)
    )
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Bu quiz için kursa kayıtlı değilsiniz"


@pytest.mark.asyncio
async def test_create_quiz_attempt_success_and_nf05_check(
    client: AsyncClient, db_session: AsyncSession, test_user: User, test_quiz: Quiz
):
    # 1. Enroll the user
    enrollment = Enrollment(user_id=test_user.id, course_id=test_quiz.course_id)
    db_session.add(enrollment)
    await db_session.commit()

    # 2. Start attempt
    resp = await client.post(
        f"/v1/quizzes/{test_quiz.id}/attempts", cookies=_auth_cookies(test_user)
    )
    assert resp.status_code == 201

    data = resp.json()
    assert data["quiz_id"] == str(test_quiz.id)
    assert "id" in data
    assert "started_at" in data
    assert "duration_seconds" in data
    assert data["duration_seconds"] == test_quiz.duration_seconds

    # 3. NF-05 Check: Ensure correct_index is NOT exposed
    questions = data["questions"]
    # 4 aktif soru var, 1 pasif soru response'ta olmamalı
    assert len(questions) == 4
    for q in questions:
        assert "correct_index" not in q
        assert "explanation" not in q
        assert "order_index" not in q  # also testing order_index removal
        for option in q["options"]:
            assert "correct_index" not in option

    # total_questions attempt oluşturulurken set edilmeli (snapshot davranışı)
    attempt_in_db = await db_session.scalar(
        select(QuizAttempt).where(QuizAttempt.quiz_id == test_quiz.id)
    )
    assert attempt_in_db is not None
    assert attempt_in_db.total_questions == 4  # 4 aktif soru, 1 pasif sayılmaz


@pytest.mark.asyncio
async def test_create_quiz_attempt_conflict_returns_409(
    client: AsyncClient, db_session: AsyncSession, test_user: User, test_quiz: Quiz
):
    # 1. Enroll the user
    enrollment = Enrollment(user_id=test_user.id, course_id=test_quiz.course_id)
    db_session.add(enrollment)
    await db_session.commit()

    # 2. Start first attempt
    resp1 = await client.post(
        f"/v1/quizzes/{test_quiz.id}/attempts", cookies=_auth_cookies(test_user)
    )
    assert resp1.status_code == 201

    # 3. Attempt to start another while first is unfinished
    resp2 = await client.post(
        f"/v1/quizzes/{test_quiz.id}/attempts", cookies=_auth_cookies(test_user)
    )
    assert resp2.status_code == 409
    assert resp2.json()["detail"] == "Zaten aktif bir attempt mevcut"


# ===========================================================================
# BE-19: POST /v1/quiz-attempts/{attempt_id}/submit
# ===========================================================================


@pytest.fixture
async def enrolled_attempt(
    db_session: AsyncSession, test_user: User, test_quiz: Quiz
) -> QuizAttempt:
    """Kayıtlı kullanıcı için aktif (submit edilmemiş) bir attempt fixture'ı."""
    enrollment = Enrollment(user_id=test_user.id, course_id=test_quiz.course_id)
    db_session.add(enrollment)
    await db_session.flush()

    # Aktif soru sayısını dinamik hesapla; test_quiz fixture'ı
    # değişirse bu da güncellenir
    active_qs_result = await db_session.execute(
        select(Question).where(
            Question.quiz_id == test_quiz.id,
            Question.is_active.is_(True),
        )
    )
    active_count = len(active_qs_result.scalars().all())

    attempt = QuizAttempt(
        user_id=test_user.id,
        quiz_id=test_quiz.id,
        started_at=datetime.now(timezone.utc),
        total_questions=active_count,
    )
    db_session.add(attempt)
    await db_session.commit()
    return attempt


@pytest.mark.asyncio
async def test_submit_attempt_not_found_returns_404(
    client: AsyncClient, test_user: User
):
    """Var olmayan attempt_id ile submit → 404."""
    fake_id = uuid4()
    resp = await client.post(
        f"/v1/quiz-attempts/{fake_id}/submit",
        json={"answers": []},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Attempt bulunamadı"


@pytest.mark.asyncio
async def test_submit_attempt_wrong_user_returns_404(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    enrolled_attempt: QuizAttempt,
):
    """Başka kullanıcının attempt'ini submit etmeye çalışmak → 404.
    Attempt varlığını sızdırmamak için 403 yerine 404 döndürülür
    (ownership sızıntısı kapatıldı).
    """
    other_user = User(
        email="other@example.com",
        display_name="Other User",
    )
    db_session.add(other_user)
    await db_session.commit()

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": []},
        cookies=_auth_cookies(other_user),
    )
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Attempt bulunamadı"


@pytest.mark.asyncio
async def test_submit_attempt_late_returns_422(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
):
    """Süre aşımı (duration_seconds + 30sn) → 422."""
    enrollment = Enrollment(user_id=test_user.id, course_id=test_quiz.course_id)
    db_session.add(enrollment)
    await db_session.flush()

    # started_at'i duration + 31sn öncesine ayarla
    late_started_at = datetime.now(timezone.utc) - timedelta(
        seconds=test_quiz.duration_seconds + 31
    )
    attempt = QuizAttempt(
        user_id=test_user.id,
        quiz_id=test_quiz.id,
        started_at=late_started_at,
        total_questions=4,
    )
    db_session.add(attempt)
    await db_session.commit()

    resp = await client.post(
        f"/v1/quiz-attempts/{attempt.id}/submit",
        json={"answers": []},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 422
    assert resp.json()["detail"] == "Süre aşıldı. Submission reddedildi."


@pytest.mark.asyncio
async def test_submit_attempt_already_submitted_returns_409(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
):
    """Zaten submit edilmiş attempt'i tekrar submit etmek → 409."""
    enrollment = Enrollment(user_id=test_user.id, course_id=test_quiz.course_id)
    db_session.add(enrollment)
    await db_session.flush()

    attempt = QuizAttempt(
        user_id=test_user.id,
        quiz_id=test_quiz.id,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),  # zaten tamamlanmış
        total_questions=4,
        score=2,
        passed=False,
        time_spent_secs=100,
    )
    db_session.add(attempt)
    await db_session.commit()

    resp = await client.post(
        f"/v1/quiz-attempts/{attempt.id}/submit",
        json={"answers": []},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 409
    assert resp.json()["detail"] == "Bu attempt zaten tamamlandı"


@pytest.mark.asyncio
async def test_submit_attempt_success_correct_index_revealed(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
):
    """
    Başarılı submit:
    - correct_index response'ta açılır (NF-05)
    - score, passed, time_spent_secs hesaplanır
    """
    # test_quiz'deki soruları getir
    questions_result = await db_session.execute(
        select(Question).where(
            Question.quiz_id == test_quiz.id, Question.is_active.is_(True)
        )
    )
    questions = questions_result.scalars().all()

    # Tüm soruları doğru cevapla
    answers = [
        {"question_id": str(q.id), "selected_index": q.correct_index} for q in questions
    ]

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": answers},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 200

    data = resp.json()
    assert data["score"] == len(questions)
    assert data["total_questions"] == len(questions)
    assert data["passed"] is True
    assert data["time_spent_secs"] >= 0

    # NF-05: correct_index submit sonrası açılmalı
    for answer in data["answers"]:
        assert "correct_index" in answer
        assert answer["is_correct"] is True


@pytest.mark.asyncio
async def test_submit_attempt_unanswered_questions_scored_as_wrong(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
):
    """
    Cevapsız sorular (selected_index=None) yanlış sayılır.
    4 sorudan hiçbiri cevaplanmazsa score=0 ve passed=False olmalı.
    """
    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": []},  # hiç cevap gönderilmedi
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 200

    data = resp.json()
    assert data["score"] == 0
    assert data["passed"] is False

    # Tüm cevaplar yanlış ve selected_index None olmalı
    for answer in data["answers"]:
        assert answer["selected_index"] is None
        assert answer["is_correct"] is False
        assert "correct_index" in answer  # NF-05: yine de açılır


@pytest.mark.asyncio
async def test_submit_partial_correct_passes_threshold(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
):
    """3/4 doğru (%75) → pass_threshold=0.7 ile passed=True olmalı."""
    questions_result = await db_session.execute(
        select(Question).where(
            Question.quiz_id == test_quiz.id, Question.is_active.is_(True)
        )
    )
    questions = questions_result.scalars().all()
    assert len(questions) == 4

    # İlk 3 soruyu doğru, 4. soruyu yanlış cevapla
    answers = [
        {"question_id": str(q.id), "selected_index": q.correct_index}
        for q in questions[:3]
    ] + [
        {
            "question_id": str(questions[3].id),
            "selected_index": (questions[3].correct_index + 1)
            % len(questions[3].options),
        }
    ]

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": answers},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 200

    data = resp.json()
    assert data["score"] == 3
    assert data["total_questions"] == 4
    assert data["passed"] is True


@pytest.mark.asyncio
async def test_submit_partial_correct_below_threshold(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
):
    """2/4 doğru (%50) → pass_threshold=0.7 ile passed=False olmalı."""
    questions_result = await db_session.execute(
        select(Question).where(
            Question.quiz_id == test_quiz.id, Question.is_active.is_(True)
        )
    )
    questions = questions_result.scalars().all()
    assert len(questions) == 4

    # İlk 2 soruyu doğru, son 2'yi yanlış cevapla
    answers = [
        {"question_id": str(q.id), "selected_index": q.correct_index}
        for q in questions[:2]
    ] + [
        {
            "question_id": str(q.id),
            "selected_index": (q.correct_index + 1) % len(q.options),
        }
        for q in questions[2:]
    ]

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": answers},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 200

    data = resp.json()
    assert data["score"] == 2
    assert data["total_questions"] == 4
    assert data["passed"] is False


@pytest.mark.asyncio
async def test_submit_duplicate_question_id_returns_400(
    client: AsyncClient,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
    db_session: AsyncSession,
):
    """Aynı question_id'yi iki kez göndermek → 400."""
    questions_result = await db_session.execute(
        select(Question).where(
            Question.quiz_id == test_quiz.id, Question.is_active.is_(True)
        )
    )
    questions = questions_result.scalars().all()
    first_qid = str(questions[0].id)

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={
            "answers": [
                {"question_id": first_qid, "selected_index": 0},
                {"question_id": first_qid, "selected_index": 1},  # duplicate
            ]
        },
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Aynı soru için birden fazla cevap gönderildi"


@pytest.mark.asyncio
async def test_submit_foreign_question_id_is_silently_ignored(
    client: AsyncClient,
    test_user: User,
    enrolled_attempt: QuizAttempt,
):
    """
    Bu quize ait olmayan question_id gönderildiğinde sessizce atlanır (400 dönmez).
    Yabancı cevap skora etki etmez; tüm gerçek sorular cevapsız sayılır → score=0.
    """
    foreign_qid = str(uuid4())

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": [{"question_id": foreign_qid, "selected_index": 0}]},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 200
    data = resp.json()
    # Yabancı soru görmezden gelinir; quizdeki gerçek sorular cevapsız → score=0
    assert data["score"] == 0
    assert data["passed"] is False


@pytest.mark.asyncio
async def test_submit_out_of_range_selected_index_returns_400(
    client: AsyncClient,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
    db_session: AsyncSession,
):
    """selected_index seçenek sayısının dışındaysa → 400."""
    questions_result = await db_session.execute(
        select(Question).where(
            Question.quiz_id == test_quiz.id, Question.is_active.is_(True)
        )
    )
    questions = questions_result.scalars().all()
    q = questions[0]
    out_of_range = len(q.options)  # 0-based, bu değer >= options sayısı → geçersiz

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": [{"question_id": str(q.id), "selected_index": out_of_range}]},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Geçersiz seçenek"


@pytest.mark.asyncio
async def test_submit_time_spent_secs_accuracy(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
):
    """time_spent_secs = submitted_at - started_at, ±1sn tolerans içinde olmalı."""
    enrollment = Enrollment(user_id=test_user.id, course_id=test_quiz.course_id)
    db_session.add(enrollment)
    await db_session.flush()

    expected_secs = 30
    known_started_at = datetime.now(timezone.utc) - timedelta(seconds=expected_secs)
    attempt = QuizAttempt(
        user_id=test_user.id,
        quiz_id=test_quiz.id,
        started_at=known_started_at,
        total_questions=4,
    )
    db_session.add(attempt)
    await db_session.commit()

    resp = await client.post(
        f"/v1/quiz-attempts/{attempt.id}/submit",
        json={"answers": []},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert abs(data["time_spent_secs"] - expected_secs) <= 1, (
        f"Beklenen ~{expected_secs}sn, alınan {data['time_spent_secs']}sn"
    )


@pytest.mark.asyncio
async def test_submit_attempt_after_unenrollment_still_succeeds(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
):
    """
    Enrollment iptal senaryosu (B1 — Seçenek 2, bilinçli tasarım kararı):
    Kullanıcı quiz başlattıktan sonra kursa kaydı silinse bile
    aktif attempt'ini submit edebilmelidir. Yarıda kalmış deneme olmasın.
    """
    # Enrollment'ı sil (kursu bırakma senaryosu)
    enrollment = await db_session.scalar(
        select(Enrollment).where(
            Enrollment.user_id == test_user.id,
            Enrollment.course_id == test_quiz.course_id,
        )
    )
    assert enrollment is not None
    await db_session.delete(enrollment)
    await db_session.commit()

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": []},
        cookies=_auth_cookies(test_user),
    )
    # Enrollment yokken bile submit kabul edilmeli
    assert resp.status_code == 200
    data = resp.json()
    assert data["score"] == 0
    assert data["passed"] is False


@pytest.mark.asyncio
async def test_submit_after_question_deactivation_uses_actual_count(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_quiz: Quiz,
    enrolled_attempt: QuizAttempt,
):
    """
    Attempt başladıktan sonra bir soru deaktive edilirse:
    - Submit kabul edilmeli (422 dönmemeli)
    - total_questions response'ta ve DB'de fiilen değerlendirilen
      soru sayısını göstermeli
    - Skor deaktive edilen soru olmadan hesaplanmalı
    """
    # test_quiz'deki aktif soruları getir (4 adet)
    questions_result = await db_session.execute(
        select(Question).where(
            Question.quiz_id == test_quiz.id,
            Question.is_active.is_(True),
        )
    )
    questions = questions_result.scalars().all()
    assert len(questions) == 4

    # attempt başladıktan sonra bir soruyu deaktive et
    deactivated_q = questions[3]
    deactivated_q.is_active = False
    await db_session.commit()

    # kalan 3 soruyu doğru cevapla
    answers = [
        {"question_id": str(q.id), "selected_index": q.correct_index}
        for q in questions[:3]
    ]

    resp = await client.post(
        f"/v1/quiz-attempts/{enrolled_attempt.id}/submit",
        json={"answers": answers},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 200

    data = resp.json()
    # Fiilen değerlendirilen soru sayısı 3 (deaktive olan hariç)
    assert data["score"] == 3
    assert data["total_questions"] == 3
    assert data["passed"] is True  # 3/3 = 1.0 >= 0.7

    # DB'deki total_questions da response ile tutarlı olmalı
    await db_session.refresh(enrolled_attempt)
    assert enrolled_attempt.total_questions == 3


@pytest.mark.skip(
    reason=(
        "Mevcut test infra dependency_override ile tüm request'lere AYNI db_session'ı "
        "sağlıyor; bu nedenle (1) asyncio.gather ile paralel HTTP istekleri "
        "AsyncSession'ı concurrent kullanır ve SQLAlchemy hatası atabilir, "
        "(2) with_for_update() aynı transaction içinde gerçek satır kilidi gibi "
        "davranmaz (SAVEPOINT izolasyonu nedeniyle). Gerçek race condition "
        "testi için request başına bağımsız session/connection veren integration "
        "test altyapısı gerekir. İdempotency (sıralı iki submit → 409) zaten "
        "test_submit_attempt_already_submitted_returns_409 ile kapsanıyor."
    )
)
@pytest.mark.asyncio
async def test_submit_attempt_concurrent_requests_only_one_succeeds(
    client: AsyncClient,
    test_user: User,
    enrolled_attempt: QuizAttempt,
):
    """
    Eş zamanlı submit (race condition) koruması:
    Aynı attempt için iki paralel submit gönderildiğinde, row-level lock
    (with_for_update) ve submitted_at idempotency kontrolü sayesinde
    yalnızca biri 200, diğeri 409 dönmelidir.
    """
    url = f"/v1/quiz-attempts/{enrolled_attempt.id}/submit"
    cookies = _auth_cookies(test_user)
    payload = {"answers": []}

    resp1, resp2 = await asyncio.gather(
        client.post(url, json=payload, cookies=cookies),
        client.post(url, json=payload, cookies=cookies),
    )

    statuses = sorted([resp1.status_code, resp2.status_code])
    assert statuses == [200, 409], (
        f"Beklenen [200, 409], alınan {statuses} "
        f"(resp1={resp1.status_code}, resp2={resp2.status_code})"
    )

    # Başarılı olan "tamamlandı", diğeri "zaten tamamlandı" mesajı dönmeli
    conflict_resp = resp1 if resp1.status_code == 409 else resp2
    assert conflict_resp.json()["detail"] == "Bu attempt zaten tamamlandı"
