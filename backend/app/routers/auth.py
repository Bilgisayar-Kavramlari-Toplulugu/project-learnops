from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import (
    MergeAccountRequest,
    MergeAccountResponse,
    AccountConflictResponse,
    OAuthProvider,
)
from app.services.oauth_service import (
    get_user_by_email,
    build_conflict_response,
    merge_oauth_accounts,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/merge",
    response_model=MergeAccountResponse,
    status_code=status.HTTP_200_OK,
    summary="Merge OAuth accounts",
)
async def merge_accounts_endpoint(
    request: MergeAccountRequest,
    db: AsyncSession = Depends(get_db),
) -> MergeAccountResponse:
    """
    Kullanıcı onayı sonrası iki OAuth hesabını birleştir.
    Frontend merge_token'ı bu endpoint'e gönderir.
    """
    try:
        user, providers = await merge_oauth_accounts(db, request.merge_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return MergeAccountResponse(
        message="Hesaplar başarıyla birleştirildi",
        email=user.email,
        providers=providers,
    )


@router.get(
    "/conflict-check",
    response_model=AccountConflictResponse | None,
    status_code=status.HTTP_200_OK,
    summary="Check OAuth account conflict",
)
async def check_conflict_endpoint(
    email: str,
    provider: str,
    provider_account_id: str,
    access_token: str,
    db: AsyncSession = Depends(get_db),
) -> AccountConflictResponse | None:
    """
    OAuth callback sırasında email çakışması var mı kontrol et.
    Çakışma varsa conflict response döner, yoksa None döner.
    """
    try:
        oauth_provider = OAuthProvider(provider)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Geçersiz provider: {provider}. Geçerli değerler: {[p.value for p in OAuthProvider]}",
        )

    existing_user = await get_user_by_email(db, email)
    if not existing_user:
        return None

    return build_conflict_response(
        existing_user,
        oauth_provider,
        provider_account_id,
        access_token,
    )