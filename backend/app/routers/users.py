import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import OAuthAccount, User
from app.schemas.users import (
    LinkedAccountResponse,
    UserProfileResponse,
    UserProfileUpdate,
)
from app.services.oauth_service import unlink_oauth_account

router = APIRouter(prefix="/users", tags=["users"])
logger = logging.getLogger(__name__)


@router.get("/me", response_model=UserProfileResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Return the current user's profile."""
    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        bio=user.bio,
        avatar_type=user.avatar_type,
    )


@router.patch("/me", response_model=UserProfileResponse)
async def update_me(
    body: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile.

    Rate limit: general API category (100 req/min) — intentional,
    profile updates are low-frequency.
    """

    if body.display_name is not None:
        user.display_name = body.display_name
    if body.bio is not None:
        user.bio = body.bio
    if body.avatar_type is not None:
        user.avatar_type = body.avatar_type

    await (
        db.commit()
    )  # updated_at is handled automatically via onupdate=func.now() in BaseModel
    await db.refresh(user)

    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        bio=user.bio,
        avatar_type=user.avatar_type,
    )


@router.get("/me/accounts", response_model=list[LinkedAccountResponse])
async def get_my_accounts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OAuthAccount).where(OAuthAccount.user_id == user.id)
    )

    accounts = result.scalars().all()

    return [
        LinkedAccountResponse(
            id=str(acc.id),
            provider=acc.provider,
            provider_email=acc.provider_email,
            linked_at=acc.linked_at,
        )
        for acc in accounts
    ]


@router.delete(
    "/me/accounts/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink an OAuth account",
    responses={
        400: {"description": "Son OAuth hesabı silinemez"},
        404: {"description": "OAuth hesabı bulunamadı"},
    },
)
async def delete_oauth_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Kullanıcının bağlı OAuth hesaplarından birini kaldırır.

    - En az 1 OAuth bağlantısı kalmalıdır (son hesap silinemez → 400).
    - Hesap mevcut kullanıcıya ait olmalıdır (IDOR koruması → 404).
    """
    try:
        await unlink_oauth_account(db, account_id, current_user_id)
        await db.commit()
    except ValueError as e:
        await db.rollback()
        error_code = str(e)
        if error_code == "not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="OAuth hesabı bulunamadı",
            )
        elif error_code == "last_account":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="En az bir OAuth hesabı bağlı kalmalıdır",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
