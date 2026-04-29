import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

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
    response = await client.get("/v1/dashboard/summary", headers=token_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["completed_courses_count"] == 0
    assert data["in_progress_courses"] == []
    assert data["last_quiz"] is None  # Hiç attempt yoksa None dönmeli


@pytest.mark.asyncio
async def test_dashboard_logic_calculations(
    client: AsyncClient, db_session: AsyncSession, test_user, token_headers: dict
):
    """Karmaşık senaryo: Tamamlanan kurs sayısı ve next_section doğrulaması."""
    # 1. Hazırlık: Bir kurs oluştur ve tamamla
    course_1 = Course(id=uuid4(), title="Tamamlanan Kurs", description="Desc")
    db_session.add(course_1)
    enroll_1 = Enrollment(
        user_id=test_user.id, course_id=course_1.id, completed_at=func.now()
    )
    db_session.add(enroll_1)

    # 2. Hazırlık: Devam eden bir kurs ve bölümler oluştur
    course_2 = Course(id=uuid4(), title="Devam Eden Kurs", description="Desc")
    db_session.add(course_2)

    sec_1 = Section(id=uuid4(), course_id=course_2.id, title="Bölüm 1", order_index=1)
    sec_2 = Section(id=uuid4(), course_id=course_2.id, title="Bölüm 2", order_index=2)
    db_session.add_all([sec_1, sec_2])

    enroll_2 = Enrollment(user_id=test_user.id, course_id=course_2.id)
    db_session.add(enroll_2)

    # Bölüm 1'i tamamla (Next section Bölüm 2 olmalı)
    progress = UserProgress(user_id=test_user.id, section_id=sec_1.id, completed=True)
    db_session.add(progress)

    await db_session.commit()

    # Testi çalıştır
    response = await client.get("/v1/dashboard/summary", headers=token_headers)
    data = response.json()

    # Doğrulamalar
    assert data["completed_courses_count"] == 1
    assert len(data["in_progress_courses"]) == 1

    in_progress = data["in_progress_courses"][0]
    assert in_progress["course_id"] == str(course_2.id)
    # En küçük order_index'e sahip tamamlanmamış bölüm (Bölüm 2) gelmeli
    assert in_progress["next_section"]["id"] == str(sec_2.id)
    assert in_progress["next_section"]["order_index"] == 2


@pytest.mark.asyncio
async def test_dashboard_last_quiz_logic(
    client: AsyncClient, db_session: AsyncSession, test_user, token_headers: dict
):
    """En son yapılan quiz attempt verisinin doğru gelmesi."""
    course = Course(id=uuid4(), title="Quiz Kursu", description="Desc")
    quiz = Quiz(id=uuid4(), course_id=course.id, title="Final Quiz")
    db_session.add_all([course, quiz])

    # İki attempt ekle, sonuncusu daha yüksek puanlı ve daha yeni olsun
    attempt = QuizAttempt(
        user_id=test_user.id, quiz_id=quiz.id, score=85.0, submitted_at=func.now()
    )
    db_session.add(attempt)
    await db_session.commit()

    response = await client.get("/v1/dashboard/summary", headers=token_headers)
    data = response.json()

    assert data["last_quiz"] is not None
    assert data["last_quiz"]["score"] == 85.0
    assert data["last_quiz"]["quiz_name"] == "Quiz Kursu"
