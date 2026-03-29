import logging
from contextlib import asynccontextmanager

from alembic.config import Config
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from starlette.middleware.sessions import SessionMiddleware

from alembic import command  # type: ignore
from app import (
    models as _models,  # noqa: F401 - ensure all SQLAlchemy models are registered
)
from app.config import settings
from app.database import get_db
from app.middleware.rate_limiting import RateLimiterMiddleware
from app.routers import auth

logger = logging.getLogger(__name__)

def run_upgrade(connection, cfg):
    cfg.attributes["connection"] = connection
    command.upgrade(cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Sadece lokal geliştirme ortamında çalıştır, production'da atla
    if settings.ENVIRONMENT == "development":
        logger.info("Lokal ortam algılandı. Otomatik migrasyon başlatılıyor...")
        try:
            alembic_cfg = Config("alembic.ini")
            engine = create_async_engine(settings.DATABASE_URL)
            async with engine.begin() as conn:
                await conn.run_sync(run_upgrade, alembic_cfg)
            await engine.dispose()
            logger.info("Migrasyon başarıyla tamamlandı. Tablolar hazır.")
        except Exception as e:
            logger.error(f"Migrasyon hatası: {e}")
            raise e
    yield


app = FastAPI(
    title="LearnOps API",
    version="1.0.0",
    docs_url="/v1/docs",
    redoc_url="/v1/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
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
    https_only=settings.ENVIRONMENT == "production",
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
