import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.courses import Course, Enrollment
from app.models.quizzes import Question, Quiz
from app.models.users import User
from app.services.jwt_service import create_access_token


def _auth_cookies(user: User) -> dict:
    token = create_access_token(sub=str(user.id))
    return {"access_token": token}


@pytest.fixture
async def test_quiz(db_session: AsyncSession, test_course: Course) -> Quiz:
    quiz = Quiz(course_id=test_course.id, pass_threshold=0.7, duration_seconds=1200)
    db_session.add(quiz)
    await db_session.flush()

    question = Question(
        quiz_id=quiz.id,
        text="Python nedir?",
        options=[
            {"index": 0, "text": "Programlama dili"},
            {"index": 1, "text": "Yılan"},
            {"index": 2, "text": "Oyun"},
        ],
        correct_index=0,
        order_index=1,
        is_active=True,
    )
    db_session.add(question)
    await db_session.flush()
    return quiz


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
    assert len(questions) == 1
    for q in questions:
        assert "correct_index" not in q
        assert "explanation" not in q
        assert "order_index" not in q  # also testing order_index removal
        for option in q["options"]:
            assert "correct_index" not in option


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
