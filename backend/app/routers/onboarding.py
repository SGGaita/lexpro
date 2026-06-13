"""
Onboarding / self-service registration.

Public endpoints — no auth token required.

POST /api/v1/onboarding/verify-storage  → test storage credentials before saving
POST /api/v1/onboarding/register        → create tenant + admin user + storage config
                                          returns a JWT so the firm is immediately logged in
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from botocore.config import Config

from app.database import get_db
from app.models import Tenant, User, StorageConfig, TenantPlan, UserRole, StorageProvider
from app.schemas import (
    OnboardingRequest, OnboardingResponse, StorageSetup,
    UserOut, TenantOut,
)
from app.auth.jwt import hash_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

PLAN_MAP = {
    "Starter":      TenantPlan.starter,
    "Professional": TenantPlan.professional,
    "Enterprise":   TenantPlan.enterprise,
}

BYOS_PROVIDERS = {"cloudflare_r2", "aws_s3", "azure_blob"}


def _build_s3_client(storage: StorageSetup):
    """Build a boto3 S3 client from a StorageSetup (works for R2, AWS S3)."""
    import boto3

    if storage.provider == "cloudflare_r2":
        endpoint = storage.endpoint_url or f"https://{storage.account_id}.r2.cloudflarestorage.com"
        region = "auto"
    elif storage.provider == "aws_s3":
        endpoint = None
        region = storage.region or "us-east-1"
    else:
        endpoint = storage.endpoint_url
        region = storage.region or "auto"

    kwargs = dict(
        aws_access_key_id=storage.access_key_id,
        aws_secret_access_key=storage.secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name=region,
    )
    if endpoint:
        kwargs["endpoint_url"] = endpoint

    return boto3.client("s3", **kwargs)


# ─── Verify Storage (public, no auth) ─────────────────────────────────────────

@router.post("/verify-storage")
async def verify_storage(body: StorageSetup):
    """
    Test that the supplied storage credentials can write to the bucket.
    Called from the frontend before the firm submits the registration form.
    """
    if body.provider == "lexpro_managed":
        return {"verified": True, "message": "LexPro Managed storage is always available."}

    # BYOS providers require credentials
    missing = [f for f in ("access_key_id", "secret_access_key", "bucket_name")
               if not getattr(body, f)]
    if missing:
        raise HTTPException(400, detail=f"Missing required fields: {', '.join(missing)}")

    if body.provider == "cloudflare_r2" and not (body.account_id or body.endpoint_url):
        raise HTTPException(400, detail="Cloudflare R2 requires account_id or endpoint_url")

    if body.provider == "azure_blob":
        # Azure uses a different SDK — placeholder for future implementation
        raise HTTPException(501, detail="Azure Blob Storage integration coming soon. Please choose R2 or S3.")

    try:
        client = _build_s3_client(body)
        test_key = ".lexpro-connection-test"
        client.put_object(
            Bucket=body.bucket_name,
            Key=test_key,
            Body=b"lexpro-ok",
            ContentType="text/plain",
        )
        client.delete_object(Bucket=body.bucket_name, Key=test_key)
        return {"verified": True, "message": "Connection successful — bucket is writable."}
    except Exception as exc:
        raise HTTPException(400, detail=f"Storage connection failed: {str(exc)}")


# ─── Register (public, no auth) ───────────────────────────────────────────────

@router.post("/register", response_model=OnboardingResponse, status_code=201)
async def register_firm(body: OnboardingRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new tenant, admin user, and (optionally) storage config in one transaction.
    Returns a JWT so the firm lands directly on the dashboard after signup.
    """

    # ── 1. Guard: email must be unique across the whole platform ──────────────
    existing = await db.execute(select(User).where(User.email == body.admin.email))
    if existing.scalar_one_or_none():
        raise HTTPException(400, detail="An account with this email already exists.")

    # ── 2. Validate plan ──────────────────────────────────────────────────────
    plan = PLAN_MAP.get(body.firm.plan, TenantPlan.professional)

    # ── 3. BYOS only available on Enterprise ─────────────────────────────────
    if body.storage.provider in BYOS_PROVIDERS and plan != TenantPlan.enterprise:
        raise HTTPException(
            400,
            detail="Custom storage (BYOS) requires the Enterprise plan. "
                   "Please upgrade your plan or choose LexPro Managed storage.",
        )

    # ── 4. Create Tenant ──────────────────────────────────────────────────────
    logo = body.firm.logo or "".join(w[0] for w in body.firm.name.split()[:2]).upper()
    tenant = Tenant(
        name=body.firm.name,
        specialty=body.firm.specialty,
        logo=logo,
        color=body.firm.color,
        plan=plan,
        established=body.firm.established,
        location=body.firm.location,
        storage_provider=StorageProvider(body.storage.provider),
        onboarding_complete=True,
        is_active=True,
    )
    db.add(tenant)
    await db.flush()  # populate tenant.id

    # ── 5. Create Admin User ──────────────────────────────────────────────────
    user = User(
        tenant_id=tenant.id,
        name=body.admin.name,
        email=body.admin.email,
        phone=body.admin.phone,
        hashed_password=hash_password(body.admin.password),
        role=UserRole.admin,
        billable_rate=0.0,
        is_active=True,
    )
    db.add(user)

    # ── 6. Create StorageConfig for BYOS providers ────────────────────────────
    if body.storage.provider in BYOS_PROVIDERS:
        from app.crypto import encrypt
        storage_config = StorageConfig(
            tenant_id=tenant.id,
            provider=StorageProvider(body.storage.provider),
            bucket_name=body.storage.bucket_name,
            account_id=body.storage.account_id,
            access_key_id=body.storage.access_key_id,
            secret_access_key=encrypt(body.storage.secret_access_key),
            region=body.storage.region,
            endpoint_url=body.storage.endpoint_url,
            is_verified=True,
        )
        db.add(storage_config)

    # ── 7. Commit everything ──────────────────────────────────────────────────
    await db.commit()
    await db.refresh(tenant)
    await db.refresh(user)

    # ── 8. Issue JWT — firm is immediately authenticated ──────────────────────
    token = create_access_token({
        "sub": user.id,
        "tenant_id": user.tenant_id,
        "role": user.role.value,
        "name": user.name,
    })

    return OnboardingResponse(
        access_token=token,
        user=UserOut.model_validate(user),
        tenant=TenantOut.model_validate(tenant),
    )
