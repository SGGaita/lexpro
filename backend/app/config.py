from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/lexprodb"

    # JWT
    SECRET_KEY: str = "super-secret-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    # App
    APP_NAME: str = "LexPro API"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://192.168.100.90",        # LAN dev machine
        "http://192.168.100.90:3000",
    ]

    # Google Calendar OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://192.168.100.90/api/v1/gcal/oauth/callback"
    APP_BASE_URL: str = "http://192.168.100.90"

    # Encryption key for storing storage credentials
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ENCRYPTION_KEY: str = "placeholder-replace-with-real-fernet-key-32bytes=="

    # Cloudflare R2 — LexPro managed (default storage for all tenants on managed plan)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "lexpro-documents"

    class Config:
        env_file = ".env"
        extra = "ignore"  # ignore unknown env vars (e.g. R2_TOKEN, custom vars)

settings = Settings()
