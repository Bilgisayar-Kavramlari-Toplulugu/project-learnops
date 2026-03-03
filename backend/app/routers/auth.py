from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

import logging
import httpx
import uuid 
from sqlalchemy import select
from app.config import settings
from app.database import get_db
from app.models.users import User, OAuthAccount

router = APIRouter(prefix='/auth', tags=['authentication'])
logger = logging.getLogger(__name__)

@router.get('/google/login')
async def google_login():
    """Generate Google OAuth login URL"""
    try:
        if not settings.GOOGLE_CLIENT_ID:
            logger.error("GOOGLE_CLIENT_ID not configured")
            return {"error": "Google OAuth not configured"}
        
        redirect_uri = 'http://localhost:8000/v1/auth/google/callback'  
        auth_url = (
            f'https://accounts.google.com/o/oauth2/v2/auth'
            f'?client_id={settings.GOOGLE_CLIENT_ID}'
            f'&redirect_uri={redirect_uri}'
            f'&response_type=code'
            f'&scope=openid%20email%20profile'
        )
        logger.info(f"Generated URL: {auth_url}")
        return {"login_url": auth_url}
        
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
        # Tüm parametreleri logla
        logger.info(f"=== CALLBACK RECEIVED ===")
        logger.info(f"URL: {request.url}")
        logger.info(f"Query params: {dict(request.query_params)}")
        
        code = request.query_params.get('code')
        logger.info(f"Code: {code[:20] if code else 'None'}...")
        
        if not code:
            logger.error("No code in request")
            raise HTTPException(status_code=400, detail="Code not found")
        
        # 1. Exchange code for tokens
        logger.info("Exchanging code for tokens...")
        logger.info(f"Client ID: {settings.GOOGLE_CLIENT_ID[:10]}...")
        logger.info(f"Redirect URI: http://localhost:8000/v1/auth/google/callback")
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'redirect_uri': 'http://localhost:8000/v1/auth/google/callback',
                    'grant_type': 'authorization_code'
                }
            )
            logger.info(f"Token response status: {token_response.status_code}")
            tokens = token_response.json()
            logger.info(f"Token response keys: {tokens.keys()}")
            
            if 'error' in tokens:
                logger.error(f"Token error: {tokens}")
                raise HTTPException(status_code=400, detail=tokens.get('error_description', 'Token exchange failed'))
        
        # 2. Get user info
        logger.info("Getting user info...")
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                'https://www.googleapis.com/oauth2/v1/userinfo',
                headers={'Authorization': f'Bearer {tokens["access_token"]}'}
            )
            logger.info(f"User info status: {user_response.status_code}")
            user_info = user_response.json()
            logger.info(f"User email: {user_info.get('email')}")
        
        # 3. Get or create user (kodun devamı)
        # ...
#  Mock endpoint for testing 
@router.get('/google/mock-callback')
async def mock_google_callback(db: AsyncSession = Depends(get_db)):
    """MOCK callback - tests ONLY database operations"""
    try:
        import uuid
        from datetime import datetime
        import traceback
        
        logger.info("=== Starting mock callback test ===")
        
        # Generate unique test email
        unique_id = uuid.uuid4().hex[:8]
        mock_email = f"testuser_{unique_id}@example.com"
        logger.info(f"Creating test user with email: {mock_email}")
        
        # Create test user
        user = User(
            email=mock_email,
            full_name="Test User",
            avatar_url="https://example.com/photo.jpg", 
            is_active=True,
            is_superuser=False
        )
        
        logger.info("Adding user to database...")
        db.add(user)
        await db.commit()
        logger.info("Commit successful")
        
        await db.refresh(user)
        logger.info(f"User created with ID: {user.id}")
        
        # Query to verify
        from sqlalchemy import select
        result = await db.execute(
            select(User).where(User.email == mock_email)
        )
        created_user = result.scalar_one_or_none()
        
        if created_user:
            logger.info("✅ User retrieved successfully")
            return {
                "message": "Mock test successful",
                "user": {
                    "id": str(created_user.id),
                    "email": created_user.email,
                    "name": created_user.full_name
                },
                "db_test": "✅ User created and retrieved successfully"
            }
        else:
            logger.error("❌ User not found after creation")
            return {
                "error": "User not found after creation",
                "db_test": "❌ Failed"
            }
        
    except Exception as e:
        logger.error(f"❌ Mock callback error: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {
            "error": str(e),
            "error_type": type(e).__name__,
            "db_test": "❌ Failed",
            "trace": traceback.format_exc().split('\n')
        }
    
#  debug endpoint to check database connection alone
@router.get('/test-db-only')
async def test_db_only(db: AsyncSession = Depends(get_db)):
    """Test ONLY database connection"""
    try:
        from sqlalchemy import text
        result = await db.execute(text("SELECT 1"))
        return {"status": "✅ Database connection working"}
    except Exception as e:
        return {"error": str(e)}