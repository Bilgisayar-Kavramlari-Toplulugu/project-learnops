import uuid
from datetime import datetime, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user
from app.main import app
from app.models.courses import Course
from app.models.quizzes import Quiz, QuizAttempt
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
    course = Course(
        slug=f"quiz-test-course-{uuid.uuid4().hex[:6]}",
        title="Quiz Test Course",
        is_published=True,
    )
    db_session.add(course)
    await db_session.flush()

    quiz = Quiz(
        id=uuid.uuid4(),
        course_id=course.id,
        pass_threshold=0.70,
        duration_seconds=1200,
    )
    db_session.add(quiz)
    await db_session.flush()
    return quiz.id


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
    """Başkasının attempt'ine erişim -> 404 (IDOR koruması)."""
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
        assert resp.status_code == 404
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
async def test_get_quiz_attempt_success(
    client: AsyncClient,
    db_session: AsyncSession,
    quiz_user: User,
    sample_quiz_id: uuid.UUID,
):
    """Geçerli bir attempt istendiğinde 200 döner ve içerik doğru serialize edilir."""
    from app.models.quizzes import Question, QuizAttemptAnswer

    question = Question(
        quiz_id=sample_quiz_id,
        text="Test Soru",
        options=[{"index": 0, "text": "A"}, {"index": 1, "text": "B"}],
        correct_index=0,
        order_index=1,
    )
    db_session.add(question)
    await db_session.flush()

    attempt = QuizAttempt(
        user_id=quiz_user.id,
        quiz_id=sample_quiz_id,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        score=1,
        total_questions=1,
        passed=True,
        time_spent_secs=10,
    )
    db_session.add(attempt)
    await db_session.flush()

    answer = QuizAttemptAnswer(
        attempt_id=attempt.id,
        question_id=question.id,
        selected_index=0,
        is_correct=True,
    )
    db_session.add(answer)
    await db_session.flush()

    app.dependency_overrides[get_current_user] = lambda: quiz_user
    try:
        resp = await client.get(f"/v1/quiz-attempts/{attempt.id}")
        assert resp.status_code == 200

        data = resp.json()
        assert data["id"] == str(attempt.id)
        assert data["score"] == 1
        assert data["passed"] is True

        assert "answers" in data
        assert len(data["answers"]) == 1

        ans = data["answers"][0]
        assert ans["is_correct"] is True
        assert ans["selected_index"] == 0
        assert ans["question"]["text"] == "Test Soru"
        assert ans["question"]["correct_index"] == 0
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
