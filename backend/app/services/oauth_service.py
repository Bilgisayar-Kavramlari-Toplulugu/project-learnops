import secrets
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.users import User, OAuthAccount
from app.schemas.auth import OAuthProvider, AccountConflictResponse


# ---------------------------------------------------------------------------
# TODO: BE-07 (jwt_service) merge olduğunda MergeTokenStore kaldırılacak.
# create_merge_token() / decode_merge_token() ile stateless JWT'ye geçilecek.
# ---------------------------------------------------------------------------

@dataclass
class PendingMerge:
    user_id: str
    new_provider: str
    provider_account_id: str
    access_token: str


class MergeTokenStore:
    """Geçici merge token'larını bellekte tutan in-memory store."""

    def __init__(self) -> None:
        self._store: dict[str, PendingMerge] = {}

    def save(self, token: str, data: PendingMerge) -> None:
        self._store[token] = data

    def pop(self, token: str) -> PendingMerge | None:
        return self._store.pop(token, None)


merge_token_store = MergeTokenStore()


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
    provider_account_id: str,
) -> OAuthAccount | None:
    """Provider ve provider_account_id ile OAuth hesabı getirir."""
    result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_account_id == provider_account_id,
        )
    )
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Service functions (Single Responsibility: sadece iş mantığı)
# ---------------------------------------------------------------------------

def build_conflict_response(
    existing_user: User,
    new_provider: OAuthProvider,
    provider_account_id: str,
    access_token: str,
) -> AccountConflictResponse:
    """
    Email çakışması tespit edildiğinde conflict response oluşturur.
    Geçici merge_token üretip store'a kaydeder.
    """
    merge_token = secrets.token_urlsafe(32)

    merge_token_store.save(
        merge_token,
        PendingMerge(
            user_id=str(existing_user.id),
            new_provider=new_provider.value,
            provider_account_id=provider_account_id,
            access_token=access_token,
        ),
    )

    existing_providers = [acc.provider for acc in existing_user.oauth_accounts]
    providers_str = ", ".join(existing_providers) if existing_providers else "başka bir hesap"

    return AccountConflictResponse(
        message=f"Bu email adresi zaten {providers_str} ile kayıtlı. Hesapları birleştirmek ister misiniz?",
        email=existing_user.email,
        existing_providers=existing_providers,
        new_provider=new_provider,
        merge_token=merge_token,
    )


async def merge_oauth_accounts(
    db: AsyncSession,
    merge_token: str,
) -> tuple[User, list[str]]:
    """
    Kullanıcı onayı sonrası hesapları birleştirir.
    Yeni OAuthAccount kaydı oluşturur, token'ı store'dan siler.
    """
    pending = merge_token_store.pop(merge_token)
    if not pending:
        raise ValueError("Geçersiz veya süresi dolmuş merge token")

    result = await db.execute(
        select(User)
        .where(User.id == pending.user_id)
        .options(selectinload(User.oauth_accounts))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("Kullanıcı bulunamadı")

    new_oauth = OAuthAccount(
        user_id=user.id,
        provider=pending.new_provider,
        provider_account_id=pending.provider_account_id,
        access_token=pending.access_token,
    )
    db.add(new_oauth)
    await db.commit()
    await db.refresh(user)

    providers = [acc.provider for acc in user.oauth_accounts]
    return user, providers