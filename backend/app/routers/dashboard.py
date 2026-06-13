from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime
from app.database import get_db
from app.models import User, Tenant, Client, Case, Invoice, TimeEntry, CalendarEvent, CaseStatus, InvoiceStatus
from app.schemas import DashboardStats
from app.auth.deps import get_current_user, get_current_tenant

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    tid = tenant.id
    now = datetime.utcnow()

    active_cases = await db.scalar(select(func.count(Case.id)).where(Case.tenant_id == tid, Case.status == CaseStatus.active))
    total_clients = await db.scalar(select(func.count(Client.id)).where(Client.tenant_id == tid))
    total_staff = await db.scalar(select(func.count(User.id)).where(User.tenant_id == tid, User.is_active == True))

    pending_inv = await db.scalar(select(func.count(Invoice.id)).where(Invoice.tenant_id == tid, Invoice.status.in_([InvoiceStatus.pending, InvoiceStatus.overdue, InvoiceStatus.partial])))
    overdue_inv = await db.scalar(select(func.count(Invoice.id)).where(Invoice.tenant_id == tid, Invoice.status == InvoiceStatus.overdue))

    total_billed = await db.scalar(select(func.coalesce(func.sum(Invoice.amount), 0)).where(Invoice.tenant_id == tid)) or 0
    total_revenue = await db.scalar(select(func.coalesce(func.sum(Invoice.paid), 0)).where(Invoice.tenant_id == tid)) or 0

    unbilled_hours = await db.scalar(
        select(func.coalesce(func.sum(TimeEntry.hours), 0)).where(
            TimeEntry.tenant_id == tid,
            TimeEntry.is_billable == True,
            TimeEntry.is_billed == False,
        )
    ) or 0

    upcoming = await db.scalar(
        select(func.count(CalendarEvent.id)).where(CalendarEvent.tenant_id == tid, CalendarEvent.date >= now)
    )

    collection_rate = round((total_revenue / total_billed * 100), 1) if total_billed > 0 else 0.0

    return DashboardStats(
        active_cases=active_cases or 0,
        total_clients=total_clients or 0,
        total_staff=total_staff or 0,
        pending_invoices=pending_inv or 0,
        overdue_invoices=overdue_inv or 0,
        total_revenue=total_revenue,
        total_billed=total_billed,
        unbilled_hours=unbilled_hours,
        upcoming_hearings=upcoming or 0,
        collection_rate=collection_rate,
    )
