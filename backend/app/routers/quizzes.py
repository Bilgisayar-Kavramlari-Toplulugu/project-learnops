from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions.access_denied import AccessDeniedError
from app.exceptions.not_found import EntityNotFoundError
from app.exceptions.validation import ValidationError
from app.models.users import User
from app.schemas.quizzes import QuizAttemptDetail, QuizAttemptListItem
from app.services.quiz_service import (
    get_quiz_attempt_by_id,
    get_quiz_attempts_by_quiz_id,
)

router = APIRouter(tags=["quizzes"])


@router.get("/quiz-attempts/{attempt_id}", response_model=QuizAttemptDetail)
async def get_quiz_attempt(
    attempt_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed information about a completed quiz attempt.
    """
    try:
        attempt = await get_quiz_attempt_by_id(db, attempt_id, current_user.id)
        return attempt
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AccessDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/quiz-attempts", response_model=List[QuizAttemptListItem])
async def list_quiz_attempts(
    quiz_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(
        default=20, ge=1, le=100, description="Maximum number of attempts to return"
    ),
):
    """
    Get the history of completed quiz attempts for a specific quiz.
    """
    attempts = await get_quiz_attempts_by_quiz_id(
        db, quiz_id, current_user.id, limit=limit
    )
    return attempts
