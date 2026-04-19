import logging
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User
from app.schemas.quizzes import QuestionOptionOut, QuestionOut, QuizAttemptResponse
from app.services.quiz_service import create_quiz_attempt

router = APIRouter(prefix="/quizzes", tags=["quizzes"])
logger = logging.getLogger(__name__)


@router.post(
    "/{quiz_id}/attempts",
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
                        index=o.get("index"),
                        text=o.get("text"),
                    )
                    for o in q.options
                ],
            )
            for q in randomized_questions
        ],
    )

    await db.commit()
    return response
