from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.users import OAuthAccount, User
from app.schemas.users import UserProfileResponse, UserProfileUpdate
from app.services.jwt_service import decode_token

router = APIRouter(prefix="/users", tags=["users"])


async def _get_current_user(request: Request, db: AsyncSession) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz veya süresi dolmuş",
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token gerekli",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.get("/me", response_model=UserProfileResponse)
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    """Return the current user's profile."""
    user = await _get_current_user(request, db)
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
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    user = await _get_current_user(request, db)

    if body.display_name is not None:
        user.display_name = body.display_name
    if body.bio is not None:
        user.bio = body.bio
    if body.avatar_type is not None:
        user.avatar_type = body.avatar_type

    await db.commit()
    await db.refresh(user)

    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        bio=user.bio,
        avatar_type=user.avatar_type,
    )


@router.get("/me/accounts", response_model=list[str])
async def get_my_accounts(request: Request, db: AsyncSession = Depends(get_db)):
    """Return the OAuth provider names linked to the current user."""
    user = await _get_current_user(request, db)
    result = await db.execute(
        select(OAuthAccount.provider).where(OAuthAccount.user_id == user.id)
    )
    return result.scalars().all()
