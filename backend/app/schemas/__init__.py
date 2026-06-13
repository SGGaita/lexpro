from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"
    tenant: "TenantOut"


# ─── Tenant ───────────────────────────────────────────────────────────────────

class TenantOut(BaseModel):
    id: str
    name: str
    specialty: Optional[str]
    logo: Optional[str]
    color: str
    plan: str
    established: Optional[str]
    location: Optional[str]

    model_config = {"from_attributes": True}


class TenantCreate(BaseModel):
    name: str
    specialty: Optional[str] = None
    logo: Optional[str] = None
    color: str = "#D4A843"
    plan: str = "Professional"
    established: Optional[str] = None
    location: Optional[str] = None


# ─── User / Staff ─────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    tenant_id: str
    name: str
    email: str
    phone: Optional[str]
    role: str
    specialty: Optional[str]
    avatar: Optional[str]
    billable_rate: float
    status: str
    is_active: bool
    joined: datetime

    model_config = {"from_attributes": True}

    @field_validator("role", mode="before")
    @classmethod
    def extract_role(cls, v):
        return v.value if hasattr(v, "value") else v


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    role: str = "Associate"
    specialty: Optional[str] = None
    avatar: Optional[str] = None
    billable_rate: float = 10000.0

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    specialty: Optional[str] = None
    billable_rate: Optional[float] = None
    status: Optional[str] = None


# ─── Client ───────────────────────────────────────────────────────────────────

class ClientOut(BaseModel):
    id: str
    tenant_id: str
    name: str
    type: str
    contact: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    industry: Optional[str]
    status: str
    since: datetime
    total_billed: Optional[float] = 0.0
    case_count: Optional[int] = 0

    model_config = {"from_attributes": True}

    @field_validator("type", mode="before")
    @classmethod
    def extract_type(cls, v):
        return v.value if hasattr(v, "value") else v


class ClientCreate(BaseModel):
    name: str
    type: str = "Individual"
    contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None


# ─── Case ─────────────────────────────────────────────────────────────────────

class CaseOut(BaseModel):
    id: str
    tenant_id: str
    client_id: Optional[str]
    assigned_user_id: Optional[str]
    title: str
    case_no: Optional[str]
    type: Optional[str]
    description: Optional[str]
    court: Optional[str]
    status: str
    priority: str
    fee: float
    filed: datetime
    next_hearing: Optional[datetime]
    client_name: Optional[str] = None
    assigned_to: Optional[str] = None

    model_config = {"from_attributes": True}

    @field_validator("status", "priority", mode="before")
    @classmethod
    def extract_enum(cls, v):
        return v.value if hasattr(v, "value") else v


class CaseCreate(BaseModel):
    client_id: Optional[str] = None
    assigned_user_id: Optional[str] = None
    title: str
    case_no: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    court: Optional[str] = None
    status: str = "Active"
    priority: str = "Medium"
    fee: float = 0.0
    next_hearing: Optional[datetime] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    assigned_user_id: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    court: Optional[str] = None
    next_hearing: Optional[datetime] = None
    fee: Optional[float] = None
    description: Optional[str] = None


# ─── Invoice ──────────────────────────────────────────────────────────────────

class InvoiceItemOut(BaseModel):
    id: str
    case_id: Optional[str]
    description: Optional[str]
    hours: float
    rate: float
    amount: float
    model_config = {"from_attributes": True}

class InvoiceOut(BaseModel):
    id: str
    tenant_id: str
    client_id: Optional[str]
    number: str
    amount: float
    paid: float
    status: str
    issued: datetime
    due: Optional[datetime]
    notes: Optional[str]
    client_name: Optional[str] = None
    items: List[InvoiceItemOut] = []

    model_config = {"from_attributes": True}

    @field_validator("status", mode="before")
    @classmethod
    def extract_status(cls, v):
        return v.value if hasattr(v, "value") else v


class InvoiceItemCreate(BaseModel):
    case_id: Optional[str] = None
    description: Optional[str] = None
    hours: float = 0.0
    rate: float = 0.0

class InvoiceCreate(BaseModel):
    client_id: Optional[str] = None
    number: str
    due: Optional[datetime] = None
    notes: Optional[str] = None
    items: List[InvoiceItemCreate] = []

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    paid: Optional[float] = None
    due: Optional[datetime] = None
    notes: Optional[str] = None


# ─── Document ─────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    tenant_id: str
    case_id: Optional[str]
    name: str
    type: str
    size: Optional[str]
    tags: Optional[str]
    uploaded_at: datetime
    uploaded_by: Optional[str] = None
    client_name: Optional[str] = None

    model_config = {"from_attributes": True}

    @field_validator("type", mode="before")
    @classmethod
    def extract_type(cls, v):
        return v.value if hasattr(v, "value") else v


class DocumentCreate(BaseModel):
    case_id: Optional[str] = None
    name: str
    type: str = "Correspondence"
    size: Optional[str] = None
    tags: Optional[str] = ""


# ─── Calendar Event ───────────────────────────────────────────────────────────

class EventOut(BaseModel):
    id: str
    tenant_id: str
    case_id: Optional[str]
    lawyer_id: Optional[str]
    title: str
    date: datetime
    time: Optional[str]
    type: str
    court: Optional[str]
    notes: Optional[str]
    priority: str
    lawyer_name: Optional[str] = None
    case_title: Optional[str] = None

    model_config = {"from_attributes": True}

    @field_validator("type", "priority", mode="before")
    @classmethod
    def extract_enum(cls, v):
        return v.value if hasattr(v, "value") else v


class EventCreate(BaseModel):
    case_id: Optional[str] = None
    lawyer_id: Optional[str] = None
    title: str
    date: datetime
    time: Optional[str] = None
    type: str = "Court Hearing"
    court: Optional[str] = None
    notes: Optional[str] = None
    priority: str = "Medium"

class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    court: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None


# ─── Time Entry ───────────────────────────────────────────────────────────────

class TimeEntryOut(BaseModel):
    id: str
    tenant_id: str
    user_id: Optional[str]
    case_id: Optional[str]
    date: datetime
    description: Optional[str]
    hours: float
    rate: float
    is_billable: bool
    is_billed: bool
    lawyer_name: Optional[str] = None
    client_name: Optional[str] = None
    amount: Optional[float] = None

    model_config = {"from_attributes": True}


class TimeEntryCreate(BaseModel):
    case_id: Optional[str] = None
    date: Optional[datetime] = None
    description: Optional[str] = None
    hours: float
    rate: float
    is_billable: bool = True

class TimeEntryUpdate(BaseModel):
    description: Optional[str] = None
    hours: Optional[float] = None
    is_billable: Optional[bool] = None
    is_billed: Optional[bool] = None


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    active_cases: int
    total_clients: int
    total_staff: int
    pending_invoices: int
    overdue_invoices: int
    total_revenue: float
    total_billed: float
    unbilled_hours: float
    upcoming_hearings: int
    collection_rate: float


# ─── Onboarding ───────────────────────────────────────────────────────────────

class StorageSetup(BaseModel):
    provider: str = "lexpro_managed"
    bucket_name: Optional[str] = None
    account_id: Optional[str] = None
    access_key_id: Optional[str] = None
    secret_access_key: Optional[str] = None
    region: Optional[str] = None
    endpoint_url: Optional[str] = None


class OnboardingFirm(BaseModel):
    name: str
    specialty: Optional[str] = None
    location: Optional[str] = None
    established: Optional[str] = None
    logo: Optional[str] = None
    color: str = "#D4A843"
    plan: str = "Professional"


class OnboardingAdmin(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None


class OnboardingRequest(BaseModel):
    firm: OnboardingFirm
    admin: OnboardingAdmin
    storage: StorageSetup


class OnboardingResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"
    tenant: "TenantOut"


# Forward refs
TokenResponse.model_rebuild()
OnboardingResponse.model_rebuild()
