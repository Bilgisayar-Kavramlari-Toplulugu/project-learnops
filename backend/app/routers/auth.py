from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import httpx
import secrets
from datetime import datetime, timezone
from sqlalchemy import select
from app.config import settings
from app.database import get_db
from app.models.users import User, OAuthAccount
from app.core.security import encrypt_token, create_access_token, create_refresh_token

router = APIRouter(prefix='/auth', tags=['authentication'])
logger = logging.getLogger(__name__)


def _google_redirect_uri(request: Request) -> str:
    base_url = (settings.BACKEND_PUBLIC_URL or str(request.base_url)).strip().rstrip("/")
    return f"{base_url}/v1/auth/google/callback"


@router.get('/google/login')
async def google_login(request: Request):
    """Generate Google OAuth login URL"""
    try:
        client_id = settings.GOOGLE_CLIENT_ID.strip()
        if not client_id:
            logger.error("GOOGLE_CLIENT_ID not configured")
            return {"error": "Google OAuth not configured"}
        
        # 🔐 CSRF koruması için state parametresi
        state = secrets.token_urlsafe(32)
        
        # State'i session'da sakla
        request.session['oauth_state'] = state
        
        # 🔧 Redirect URI'yi settings'den al
        redirect_uri = _google_redirect_uri(request)
        
        # Google refresh token için offline access_type kullanılmalı (scope değil)
        auth_url = (
            f'https://accounts.google.com/o/oauth2/v2/auth'
            f'?client_id={client_id}'
            f'&redirect_uri={redirect_uri}'
            f'&response_type=code'
            f'&state={state}'
            f'&scope=openid%20email%20profile'
            f'&access_type=offline'
            f'&prompt=consent'
        )
        logger.info(f"Generated URL: {auth_url}")
        if request.query_params.get("format") == "json":
            response = JSONResponse(content={"login_url": auth_url})
        else:
            response = RedirectResponse(url=auth_url, status_code=307)

        # Session'e ek olarak state'i cookie'de tut (callback'te fallback doğrulama için)
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
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/google/callback')
async def google_callback(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Google OAuth callback"""
    try:
        logger.info(f"=== CALLBACK RECEIVED ===")
        logger.info(f"URL: {request.url}")
        logger.info(f"Query params: {dict(request.query_params)}")
        
        # 🔐 1. State kontrolü (CSRF koruması)
        received_state = request.query_params.get('state')
        expected_state = request.session.get('oauth_state') or request.cookies.get('oauth_state')
        
        if not expected_state or received_state != expected_state:
            logger.error(f"State mismatch. Expected: {expected_state}, Received: {received_state}")
            raise HTTPException(status_code=400, detail="Invalid state parameter")
        
        # 2. Code'u al
        code = request.query_params.get('code')
        logger.info(f"Code: {code[:20] if code else 'None'}...")
        
        if not code:
            logger.error("No code in request")
            raise HTTPException(status_code=400, detail="Code not found")
        
        # 3. Exchange code for tokens
        logger.info("Exchanging code for tokens...")
        redirect_uri = _google_redirect_uri(request)
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': settings.GOOGLE_CLIENT_ID.strip(),
                    'client_secret': settings.GOOGLE_CLIENT_SECRET.strip(),
                    'redirect_uri': redirect_uri,
                    'grant_type': 'authorization_code'
                }
            )
            logger.info(f"Token response status: {token_response.status_code}")
            tokens = token_response.json()
            logger.info(f"Token response keys: {tokens.keys()}")
            
            if 'error' in tokens:
                logger.error(f"Token error: {tokens}")
                raise HTTPException(status_code=400, detail=tokens.get('error_description', 'Token exchange failed'))
        
        # 4. Get user info
        logger.info("Getting user info...")
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                'https://www.googleapis.com/oauth2/v1/userinfo',
                headers={'Authorization': f'Bearer {tokens["access_token"]}'}
            )
            logger.info(f"User info status: {user_response.status_code}")
            user_info = user_response.json()
            logger.info(f"User email: {user_info.get('email')}")
        
        # 5. Get or create user
        result = await db.execute(
            select(User).where(User.email == user_info['email'])
        )
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=user_info['email'],
                display_name=user_info.get('name', user_info['email'].split('@')[0]),
                avatar_type='initials',
                last_login_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.flush()
            logger.info(f"✅ New user created: {user.email}")
        else:
            user.last_login_at = datetime.now(timezone.utc)
            logger.info(f"✅ Existing user logged in: {user.email}")
        
        # 6. OAuth account'u kaydet/güncelle (refresh token opsiyonel)
        oauth_result = await db.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == 'google',
                OAuthAccount.provider_user_id == user_info['id']
            )
        )
        oauth_account = oauth_result.scalar_one_or_none()
        refresh_token_encrypted = None
        if 'refresh_token' in tokens:
            refresh_token_encrypted = encrypt_token(tokens['refresh_token'])

        if oauth_account:
            oauth_account.provider_email = user_info['email']
            if refresh_token_encrypted is not None:
                oauth_account.refresh_token_encrypted = refresh_token_encrypted
            logger.info("✅ OAuth account updated")
        else:
            oauth_account = OAuthAccount(
                user_id=user.id,
                provider='google',
                provider_user_id=user_info['id'],
                provider_email=user_info['email'],
                refresh_token_encrypted=refresh_token_encrypted
            )
            db.add(oauth_account)
            logger.info("✅ New OAuth account created")
        await db.commit()
        
        # 7. JWT token'ları üret
        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        # 8. Cookie'ye set et (httpOnly)
        response = RedirectResponse(
            url=f"{settings.FRONTEND_PUBLIC_URL.rstrip('/')}/dashboard",
            status_code=302,
        )
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )
        
        # 9. State'i temizle
        request.session.pop('oauth_state', None)
        response.delete_cookie("oauth_state")
        
        # 10. Başarılı yanıt sonrası dashboard'a yönlendir
        return response
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Callback error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 🔧 Test endpoint'leri KALDIRILDI (mock-callback ve test-db-only silindi)
