from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.sessions import SessionMiddleware

import app.models  # noqa: F401 - ensure all SQLAlchemy models are registered
from app.config import settings
from app.database import get_db
from app.middleware.rate_limiting import RateLimiterMiddleware
from app.routers import auth

app = FastAPI(
    title="LearnOps API",
    version="1.0.0",
    docs_url="/v1/docs",
    redoc_url="/v1/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    session_cookie="learnops_session",
    max_age=3600,  # 1 saat
    same_site="lax",  # OAuth callback cross-site redirect requires lax
    https_only=settings.ENVIRONMENT == "production"
)


app.include_router(auth.router, prefix="/v1")


# Rate Limiting
app.add_middleware(RateLimiterMiddleware)

@app.get("/v1/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail="Database connection failed"
        ) from exc
    return {"status": "ok", "version": "1.0.0"}
