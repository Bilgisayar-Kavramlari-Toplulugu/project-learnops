import logging
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User
from app.schemas.quizzes import AnswerResultItem, QuizSubmitRequest, QuizSubmitResponse
from app.services.quiz_service import submit_quiz_attempt

router = APIRouter(prefix="/quiz-attempts", tags=["quiz-attempts"])
logger = logging.getLogger(__name__)


@router.post(
    "/{attempt_id}/submit",
    response_model=QuizSubmitResponse,
    status_code=status.HTTP_200_OK,
)
async def submit_quiz(
    attempt_id: UUID,
    body: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuizSubmitResponse:
    """
    Quiz denemesini tamamlar ve sonuçları döndürür.

    - Süre aşımı (duration_seconds + 30sn tolerans) → 422
    - Cevapsız sorular null olarak değerlendirilir ve yanlış sayılır
    - GÜVENLİK (NF-05): correct_index yalnızca bu response'ta açılır
    """
    result = await submit_quiz_attempt(
        db=db,
        attempt_id=attempt_id,
        user_id=current_user.id,
        submitted_answers=body.answers,
    )

    response = QuizSubmitResponse(
        attempt_id=result["attempt_id"],
        score=result["score"],
        total_questions=result["total_questions"],
        passed=result["passed"],
        time_spent_secs=result["time_spent_secs"],
        answers=[
            AnswerResultItem(
                question_id=a["question_id"],
                selected_index=a["selected_index"],
                correct_index=a["correct_index"],
                is_correct=a["is_correct"],
                explanation=a.get("explanation"),
            )
            for a in result["answers"]
        ],
    )

    await db.commit()

    return response
