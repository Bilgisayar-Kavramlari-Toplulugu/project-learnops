import uuid
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User
from app.schemas.quizzes import QuizAttemptDetail, QuizAttemptListItem
from app.services.quiz_service import (
    get_quiz_attempt_by_id,
    get_quiz_attempts_by_quiz_id,
)

router = APIRouter(tags=["quizzes"])


@router.get("/quiz-attempts/{attempt_id}", response_model=QuizAttemptDetail)
async def get_quiz_attempt(
    attempt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed information about a completed quiz attempt.
    """
    attempt = await get_quiz_attempt_by_id(db, attempt_id, current_user.id)
    return attempt


@router.get("/quiz-attempts", response_model=List[QuizAttemptListItem])
async def list_quiz_attempts(
    quiz_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the history of completed quiz attempts for a specific quiz.
    """
    attempts = await get_quiz_attempts_by_quiz_id(db, quiz_id, current_user.id)
    return attempts
