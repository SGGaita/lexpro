"""
Symmetric encryption for sensitive fields (e.g. storage secret keys).
Uses Fernet (AES-128-CBC + HMAC-SHA256) via MultiFernet so keys can be rotated.

- ENCRYPTION_KEY       — the current key; all new values are encrypted with it.
- ENCRYPTION_KEYS_OLD  — comma-separated previous keys, still accepted for decryption.

Generate a key:
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

Rotate: put the old key in ENCRYPTION_KEYS_OLD, the new key in ENCRYPTION_KEY, run
    python -m app.scripts.rotate_encryption_key
then remove the old key from ENCRYPTION_KEYS_OLD.
"""
from cryptography.fernet import Fernet, InvalidToken, MultiFernet

from app.config import settings

_fernet: MultiFernet | None = None


def _get_fernet() -> MultiFernet:
    global _fernet
    if _fernet is None:
        if not settings.ENCRYPTION_KEY:
            raise RuntimeError("ENCRYPTION_KEY is not configured")
        keys = [settings.ENCRYPTION_KEY, *settings.old_encryption_keys]
        _fernet = MultiFernet([Fernet(k.encode()) for k in keys])
    return _fernet


def encrypt(value: str) -> str:
    """Encrypt a plaintext string with the current key; returns a URL-safe base64 token."""
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    """Decrypt a token produced by encrypt() with the current or any old key."""
    try:
        return _get_fernet().decrypt(value.encode()).decode()
    except InvalidToken as e:
        raise ValueError("Failed to decrypt value — wrong key or corrupted data") from e


def rotate(value: str) -> str:
    """Re-encrypt a token under the current key (accepts tokens from any configured key)."""
    try:
        return _get_fernet().rotate(value.encode()).decode()
    except InvalidToken as e:
        raise ValueError("Failed to rotate value — wrong key or corrupted data") from e
