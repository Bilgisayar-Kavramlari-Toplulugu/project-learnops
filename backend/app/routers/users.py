from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import OAuthAccount, User
from app.schemas.users import UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


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
# Rate limit: general API category (100 req/min) — intentional, profile updates are low-frequency
async def update_me(
    body: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""

    if body.display_name is not None:
        user.display_name = body.display_name
    if body.bio is not None:
        user.bio = body.bio
    if body.avatar_type is not None:
        user.avatar_type = body.avatar_type

    await db.commit()  # updated_at is handled automatically via onupdate=func.now() in BaseModel
    await db.refresh(user)

    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        bio=user.bio,
        avatar_type=user.avatar_type,
    )


@router.get("/me/accounts", response_model=list[str])
async def get_my_accounts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the OAuth provider names linked to the current user."""
    result = await db.execute(
        select(OAuthAccount.provider).where(OAuthAccount.user_id == user.id)
    )
    return result.scalars().all()
