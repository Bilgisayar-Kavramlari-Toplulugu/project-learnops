import random
from datetime import datetime, timezone
from typing import List, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.courses import Enrollment
from app.models.quizzes import Question, Quiz, QuizAttempt


async def create_quiz_attempt(
    db: AsyncSession,
    quiz_id: UUID,
    user_id: UUID,
) -> Tuple[QuizAttempt, List[Question], Quiz]:
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

    # 1.2. Eş zamanlı açık attempt kontrolü
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

    # 2. Yeni bir Attempt oluştur
    started_at = datetime.now(timezone.utc)
    attempt = QuizAttempt(user_id=user_id, quiz_id=quiz_id, started_at=started_at)
    db.add(attempt)
    await db.flush()  # attempt.id oluşması için

    # 3. Sadece aktif soruları al
    active_questions = [q for q in quiz.questions if q.is_active]

    # 4. Soruları rastgele sırala (Soru randomization)
    random.shuffle(active_questions)

    return attempt, active_questions, quiz
