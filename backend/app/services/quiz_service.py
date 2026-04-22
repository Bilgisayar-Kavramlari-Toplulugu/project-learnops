import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions.access_denied import AccessDeniedError
from app.exceptions.not_found import EntityNotFoundError
from app.exceptions.validation import ValidationError
from app.models.quizzes import QuizAttempt, QuizAttemptAnswer


async def get_quiz_attempt_by_id(
    db: AsyncSession, attempt_id: uuid.UUID, user_id: uuid.UUID
) -> QuizAttempt:
    """Gets a detailed quiz attempt."""
    stmt = (
        select(QuizAttempt)
        .options(
            selectinload(QuizAttempt.answers).selectinload(QuizAttemptAnswer.question)
        )
        .where(QuizAttempt.id == attempt_id)
    )
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if not attempt:
        raise EntityNotFoundError("Quiz attempt not found")

    if attempt.user_id != user_id:
        raise AccessDeniedError("You do not have access to this quiz attempt")

    if attempt.submitted_at is None:
        raise ValidationError("Quiz attempt is not completed yet")

    return attempt


async def get_quiz_attempts_by_quiz_id(
    db: AsyncSession, quiz_id: uuid.UUID, user_id: uuid.UUID, limit: int = 20
) -> Sequence[QuizAttempt]:
    """Gets all completed quiz attempts for a user on a specific quiz."""
    # TODO: Add cursor-based pagination when attempt counts grow significantly
    stmt = (
        select(QuizAttempt)
        .where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == user_id,
            QuizAttempt.submitted_at.is_not(None),
        )
        .order_by(QuizAttempt.started_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
