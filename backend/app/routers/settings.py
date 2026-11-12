"""
Settings router — firm profile + storage configuration.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import Tenant, StorageConfig, StorageProvider
from app.auth.deps import get_current_tenant, get_current_user
from app.models import User
from app.crypto import encrypt, decrypt


router = APIRouter(prefix="/settings", tags=["Settings"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class FirmProfileUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    location: Optional[str] = None
    established: Optional[str] = None
    color: Optional[str] = None
    logo: Optional[str] = None


class StorageConfigOut(BaseModel):
    provider: str
    bucket_name: Optional[str] = None
    account_id: Optional[str] = None
    access_key_id: Optional[str] = None
    secret_key_masked: Optional[str] = None  # last 4 chars only
    endpoint_url: Optional[str] = None
    region: Optional[str] = None
    is_verified: bool = False


class StorageConfigUpdate(BaseModel):
    provider: str  # lexpro_managed | cloudflare_r2 | aws_s3
    bucket_name: Optional[str] = None
    account_id: Optional[str] = None
    access_key_id: Optional[str] = None
    secret_access_key: Optional[str] = None  # raw — will be encrypted
    endpoint_url: Optional[str] = None
    region: Optional[str] = None


class SettingsOut(BaseModel):
    id: str
    name: str
    specialty: Optional[str]
    location: Optional[str]
    established: Optional[str]
    color: str
    logo: Optional[str]
    plan: str
    storage: Optional[StorageConfigOut]


# ─── GET /settings ─────────────────────────────────────────────────────────────

@router.get("", response_model=SettingsOut)
async def get_settings(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    r = await db.execute(select(StorageConfig).where(StorageConfig.tenant_id == tenant.id))
    sc = r.scalar_one_or_none()

    storage_out = None
    if sc:
        masked = None
        if sc.secret_access_key:
            try:
                raw = decrypt(sc.secret_access_key)
                masked = "•" * (len(raw) - 4) + raw[-4:]
            except Exception:
                masked = "••••••••"
        storage_out = StorageConfigOut(
            provider=sc.provider.value if hasattr(sc.provider, "value") else sc.provider,
            bucket_name=sc.bucket_name,
            account_id=sc.account_id,
            access_key_id=sc.access_key_id,
            secret_key_masked=masked,
            endpoint_url=sc.endpoint_url,
            region=sc.region,
            is_verified=sc.is_verified,
        )

    plan = tenant.plan.value if hasattr(tenant.plan, "value") else tenant.plan
    return SettingsOut(
        id=tenant.id,
        name=tenant.name,
        specialty=tenant.specialty,
        location=tenant.location,
        established=tenant.established,
        color=tenant.color,
        logo=tenant.logo,
        plan=plan,
        storage=storage_out,
    )


# ─── PUT /settings/profile ─────────────────────────────────────────────────────

@router.put("/profile", response_model=SettingsOut)
async def update_profile(
    body: FirmProfileUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(tenant, k, v)
    await db.flush()
    await db.refresh(tenant)
    return await get_settings(tenant=tenant, db=db)


# ─── PUT /settings/storage ─────────────────────────────────────────────────────

@router.put("/storage", response_model=StorageConfigOut)
async def update_storage(
    body: StorageConfigUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    # Validate provider
    try:
        provider_enum = StorageProvider(body.provider)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {body.provider}")

    if provider_enum in (StorageProvider.cloudflare_r2, StorageProvider.aws_s3):
        missing = [f for f in ("bucket_name", "access_key_id") if not getattr(body, f)]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    # Encrypt secret key if provided
    encrypted_secret = None
    raw_secret = None
    if body.secret_access_key:
        raw_secret = body.secret_access_key
        encrypted_secret = encrypt(body.secret_access_key)

    # Build endpoint URL for R2 if not provided
    endpoint_url = body.endpoint_url
    if provider_enum == StorageProvider.cloudflare_r2 and not endpoint_url and body.account_id:
        endpoint_url = f"https://{body.account_id}.r2.cloudflarestorage.com"

    # Upsert storage config
    r = await db.execute(select(StorageConfig).where(StorageConfig.tenant_id == tenant.id))
    sc = r.scalar_one_or_none()

    if sc:
        sc.provider = provider_enum
        sc.bucket_name = body.bucket_name
        sc.account_id = body.account_id
        sc.access_key_id = body.access_key_id
        if encrypted_secret:
            sc.secret_access_key = encrypted_secret
        sc.endpoint_url = endpoint_url
        sc.region = body.region
        sc.is_verified = False  # re-verify after any change
    else:
        from app.models import gen_uuid
        sc = StorageConfig(
            id=gen_uuid(),
            tenant_id=tenant.id,
            provider=provider_enum,
            bucket_name=body.bucket_name,
            account_id=body.account_id,
            access_key_id=body.access_key_id,
            secret_access_key=encrypted_secret,
            endpoint_url=endpoint_url,
            region=body.region,
            is_verified=False,
        )
        db.add(sc)

    # Verify connection
    if provider_enum == StorageProvider.lexpro_managed:
        # Verify using platform R2 credentials from settings
        try:
            from app.storage import _platform_r2_configured, _platform_s3, _platform_cfg
            if _platform_r2_configured():
                _platform_s3().head_bucket(Bucket=_platform_cfg()["bucket"])
                sc.is_verified = True
            else:
                sc.is_verified = True  # No platform R2 yet — accept it (dev mode)
        except Exception:
            sc.is_verified = False

    elif provider_enum in (StorageProvider.cloudflare_r2, StorageProvider.aws_s3) and raw_secret:
        try:
            import boto3
            from botocore.client import Config
            s3 = boto3.client(
                "s3",
                endpoint_url=endpoint_url,
                aws_access_key_id=body.access_key_id,
                aws_secret_access_key=raw_secret,
                region_name=body.region or "auto",
                config=Config(signature_version="s3v4"),
            )
            s3.head_bucket(Bucket=body.bucket_name)
            sc.is_verified = True
        except Exception:
            sc.is_verified = False

    await db.flush()
    await db.refresh(sc)

    masked = None
    if sc.secret_access_key:
        try:
            raw = decrypt(sc.secret_access_key)
            masked = "•" * (len(raw) - 4) + raw[-4:]
        except Exception:
            masked = "••••••••"

    return StorageConfigOut(
        provider=sc.provider.value if hasattr(sc.provider, "value") else sc.provider,
        bucket_name=sc.bucket_name,
        account_id=sc.account_id,
        access_key_id=sc.access_key_id,
        secret_key_masked=masked,
        endpoint_url=sc.endpoint_url,
        region=sc.region,
        is_verified=sc.is_verified,
    )


# ─── POST /settings/storage/verify ─────────────────────────────────────────────

@router.post("/storage/verify")
async def verify_storage(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Test the saved credentials by doing a head_bucket call."""
    r = await db.execute(select(StorageConfig).where(StorageConfig.tenant_id == tenant.id))
    sc = r.scalar_one_or_none()
    if not sc:
        raise HTTPException(status_code=404, detail="No storage config found")

    if sc.provider == StorageProvider.lexpro_managed:
        from app.storage import _platform_r2_configured, _platform_s3, _platform_cfg
        if not _platform_r2_configured():
            return {"verified": True, "message": "Using local storage (dev mode — R2 not configured)"}
        try:
            _platform_s3().head_bucket(Bucket=_platform_cfg()["bucket"])
            sc.is_verified = True
            await db.flush()
            return {"verified": True, "message": f"Connected to LexPro R2 bucket '{_platform_cfg()['bucket']}'"}
        except Exception as e:
            return {"verified": False, "message": f"Platform R2 error: {e}"}

    try:
        import boto3
        from botocore.client import Config
        s3 = boto3.client(
            "s3",
            endpoint_url=sc.endpoint_url,
            aws_access_key_id=sc.access_key_id,
            aws_secret_access_key=decrypt(sc.secret_access_key),
            region_name=sc.region or "auto",
            config=Config(signature_version="s3v4"),
        )
        s3.head_bucket(Bucket=sc.bucket_name)
        sc.is_verified = True
        await db.flush()
        return {"verified": True, "message": f"Successfully connected to bucket '{sc.bucket_name}'"}
    except Exception as e:
        sc.is_verified = False
        await db.flush()
        return {"verified": False, "message": str(e)}
