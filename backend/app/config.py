from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

    database_url: str = "postgresql+asyncpg://learnops:localdev@localhost/learnops"
    jwt_secret: str = "change-me-in-production-min-32-chars"
    environment: str = "development"
    allowed_origins: list[str] = ["http://localhost:3000"]

    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    token_encryption_key: str = ""

settings = Settings()