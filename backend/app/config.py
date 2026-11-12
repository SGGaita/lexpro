import logging
import secrets
from typing import Literal

from cryptography.fernet import Fernet
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("lexpro.config")

# Values that must never be used outside local development.
_INSECURE_SECRET_KEYS = {
    "",
    "super-secret-change-in-production-please",
    "change-this-in-production",
    "change-this-to-a-random-256-bit-secret",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Environment: development | staging | production
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False

    # Dev-only admin endpoints (/api/v1/admin/*). Only honoured when ENVIRONMENT=development.
    ENABLE_ADMIN_ROUTES: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/lexprodb"

    # JWT — must be set (>= 32 chars) outside development
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    # App
    APP_NAME: str = "LexPro API"
    CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
    ]

    # Google Calendar OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost/api/v1/gcal/oauth/callback"
    APP_BASE_URL: str = "http://localhost"

    # Fernet key used to encrypt stored storage credentials.
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ENCRYPTION_KEY: str = ""
    # Comma-separated previous keys, still accepted for decryption while rotating.
    ENCRYPTION_KEYS_OLD: str = ""

    # Cloudflare R2 — LexPro managed (default storage for all tenants on managed plan)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "lexpro-documents"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def admin_routes_enabled(self) -> bool:
        return self.is_development and self.ENABLE_ADMIN_ROUTES

    @model_validator(mode="after")
    def _check_secrets(self) -> "Settings":
        problems: list[str] = []

        if self.SECRET_KEY in _INSECURE_SECRET_KEYS or len(self.SECRET_KEY) < 32:
            if self.is_development:
                # Ephemeral key: tokens stop working on restart, which is fine locally.
                self.SECRET_KEY = secrets.token_urlsafe(48)
                logger.warning("SECRET_KEY not set; using a random key for this process (development only).")
            else:
                problems.append("SECRET_KEY must be set to a random value of at least 32 characters")

        if self.ENCRYPTION_KEY:
            try:
                Fernet(self.ENCRYPTION_KEY.encode())
            except Exception:
                problems.append("ENCRYPTION_KEY is not a valid Fernet key")
        elif not self.is_development:
            problems.append("ENCRYPTION_KEY must be set")

        for old in self.old_encryption_keys:
            try:
                Fernet(old.encode())
            except Exception:
                problems.append("ENCRYPTION_KEYS_OLD contains an invalid Fernet key")
                break

        if not self.is_development and self.DEBUG:
            problems.append("DEBUG must be false outside development")

        if problems:
            raise ValueError(f"Insecure configuration for ENVIRONMENT={self.ENVIRONMENT}: " + "; ".join(problems))
        return self

    @property
    def old_encryption_keys(self) -> list[str]:
        return [k.strip() for k in self.ENCRYPTION_KEYS_OLD.split(",") if k.strip()]


settings = Settings()
