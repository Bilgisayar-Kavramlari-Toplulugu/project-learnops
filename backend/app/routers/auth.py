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
    TokenResponse,
    UserMeResponse,
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
            response = RedirectResponse(url=auth_url, status_code=302)

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
    frontend_url = settings.FRONTEND_PUBLIC_URL.rstrip("/")

    try:
        logger.info("=== CALLBACK RECEIVED ===")

        # State kontrolü (CSRF koruması)
        received_state = request.query_params.get("state")
        expected_state = request.session.get("oauth_state") or request.cookies.get(
            "oauth_state"
        )

        if not expected_state or received_state != expected_state:
            logger.error("State mismatch in OAuth callback")
            return RedirectResponse(
                url=f"{frontend_url}/login?error=invalid_state", status_code=302
            )

        # Code'u al
        code = request.query_params.get("code")
        logger.info(f"Code received: {'yes' if code else 'no'}")

        if not code:
            logger.error("No code in request")
            return RedirectResponse(
                url=f"{frontend_url}/login?error=invalid_code", status_code=302
            )

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
                return RedirectResponse(
                    url=f"{frontend_url}/login?error=oauth_failed", status_code=302
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
                return RedirectResponse(
                    url=f"{frontend_url}/login?error=oauth_failed", status_code=302
                )
            user_info = user_response.json()
            if "email" not in user_info:
                logger.error("Google userinfo response missing email")
                return RedirectResponse(
                    url=f"{frontend_url}/login?error=oauth_failed", status_code=302
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
        await db.flush()

        # JWT token'ları üret
        new_jti = str(uuid.uuid4())
        access_token = create_access_token(sub=str(user.id))
        refresh_token = create_refresh_token(sub=str(user.id), jti=new_jti)

        # Cookie'ye set et (httpOnly)
        response = RedirectResponse(
            url=(f"{frontend_url.rstrip('/')}/dashboard"),
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

    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        return RedirectResponse(
            url=f"{frontend_url}/login?error=server_error", status_code=302
        )


@router.get("/me", response_model=UserMeResponse)
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    """Return the current user's profile from the access_token cookie."""
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

    return UserMeResponse(
        id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        avatar_type=user.avatar_type,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request):
    """Cookie'deki refresh token ile yeni access + refresh token üretir."""
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token bulunamadı",
        )

    try:
        payload = decode_token(token)
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
    new_access_token = create_access_token(sub)
    new_refresh_token = create_refresh_token(sub, new_jti)

    response = JSONResponse(
        content=TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        ).model_dump()
    )
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    return response


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request):
    """Cookie'deki refresh token'ı blacklist'e ekleyerek logout yapar."""
    token = request.cookies.get("refresh_token")
    if token:
        try:
            payload = decode_token(token)
            if payload.get("type") == "refresh":
                jti = payload.get("jti", "")
                blacklist_token(jti)
        except JWTError:
            pass  # zaten geçersiz, işlem yok

    response = JSONResponse(content=None, status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


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
    except ValueError as e:
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
