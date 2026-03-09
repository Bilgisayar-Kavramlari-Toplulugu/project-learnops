import uuid as uuid_mod

from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.users import OAuthAccount, User
from app.schemas.auth import AccountConflictResponse, OAuthProvider
from app.services.jwt_service import create_merge_token, decode_merge_token, blacklist_token, is_blacklisted

# ---------------------------------------------------------------------------
# Repository functions (Single Responsibility: sadece DB sorguları)
# ---------------------------------------------------------------------------

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Email ile kullanıcıyı oauth_accounts ilişkisiyle birlikte getirir."""
    result = await db.execute(
        select(User)
        .where(User.email == email)
        .options(selectinload(User.oauth_accounts))
    )
    return result.scalar_one_or_none()


async def get_oauth_account(
    db: AsyncSession,
    provider: str,
    provider_user_id: str,
) -> OAuthAccount | None:
    """Provider ve provider_user_id ile OAuth hesabı getirir."""
    result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == provider_user_id,
        )
    )
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Service functions (Single Responsibility: sadece iş mantığı)
# ---------------------------------------------------------------------------


def build_conflict_response(
    existing_user: User,
    new_provider: OAuthProvider,
    provider_user_id: str,
    provider_email: str,
) -> AccountConflictResponse:
    """
    Email çakışması tespit edildiğinde conflict response oluşturur.
    Stateless JWT merge_token üretir.
    """
    merge_token = create_merge_token(
        user_id=str(existing_user.id),
        new_provider=new_provider.value,
        provider_user_id=provider_user_id,
        provider_email=provider_email,
    )

    existing_providers = [acc.provider for acc in existing_user.oauth_accounts]
    providers_str = (
        ", ".join(existing_providers) if existing_providers else "başka bir hesap"
    )

    return AccountConflictResponse(
        message=f"Bu email adresi zaten {providers_str} ile kayıtlı. "
        f"Hesapları birleştirmek ister misiniz?",
        email=existing_user.email,
        existing_providers=existing_providers,
        new_provider=new_provider,
        merge_token=merge_token,
    )


async def merge_oauth_accounts(
    db: AsyncSession,
    merge_token: str,
    current_user_id: str,
) -> tuple[User, list[str]]:

    try:
        payload = decode_merge_token(merge_token)
    except JWTError:
        raise ValueError("Geçersiz veya süresi dolmuş merge token")

    jti = payload.get("jti", "")
    if is_blacklisted(jti):
        raise ValueError("Bu merge token daha önce kullanılmış")

    user_id = payload.get("user_id")
    # Token'daki user ile login olan user aynı mı?
    if user_id != current_user_id:
        raise ValueError("Bu merge işlemi sizin hesabınıza ait değil")

    new_provider = payload.get("new_provider")
    provider_user_id = payload.get("provider_user_id")
    provider_email = payload.get("provider_email")

    result = await db.execute(
        select(User)
        .where(User.id == uuid_mod.UUID(user_id))
        .options(selectinload(User.oauth_accounts))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("Kullanıcı bulunamadı")

    existing = await get_oauth_account(db, new_provider, provider_user_id)
    if existing:
        raise ValueError("Bu OAuth hesabı zaten bağlı")

    new_oauth = OAuthAccount(
        user_id=user.id,
        provider=new_provider,
        provider_user_id=provider_user_id,
        provider_email=provider_email,
    )
    db.add(new_oauth)

    if jti:
        blacklist_token(jti)

    await db.flush()
    await db.refresh(user, attribute_names=["oauth_accounts"])
    providers = [acc.provider for acc in user.oauth_accounts]
    return user, providers