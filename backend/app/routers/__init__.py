"""
All resource routers — one file for brevity.
Each router is a separate APIRouter and registered individually in main.py.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.models import (
    User, Tenant, Client, Case, Invoice, InvoiceItem,
    Document, CalendarEvent, TimeEntry, CaseStatus
)
from app.schemas import (
    ClientOut, ClientCreate, ClientUpdate,
    CaseOut, CaseCreate, CaseUpdate,
    InvoiceOut, InvoiceCreate, InvoiceUpdate,
    DocumentOut, DocumentCreate,
    EventOut, EventCreate, EventUpdate,
    UserOut, UserCreate, UserUpdate,
    TimeEntryOut, TimeEntryCreate, TimeEntryUpdate,
)
from app.auth.deps import get_current_user, get_current_tenant
from app.auth.jwt import hash_password


# ─── Helpers ──────────────────────────────────────────────────────────────────

def not_found(resource: str):
    return HTTPException(status_code=404, detail=f"{resource} not found")

def tenant_filter(query, model, tenant_id: str):
    return query.where(model.tenant_id == tenant_id)


# ─── Clients ──────────────────────────────────────────────────────────────────

clients_router = APIRouter(prefix="/clients", tags=["Clients"])

@clients_router.get("", response_model=List[ClientOut])
async def list_clients(
    search: Optional[str] = None,
    type: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(Client).where(Client.tenant_id == tenant.id)
    if search:
        q = q.where(Client.name.ilike(f"%{search}%") | Client.contact.ilike(f"%{search}%"))
    if type:
        q = q.where(Client.type == type)
    result = await db.execute(q.order_by(Client.name))
    clients = result.scalars().all()

    out = []
    for c in clients:
        case_count = await db.scalar(select(func.count(Case.id)).where(Case.client_id == c.id))
        total_billed = await db.scalar(select(func.coalesce(func.sum(Invoice.amount), 0)).where(Invoice.client_id == c.id)) or 0
        d = ClientOut.model_validate(c)
        d.case_count = case_count or 0
        d.total_billed = total_billed
        out.append(d)
    return out

@clients_router.post("", response_model=ClientOut, status_code=201)
async def create_client(
    body: ClientCreate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    client = Client(tenant_id=tenant.id, **body.model_dump())
    db.add(client)
    await db.flush()
    await db.refresh(client)
    d = ClientOut.model_validate(client)
    d.case_count = 0
    d.total_billed = 0
    return d

@clients_router.put("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: str,
    body: ClientUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Client).where(Client.id == client_id, Client.tenant_id == tenant.id))
    client = result.scalar_one_or_none()
    if not client:
        raise not_found("Client")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(client, k, v)
    await db.flush()
    await db.refresh(client)
    return ClientOut.model_validate(client)

@clients_router.delete("/{client_id}", status_code=204)
async def delete_client(
    client_id: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Client).where(Client.id == client_id, Client.tenant_id == tenant.id))
    client = result.scalar_one_or_none()
    if not client:
        raise not_found("Client")
    await db.delete(client)


# ─── Cases ────────────────────────────────────────────────────────────────────

cases_router = APIRouter(prefix="/cases", tags=["Cases"])

async def _enrich_case(case: Case, db: AsyncSession) -> CaseOut:
    d = CaseOut.model_validate(case)
    if case.client_id:
        r = await db.execute(select(Client.name).where(Client.id == case.client_id))
        d.client_name = r.scalar_one_or_none()
    if case.assigned_user_id:
        r = await db.execute(select(User.name).where(User.id == case.assigned_user_id))
        d.assigned_to = r.scalar_one_or_none()
    return d

@cases_router.get("", response_model=List[CaseOut])
async def list_cases(
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(Case).where(Case.tenant_id == tenant.id)
    if search:
        q = q.where(Case.title.ilike(f"%{search}%") | Case.case_no.ilike(f"%{search}%"))
    if status:
        q = q.where(Case.status == status)
    if priority:
        q = q.where(Case.priority == priority)
    result = await db.execute(q.order_by(Case.filed.desc()))
    return [await _enrich_case(c, db) for c in result.scalars().all()]

@cases_router.post("", response_model=CaseOut, status_code=201)
async def create_case(
    body: CaseCreate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    case = Case(tenant_id=tenant.id, **body.model_dump())
    db.add(case)
    await db.flush()
    await db.refresh(case)
    return await _enrich_case(case, db)

@cases_router.put("/{case_id}", response_model=CaseOut)
async def update_case(
    case_id: str,
    body: CaseUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Case).where(Case.id == case_id, Case.tenant_id == tenant.id))
    case = result.scalar_one_or_none()
    if not case:
        raise not_found("Case")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(case, k, v)
    await db.flush()
    await db.refresh(case)
    return await _enrich_case(case, db)

@cases_router.delete("/{case_id}", status_code=204)
async def delete_case(
    case_id: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Case).where(Case.id == case_id, Case.tenant_id == tenant.id))
    case = result.scalar_one_or_none()
    if not case:
        raise not_found("Case")
    await db.delete(case)


# ─── Billing / Invoices ───────────────────────────────────────────────────────

billing_router = APIRouter(prefix="/billing", tags=["Billing"])

async def _enrich_invoice(inv: Invoice, db: AsyncSession) -> InvoiceOut:
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Invoice).where(Invoice.id == inv.id).options(selectinload(Invoice.items))
    )
    inv = result.scalar_one()
    d = InvoiceOut.model_validate(inv)
    if inv.client_id:
        r = await db.execute(select(Client.name).where(Client.id == inv.client_id))
        d.client_name = r.scalar_one_or_none()
    return d

@billing_router.get("", response_model=List[InvoiceOut])
async def list_invoices(
    status: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    q = select(Invoice).where(Invoice.tenant_id == tenant.id).options(selectinload(Invoice.items))
    if status:
        q = q.where(Invoice.status == status)
    result = await db.execute(q.order_by(Invoice.issued.desc()))
    return [await _enrich_invoice(i, db) for i in result.scalars().all()]

@billing_router.post("", response_model=InvoiceOut, status_code=201)
async def create_invoice(
    body: InvoiceCreate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    items_data = body.model_dump(exclude={"items"})
    invoice = Invoice(tenant_id=tenant.id, **items_data)
    total = 0.0
    for item_data in body.items:
        amount = item_data.hours * item_data.rate
        total += amount
        item = InvoiceItem(amount=amount, **item_data.model_dump())
        invoice.items.append(item)
    invoice.amount = total
    db.add(invoice)
    await db.flush()
    await db.refresh(invoice)
    return await _enrich_invoice(invoice, db)

@billing_router.put("/{invoice_id}", response_model=InvoiceOut)
async def update_invoice(
    invoice_id: str,
    body: InvoiceUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id, Invoice.tenant_id == tenant.id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise not_found("Invoice")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(invoice, k, v)
    # Auto-update status based on paid amount
    if body.paid is not None:
        if invoice.paid >= invoice.amount:
            invoice.status = "paid"
        elif invoice.paid > 0:
            invoice.status = "partial"
    await db.flush()
    await db.refresh(invoice)
    return await _enrich_invoice(invoice, db)


# ─── Documents ────────────────────────────────────────────────────────────────

documents_router = APIRouter(prefix="/documents", tags=["Documents"])

@documents_router.get("", response_model=List[DocumentOut])
async def list_documents(
    search: Optional[str] = None,
    type: Optional[str] = None,
    case_id: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(Document).where(Document.tenant_id == tenant.id)
    if search:
        q = q.where(Document.name.ilike(f"%{search}%") | Document.tags.ilike(f"%{search}%"))
    if type:
        q = q.where(Document.type == type)
    if case_id:
        q = q.where(Document.case_id == case_id)
    result = await db.execute(q.order_by(Document.uploaded_at.desc()))
    docs = result.scalars().all()

    out = []
    for doc in docs:
        d = DocumentOut.model_validate(doc)
        if doc.case_id:
            r = await db.execute(select(Case).where(Case.id == doc.case_id))
            case = r.scalar_one_or_none()
            if case and case.client_id:
                r2 = await db.execute(select(Client.name).where(Client.id == case.client_id))
                d.client_name = r2.scalar_one_or_none()
        if doc.uploaded_by_id:
            r = await db.execute(select(User.name).where(User.id == doc.uploaded_by_id))
            d.uploaded_by = r.scalar_one_or_none()
        out.append(d)
    return out

@documents_router.post("", response_model=DocumentOut, status_code=201)
async def create_document(
    body: DocumentCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    doc = Document(tenant_id=tenant.id, uploaded_by_id=current_user.id, **body.model_dump())
    db.add(doc)
    await db.flush()
    await db.refresh(doc)
    return DocumentOut.model_validate(doc)

@documents_router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == doc_id, Document.tenant_id == tenant.id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise not_found("Document")
    await db.delete(doc)


# ─── Calendar ─────────────────────────────────────────────────────────────────

calendar_router = APIRouter(prefix="/calendar", tags=["Calendar"])

@calendar_router.get("", response_model=List[EventOut])
async def list_events(
    upcoming_only: bool = False,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(CalendarEvent).where(CalendarEvent.tenant_id == tenant.id)
    if upcoming_only:
        q = q.where(CalendarEvent.date >= datetime.utcnow())
    result = await db.execute(q.order_by(CalendarEvent.date.asc()))
    events = result.scalars().all()

    out = []
    for e in events:
        d = EventOut.model_validate(e)
        if e.lawyer_id:
            r = await db.execute(select(User.name).where(User.id == e.lawyer_id))
            d.lawyer_name = r.scalar_one_or_none()
        if e.case_id:
            r = await db.execute(select(Case.title).where(Case.id == e.case_id))
            d.case_title = r.scalar_one_or_none()
        out.append(d)
    return out

@calendar_router.post("", response_model=EventOut, status_code=201)
async def create_event(
    body: EventCreate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    event = CalendarEvent(tenant_id=tenant.id, **body.model_dump())
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return EventOut.model_validate(event)

@calendar_router.put("/{event_id}", response_model=EventOut)
async def update_event(
    event_id: str,
    body: EventUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.tenant_id == tenant.id))
    event = result.scalar_one_or_none()
    if not event:
        raise not_found("Event")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(event, k, v)
    await db.flush()
    await db.refresh(event)
    return EventOut.model_validate(event)

@calendar_router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.tenant_id == tenant.id))
    event = result.scalar_one_or_none()
    if not event:
        raise not_found("Event")
    await db.delete(event)


# ─── Staff ────────────────────────────────────────────────────────────────────

staff_router = APIRouter(prefix="/staff", tags=["Staff"])

@staff_router.get("", response_model=List[UserOut])
async def list_staff(
    role: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(User).where(User.tenant_id == tenant.id)
    if role:
        q = q.where(User.role == role)
    result = await db.execute(q.order_by(User.name))
    return [UserOut.model_validate(u) for u in result.scalars().all()]

@staff_router.post("", response_model=UserOut, status_code=201)
async def create_staff(
    body: UserCreate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump(exclude={"password"})
    user = User(
        tenant_id=tenant.id,
        hashed_password=hash_password(body.password),
        **data,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return UserOut.model_validate(user)

@staff_router.put("/{user_id}", response_model=UserOut)
async def update_staff(
    user_id: str,
    body: UserUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.tenant_id == tenant.id))
    user = result.scalar_one_or_none()
    if not user:
        raise not_found("Staff member")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(user, k, v)
    await db.flush()
    await db.refresh(user)
    return UserOut.model_validate(user)


# ─── Time Tracking ────────────────────────────────────────────────────────────

time_router = APIRouter(prefix="/time", tags=["Time Tracking"])

@time_router.get("", response_model=List[TimeEntryOut])
async def list_time_entries(
    billable: Optional[bool] = None,
    billed: Optional[bool] = None,
    user_id: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    q = select(TimeEntry).where(TimeEntry.tenant_id == tenant.id)
    if billable is not None:
        q = q.where(TimeEntry.is_billable == billable)
    if billed is not None:
        q = q.where(TimeEntry.is_billed == billed)
    if user_id:
        q = q.where(TimeEntry.user_id == user_id)
    result = await db.execute(q.order_by(TimeEntry.date.desc()))
    entries = result.scalars().all()

    out = []
    for e in entries:
        d = TimeEntryOut.model_validate(e)
        d.amount = e.hours * e.rate
        if e.user_id:
            r = await db.execute(select(User.name).where(User.id == e.user_id))
            d.lawyer_name = r.scalar_one_or_none()
        if e.case_id:
            r = await db.execute(select(Case).where(Case.id == e.case_id))
            case = r.scalar_one_or_none()
            if case and case.client_id:
                r2 = await db.execute(select(Client.name).where(Client.id == case.client_id))
                d.client_name = r2.scalar_one_or_none()
        out.append(d)
    return out

@time_router.post("", response_model=TimeEntryOut, status_code=201)
async def create_time_entry(
    body: TimeEntryCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump()
    if not data.get("date"):
        data["date"] = datetime.utcnow()
    entry = TimeEntry(tenant_id=tenant.id, user_id=current_user.id, **data)
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    d = TimeEntryOut.model_validate(entry)
    d.amount = entry.hours * entry.rate
    return d

@time_router.put("/{entry_id}", response_model=TimeEntryOut)
async def update_time_entry(
    entry_id: str,
    body: TimeEntryUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id, TimeEntry.tenant_id == tenant.id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise not_found("Time entry")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(entry, k, v)
    await db.flush()
    await db.refresh(entry)
    d = TimeEntryOut.model_validate(entry)
    d.amount = entry.hours * entry.rate
    return d

@time_router.delete("/{entry_id}", status_code=204)
async def delete_time_entry(
    entry_id: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id, TimeEntry.tenant_id == tenant.id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise not_found("Time entry")
    await db.delete(entry)
