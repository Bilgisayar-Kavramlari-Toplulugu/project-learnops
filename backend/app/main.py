from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
import app.models  # noqa: F401 - ensure all SQLAlchemy models are registered
from app.routers import auth
from starlette.middleware.sessions import SessionMiddleware 

app = FastAPI(
    title="LearnOps API",
    version="1.0.0",
    docs_url="/v1/docs",
    redoc_url="/v1/redoc",
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
    secret_key=settings.JWT_SECRET,  # JWT_SECRET'i kullan
    session_cookie="learnops_session",
    max_age=3600,  # 1 saat
    same_site="lax",
    https_only=settings.ENVIRONMENT == "production"
)


app.include_router(auth.router, prefix="/v1")

@app.get("/v1/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
