from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # This ignores extra env vars not defined here
    )

    # Database (matches .env UPPERCASE names)
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "localdev123"
    POSTGRES_DB: str = "learnops_dev"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:localdev123@db:5432/learnops_dev"

    # JWT Settings (BE-07 ile ortak)
    JWT_SECRET: str = "change-me-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7


    # OAuth (matching .env UPPERCASE)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_PROJECT_ID: str = ""
    GOOGLE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    GOOGLE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    GOOGLE_AUTH_PROVIDER_X509_CERT_URL: str = "https://www.googleapis.com/oauth2/v1/certs"
    
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    
    # Token encryption
    TOKEN_ENCRYPTION_KEY: str = ""
    
    # Environment
    ENVIRONMENT: str = "development"
    BACKEND_INTERNAL_URL: str = "http://backend:8000"
    BACKEND_PUBLIC_URL: str = "http://localhost:8000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # For backward compatibility with existing code that uses lowercase
    @property
    def google_client_id(self) -> str:
        return self.GOOGLE_CLIENT_ID.strip()
    
    @property
    def google_client_secret(self) -> str:
        return self.GOOGLE_CLIENT_SECRET.strip()
    
    @property
    def allowed_origins(self) -> List[str]:
        return self.ALLOWED_ORIGINS
    
    @property
    def environment(self) -> str:
        return self.ENVIRONMENT

settings = Settings()
