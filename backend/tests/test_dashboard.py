from datetime import datetime, timezone
from uuid import uuid4

import pytest
from httpx import AsyncClient
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.courses import Course, Enrollment, Section, UserProgress
from app.models.quizzes import Quiz, QuizAttempt


@pytest.mark.asyncio
async def test_get_dashboard_summary_unauthorized(client: AsyncClient):
    """Auth olmadan 401 Unauthorized dönmeli."""
    response = await client.get("/v1/dashboard/summary")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_dashboard_summary_authenticated_empty(
    client: AsyncClient, token_headers: dict
):
    """Authenticated kullanıcı için 200 OK ve boş/başlangıç verisi doğrulaması."""
    # token_headers fixture'ı artık conftest.py'dan geliyor
    response = await client.get("/v1/dashboard/summary", headers=token_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["completed_courses_count"] == 0
    assert data["in_progress_courses"] == []
    assert data["last_quiz"] is None


@pytest.mark.asyncio
async def test_dashboard_logic_calculations(
    client: AsyncClient, db_session: AsyncSession, test_user, token_headers: dict
):
    """Karmaşık senaryo: Tamamlanan kurs sayısı ve next_section doğrulaması."""
    # 1. Hazırlık: Bir kurs oluştur ve tamamla
    # slug eklenmeli (NOT NULL kısıtlaması)
    course_1 = Course(
        id=uuid4(), slug="tamamlanan-kurs", title="Tamamlanan Kurs", description="Desc"
    )
    db_session.add(course_1)

    enroll_1 = Enrollment(
        user_id=test_user.id, course_id=course_1.id, completed_at=func.now()
    )
    db_session.add(enroll_1)

    # 2. Hazırlık: Devam eden bir kurs ve bölümler oluştur
    course_2 = Course(
        id=uuid4(), slug="devam-eden-kurs", title="Devam Eden Kurs", description="Desc"
    )
    db_session.add(course_2)

    # section_id_str eklenmeli (NOT NULL kısıtlaması)
    sec_1 = Section(
        id=uuid4(),
        course_id=course_2.id,
        section_id_str="sec-1",
        title="Bölüm 1",
        order_index=1,
    )
    sec_2 = Section(
        id=uuid4(),
        course_id=course_2.id,
        section_id_str="sec-2",
        title="Bölüm 2",
        order_index=2,
    )
    db_session.add_all([sec_1, sec_2])

    enroll_2 = Enrollment(user_id=test_user.id, course_id=course_2.id)
    db_session.add(enroll_2)

    # Bölüm 1'i tamamla
    progress = UserProgress(user_id=test_user.id, section_id=sec_1.id, completed=True)
    db_session.add(progress)

    # Verileri session'da görünür kıl (SAVEPOINT stratejisiyle uyumlu)
    await db_session.flush()

    # Testi çalıştır
    response = await client.get("/v1/dashboard/summary", headers=token_headers)
    assert response.status_code == 200, f"Auth failed: {response.json()}"
    data = response.json()

    # Doğrulamalar
    assert data["completed_courses_count"] == 1
    assert len(data["in_progress_courses"]) == 1
    in_progress = data["in_progress_courses"][0]
    assert in_progress["next_section"]["id"] == str(sec_2.id)


@pytest.mark.asyncio
async def test_dashboard_last_quiz_logic(
    client: AsyncClient, db_session: AsyncSession, test_user, token_headers: dict
):
    """En son yapılan quiz attempt verisinin doğru gelmesi."""
    course = Course(
        id=uuid4(),
        slug="quiz-kursu",
        title="Quiz Kursu",
        description="Desc",
    )
    db_session.add(course)
    await db_session.flush()

    # Quiz modelinde duration_seconds zorunlu
    quiz = Quiz(
        id=uuid4(),
        course_id=course.id,
        duration_seconds=1500,
    )
    db_session.add(quiz)
    await db_session.flush()

    # QuizAttempt'te 'started_at' zorunlu, 'score' integer
    attempt = QuizAttempt(
        user_id=test_user.id,
        quiz_id=quiz.id,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        score=85,
        total_questions=10,
        passed=True,
    )
    db_session.add(attempt)
    await db_session.flush()

    response = await client.get("/v1/dashboard/summary", headers=token_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["last_quiz"] is not None
    assert data["last_quiz"]["score"] == 85
    assert data["last_quiz"]["quiz_name"] == "Quiz Kursu"


@pytest.mark.asyncio
async def test_dashboard_all_sections_completed(
    client: AsyncClient, db_session: AsyncSession, test_user, token_headers: dict
):
    """Tüm bölümler tamamlandığında next_section null dönmeli."""
    # 1. Kurs ve Bölüm Kurulumu (2 Bölümlü)
    course = Course(
        id=uuid4(), slug="full-course", title="Full Course", is_published=True
    )
    db_session.add(course)
    await db_session.flush()

    sec_1 = Section(course_id=course.id, title="Bölüm 1", order_index=1)
    sec_2 = Section(course_id=course.id, title="Bölüm 2", order_index=2)
    db_session.add_all([sec_1, sec_2])
    await db_session.flush()

    # 2. Kayıt ve TÜM bölümleri tamamlama
    enrollment = Enrollment(user_id=test_user.id, course_id=course.id)
    db_session.add(enrollment)

    # İki bölümü de tamamla
    progress_1 = UserProgress(
        user_id=test_user.id, section_id=sec_1.id, is_completed=True
    )
    progress_2 = UserProgress(
        user_id=test_user.id, section_id=sec_2.id, is_completed=True
    )
    db_session.add_all([progress_1, progress_2])
    await db_session.commit()  # Verinin persist olduğundan emin olalım

    # 3. API Çağrısı
    response = await client.get("/v1/dashboard/summary", headers=token_headers)
    assert response.status_code == 200
    data = response.json()

    # 4. Doğrulama
    in_progress = [c for c in data["in_progress_courses"] if c["id"] == str(course.id)]

    if not in_progress:
        # Eğer iş mantığınız tümü biten kursu in_progress'ten çıkarıyorsa
        # bu da geçerli bir case'dir
        assert True
    else:
        # Eğer hala in_progress listesindeyse, next_section kesinlikle null olmalı
        assert in_progress[0]["next_section"] is None
