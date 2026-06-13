import uuid
from datetime import datetime
from sqlalchemy import (
    Boolean, Float, Text, DateTime, ForeignKey,
    Enum as SAEnum, UniqueConstraint, String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


def gen_uuid() -> str:
    return str(uuid.uuid4())


# Reusable column helpers
def uuid_pk():
    """Primary key UUID column — stored as native PG UUID, Python sees str."""
    return mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)


def uuid_fk(target: str, *, nullable: bool = False, ondelete: str = "CASCADE"):
    """Foreign key UUID column pointing to *target* (e.g. 'tenants.id')."""
    return mapped_column(UUID(as_uuid=False), ForeignKey(target, ondelete=ondelete), nullable=nullable)


# ─── Enums ────────────────────────────────────────────────────────────────────

class TenantPlan(str, enum.Enum):
    starter = "Starter"
    professional = "Professional"
    enterprise = "Enterprise"

class StorageProvider(str, enum.Enum):
    lexpro_managed = "lexpro_managed"
    cloudflare_r2  = "cloudflare_r2"
    aws_s3         = "aws_s3"
    azure_blob     = "azure_blob"

class UserRole(str, enum.Enum):
    admin = "Admin"
    senior_partner = "Senior Partner"
    partner = "Partner"
    associate = "Associate"
    junior_associate = "Junior Associate"
    paralegal = "Paralegal"

class CaseStatus(str, enum.Enum):
    active = "Active"
    pending = "Pending"
    closed = "Closed"

class CasePriority(str, enum.Enum):
    critical = "Critical"
    high = "High"
    medium = "Medium"
    low = "Low"

class InvoiceStatus(str, enum.Enum):
    pending = "Pending"
    paid = "Paid"
    overdue = "Overdue"
    partial = "Partial"

class DocumentType(str, enum.Enum):
    court_filing = "Court Filing"
    contract = "Contract"
    evidence = "Evidence"
    legal_instrument = "Legal Instrument"
    report = "Report"
    correspondence = "Correspondence"

class EventType(str, enum.Enum):
    court_hearing = "Court Hearing"
    pre_trial = "Pre-Trial Conference"
    deadline = "Deadline"
    regulatory = "Regulatory Meeting"
    client_meeting = "Client Meeting"

class ClientType(str, enum.Enum):
    corporate = "Corporate"
    individual = "Individual"
    government = "Government"


# ─── Tenant ───────────────────────────────────────────────────────────────────

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = uuid_pk()
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    specialty: Mapped[str] = mapped_column(String(200), nullable=True)
    logo: Mapped[str] = mapped_column(String(10), nullable=True)
    color: Mapped[str] = mapped_column(String(10), default="#D4A843")
    plan: Mapped[TenantPlan] = mapped_column(SAEnum(TenantPlan), default=TenantPlan.professional)
    established: Mapped[str] = mapped_column(String(10), nullable=True)
    location: Mapped[str] = mapped_column(String(200), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    storage_provider: Mapped[StorageProvider] = mapped_column(SAEnum(StorageProvider), default=StorageProvider.lexpro_managed)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    storage_config: Mapped[list["StorageConfig"]] = relationship("StorageConfig", back_populates="tenant", cascade="all, delete-orphan", uselist=False)
    clients: Mapped[list["Client"]] = relationship("Client", back_populates="tenant", cascade="all, delete-orphan")
    cases: Mapped[list["Case"]] = relationship("Case", back_populates="tenant", cascade="all, delete-orphan")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="tenant", cascade="all, delete-orphan")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="tenant", cascade="all, delete-orphan")
    events: Mapped[list["CalendarEvent"]] = relationship("CalendarEvent", back_populates="tenant", cascade="all, delete-orphan")
    time_entries: Mapped[list["TimeEntry"]] = relationship("TimeEntry", back_populates="tenant", cascade="all, delete-orphan")


# ─── User / Staff ─────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = uuid_fk("tenants.id", nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(500), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.associate)
    specialty: Mapped[str] = mapped_column(String(200), nullable=True)
    avatar: Mapped[str] = mapped_column(String(10), nullable=True)
    billable_rate: Mapped[float] = mapped_column(Float, default=10000.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(50), default="Active")
    joined: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="users")
    assigned_cases: Mapped[list["Case"]] = relationship("Case", back_populates="assigned_user", foreign_keys="Case.assigned_user_id")
    time_entries: Mapped[list["TimeEntry"]] = relationship("TimeEntry", back_populates="user")


# ─── Client ───────────────────────────────────────────────────────────────────

class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = uuid_fk("tenants.id", nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[ClientType] = mapped_column(SAEnum(ClientType), default=ClientType.individual)
    contact: Mapped[str] = mapped_column(String(200), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    industry: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Active")
    since: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="clients")
    cases: Mapped[list["Case"]] = relationship("Case", back_populates="client")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="client")


# ─── Case ─────────────────────────────────────────────────────────────────────

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = uuid_fk("tenants.id", nullable=False)
    client_id: Mapped[str] = uuid_fk("clients.id", nullable=True, ondelete="SET NULL")
    assigned_user_id: Mapped[str] = uuid_fk("users.id", nullable=True, ondelete="SET NULL")

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    case_no: Mapped[str] = mapped_column(String(100), nullable=True)
    type: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    court: Mapped[str] = mapped_column(String(200), nullable=True)
    status: Mapped[CaseStatus] = mapped_column(SAEnum(CaseStatus), default=CaseStatus.active)
    priority: Mapped[CasePriority] = mapped_column(SAEnum(CasePriority), default=CasePriority.medium)
    fee: Mapped[float] = mapped_column(Float, default=0.0)
    filed: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    next_hearing: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="cases")
    client: Mapped["Client"] = relationship("Client", back_populates="cases")
    assigned_user: Mapped["User"] = relationship("User", back_populates="assigned_cases", foreign_keys=[assigned_user_id])
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="case")
    events: Mapped[list["CalendarEvent"]] = relationship("CalendarEvent", back_populates="case")
    time_entries: Mapped[list["TimeEntry"]] = relationship("TimeEntry", back_populates="case")
    invoice_items: Mapped[list["InvoiceItem"]] = relationship("InvoiceItem", back_populates="case")


# ─── Invoice ──────────────────────────────────────────────────────────────────

class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = uuid_fk("tenants.id", nullable=False)
    client_id: Mapped[str] = uuid_fk("clients.id", nullable=True, ondelete="SET NULL")

    number: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    paid: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[InvoiceStatus] = mapped_column(SAEnum(InvoiceStatus), default=InvoiceStatus.pending)
    issued: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    due: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="invoices")
    client: Mapped["Client"] = relationship("Client", back_populates="invoices")
    items: Mapped[list["InvoiceItem"]] = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[str] = uuid_pk()
    invoice_id: Mapped[str] = uuid_fk("invoices.id", nullable=False)
    case_id: Mapped[str] = uuid_fk("cases.id", nullable=True, ondelete="SET NULL")

    description: Mapped[str] = mapped_column(String(500), nullable=True)
    hours: Mapped[float] = mapped_column(Float, default=0.0)
    rate: Mapped[float] = mapped_column(Float, default=0.0)
    amount: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")
    case: Mapped["Case"] = relationship("Case", back_populates="invoice_items")


# ─── Document ─────────────────────────────────────────────────────────────────

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = uuid_fk("tenants.id", nullable=False)
    case_id: Mapped[str] = uuid_fk("cases.id", nullable=True, ondelete="SET NULL")
    uploaded_by_id: Mapped[str] = uuid_fk("users.id", nullable=True, ondelete="SET NULL")

    name: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[DocumentType] = mapped_column(SAEnum(DocumentType), default=DocumentType.correspondence)
    size: Mapped[str] = mapped_column(String(50), nullable=True)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=True)
    tags: Mapped[str] = mapped_column(String(500), default="")  # comma-separated
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="documents")
    case: Mapped["Case"] = relationship("Case", back_populates="documents")


# ─── Calendar Event ───────────────────────────────────────────────────────────

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = uuid_fk("tenants.id", nullable=False)
    case_id: Mapped[str] = uuid_fk("cases.id", nullable=True, ondelete="SET NULL")
    lawyer_id: Mapped[str] = uuid_fk("users.id", nullable=True, ondelete="SET NULL")

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    time: Mapped[str] = mapped_column(String(20), nullable=True)
    type: Mapped[EventType] = mapped_column(SAEnum(EventType), default=EventType.court_hearing)
    court: Mapped[str] = mapped_column(String(300), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    priority: Mapped[CasePriority] = mapped_column(SAEnum(CasePriority), default=CasePriority.medium)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="events")
    case: Mapped["Case"] = relationship("Case", back_populates="events")


# ─── Time Entry ───────────────────────────────────────────────────────────────

class TimeEntry(Base):
    __tablename__ = "time_entries"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = uuid_fk("tenants.id", nullable=False)
    user_id: Mapped[str] = uuid_fk("users.id", nullable=True, ondelete="SET NULL")
    case_id: Mapped[str] = uuid_fk("cases.id", nullable=True, ondelete="SET NULL")

    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    hours: Mapped[float] = mapped_column(Float, nullable=False)
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    is_billable: Mapped[bool] = mapped_column(Boolean, default=True)
    is_billed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="time_entries")
    user: Mapped["User"] = relationship("User", back_populates="time_entries")
    case: Mapped["Case"] = relationship("Case", back_populates="time_entries")


# ─── Storage Config ───────────────────────────────────────────────────────────

class StorageConfig(Base):
    __tablename__ = "storage_configs"

    id: Mapped[str] = uuid_pk()
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, unique=True)
    provider: Mapped[StorageProvider] = mapped_column(SAEnum(StorageProvider), nullable=False, default=StorageProvider.lexpro_managed)
    bucket_name: Mapped[str] = mapped_column(String(200), nullable=True)
    account_id: Mapped[str] = mapped_column(String(200), nullable=True)
    access_key_id: Mapped[str] = mapped_column(String(500), nullable=True)
    secret_access_key: Mapped[str] = mapped_column(String(1000), nullable=True)  # Fernet-encrypted
    region: Mapped[str] = mapped_column(String(100), nullable=True)
    endpoint_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="storage_config")
