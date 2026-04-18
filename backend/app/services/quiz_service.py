import logging
import random
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.courses import Enrollment
from app.models.quizzes import Question, Quiz, QuizAttempt

logger = logging.getLogger(__name__)


async def create_quiz_attempt(
    db: AsyncSession,
    quiz_id: UUID,
    user_id: UUID,
) -> tuple[QuizAttempt, list[Question], Quiz]:
    """
    Kullanıcı için yeni bir quiz denemesi oluşturur.
    Soruları rastgele sıralar.
    """
    # 1. Quiz'i sorularıyla birlikte getir
    query = select(Quiz).options(selectinload(Quiz.questions)).where(Quiz.id == quiz_id)
    quiz = await db.scalar(query)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz bulunamadı"
        )

    # 1.1. Enrollment kontrolü
    enrollment_check = await db.scalar(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_id == quiz.course_id,
        )
    )
    if not enrollment_check:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu quiz için kursa kayıtlı değilsiniz",
        )

    # 1.2. Eş zamanlı açık attempt kontrolü (fast-fail; DB index de korur)
    existing = await db.scalar(
        select(QuizAttempt).where(
            QuizAttempt.user_id == user_id,
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.submitted_at.is_(None),
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Zaten aktif bir attempt mevcut",
        )

    # 2. Sadece aktif soruları al — attempt oluşturmadan önce (Bulgu #2, #3)
    active_questions = [q for q in quiz.questions if q.is_active]

    if not active_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu quizde aktif soru bulunmuyor",
        )

    # 3. Yeni bir Attempt oluştur — total_questions snapshot olarak kaydedilir
    started_at = datetime.now(timezone.utc)
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
        started_at=started_at,
        total_questions=len(active_questions),
    )
    db.add(attempt)

    try:
        await db.flush()  # attempt.id oluşması + unique index kontrolü için
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Zaten aktif bir attempt mevcut",
        )

    # 4. Soruları rastgele sırala — thread-safe Random instance ile
    rng = random.Random()
    rng.shuffle(active_questions)

    logger.info(
        "Quiz attempt oluşturuldu: user_id=%s quiz_id=%s attempt_id=%s questions=%d",
        user_id,
        quiz_id,
        attempt.id,
        len(active_questions),
    )

    return attempt, active_questions, quiz
