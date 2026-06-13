"""
Seed the database with 3 tenants, staff, clients, cases, invoices,
documents, events, and time entries from the original mockData.js.

Run:  python -m app.seed
"""
import asyncio
from datetime import datetime
from app.database import engine, AsyncSessionLocal, Base
from app.models import (
    Tenant, User, Client, Case, Invoice, InvoiceItem,
    Document, CalendarEvent, TimeEntry,
    TenantPlan, UserRole, ClientType, CaseStatus, CasePriority,
    InvoiceStatus, DocumentType, EventType,
)
from app.auth.jwt import hash_password


async def seed():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:

        # ── Tenants ──────────────────────────────────────────────────────────
        t1 = Tenant(id="t1", name="Kariuki & Associates", specialty="Corporate & Commercial",
                    logo="K&A", color="#D4A843", plan=TenantPlan.enterprise,
                    established="2008", location="Nairobi, Kenya")
        t2 = Tenant(id="t2", name="Odhiambo Legal Partners", specialty="Criminal & Civil Law",
                    logo="OLP", color="#4A90D9", plan=TenantPlan.professional,
                    established="2015", location="Mombasa, Kenya")
        t3 = Tenant(id="t3", name="Wanjiru & Mwangi LLP", specialty="Family & Real Estate",
                    logo="W&M", color="#2ECC71", plan=TenantPlan.professional,
                    established="2012", location="Kisumu, Kenya")
        db.add_all([t1, t2, t3])
        await db.flush()

        # ── Staff / Users ─────────────────────────────────────────────────────
        pw = hash_password("password123")

        # T1 staff
        u1 = User(id="u1t1", tenant_id="t1", name="Diana Kariuki", email="d.kariuki@ka.co.ke",
                  phone="+254 700 111 001", hashed_password=pw, role=UserRole.senior_partner,
                  specialty="M&A", avatar="DK", billable_rate=25000,
                  joined=datetime(2008, 3, 1))
        u2 = User(id="u2t1", tenant_id="t1", name="Peter Maina", email="p.maina@ka.co.ke",
                  phone="+254 700 111 002", hashed_password=pw, role=UserRole.associate,
                  specialty="Corporate", avatar="PM", billable_rate=15000,
                  joined=datetime(2019, 7, 15))
        u3 = User(id="u3t1", tenant_id="t1", name="Grace Njeri", email="g.njeri@ka.co.ke",
                  phone="+254 700 111 003", hashed_password=pw, role=UserRole.partner,
                  specialty="Tax Law", avatar="GN", billable_rate=20000,
                  joined=datetime(2013, 1, 10))
        u4 = User(id="u4t1", tenant_id="t1", name="James Omondi", email="j.omondi@ka.co.ke",
                  phone="+254 700 111 004", hashed_password=pw, role=UserRole.junior_associate,
                  specialty="Contracts", avatar="JO", billable_rate=10000,
                  joined=datetime(2022, 5, 1))
        u5 = User(id="u5t1", tenant_id="t1", name="Aisha Waweru", email="a.waweru@ka.co.ke",
                  phone="+254 700 111 005", hashed_password=pw, role=UserRole.paralegal,
                  specialty="Research", avatar="AW", billable_rate=6000, status="On Leave",
                  joined=datetime(2020, 2, 20))

        # T2 staff
        u6 = User(id="u1t2", tenant_id="t2", name="Tobias Odhiambo", email="t.odhiambo@olp.co.ke",
                  phone="+254 722 222 001", hashed_password=pw, role=UserRole.senior_partner,
                  specialty="Criminal Defense", avatar="TO", billable_rate=22000,
                  joined=datetime(2015, 1, 1))
        u7 = User(id="u2t2", tenant_id="t2", name="Naomi Achieng", email="n.achieng@olp.co.ke",
                  phone="+254 722 222 002", hashed_password=pw, role=UserRole.associate,
                  specialty="Civil Litigation", avatar="NA", billable_rate=16000,
                  joined=datetime(2017, 9, 1))

        # T3 staff
        u8 = User(id="u1t3", tenant_id="t3", name="Irene Wanjiru", email="i.wanjiru@wm.co.ke",
                  phone="+254 733 333 001", hashed_password=pw, role=UserRole.partner,
                  specialty="Family Law", avatar="IW", billable_rate=18000,
                  joined=datetime(2012, 6, 1))
        u9 = User(id="u2t3", tenant_id="t3", name="Samuel Mwangi", email="s.mwangi@wm.co.ke",
                  phone="+254 733 333 002", hashed_password=pw, role=UserRole.partner,
                  specialty="Real Estate", avatar="SM", billable_rate=17000,
                  joined=datetime(2012, 6, 1))

        db.add_all([u1, u2, u3, u4, u5, u6, u7, u8, u9])
        await db.flush()

        # ── Clients ───────────────────────────────────────────────────────────
        c1 = Client(id="c1t1", tenant_id="t1", name="Safaricom PLC", type=ClientType.corporate,
                    contact="John Njoroge", email="legal@safaricom.co.ke", phone="+254 722 000 100",
                    industry="Telecommunications", since=datetime(2015, 3, 1))
        c2 = Client(id="c2t1", tenant_id="t1", name="Kenya Breweries Ltd", type=ClientType.corporate,
                    contact="Mary Wanjiku", email="legal@kbl.co.ke", phone="+254 722 000 200",
                    industry="FMCG", since=datetime(2018, 7, 15))
        c3 = Client(id="c3t1", tenant_id="t1", name="Allan Kimani", type=ClientType.individual,
                    contact="Allan Kimani", email="a.kimani@gmail.com", phone="+254 700 333 001",
                    industry="Private", since=datetime(2023, 1, 20))
        c4 = Client(id="c4t1", tenant_id="t1", name="Equity Bank Kenya", type=ClientType.corporate,
                    contact="Susan Otieno", email="legal@equity.co.ke", phone="+254 722 000 400",
                    industry="Banking", since=datetime(2010, 5, 1))
        c5 = Client(id="c5t1", tenant_id="t1", name="Nairobi County Govt", type=ClientType.government,
                    contact="Hon. David Mwai", email="legal@nairobi.go.ke", phone="+254 20 222 5000",
                    industry="Government", since=datetime(2019, 11, 1))
        c6 = Client(id="c1t2", tenant_id="t2", name="Michael Otieno", type=ClientType.individual,
                    contact="Michael Otieno", email="m.otieno@gmail.com", phone="+254 722 500 001",
                    industry="Private", since=datetime(2023, 6, 1))
        c7 = Client(id="c2t2", tenant_id="t2", name="Coastal Traders Ltd", type=ClientType.corporate,
                    contact="Fatuma Hassan", email="legal@coastaltraders.co.ke", phone="+254 722 500 002",
                    industry="Trade", since=datetime(2021, 3, 15))
        c8 = Client(id="c1t3", tenant_id="t3", name="Wanjiku Kamau", type=ClientType.individual,
                    contact="Wanjiku Kamau", email="w.kamau@gmail.com", phone="+254 733 600 001",
                    industry="Private", since=datetime(2024, 1, 10))
        c9 = Client(id="c2t3", tenant_id="t3", name="Nyeri Properties Ltd", type=ClientType.corporate,
                    contact="Charles Mutua", email="legal@nyerip.co.ke", phone="+254 733 600 002",
                    industry="Real Estate", since=datetime(2020, 8, 1))
        db.add_all([c1, c2, c3, c4, c5, c6, c7, c8, c9])
        await db.flush()

        # ── Cases ─────────────────────────────────────────────────────────────
        ca1 = Case(id="ca1t1", tenant_id="t1", client_id="c1t1", assigned_user_id="u1t1",
                   title="Safaricom vs Airtel - Patent Dispute", case_no="HCCC 045/2024",
                   type="Intellectual Property", description="Patent infringement dispute over 5G network technology.",
                   court="High Court, Nairobi", status=CaseStatus.active, priority=CasePriority.high,
                   fee=1200000, filed=datetime(2024, 1, 15), next_hearing=datetime(2025, 6, 10))
        ca2 = Case(id="ca2t1", tenant_id="t1", client_id="c2t1", assigned_user_id="u3t1",
                   title="KBL Merger - Regulatory Filing", case_no="CAK/023/2024",
                   type="Corporate M&A", description="Regulatory approval for acquisition of a regional brewery.",
                   court="Competition Authority", status=CaseStatus.active, priority=CasePriority.high,
                   fee=950000, filed=datetime(2024, 3, 1))
        ca3 = Case(id="ca3t1", tenant_id="t1", client_id="c3t1", assigned_user_id="u2t1",
                   title="Kimani Estate Planning", case_no="PROB 112/2024",
                   type="Estate & Probate", description="Drafting of will and trust instruments.",
                   court="Milimani Law Courts", status=CaseStatus.pending, priority=CasePriority.medium,
                   fee=250000, filed=datetime(2024, 11, 20), next_hearing=datetime(2025, 5, 20))
        ca4 = Case(id="ca4t1", tenant_id="t1", client_id="c4t1", assigned_user_id="u1t1",
                   title="Equity Bank - NPA Recovery", case_no="COMM 301/2023",
                   type="Banking & Finance", description="Recovery of non-performing loans from defaulting corporate borrowers.",
                   court="Commercial Court", status=CaseStatus.active, priority=CasePriority.critical,
                   fee=3500000, filed=datetime(2023, 9, 10), next_hearing=datetime(2025, 6, 2))
        ca5 = Case(id="ca5t1", tenant_id="t1", client_id="c5t1", assigned_user_id="u3t1",
                   title="Nairobi County Land Acquisition", case_no="ELC 088/2023",
                   type="Public Law", description="Compulsory acquisition proceedings for infrastructure expansion.",
                   court="Environment & Land Court", status=CaseStatus.closed, priority=CasePriority.low,
                   fee=1800000, filed=datetime(2023, 4, 1))
        ca6 = Case(id="ca6t1", tenant_id="t1", client_id="c4t1", assigned_user_id="u4t1",
                   title="Equity Bank - Employment Dispute", case_no="ELC 220/2024",
                   type="Employment Law", description="Wrongful termination claim by former senior manager.",
                   court="Employment & Labour Court", status=CaseStatus.active, priority=CasePriority.medium,
                   fee=420000, filed=datetime(2024, 8, 5), next_hearing=datetime(2025, 7, 15))
        ca7 = Case(id="ca1t2", tenant_id="t2", client_id="c1t2", assigned_user_id="u1t2",
                   title="Otieno - Criminal Defense", case_no="CR 099/2023",
                   type="Criminal Defense", description="Defense on charges of financial fraud.",
                   court="High Court, Mombasa", status=CaseStatus.active, priority=CasePriority.critical,
                   fee=320000, filed=datetime(2023, 10, 1), next_hearing=datetime(2025, 6, 5))
        ca8 = Case(id="ca2t2", tenant_id="t2", client_id="c2t2", assigned_user_id="u2t2",
                   title="Coastal Traders - Commercial Dispute", case_no="COMM 041/2024",
                   type="Commercial Litigation", description="Dispute over breach of supply contract.",
                   court="Commercial Court, Mombasa", status=CaseStatus.pending, priority=CasePriority.high,
                   fee=550000, filed=datetime(2024, 5, 12), next_hearing=datetime(2025, 6, 20))
        ca9 = Case(id="ca1t3", tenant_id="t3", client_id="c1t3", assigned_user_id="u1t3",
                   title="Kamau Divorce Proceedings", case_no="FAM 033/2024",
                   type="Family Law", description="Contested divorce with child custody and property division.",
                   court="Family Court, Kisumu", status=CaseStatus.active, priority=CasePriority.high,
                   fee=180000, filed=datetime(2024, 2, 1), next_hearing=datetime(2025, 6, 18))
        ca10 = Case(id="ca2t3", tenant_id="t3", client_id="c2t3", assigned_user_id="u2t3",
                    title="Nyeri Properties - Conveyancing", case_no="CONV 201/2024",
                    type="Real Estate", description="Title transfer for 15-acre commercial development parcel.",
                    court="N/A", status=CaseStatus.active, priority=CasePriority.medium,
                    fee=1200000, filed=datetime(2024, 7, 10))
        db.add_all([ca1, ca2, ca3, ca4, ca5, ca6, ca7, ca8, ca9, ca10])
        await db.flush()

        # ── Invoices ──────────────────────────────────────────────────────────
        inv1 = Invoice(id="inv1t1", tenant_id="t1", client_id="c1t1", number="INV-2025-001",
                       amount=600000, paid=600000, status=InvoiceStatus.paid,
                       issued=datetime(2025, 1, 31), due=datetime(2025, 2, 28))
        inv1.items.append(InvoiceItem(case_id="ca1t1", description="Legal representation - Q4 2024", hours=40, rate=15000, amount=600000))

        inv2 = Invoice(id="inv2t1", tenant_id="t1", client_id="c4t1", number="INV-2025-002",
                       amount=1200000, paid=0, status=InvoiceStatus.overdue,
                       issued=datetime(2025, 3, 1), due=datetime(2025, 3, 31))
        inv2.items.append(InvoiceItem(case_id="ca4t1", description="NPA Recovery - Q1 2025", hours=48, rate=25000, amount=1200000))

        inv3 = Invoice(id="inv3t1", tenant_id="t1", client_id="c2t1", number="INV-2025-003",
                       amount=475000, paid=475000, status=InvoiceStatus.paid,
                       issued=datetime(2025, 2, 15), due=datetime(2025, 3, 15))
        inv3.items.append(InvoiceItem(case_id="ca2t1", description="M&A Advisory - Phase 1", hours=30, rate=20000, amount=475000))

        inv4 = Invoice(id="inv4t1", tenant_id="t1", client_id="c3t1", number="INV-2025-004",
                       amount=125000, paid=0, status=InvoiceStatus.pending,
                       issued=datetime(2025, 4, 1), due=datetime(2025, 5, 1))
        inv4.items.append(InvoiceItem(case_id="ca3t1", description="Estate planning consultation", hours=12, rate=15000, amount=125000))

        inv5 = Invoice(id="inv5t1", tenant_id="t1", client_id="c4t1", number="INV-2025-005",
                       amount=210000, paid=210000, status=InvoiceStatus.paid,
                       issued=datetime(2025, 4, 15), due=datetime(2025, 5, 15))
        inv5.items.append(InvoiceItem(case_id="ca6t1", description="Employment case - initial filing", hours=21, rate=10000, amount=210000))

        inv6 = Invoice(id="inv1t2", tenant_id="t2", client_id="c1t2", number="INV-2025-001",
                       amount=160000, paid=80000, status=InvoiceStatus.partial,
                       issued=datetime(2025, 1, 10), due=datetime(2025, 2, 10))
        inv6.items.append(InvoiceItem(case_id="ca1t2", description="Criminal defense retainer", hours=20, rate=22000, amount=160000))

        inv7 = Invoice(id="inv1t3", tenant_id="t3", client_id="c1t3", number="INV-2025-001",
                       amount=90000, paid=90000, status=InvoiceStatus.paid,
                       issued=datetime(2025, 2, 1), due=datetime(2025, 3, 1))
        inv7.items.append(InvoiceItem(case_id="ca1t3", description="Divorce proceedings - Q1", hours=15, rate=18000, amount=90000))

        db.add_all([inv1, inv2, inv3, inv4, inv5, inv6, inv7])
        await db.flush()

        # ── Documents ─────────────────────────────────────────────────────────
        docs = [
            Document(id="d1t1", tenant_id="t1", case_id="ca1t1", uploaded_by_id="u1t1",
                     name="Safaricom Patent Filing.pdf", type=DocumentType.court_filing,
                     size="2.4 MB", tags="patent,filing"),
            Document(id="d2t1", tenant_id="t1", case_id="ca2t1", uploaded_by_id="u3t1",
                     name="KBL Merger Agreement Draft v3.docx", type=DocumentType.contract,
                     size="1.1 MB", tags="M&A,contract"),
            Document(id="d3t1", tenant_id="t1", case_id="ca4t1", uploaded_by_id="u1t1",
                     name="Equity Bank - Loan Agreements Bundle.pdf", type=DocumentType.evidence,
                     size="8.7 MB", tags="NPA,loans"),
            Document(id="d4t1", tenant_id="t1", case_id="ca3t1", uploaded_by_id="u2t1",
                     name="Kimani Last Will and Testament.docx", type=DocumentType.legal_instrument,
                     size="0.5 MB", tags="will,estate"),
            Document(id="d1t2", tenant_id="t2", case_id="ca1t2", uploaded_by_id="u1t2",
                     name="Otieno - Police Statement.pdf", type=DocumentType.evidence,
                     size="1.2 MB", tags="criminal,statement"),
            Document(id="d1t3", tenant_id="t3", case_id="ca1t3", uploaded_by_id="u1t3",
                     name="Kamau Marriage Certificate.pdf", type=DocumentType.evidence,
                     size="0.3 MB", tags="family,certificate"),
            Document(id="d2t3", tenant_id="t3", case_id="ca2t3", uploaded_by_id="u2t3",
                     name="Nyeri Properties - Title Deed.pdf", type=DocumentType.legal_instrument,
                     size="1.5 MB", tags="title,property"),
        ]
        db.add_all(docs)

        # ── Calendar Events ────────────────────────────────────────────────────
        events = [
            CalendarEvent(id="e1t1", tenant_id="t1", case_id="ca1t1", lawyer_id="u1t1",
                          title="Safaricom Patent Hearing", date=datetime(2025, 6, 10),
                          time="09:00", type=EventType.court_hearing, court="High Court, Nairobi",
                          notes="Bring all patent documentation", priority=CasePriority.high),
            CalendarEvent(id="e2t1", tenant_id="t1", case_id="ca4t1", lawyer_id="u1t1",
                          title="Equity NPA Hearing", date=datetime(2025, 6, 2),
                          time="14:00", type=EventType.court_hearing, court="Commercial Court",
                          notes="Prepare witness list", priority=CasePriority.critical),
            CalendarEvent(id="e3t1", tenant_id="t1", case_id="ca3t1", lawyer_id="u2t1",
                          title="Kimani Estate Filing Deadline", date=datetime(2025, 5, 20),
                          time="16:30", type=EventType.deadline, court="Milimani Law Courts",
                          notes="File will instrument", priority=CasePriority.medium),
            CalendarEvent(id="e4t1", tenant_id="t1", case_id="ca6t1", lawyer_id="u4t1",
                          title="Equity Employment Pre-Trial", date=datetime(2025, 7, 15),
                          time="10:00", type=EventType.pre_trial, court="Employment & Labour Court",
                          notes="Mediation attempt before full hearing", priority=CasePriority.medium),
            CalendarEvent(id="e1t2", tenant_id="t2", case_id="ca1t2", lawyer_id="u1t2",
                          title="Otieno Criminal Hearing", date=datetime(2025, 6, 5),
                          time="09:30", type=EventType.court_hearing, court="High Court, Mombasa",
                          notes="Expert witness scheduled", priority=CasePriority.critical),
            CalendarEvent(id="e1t3", tenant_id="t3", case_id="ca1t3", lawyer_id="u1t3",
                          title="Kamau Divorce Hearing", date=datetime(2025, 6, 18),
                          time="10:00", type=EventType.court_hearing, court="Family Court, Kisumu",
                          notes="Child custody testimony", priority=CasePriority.high),
        ]
        db.add_all(events)

        # ── Time Entries ──────────────────────────────────────────────────────
        entries = [
            TimeEntry(id="te1t1", tenant_id="t1", user_id="u1t1", case_id="ca1t1",
                      date=datetime(2025, 4, 28), description="Patent document review and analysis",
                      hours=3.5, rate=25000, is_billable=True, is_billed=True),
            TimeEntry(id="te2t1", tenant_id="t1", user_id="u3t1", case_id="ca2t1",
                      date=datetime(2025, 4, 29), description="Merger agreement drafting - Section 4",
                      hours=5, rate=20000, is_billable=True, is_billed=False),
            TimeEntry(id="te3t1", tenant_id="t1", user_id="u2t1", case_id="ca3t1",
                      date=datetime(2025, 4, 30), description="Will instrument consultation",
                      hours=2, rate=15000, is_billable=True, is_billed=False),
            TimeEntry(id="te4t1", tenant_id="t1", user_id="u1t1", case_id="ca4t1",
                      date=datetime(2025, 5, 1), description="NPA file review and strategy meeting",
                      hours=6, rate=25000, is_billable=True, is_billed=False),
            TimeEntry(id="te5t1", tenant_id="t1", user_id="u4t1", case_id="ca6t1",
                      date=datetime(2025, 5, 2), description="Employment case research - unfair dismissal precedents",
                      hours=4, rate=10000, is_billable=True, is_billed=False),
            TimeEntry(id="te1t2", tenant_id="t2", user_id="u1t2", case_id="ca1t2",
                      date=datetime(2025, 4, 30), description="Defense strategy prep",
                      hours=4, rate=22000, is_billable=True, is_billed=False),
            TimeEntry(id="te1t3", tenant_id="t3", user_id="u1t3", case_id="ca1t3",
                      date=datetime(2025, 5, 1), description="Custody agreement negotiation prep",
                      hours=3, rate=18000, is_billable=True, is_billed=False),
        ]
        db.add_all(entries)
        await db.commit()

    print("✅ Database seeded successfully!")
    print("\nLogin credentials (all firms):")
    print("  Kariuki & Associates   → d.kariuki@ka.co.ke  / password123  (tenant_id: t1)")
    print("  Odhiambo Legal Partners → t.odhiambo@olp.co.ke / password123 (tenant_id: t2)")
    print("  Wanjiru & Mwangi LLP   → i.wanjiru@wm.co.ke  / password123  (tenant_id: t3)")


if __name__ == "__main__":
    asyncio.run(seed())
