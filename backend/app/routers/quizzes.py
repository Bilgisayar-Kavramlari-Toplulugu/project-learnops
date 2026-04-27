import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions.access_denied import AccessDeniedError
from app.exceptions.not_found import EntityNotFoundError
from app.exceptions.validation import ValidationError
from app.models.users import User
from app.schemas.quizzes import (
    QuestionOptionOut,
    QuestionOut,
    QuizAttemptDetail,
    QuizAttemptListItem,
    QuizAttemptResponse,
)
from app.services.quiz_service import (
    create_quiz_attempt,
    get_quiz_attempt_by_id,
    get_quiz_attempts_by_quiz_id,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/quizzes/{quiz_id}/attempts",
    response_model=QuizAttemptResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_quiz_attempt(
    quiz_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuizAttemptResponse:
    """
    Kullanıcı için belirtilen quiz üzerinde yeni bir deneme (attempt) başlatır.
    Sorular karıştırılmış (randomized) olarak döner.
    GÜVENLİK (NF-05): correct_index cevaplarda kesinlikle yer almaz.
    """
    attempt, randomized_questions, quiz = await create_quiz_attempt(
        db, quiz_id, current_user.id
    )

    logger.info(
        "Attempt başlatıldı: user_id=%s quiz_id=%s attempt_id=%s",
        current_user.id,
        quiz_id,
        attempt.id,
    )

    # ORM nesneleri commit öncesi Pydantic modeline alınır.
    # Commit sonrası session expire ettiğinden ORM attribute'larına erişilemez;
    # bu nedenle QuizAttemptResponse commit öncesi oluşturulur.
    response = QuizAttemptResponse(
        id=attempt.id,
        quiz_id=attempt.quiz_id,
        started_at=attempt.started_at,
        duration_seconds=quiz.duration_seconds,
        questions=[
            QuestionOut(
                id=q.id,
                text=q.text,
                # options whitelist: sadece index ve text — ileride eklenen
                # alanların (örn. correct_index) sızması önlenir (NF-05)
                options=[
                    QuestionOptionOut(
                        index=o["index"],
                        text=o["text"],
                    )
                    for o in q.options
                ],
            )
            for q in randomized_questions
        ],
    )

    await db.commit()
    return response


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
