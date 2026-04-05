import logging
import secrets
from datetime import datetime, timezone
from typing import TypedDict, Union

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
    _get_user_oauth_accounts,
    build_conflict_response,
    get_oauth_account,
    get_user_by_email,
    merge_oauth_accounts,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


class ResolveResult(TypedDict, total=False):
    user: User
    conflict: AccountConflictResponse


def _google_redirect_uri(request: Request) -> str:
    base_url = (
        (settings.BACKEND_PUBLIC_URL or str(request.base_url)).strip().rstrip("/")
    )
    return f"{base_url}/v1/auth/google/callback"


def _github_redirect_uri(request: Request) -> str:
    base_url = (
        (settings.BACKEND_PUBLIC_URL or str(request.base_url)).strip().rstrip("/")
    )
    return f"{base_url}/v1/auth/github/callback"


async def resolve_oauth_user(
    db,
    *,
    email: str,
    provider: OAuthProvider,
    provider_user_id: str,
    provider_email: str,
    display_name: str,
) -> ResolveResult:
    """
    OAuth login sırasında:
    - user bulur veya oluşturur
    - conflict varsa döner
    - yoksa user + oauth account hazır döner
    """

    # 1. user bul
    user = await get_user_by_email(db, email)

    if user:
        accounts = await _get_user_oauth_accounts(db, user.id)

        # provider zaten bağlı mı?
        provider_account = next(
            (a for a in accounts if a.provider == provider.value), None
        )

        if not provider_account:
            # ❗ conflict
            conflict = build_conflict_response(
                existing_user=user,
                existing_accounts=accounts,
                new_provider=provider,
                provider_user_id=provider_user_id,
                provider_email=provider_email,
            )
            return {"conflict": conflict}

        # mevcut kullanıcı → login
        user.last_login_at = datetime.now(timezone.utc)

    else:
        # yeni user
        user = User(
            email=email,
            display_name=display_name,
            avatar_type="initials",
            last_login_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

    return {"user": user}


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
        result = await resolve_oauth_user(
            db,
            email=user_info["email"],
            provider=OAuthProvider.google,
            provider_user_id=user_info["id"],
            provider_email=user_info["email"],
            display_name=user_info.get("name", user_info["email"].split("@")[0]),
        )

        if "conflict" in result:
            conflict_data = result["conflict"]

            return RedirectResponse(
                url=f"{settings.FRONTEND_PUBLIC_URL.rstrip('/')}/login?error=account_conflict"
                f"&merge_token={conflict_data.merge_token}&email={user_info['email']}",
                status_code=302,
            )

        user = result["user"]
        provider_user_id = str(user_info["id"])
        # OAuth account'u kaydet/güncelle
        oauth_account = await get_oauth_account(db, "google", provider_user_id)
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
                provider_user_id=provider_user_id,
                provider_email=user_info["email"],
                refresh_token_encrypted=refresh_token_encrypted,
            )
            db.add(oauth_account)
            logger.info("New OAuth account created")
        await db.commit()

        # JWT token'ları üret
        access_token = create_access_token(sub=str(user.id))
        refresh_token = create_refresh_token(sub=str(user.id))

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


async def _get_github_primary_email(
    client: httpx.AsyncClient,
    access_token: str,
) -> str | None:
    """
    GitHub kullanıcısının emaili gizliyse /user endpoint'i boş döner.
    Bu durumda /user/emails endpoint'inden primary+verified emaili alır.
    """
    resp = await client.get(
        "https://api.github.com/user/emails",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
        },
    )
    if resp.status_code != 200:
        logger.warning(f"GitHub /user/emails failed: {resp.status_code}")
        return None
    for entry in resp.json():
        if entry.get("primary") and entry.get("verified"):
            return entry.get("email")
    return None


@router.get("/github/login")
async def github_login(request: Request):
    """GitHub OAuth login URL'i üretir ve yönlendirir."""
    try:
        client_id = settings.github_client_id
        if not client_id:
            logger.error("GITHUB_CLIENT_ID not configured")
            raise HTTPException(status_code=503, detail="GitHub OAuth not configured")

        state = secrets.token_urlsafe(32)
        request.session["oauth_state"] = state

        redirect_uri = _github_redirect_uri(request)

        # GitHub refresh token sağlamaz — access_type=offline
        # veya prompt=consent kullanılmaz
        auth_url = (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope=user:email"
            f"&state={state}"
        )
        logger.info("Generated GitHub OAuth URL")

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


@router.get("/github/callback")
async def github_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """GitHub OAuth callback'ini işler."""
    try:
        logger.info("=== GITHUB CALLBACK RECEIVED ===")

        # State doğrula (CSRF koruması)
        received_state = request.query_params.get("state")
        expected_state = request.session.get("oauth_state") or request.cookies.get(
            "oauth_state"
        )
        if not expected_state or received_state != expected_state:
            logger.error("State mismatch in GitHub OAuth callback")
            raise HTTPException(status_code=400, detail="Invalid state parameter")

        code = request.query_params.get("code")
        if not code:
            logger.error("No code in GitHub callback request")
            raise HTTPException(status_code=400, detail="Code not found")

        redirect_uri = _github_redirect_uri(request)

        # 1) Code → access_token
        # GitHub token endpoint'i varsayılan form-encoded döner;
        # Accept: application/json header'ı ile JSON response alınır.
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "code": code,
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "redirect_uri": redirect_uri,
                },
            )
            tokens = token_response.json()
            logger.info(f"GitHub token response keys: {list(tokens.keys())}")

            if "error" in tokens:
                logger.error(f"GitHub token error: {tokens.get('error')}")
                raise HTTPException(
                    status_code=400,
                    detail=tokens.get(
                        "error_description", "GitHub token exchange failed"
                    ),
                )

            gh_access_token = tokens.get("access_token")
            if not gh_access_token:
                raise HTTPException(
                    status_code=502,
                    detail="GitHub did not return access token",
                )

        # 2) GitHub kullanıcı bilgileri
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {gh_access_token}",
                    "Accept": "application/vnd.github+json",
                },
            )
            if user_response.status_code != 200:
                logger.error(f"GitHub user info failed: {user_response.status_code}")
                raise HTTPException(
                    status_code=502,
                    detail="Failed to retrieve user info from GitHub",
                )
            user_info = user_response.json()
            logger.info(f"GitHub user id: {user_info.get('id')}")

            # Email: kullanıcı emailini gizliyse /user boş döner → /user/emails çağrılır
            email: str | None = user_info.get("email") or None
            if not email:
                email = await _get_github_primary_email(client, gh_access_token)

            if not email:
                logger.error("GitHub did not return any email for user")
                raise HTTPException(
                    status_code=502,
                    detail="GitHub did not return user email",
                )

        # GitHub user ID integer; DB'de string olarak saklanır
        provider_user_id = str(user_info["id"])
        display_name = (
            user_info.get("name") or user_info.get("login") or email.split("@")[0]
        )

        # Mevcut kullanıcıyı email ile bul
        result = await resolve_oauth_user(
            db,
            email=email,
            provider=OAuthProvider.github,
            provider_user_id=provider_user_id,
            provider_email=email,
            display_name=display_name,
        )

        if "conflict" in result:
            conflict_data = result["conflict"]

            return RedirectResponse(
                url=f"{settings.FRONTEND_PUBLIC_URL.rstrip('/')}/login?error=account_conflict"
                f"&merge_token={conflict_data.merge_token}&email={email}",
                status_code=302,
            )

        user = result["user"]

        # GitHub OAuth account kaydet/güncelle
        oauth_account = await get_oauth_account(db, "github", provider_user_id)

        # GitHub refresh token SAĞLAMAZ — bu tasarım gereği, hata değil.
        # refresh_token_encrypted her zaman NULL olarak kaydedilir.
        if oauth_account:
            oauth_account.provider_email = email
            logger.info(
                "GitHub OAuth account updated (refresh_token_encrypted stays NULL)"
            )
        else:
            oauth_account = OAuthAccount(
                user_id=user.id,
                provider="github",
                provider_user_id=provider_user_id,
                provider_email=email,
                refresh_token_encrypted=None,
            )
            db.add(oauth_account)
            logger.info(
                "New GitHub OAuth account created (refresh_token_encrypted=NULL)"
            )

        await db.commit()

        # Kendi JWT çiftimizi üret (GitHub token'ı saklanmaz)
        access_token = create_access_token(sub=str(user.id))
        refresh_token = create_refresh_token(sub=str(user.id))

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

        request.session.pop("oauth_state", None)
        response.delete_cookie("oauth_state")

        return response

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"GitHub callback error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


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

    return TokenResponse(
        access_token=create_access_token(sub),
        refresh_token=create_refresh_token(sub),
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

    accounts = await _get_user_oauth_accounts(db, existing_user.id)

    return build_conflict_response(
        existing_user,
        accounts,
        oauth_provider,
        request.provider_user_id,
        request.provider_email,
    )
