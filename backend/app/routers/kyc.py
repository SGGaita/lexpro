"""
KYC (Know Your Client) router
  GET    /kyc/{client_id}          – fetch KYC record (creates empty one if none)
  PUT    /kyc/{client_id}          – upsert KYC data
  POST   /kyc/{client_id}/verify   – mark Verified (admin/partner only)
  POST   /kyc/{client_id}/reject   – mark Rejected (admin/partner only)
  POST   /cases/conflict-check     – check for conflicts before opening a case
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.deps import get_current_user, get_current_tenant
from app.models import ClientKYC, Client, Case, User, KYCStatus
from app.schemas import KYCOut, KYCCreate, ConflictResult

router = APIRouter(tags=["KYC & Conflicts"])

_PRIVILEGED = {"Admin", "Senior Partner", "Partner"}


def _not_found(msg="Not found"):
    raise HTTPException(status_code=404, detail=msg)


async def _get_or_create_kyc(client_id: str, tenant_id: str, db: AsyncSession) -> ClientKYC:
    """Return existing KYC record or create a blank one."""
    res = await db.execute(
        select(ClientKYC).where(ClientKYC.client_id == client_id, ClientKYC.tenant_id == tenant_id)
    )
    kyc = res.scalar_one_or_none()
    if not kyc:
        kyc = ClientKYC(tenant_id=tenant_id, client_id=client_id)
        db.add(kyc)
        await db.commit()
        await db.refresh(kyc)
    return kyc


async def _enrich(kyc: ClientKYC, db: AsyncSession) -> KYCOut:
    out = KYCOut.model_validate(kyc)
    if kyc.verified_by_id:
        r = await db.execute(select(User.name).where(User.id == kyc.verified_by_id))
        out.verified_by_name = r.scalar_one_or_none()
    return out


# ─── GET ──────────────────────────────────────────────────────────────────────

@router.get("/kyc/{client_id}", response_model=KYCOut)
async def get_kyc(
    client_id: str,
    current_user: User = Depends(get_current_user),
    tenant=Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    # Confirm client belongs to tenant
    cr = await db.execute(select(Client).where(Client.id == client_id, Client.tenant_id == tenant.id))
    if not cr.scalar_one_or_none():
        _not_found("Client not found")
    kyc = await _get_or_create_kyc(client_id, tenant.id, db)
    return await _enrich(kyc, db)


# ─── PUT (upsert) ─────────────────────────────────────────────────────────────

@router.put("/kyc/{client_id}", response_model=KYCOut)
async def update_kyc(
    client_id: str,
    body: KYCCreate,
    current_user: User = Depends(get_current_user),
    tenant=Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    cr = await db.execute(select(Client).where(Client.id == client_id, Client.tenant_id == tenant.id))
    if not cr.scalar_one_or_none():
        _not_found("Client not found")
    kyc = await _get_or_create_kyc(client_id, tenant.id, db)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(kyc, field, value)
    kyc.updated_at = datetime.utcnow()

    # Auto-upgrade risk if PEP
    if kyc.pep and kyc.risk_rating == "Low":
        kyc.risk_rating = "High"

    await db.commit()
    await db.refresh(kyc)
    return await _enrich(kyc, db)


# ─── Verify ───────────────────────────────────────────────────────────────────

@router.post("/kyc/{client_id}/verify", response_model=KYCOut)
async def verify_kyc(
    client_id: str,
    current_user: User = Depends(get_current_user),
    tenant=Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role not in _PRIVILEGED:
        raise HTTPException(status_code=403, detail="Only Admin or Partners can verify KYC")

    kyc = await _get_or_create_kyc(client_id, tenant.id, db)
    kyc.status = KYCStatus.verified
    kyc.verified_by_id = current_user.id
    kyc.verified_at = datetime.utcnow()
    kyc.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(kyc)
    return await _enrich(kyc, db)


# ─── Reject ───────────────────────────────────────────────────────────────────

@router.post("/kyc/{client_id}/reject", response_model=KYCOut)
async def reject_kyc(
    client_id: str,
    current_user: User = Depends(get_current_user),
    tenant=Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role not in _PRIVILEGED:
        raise HTTPException(status_code=403, detail="Only Admin or Partners can reject KYC")

    kyc = await _get_or_create_kyc(client_id, tenant.id, db)
    kyc.status = KYCStatus.rejected
    kyc.verified_by_id = current_user.id
    kyc.verified_at = datetime.utcnow()
    kyc.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(kyc)
    return await _enrich(kyc, db)


# ─── Conflict Check ───────────────────────────────────────────────────────────

@router.post("/cases/conflict-check", response_model=ConflictResult)
async def conflict_check(
    body: dict,
    current_user: User = Depends(get_current_user),
    tenant=Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Check for conflicts of interest before opening / updating a case.

    Body fields (all optional):
      client_id        – the client for this case
      opposing_party   – name of opposing party (free text)
      assigned_user_id – lawyer to be assigned
      case_id          – current case ID when editing (exclude self from checks)
    """
    client_id:        Optional[str] = body.get("client_id")
    opposing_party:   Optional[str] = (body.get("opposing_party") or "").strip()
    assigned_user_id: Optional[str] = body.get("assigned_user_id")
    exclude_case_id:  Optional[str] = body.get("case_id")

    conflicts = []

    # ── 1. Opposing party is an existing client ─────────────────────────────
    if opposing_party:
        # Case-insensitive partial match on client names
        r = await db.execute(
            select(Client).where(
                Client.tenant_id == tenant.id,
                func.lower(Client.name).contains(opposing_party.lower()),
            )
        )
        matched_clients = r.scalars().all()
        for mc in matched_clients:
            if mc.id != client_id:   # skip if same client
                conflicts.append({
                    "type": "opposing_is_client",
                    "severity": "high",
                    "title": "Opposing party is a firm client",
                    "detail": f'"{opposing_party}" matches existing client "{mc.name}". '
                              f"Representing both sides creates a direct conflict.",
                    "client_name": mc.name,
                    "client_id": mc.id,
                })

    # ── 2. This client previously appeared as opposing party ────────────────
    if client_id:
        client_res = await db.execute(select(Client).where(Client.id == client_id, Client.tenant_id == tenant.id))
        client_obj = client_res.scalar_one_or_none()
        if client_obj:
            client_name = client_obj.name
            q = select(Case).where(
                Case.tenant_id == tenant.id,
                func.lower(Case.opposing_party).contains(client_name.lower()),
            )
            if exclude_case_id:
                q = q.where(Case.id != exclude_case_id)
            r = await db.execute(q)
            prior_cases = r.scalars().all()
            for pc in prior_cases:
                conflicts.append({
                    "type": "client_was_opposing",
                    "severity": "high",
                    "title": "Client was opposing party in a prior case",
                    "detail": f'"{client_name}" was listed as opposing party in case '
                              f'"{pc.title}" ({pc.case_no or pc.id[:8]}). '
                              f"Check for side-switching conflict.",
                    "case_title": pc.title,
                    "case_no": pc.case_no,
                })

    # ── 3. Assigned lawyer is already on a case where this client is opposing ─
    if assigned_user_id and client_id:
        client_res = await db.execute(select(Client).where(Client.id == client_id, Client.tenant_id == tenant.id))
        client_obj = client_res.scalar_one_or_none()
        if client_obj:
            client_name = client_obj.name
            q = select(Case).where(
                Case.tenant_id == tenant.id,
                Case.assigned_user_id == assigned_user_id,
                func.lower(Case.opposing_party).contains(client_name.lower()),
            )
            if exclude_case_id:
                q = q.where(Case.id != exclude_case_id)
            r = await db.execute(q)
            lawyer_conflicts = r.scalars().all()

            # Also look up lawyer name
            lr = await db.execute(select(User.name).where(User.id == assigned_user_id))
            lawyer_name = lr.scalar_one_or_none() or "The assigned lawyer"

            for lc in lawyer_conflicts:
                conflicts.append({
                    "type": "lawyer_conflict",
                    "severity": "medium",
                    "title": "Lawyer has opposing interest in another case",
                    "detail": f'"{lawyer_name}" is assigned to case "{lc.title}" '
                              f'where "{client_name}" is the opposing party.',
                    "lawyer_name": lawyer_name,
                    "case_title": lc.title,
                })

    # ── 4. Same lawyer assigned to both sides of related matter ────────────
    if assigned_user_id and opposing_party:
        q = select(Case).where(
            Case.tenant_id == tenant.id,
            Case.assigned_user_id == assigned_user_id,
        )
        if client_id:
            q = q.where(Case.client_id == client_id)
        if exclude_case_id:
            q = q.where(Case.id != exclude_case_id)
        r = await db.execute(q)
        same_lawyer_cases = r.scalars().all()

        lr = await db.execute(select(User.name).where(User.id == assigned_user_id))
        lawyer_name = lr.scalar_one_or_none() or "The assigned lawyer"

        for slc in same_lawyer_cases:
            if slc.opposing_party and opposing_party.lower() in (slc.opposing_party or "").lower():
                conflicts.append({
                    "type": "same_opposing_party",
                    "severity": "medium",
                    "title": "Same opposing party in another case",
                    "detail": f'"{lawyer_name}" already handles a case against "{opposing_party}" '
                              f'("{slc.title}"). Verify this is not the same dispute.',
                    "case_title": slc.title,
                })

    return ConflictResult(has_conflicts=len(conflicts) > 0, conflicts=conflicts)
