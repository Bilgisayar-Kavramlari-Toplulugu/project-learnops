import logging
import secrets
import uuid
from datetime import datetime, timezone
from typing import Union

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import encrypt_token
from app.database import get_db
from app.deps import get_current_user
from app.models.users import OAuthAccount, User
from app.schemas.auth import (
    AccountConflictResponse,
    ConflictCheckRequest,
    MergeAccountRequest,
    MergeAccountResponse,
    OAuthProvider,
    RefreshRequest,
    TokenResponse,
)
from app.services.jwt_service import (
    blacklist_token,
    create_access_token,
    create_refresh_token,
    decode_token,
    is_blacklisted,
)
from app.services.oauth_service import (
    build_conflict_response,
    get_user_by_email,
    merge_oauth_accounts,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


def _google_redirect_uri(request: Request) -> str:
    base_url = (
        (settings.BACKEND_PUBLIC_URL or str(request.base_url)).strip().rstrip("/")
    )
    return f"{base_url}/v1/auth/google/callback"


@router.get("/google/login")
async def google_login(request: Request):
    """Generate Google OAuth login URL"""
    try:
        client_id = settings.GOOGLE_CLIENT_ID.strip()
        if not client_id:
            logger.error("GOOGLE_CLIENT_ID not configured")
            raise HTTPException(status_code=503, detail="Google OAuth not configured")

        # CSRF koruması için state parametresi
        state = secrets.token_urlsafe(32)

        # State'i session'da sakla
        request.session["oauth_state"] = state

        # Redirect URI'yi settings'den al
        redirect_uri = _google_redirect_uri(request)

        # Google refresh token için offline access_type kullanılmalı (scope değil)
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&response_type=code"
            f"&state={state}"
            f"&scope=openid%20email%20profile"
            f"&access_type=offline"
            f"&prompt=consent"
        )
        logger.info("Generated Google OAuth URL")
        response: Union[JSONResponse, RedirectResponse]
        if request.query_params.get("format") == "json":
            response = JSONResponse(content={"login_url": auth_url})
        else:
            response = RedirectResponse(url=auth_url, status_code=307)

        response.set_cookie(
            key="oauth_state",
            value=state,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=600,
        )
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        logger.info("=== CALLBACK RECEIVED ===")

        # State kontrolü (CSRF koruması)
        received_state = request.query_params.get("state")
        expected_state = request.session.get("oauth_state") or request.cookies.get(
            "oauth_state"
        )

        if not expected_state or received_state != expected_state:
            logger.error("State mismatch in OAuth callback")
            raise HTTPException(status_code=400, detail="Invalid state parameter")

        # Code'u al
        code = request.query_params.get("code")
        logger.info(f"Code received: {'yes' if code else 'no'}")

        if not code:
            logger.error("No code in request")
            raise HTTPException(status_code=400, detail="Code not found")

        # Exchange code for tokens
        logger.info("Exchanging code for tokens...")
        redirect_uri = _google_redirect_uri(request)

        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID.strip(),
                    "client_secret": settings.GOOGLE_CLIENT_SECRET.strip(),
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            logger.info(f"Token response status: {token_response.status_code}")
            tokens = token_response.json()
            logger.info(f"Token response keys: {tokens.keys()}")

            if "error" in tokens:
                logger.error(f"Token error: {tokens.get('error')}")
                raise HTTPException(
                    status_code=400,
                    detail=tokens.get("error_description", "Token exchange failed"),
                )

        # Get user info
        logger.info("Getting user info...")
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v1/userinfo",
                headers={"Authorization": f"Bearer {tokens['access_token']}"},
            )
            if user_response.status_code != 200:
                logger.error(
                    f"Google userinfo failed with status {user_response.status_code}"
                )
                raise HTTPException(
                    status_code=502,
                    detail="Failed to retrieve user info from Google",
                )
            user_info = user_response.json()
            if "email" not in user_info:
                logger.error("Google userinfo response missing email")
                raise HTTPException(
                    status_code=502,
                    detail="Google did not return user email",
                )
            logger.info(f"User email: {user_info.get('email')}")

        # Get or create user
        result = await db.execute(select(User).where(User.email == user_info["email"]))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email=user_info["email"],
                display_name=user_info.get("name", user_info["email"].split("@")[0]),
                avatar_type="initials",
                last_login_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)
            logger.info(f"New user created: {user.email}")
        else:
            user.last_login_at = datetime.now(timezone.utc)
            logger.info(f"Existing user logged in: {user.email}")

        # OAuth account'u kaydet/güncelle
        oauth_result = await db.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == "google",
                OAuthAccount.provider_user_id == user_info["id"],
            )
        )
        oauth_account = oauth_result.scalar_one_or_none()
        refresh_token_encrypted = None
        if "refresh_token" in tokens:
            refresh_token_encrypted = encrypt_token(tokens["refresh_token"])

        if oauth_account:
            oauth_account.provider_email = user_info["email"]
            if refresh_token_encrypted is not None:
                oauth_account.refresh_token_encrypted = refresh_token_encrypted
            logger.info("OAuth account updated")
        else:
            oauth_account = OAuthAccount(
                user_id=user.id,
                provider="google",
                provider_user_id=user_info["id"],
                provider_email=user_info["email"],
                refresh_token_encrypted=refresh_token_encrypted,
            )
            db.add(oauth_account)
            logger.info("New OAuth account created")
        await db.commit()

        # JWT token'ları üret
        new_jti = str(uuid.uuid4())
        access_token = create_access_token(sub=str(user.id))
        refresh_token = create_refresh_token(sub=str(user.id), jti=new_jti)

        # Cookie'ye set et (httpOnly)
        response = RedirectResponse(
            url=(f"{settings.FRONTEND_PUBLIC_URL.rstrip('/')}/dashboard"),
            status_code=302,
        )
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="strict",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="strict",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )

        # State'i temizle
        request.session.pop("oauth_state", None)
        response.delete_cookie("oauth_state")

        return response

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Callback error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest):
    """Refresh token ile yeni access + refresh token üretir."""
    try:
        payload = decode_token(body.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token geçersiz veya süresi dolmuş",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token gerekli",
        )

    jti = payload.get("jti", "")
    if is_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token iptal edilmiş",
        )

    # Yeni token çifti üret
    sub: str | None = payload.get("sub")
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz",
        )

    # Eski refresh token'ı blacklist'e al (token rotation)
    # sub doğrulandıktan SONRA yapılmalı, yoksa geçersiz token rotation'ı tetikler
    blacklist_token(jti)

    new_jti = str(uuid.uuid4())
    return TokenResponse(
        access_token=create_access_token(sub),
        refresh_token=create_refresh_token(sub, new_jti),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: RefreshRequest,
    _current_user: str = Depends(get_current_user),
):
    """Refresh token'ı blacklist'e ekleyerek logout yapar."""
    try:
        payload = decode_token(body.refresh_token)
    except JWTError:
        return  # zaten geçersiz, işlem yok

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token gerekli",
        )

    jti = payload.get("jti", "")
    blacklist_token(jti)


@router.post("/merge", response_model=MergeAccountResponse)
async def merge_accounts_endpoint(
    request: MergeAccountRequest,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    try:
        user, providers = await merge_oauth_accounts(
            db, request.merge_token, current_user
        )
        await db.commit()
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return MergeAccountResponse(
        message="Hesaplar başarıyla birleştirildi",
        email=user.email,
        providers=providers,
    )


@router.post(
    "/conflict-check",
    response_model=AccountConflictResponse | None,
    status_code=status.HTTP_200_OK,
    summary="Check OAuth account conflict",
)
async def check_conflict_endpoint(
    request: ConflictCheckRequest,
    db: AsyncSession = Depends(get_db),
) -> AccountConflictResponse | None:
    """
    OAuth callback sırasında email çakışması var mı kontrol et.
    Çakışma varsa conflict response döner, yoksa None döner.
    """
    try:
        oauth_provider = OAuthProvider(request.provider)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Geçersiz provider: {request.provider}. "
            f"Geçerli değerler: {[p.value for p in OAuthProvider]}",
        )

    existing_user = await get_user_by_email(db, request.email)
    if not existing_user:
        return None

    return build_conflict_response(
        existing_user,
        oauth_provider,
        request.provider_user_id,
        request.provider_email,
    )
