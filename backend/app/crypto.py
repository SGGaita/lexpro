"""
Symmetric encryption for sensitive fields (e.g. storage secret keys).
Uses Fernet (AES-128-CBC + HMAC-SHA256).

Generate a key once and store it in .env as ENCRYPTION_KEY:
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
"""
from cryptography.fernet import Fernet, InvalidToken
from app.config import settings

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = settings.ENCRYPTION_KEY.encode()
        _fernet = Fernet(key)
    return _fernet


def encrypt(value: str) -> str:
    """Encrypt a plaintext string; returns a URL-safe base64 token."""
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    """Decrypt a token produced by encrypt(); raises ValueError on bad token."""
    try:
        return _get_fernet().decrypt(value.encode()).decode()
    except InvalidToken as e:
        raise ValueError("Failed to decrypt value — wrong key or corrupted data") from e
