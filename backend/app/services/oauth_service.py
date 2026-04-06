import uuid as uuid_mod

from jose import JWTError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.users import OAuthAccount, User
from app.schemas.auth import AccountConflictResponse, OAuthProvider
from app.services.jwt_service import (
    blacklist_token,
    create_merge_token,
    decode_merge_token,
    is_blacklisted,
)

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


async def get_user_oauth_accounts(
    db: AsyncSession,
    user_id: uuid_mod.UUID,
) -> list[OAuthAccount]:
    """Kullanıcının tüm bağlı OAuth hesaplarını getirir."""
    result = await db.execute(
        select(OAuthAccount).where(OAuthAccount.user_id == user_id)
    )
    return list(result.scalars().all())


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

    if not isinstance(new_provider, str) or not isinstance(provider_user_id, str):
        raise ValueError("Geçersiz merge token: eksik provider bilgisi")

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


async def unlink_oauth_account(
    db: AsyncSession,
    account_id: uuid_mod.UUID,
    current_user_id: str,
) -> None:
    """
    OAuth hesap bağlantısını kaldırır (hard delete).

    Kısıtlar:
    - Hesap mevcut kullanıcıya ait olmalı (yoksa → ValueError "not_found")
    - Kullanıcının en az 1 OAuth hesabı kalmalı (yoksa → ValueError "last_account")

    Raises:
        ValueError("not_found"): Hesap bulunamadı veya başka kullanıcıya ait
        ValueError("last_account"): Son OAuth hesabı silinemez
    """
    # 1. OAuth hesabını bul
    result = await db.execute(select(OAuthAccount).where(OAuthAccount.id == account_id))
    oauth_account = result.scalar_one_or_none()

    # 2. Hesap var mı ve current user'a ait mi? (IDOR koruması)
    if not oauth_account or str(oauth_account.user_id) != current_user_id:
        raise ValueError("not_found")

    # 3. Kullanıcının toplam OAuth hesap sayısını kontrol et
    count_result = await db.execute(
        select(func.count(OAuthAccount.id)).where(
            OAuthAccount.user_id == oauth_account.user_id
        )
    )
    total_accounts = count_result.scalar_one()

    if total_accounts <= 1:
        raise ValueError("last_account")

    # 4. Hard delete
    await db.delete(oauth_account)
