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
    client: AsyncClient, token_cookies: dict
):
    """Authenticated kullanıcı için 200 OK ve boş/başlangıç verisi doğrulaması."""
    response = await client.get("/v1/dashboard/summary", cookies=token_cookies)

    assert response.status_code == 200
    data = response.json()

    assert "display_name" in data
    assert "avatar_type" in data
    assert data["completed_course_count"] == 0
    assert data["in_progress_courses"] == []
    assert data["last_quiz_result"] is None


@pytest.mark.asyncio
async def test_dashboard_logic_calculations(
    client: AsyncClient, db_session: AsyncSession, test_user, token_cookies: dict
):
    """Devam eden kurs: slug, progress_percent ve last_section_id_str doğrulaması."""

    # 1. Tamamlanmış kurs
    course_1 = Course(
        id=uuid4(), slug="tamamlanan-kurs", title="Tamamlanan Kurs", description="Desc"
    )
    db_session.add(course_1)

    enroll_1 = Enrollment(
        user_id=test_user.id, course_id=course_1.id, completed_at=func.now()
    )
    db_session.add(enroll_1)

    # 2. Devam eden kurs
    course_2 = Course(
        id=uuid4(), slug="devam-eden-kurs", title="Devam Eden Kurs", description="Desc"
    )
    db_session.add(course_2)

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

    await db_session.flush()

    # Testi çalıştır
    response = await client.get("/v1/dashboard/summary", cookies=token_cookies)
    assert response.status_code == 200, f"Auth failed: {response.json()}"
    data = response.json()

    assert data["completed_course_count"] == 1
    assert len(data["in_progress_courses"]) == 1

    in_progress = data["in_progress_courses"][0]
    assert in_progress["slug"] == "devam-eden-kurs"
    assert isinstance(in_progress["progress_percent"], float)
    assert in_progress["last_section_id_str"] == "sec-2"
    assert in_progress["last_section_title"] == "Bölüm 2"


@pytest.mark.asyncio
async def test_dashboard_last_quiz_logic(
    client: AsyncClient, db_session: AsyncSession, test_user, token_cookies: dict
):
    """Son quiz sonucu — MVP §5.6 field isimleri doğrulaması."""
    course = Course(
        id=uuid4(),
        slug="quiz-kursu",
        title="Quiz Kursu",
        description="Desc",
    )
    db_session.add(course)
    await db_session.flush()

    quiz = Quiz(
        id=uuid4(),
        course_id=course.id,
        duration_seconds=1500,
    )
    db_session.add(quiz)
    await db_session.flush()

    attempt = QuizAttempt(
        user_id=test_user.id,
        quiz_id=quiz.id,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        score=8,
        total_questions=10,
        passed=True,
    )
    db_session.add(attempt)
    await db_session.flush()

    response = await client.get("/v1/dashboard/summary", cookies=token_cookies)
    assert response.status_code == 200
    data = response.json()

    assert data["last_quiz_result"] is not None
    result = data["last_quiz_result"]
    assert result["course_title"] == "Quiz Kursu"
    assert result["score"] == 8
    assert result["total"] == 10
    assert result["passed"] is True
    assert "quiz_id" in result
    assert "submitted_at" in result


@pytest.mark.asyncio
async def test_dashboard_all_sections_completed(
    client: AsyncClient, db_session: AsyncSession, test_user, token_cookies: dict
):
    """Tüm bölümler tamamlandığında last_section_id_str null dönmeli."""
    course = Course(
        id=uuid4(), slug="full-course", title="Full Course", is_published=True
    )
    db_session.add(course)
    await db_session.flush()

    sec_1 = Section(
        course_id=course.id, section_id_str="sec-1", title="B 1", order_index=1
    )
    sec_2 = Section(
        course_id=course.id, section_id_str="sec-2", title="B 2", order_index=2
    )
    db_session.add_all([sec_1, sec_2])
    await db_session.flush()

    enrollment = Enrollment(user_id=test_user.id, course_id=course.id)
    db_session.add(enrollment)

    p1 = UserProgress(user_id=test_user.id, section_id=sec_1.id, completed=True)
    p2 = UserProgress(user_id=test_user.id, section_id=sec_2.id, completed=True)
    db_session.add_all([p1, p2])
    await db_session.flush()

    # 4. API Çağrısı
    response = await client.get("/v1/dashboard/summary", cookies=token_cookies)
    assert response.status_code == 200
    data = response.json()

    target = next(
        (c for c in data["in_progress_courses"] if c["course_id"] == str(course.id)),
        None,
    )
    if target:
        assert target["last_section_id_str"] is None
        assert target["last_section_title"] is None
