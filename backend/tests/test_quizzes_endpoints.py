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
