import uuid

from sqlalchemy import delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.courses import Enrollment, UserProgress
from app.models.quizzes import QuizAttempt, QuizAttemptAnswer
from app.models.users import DeletedAccount, OAuthAccount, User


async def _delete_user_related_rows(db: AsyncSession, user_uuid: uuid.UUID) -> None:
    attempt_ids_subquery = select(QuizAttempt.id).where(
        QuizAttempt.user_id == user_uuid
    )

    await db.execute(
        delete(QuizAttemptAnswer).where(
            QuizAttemptAnswer.attempt_id.in_(attempt_ids_subquery)
        )
    )
    await db.execute(delete(QuizAttempt).where(QuizAttempt.user_id == user_uuid))
    await db.execute(delete(UserProgress).where(UserProgress.user_id == user_uuid))
    await db.execute(delete(Enrollment).where(Enrollment.user_id == user_uuid))
    await db.execute(delete(OAuthAccount).where(OAuthAccount.user_id == user_uuid))
    await db.execute(delete(User).where(User.id == user_uuid))

    await db.execute(
        insert(DeletedAccount).values(
            user_id=user_uuid,
            deletion_reason="user_request",
        )
    )


async def hard_delete_user_account(db: AsyncSession, user_id: str) -> bool:
    """
    Hard-delete user and related data in a single transaction.
    Returns False if user does not exist.
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        return False

    async def _run() -> bool:
        existing_user_id = await db.scalar(select(User.id).where(User.id == user_uuid))
        if existing_user_id is None:
            return False
        await _delete_user_related_rows(db, user_uuid)
        return True

    # Test altyapısı transaction'ı dışarıdan açıyor; production'da ise
    # transaction'ı burada başlatıp atomik hard delete sağlıyoruz.
    if db.in_transaction():
        async with db.begin_nested():
            return await _run()

    async with db.begin():
        return await _run()
