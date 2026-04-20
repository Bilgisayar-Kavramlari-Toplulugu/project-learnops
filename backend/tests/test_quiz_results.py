import uuid
from datetime import datetime, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user
from app.main import app
from app.models.courses import Course
from app.models.quizzes import QuizAttempt
from app.models.users import User

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
async def quiz_user(db_session: AsyncSession) -> User:
    user = User(
        email=f"quiz-user-{uuid.uuid4().hex[:6]}@example.com",
        display_name="Quiz Test User",
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest.fixture
async def other_user(db_session: AsyncSession) -> User:
    user = User(
        email=f"other-{uuid.uuid4().hex[:6]}@example.com",
        display_name="Other User",
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest.fixture
async def sample_quiz_id(db_session: AsyncSession) -> uuid.UUID:
    """Raw SQL is ONLY used here because the 'quizzes' table is missing 'updated_at'
    which BaseModel expects. This sidesteps the schema mismatch.
    """
    course = Course(
        slug=f"quiz-test-course-{uuid.uuid4().hex[:6]}",
        title="Quiz Test Course",
        is_published=True,
    )
    db_session.add(course)
    await db_session.flush()

    quiz_id = uuid.uuid4()
    await db_session.execute(
        text(
            """
            INSERT INTO quizzes (id, course_id, pass_threshold, duration_seconds)
            VALUES (:id, :c_id, 0.70, 1200)
            """
        ),
        {"id": str(quiz_id), "c_id": str(course.id)},
    )
    await db_session.flush()
    return quiz_id


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_quiz_attempt_not_found(client: AsyncClient, quiz_user: User):
    """Var olmayan attempt -> 404."""
    app.dependency_overrides[get_current_user] = lambda: quiz_user
    fake_id = uuid.uuid4()
    try:
        resp = await client.get(f"/v1/quiz-attempts/{fake_id}")
        assert resp.status_code == 404
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_quiz_attempt_forbidden(
    client: AsyncClient,
    db_session: AsyncSession,
    quiz_user: User,
    other_user: User,
    sample_quiz_id: uuid.UUID,
):
    """Başkasının attempt'ine erişim -> 403."""
    attempt = QuizAttempt(
        user_id=quiz_user.id,
        quiz_id=sample_quiz_id,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        score=10,
        total_questions=10,
        passed=True,
        time_spent_secs=100,
    )
    db_session.add(attempt)
    await db_session.flush()

    app.dependency_overrides[get_current_user] = lambda: other_user
    try:
        resp = await client.get(f"/v1/quiz-attempts/{attempt.id}")
        assert resp.status_code == 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_quiz_attempt_not_completed(
    client: AsyncClient,
    db_session: AsyncSession,
    quiz_user: User,
    sample_quiz_id: uuid.UUID,
):
    """Tamamlanmamış (submitted_at is Null) attempt -> 400."""
    attempt = QuizAttempt(
        user_id=quiz_user.id,
        quiz_id=sample_quiz_id,
        started_at=datetime.now(timezone.utc),
        submitted_at=None,
    )
    db_session.add(attempt)
    await db_session.flush()

    app.dependency_overrides[get_current_user] = lambda: quiz_user
    try:
        resp = await client.get(f"/v1/quiz-attempts/{attempt.id}")
        assert resp.status_code == 400
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_list_quiz_attempts_success(
    client: AsyncClient,
    db_session: AsyncSession,
    quiz_user: User,
    sample_quiz_id: uuid.UUID,
):
    """Kullanıcının tamamlanmış quiz geçmişini listeleme -> 200."""
    finished = QuizAttempt(
        user_id=quiz_user.id,
        quiz_id=sample_quiz_id,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        score=8,
        total_questions=10,
        passed=True,
        time_spent_secs=100,
    )
    unfinished = QuizAttempt(
        user_id=quiz_user.id,
        quiz_id=sample_quiz_id,
        started_at=datetime.now(timezone.utc),
        submitted_at=None,
    )
    db_session.add_all([finished, unfinished])
    await db_session.flush()

    app.dependency_overrides[get_current_user] = lambda: quiz_user
    try:
        resp = await client.get(f"/v1/quiz-attempts?quiz_id={sample_quiz_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == str(finished.id)
    finally:
        app.dependency_overrides.clear()
