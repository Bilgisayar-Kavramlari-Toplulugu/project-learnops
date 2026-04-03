from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # This ignores extra env vars not defined here
    )

    # Database settings
    # POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are deprecated
    # for Cloud Run. Cloud Run uses INSTANCE_CONNECTION_NAME, DB_USER,
    # and DB_NAME injected by Terraform.
    # DATABASE_URL remains as the local development fallback.

    # Database (populated from .env via pydantic-settings)
    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    DATABASE_URL: str = ""

    # JWT Settings
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Session middleware secret (separate from JWT)
    SESSION_SECRET: str = "change-me-session-secret-min-32-chars"

    # OAuth (matching .env UPPERCASE)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_PROJECT_ID: str = ""
    GOOGLE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    GOOGLE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    GOOGLE_AUTH_PROVIDER_X509_CERT_URL: str = (
        "https://www.googleapis.com/oauth2/v1/certs"
    )

    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""

    # Token encryption
    TOKEN_ENCRYPTION_KEY: str = ""

    # Environment
    ENVIRONMENT: str = "development"
    BACKEND_INTERNAL_URL: str = "http://backend:8080"
    BACKEND_PUBLIC_URL: str = "http://localhost:8000"
    FRONTEND_PUBLIC_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] | str = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        """Parse ALLOWED_ORIGINS from comma-separated string or list."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # JSON array formatını da handle et
            v = v.strip()
            if v.startswith("["):
                import json

                return json.loads(v)
            return [origin.strip() for origin in v.split(",")]
        return v

    # For backward compatibility with existing code that uses lowercase
    @property
    def google_client_id(self) -> str:
        return self.GOOGLE_CLIENT_ID.strip()

    @property
    def google_client_secret(self) -> str:
        return self.GOOGLE_CLIENT_SECRET.strip()

    @property
    def allowed_origins(self) -> List[str]:
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [
                origin.strip()
                for origin in self.ALLOWED_ORIGINS.split(",")
                if origin.strip()
            ]
        return self.ALLOWED_ORIGINS

    @property
    def environment(self) -> str:
        return self.ENVIRONMENT


settings = Settings()

# Startup validation: reject missing required settings per environment.
_REQUIRED_BY_ENV: dict[str, list[str]] = {
    "_common": [
        "JWT_SECRET",
        "TOKEN_ENCRYPTION_KEY",
    ],
    "testing": [
        "DATABASE_URL",
    ],
    "development": [
        "DATABASE_URL",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
    ],
    "staging": [
        "DATABASE_URL",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
    ],
    "production": [
        "DATABASE_URL",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
    ],
}

_required = _REQUIRED_BY_ENV.get("_common", []) + _REQUIRED_BY_ENV.get(
    settings.ENVIRONMENT, []
)
_missing = [name for name in _required if not getattr(settings, name)]
if _missing:
    raise RuntimeError(
        f"Missing required environment variables for "
        f"'{settings.ENVIRONMENT}': {', '.join(_missing)}. "
        "Set them in .env or as environment variables."
    )

# Startup validation: reject insecure defaults in non-development environments
_INSECURE_DEFAULTS = {
    "change-me-in-production-min-32-chars",
    "change-me-session-secret-min-32-chars",
}
if settings.ENVIRONMENT not in ("development", "testing"):
    if settings.JWT_SECRET in _INSECURE_DEFAULTS:
        raise RuntimeError(
            "JWT_SECRET must be changed from the default "
            "value in non-development environments"
        )
    if settings.SESSION_SECRET in _INSECURE_DEFAULTS:
        raise RuntimeError(
            "SESSION_SECRET must be changed from the default "
            "value in non-development environments"
        )
