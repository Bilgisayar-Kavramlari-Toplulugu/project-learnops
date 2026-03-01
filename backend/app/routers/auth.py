from fastapi import APIRouter, HTTPException, Depends
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
        
        redirect_uri = 'http://localhost:8000/auth/google/callback'
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
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # 1. Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'redirect_uri': 'http://localhost:8000/auth/google/callback',
                    'grant_type': 'authorization_code'
                }
            )
            tokens = token_response.json()
        
        # 2. Get user info
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                'https://www.googleapis.com/oauth2/v1/userinfo',
                headers={'Authorization': f'Bearer {tokens["access_token"]}'}
            )
            user_info = user_response.json()
        
        # 3. Get or create user
        result = await db.execute(
            select(User).where(User.email == user_info['email'])
        )
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=user_info['email'],
                full_name=user_info.get('name'),
                avatar_url=user_info.get('picture'),
                is_active=True,
                is_superuser=False
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # 4. Return user info (NO JWT tokens )
        return {
            "message": "Login successful",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.full_name,
                "avatar": user.avatar_url
            }
        }
        
    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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