from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Tenant
from app.schemas import LoginRequest, TokenResponse, UserOut, TenantOut
from app.auth.jwt import verify_password, create_access_token
from app.auth.deps import get_current_user, get_current_tenant

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find active user by email globally — no tenant selection required
    result = await db.execute(
        select(User).where(User.email == payload.email, User.is_active == True)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Load the user's firm
    result = await db.execute(
        select(Tenant).where(Tenant.id == user.tenant_id, Tenant.is_active == True)
    )
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your firm account is inactive. Please contact support.",
        )

    token = create_access_token({
        "sub": user.id,
        "tenant_id": user.tenant_id,
        "role": user.role.value,
        "name": user.name,
    })

    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
        tenant=TenantOut.model_validate(tenant),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.get("/tenants")
async def list_tenants(db: AsyncSession = Depends(get_db)):
    """Public endpoint — returns tenant list for the login screen selector."""
    result = await db.execute(select(Tenant).where(Tenant.is_active == True))
    tenants = result.scalars().all()
    return [TenantOut.model_validate(t) for t in tenants]
