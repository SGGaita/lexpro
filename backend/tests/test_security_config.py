"""Security configuration tests for issue #1 (Security lockdown)."""
import importlib
import sys

import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient

STRONG_SECRET = "x" * 48


def _settings(monkeypatch, **env):
    for key in ("ENVIRONMENT", "DEBUG", "SECRET_KEY", "ENCRYPTION_KEY", "ENCRYPTION_KEYS_OLD", "ENABLE_ADMIN_ROUTES"):
        monkeypatch.delenv(key, raising=False)
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    from app.config import Settings
    return Settings(_env_file=None)


def _fresh_app(monkeypatch, **env):
    """Re-import app.config / app.main with the given environment."""
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    for mod in [m for m in sys.modules if m == "app" or m.startswith("app.")]:
        del sys.modules[mod]
    return importlib.import_module("app.main").app


def test_debug_defaults_to_false(monkeypatch):
    assert _settings(monkeypatch).DEBUG is False


def test_production_rejects_missing_secret_key(monkeypatch):
    with pytest.raises(ValueError, match="SECRET_KEY"):
        _settings(monkeypatch, ENVIRONMENT="production", ENCRYPTION_KEY=Fernet.generate_key().decode())


@pytest.mark.parametrize("weak", ["change-this-in-production", "short"])
def test_production_rejects_weak_secret_key(monkeypatch, weak):
    with pytest.raises(ValueError, match="SECRET_KEY"):
        _settings(monkeypatch, ENVIRONMENT="production", SECRET_KEY=weak,
                  ENCRYPTION_KEY=Fernet.generate_key().decode())


def test_production_rejects_missing_encryption_key(monkeypatch):
    with pytest.raises(ValueError, match="ENCRYPTION_KEY"):
        _settings(monkeypatch, ENVIRONMENT="production", SECRET_KEY=STRONG_SECRET)


def test_production_rejects_debug(monkeypatch):
    with pytest.raises(ValueError, match="DEBUG"):
        _settings(monkeypatch, ENVIRONMENT="production", DEBUG="true", SECRET_KEY=STRONG_SECRET,
                  ENCRYPTION_KEY=Fernet.generate_key().decode())


def test_invalid_encryption_key_rejected(monkeypatch):
    with pytest.raises(ValueError, match="Fernet"):
        _settings(monkeypatch, SECRET_KEY=STRONG_SECRET, ENCRYPTION_KEY="not-a-key")


def test_development_generates_ephemeral_secret(monkeypatch):
    s = _settings(monkeypatch)
    assert len(s.SECRET_KEY) >= 32


def test_admin_routes_require_development_and_flag(monkeypatch):
    assert _settings(monkeypatch).admin_routes_enabled is False
    assert _settings(monkeypatch, ENABLE_ADMIN_ROUTES="true").admin_routes_enabled is True
    with pytest.raises(ValueError):
        # staging must also have proper secrets, so give them and check the flag is ignored
        _settings(monkeypatch, ENVIRONMENT="staging", ENABLE_ADMIN_ROUTES="true")
    s = _settings(monkeypatch, ENVIRONMENT="staging", ENABLE_ADMIN_ROUTES="true",
                  SECRET_KEY=STRONG_SECRET, ENCRYPTION_KEY=Fernet.generate_key().decode())
    assert s.admin_routes_enabled is False


def test_admin_endpoints_not_mounted_by_default(monkeypatch):
    app = _fresh_app(monkeypatch, ENVIRONMENT="development", ENABLE_ADMIN_ROUTES="false")
    client = TestClient(app)
    assert client.post("/api/v1/admin/init-db").status_code == 404
    assert client.post("/api/v1/admin/create-tables").status_code == 404


def test_production_hides_api_docs(monkeypatch):
    app = _fresh_app(monkeypatch, ENVIRONMENT="production", DEBUG="false", SECRET_KEY=STRONG_SECRET,
                     ENCRYPTION_KEY=Fernet.generate_key().decode(), ENABLE_ADMIN_ROUTES="true")
    client = TestClient(app)
    assert client.get("/docs").status_code == 404
    assert client.get("/openapi.json").status_code == 404
    assert client.post("/api/v1/admin/init-db").status_code == 404


def test_key_rotation_roundtrip(monkeypatch):
    old, new = Fernet.generate_key().decode(), Fernet.generate_key().decode()
    for mod in [m for m in sys.modules if m == "app" or m.startswith("app.")]:
        del sys.modules[mod]
    monkeypatch.setenv("ENCRYPTION_KEY", old)
    monkeypatch.delenv("ENCRYPTION_KEYS_OLD", raising=False)
    token = importlib.import_module("app.crypto").encrypt("s3cret")

    for mod in [m for m in sys.modules if m == "app" or m.startswith("app.")]:
        del sys.modules[mod]
    monkeypatch.setenv("ENCRYPTION_KEY", new)
    monkeypatch.setenv("ENCRYPTION_KEYS_OLD", old)
    crypto = importlib.import_module("app.crypto")
    assert crypto.decrypt(token) == "s3cret"
    rotated = crypto.rotate(token)
    assert Fernet(new.encode()).decrypt(rotated.encode()).decode() == "s3cret"
