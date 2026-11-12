"""
Tenant-aware file storage service.

Supports:
  - lexpro_managed  → LexPro's own Cloudflare R2 bucket (platform-managed)
                      Falls back to local disk if platform R2 env vars aren't set (dev only)
  - cloudflare_r2   → Tenant's own R2 bucket (BYOS)
  - aws_s3          → Tenant's own S3 bucket (BYOS)

Usage:
    file_path, size_str = await upload_file(storage_config, tenant_id, doc_id, fastapi_upload)
    url = get_presigned_url(storage_config, file_path, filename)
    await delete_file(storage_config, file_path)
"""

import os
from pathlib import Path
from typing import Optional, Tuple

import boto3
from botocore.client import Config
from fastapi import UploadFile

from app.models import StorageConfig, StorageProvider
from app.crypto import decrypt
from app.config import settings   # pydantic-settings reads .env; os.getenv() does NOT


# ─── Platform R2 (lexpro_managed) ────────────────────────────────────────────
# Sourced via pydantic-settings from backend/.env

def _platform_cfg():
    """Return live platform R2 config (re-read every call so hot-reload works)."""
    account_id = settings.R2_ACCOUNT_ID or ""
    return {
        "bucket":    settings.R2_BUCKET_NAME or "lexpro-documents",
        "key_id":    settings.R2_ACCESS_KEY_ID or "",
        "secret":    settings.R2_SECRET_ACCESS_KEY or "",
        "endpoint":  f"https://{account_id}.r2.cloudflarestorage.com" if account_id else "",
    }

# Local fallback (dev only — when platform R2 is not configured)
_LOCAL_UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))


def _platform_r2_configured() -> bool:
    cfg = _platform_cfg()
    return bool(cfg["key_id"] and cfg["secret"] and cfg["endpoint"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _fmt_size(n: int) -> str:
    if n < 1024:
        return f"{n} B"
    if n < 1024 ** 2:
        return f"{n / 1024:.1f} KB"
    return f"{n / 1024 ** 2:.1f} MB"


def _platform_s3():
    """boto3 client using LexPro's own R2 credentials (reads settings at call time)."""
    cfg = _platform_cfg()
    return boto3.client(
        "s3",
        endpoint_url=cfg["endpoint"],
        aws_access_key_id=cfg["key_id"],
        aws_secret_access_key=cfg["secret"],
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def _tenant_s3(cfg: StorageConfig):
    """boto3 client using a tenant's own BYOS credentials."""
    return boto3.client(
        "s3",
        endpoint_url=cfg.endpoint_url,
        aws_access_key_id=cfg.access_key_id,
        aws_secret_access_key=decrypt(cfg.secret_access_key),
        region_name=cfg.region or "auto",
        config=Config(signature_version="s3v4"),
    )


def _provider(cfg: Optional[StorageConfig]) -> StorageProvider:
    return cfg.provider if cfg else StorageProvider.lexpro_managed


# ─── Upload ───────────────────────────────────────────────────────────────────

async def upload_file(
    storage_config: Optional[StorageConfig],
    tenant_id: str,
    doc_id: str,
    file: UploadFile,
) -> Tuple[str, str]:
    """Upload *file* to the appropriate storage backend.

    Returns (object_key_or_local_path, human_size_str).
    """
    provider = _provider(storage_config)
    content = await file.read()
    size_str = _fmt_size(len(content))
    ext = Path(file.filename or "").suffix or ""
    obj_key = f"{tenant_id}/{doc_id}{ext}"

    if provider == StorageProvider.lexpro_managed:
        if _platform_r2_configured():
            # Store in LexPro's shared R2 bucket
            _platform_s3().put_object(
                Bucket=_platform_cfg()["bucket"],
                Key=obj_key,
                Body=content,
                ContentType=file.content_type or "application/octet-stream",
            )
            return obj_key, size_str
        else:
            # Dev fallback: local disk
            dest_dir = _LOCAL_UPLOAD_DIR / tenant_id
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest_path = dest_dir / f"{doc_id}{ext}"
            dest_path.write_bytes(content)
            return str(dest_path), size_str

    if provider in (StorageProvider.cloudflare_r2, StorageProvider.aws_s3):
        _tenant_s3(storage_config).put_object(
            Bucket=storage_config.bucket_name,
            Key=obj_key,
            Body=content,
            ContentType=file.content_type or "application/octet-stream",
        )
        return obj_key, size_str

    raise NotImplementedError(f"Storage provider not yet supported: {provider}")


# ─── Download ─────────────────────────────────────────────────────────────────

def get_presigned_url(
    storage_config: Optional[StorageConfig],
    file_path: str,
    filename: str,
    expires: int = 3600,
) -> Optional[str]:
    """Return a presigned download URL, or None if the file must be streamed locally."""
    provider = _provider(storage_config)
    params = {
        "Bucket": None,
        "Key": file_path,
        "ResponseContentDisposition": f'attachment; filename="{filename}"',
    }

    if provider == StorageProvider.lexpro_managed:
        if _platform_r2_configured():
            params["Bucket"] = _platform_cfg()["bucket"]
            return _platform_s3().generate_presigned_url("get_object", Params=params, ExpiresIn=expires)
        return None  # local dev — caller streams file

    if provider in (StorageProvider.cloudflare_r2, StorageProvider.aws_s3):
        params["Bucket"] = storage_config.bucket_name
        return _tenant_s3(storage_config).generate_presigned_url("get_object", Params=params, ExpiresIn=expires)

    return None


# ─── Delete ───────────────────────────────────────────────────────────────────

async def delete_file(
    storage_config: Optional[StorageConfig],
    file_path: str,
) -> None:
    """Remove the underlying file (best-effort; swallows errors)."""
    if not file_path:
        return
    provider = _provider(storage_config)

    try:
        if provider == StorageProvider.lexpro_managed:
            if _platform_r2_configured():
                _platform_s3().delete_object(Bucket=_platform_cfg()["bucket"], Key=file_path)
            else:
                Path(file_path).unlink(missing_ok=True)

        elif provider in (StorageProvider.cloudflare_r2, StorageProvider.aws_s3):
            _tenant_s3(storage_config).delete_object(
                Bucket=storage_config.bucket_name, Key=file_path
            )
    except Exception:
        pass
