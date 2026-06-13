# LexPro — SaaS Audit Report
**Date:** June 12, 2026  
**Codebase:** Next.js 16 + FastAPI + PostgreSQL + Docker  
**Domain:** Legal Practice Management (Kenya market)

---

## Executive Summary

LexPro is a well-structured, multi-tenant law firm management system with a clean dark-themed UI, solid data model, and good backend foundations. The core module coverage (cases, clients, billing, documents, calendar, time tracking, staff) is impressive for an early-stage product. However, it is currently a **prototype** — several modules are UI-only with mock data, the document vault has no real file storage, there is no subscription/payment infrastructure, and critical SaaS-hardening work (tests, security, rate limiting, observability) is absent. The gaps below represent a clear, prioritised roadmap to ship a competitive legal SaaS.

---

## 1. Strengths

### Architecture & Infrastructure
- **True multi-tenancy from day one.** Every model has `tenant_id` with cascade deletes. The auth layer enforces tenant scoping on every API call via `get_current_tenant()` dependency — this is the right foundation.
- **Async FastAPI + asyncpg.** Full async stack means it will scale well under concurrent load without thread-pool bottlenecks.
- **Clean separation of concerns.** Backend models → schemas → routers is well-layered; frontend has a single `api.js` client and a global `AppContext` — minimal coupling.
- **Docker Compose with Nginx reverse proxy.** Production-like local setup, zero friction for a team to spin up.
- **Standalone Next.js output** (`output: 'standalone'`). Optimised for containerised deployment.

### Data Model
- **Rich, realistic schema.** Tenants, Users (with roles + billable rates), Clients (individual/corporate/government), Cases, Invoices with line items, Documents, Calendar Events, Time Entries — this covers ~80% of a law firm's core workflow.
- **Role hierarchy.** Six distinct roles (Senior Partner → Paralegal) with a `require_role()` dependency factory ready to use.
- **Invoice automation.** Auto-status transition (pending → partial → paid) on payment updates is clean.
- **Kenyan market focus.** KES currency, realistic seed data with local firms, courts, and phone numbers — a real differentiator vs. generic Western legal SaaS.

### UI / UX
- **Premium dark theme.** The Cormorant Garamond + DM Sans combination with gold accents (`#D4A843`) gives a legal-appropriate, high-end feel uncommon in this category.
- **Live KPI dashboard.** Stats cards, billing vs. collections bar chart, cases-by-practice-area pie, upcoming hearings, and overdue invoice alert — all driven by real API data.
- **Badge notifications** on sidebar (overdue invoices, upcoming hearings) — small but signals product thinking.
- **Tenant switcher.** Users can switch between firms from the sidebar — critical for accountants and consultants who serve multiple firms.

### Developer Experience
- **Seed script** with 3 realistic tenants, 9 staff, 9 clients, 10 cases, 7 invoices, 7 documents, 6 calendar events, 7 time entries — a fully usable demo environment.
- **Alembic set up** (directory exists, ready for migration files).
- **OpenAPI docs** exposed at `/docs` and `/redoc`.

---

## 2. Gaps (Must-Fix Before Launch)

### 🔴 Critical

**1. No actual file storage for documents.**  
The `Document` model has a `file_path` column but there is no file upload endpoint — `DocumentCreate` takes metadata only, and the frontend "Download" button is non-functional. Users can't upload or retrieve real files.  
_Fix:_ Add `POST /documents/upload` with `python-multipart`, store files in S3/Cloudflare R2/local volume, save the path to `file_path`.

**2. Frontend UI actions are not wired to the API for mutations.**  
"New Case", "New Invoice", "New Client", "Upload" buttons exist but have no forms or API calls behind them. The app is read-only for demo data.  
_Fix:_ Add create/edit dialogs for all 7 modules, wired to the existing API endpoints.

**3. No Alembic migration files.**  
The `alembic/versions/` directory is empty. The only way to create the schema is `seed.py` (which does `drop_all` + `create_all`). Any production schema change destroys all data.  
_Fix:_ Run `alembic revision --autogenerate` to capture the current schema, then use migrations for all future changes.

**4. Hardcoded secrets in docker-compose.yml.**  
`SECRET_KEY: change-this-in-production` and `POSTGRES_PASSWORD: lexpro123` are in the compose file. These will leak if the repo is public.  
_Fix:_ Use Docker secrets or reference `.env` file variables; add `.env` to `.gitignore`.

**5. No tests.**  
Zero test files exist (backend or frontend). There is no way to safely refactor or add features.  
_Fix:_ Add `pytest` + `httpx` async integration tests for auth and at least one CRUD router; add a basic Jest/React Testing Library setup for the frontend.

**6. No refresh token / token expiry handling.**  
JWTs expire after 8 hours. On expiry the frontend silently redirects to `/` (login). There is no refresh token flow, so users are hard-logged out mid-session.  
_Fix:_ Implement refresh tokens stored as httpOnly cookies, or extend with a `/auth/refresh` endpoint.

### 🟠 High Priority

**7. N+1 query problem in list endpoints.**  
`list_clients` fires a separate `SELECT COUNT` and `SELECT SUM` for every client in a loop. `list_documents` fires 2–3 queries per document. With 500+ records this will be noticeably slow.  
_Fix:_ Use SQLAlchemy `subquery()` or `with_expression()` to compute `case_count` and `total_billed` in a single join query.

**8. Dashboard billing chart uses hardcoded mock data.**  
`billingData` in `dashboard.js` is static January–May 2025 data — it never changes regardless of actual invoices.  
_Fix:_ Add a `/dashboard/monthly-billing` endpoint that aggregates invoices by month.

**9. No role-based access control applied to routes.**  
The `require_role()` factory exists but is not used on any router. Any authenticated user (including a Paralegal) can create, update, or delete anything.  
_Fix:_ Apply `require_role("Admin", "Senior Partner")` to destructive and financial endpoints.

**10. CORS is too permissive in production.**  
`allow_origins=settings.CORS_ORIGINS` is fine, but `allow_methods=["*"]` and `allow_headers=["*"]` should be tightened for production.

**11. No pagination.**  
All list endpoints return every record. A firm with 5 years of time entries will return thousands of rows in one request.  
_Fix:_ Add `skip` / `limit` query params (or cursor pagination) to all list endpoints.

**12. No input validation on enums.**  
`CaseCreate.status` and `CaseCreate.priority` are plain strings. Passing `"INVALID"` will cause a SQLAlchemy error at the database level rather than a clean 422.  
_Fix:_ Use `Literal` types or a custom validator in the Pydantic schemas.

---

## 3. Opportunities (Competitive Differentiators)

### 💰 Monetisation & Growth

**A. Subscription billing with M-Pesa integration.**  
The `TenantPlan` enum (Starter/Professional/Enterprise) exists but has no enforcement. Add Stripe for international cards and M-Pesa Daraja API for local payments — this is the single biggest revenue unlock. Gate features by plan (e.g., max users, storage quota, API access).

**B. Self-service tenant onboarding.**  
Currently tenants are created by the seed script. Add a public signup flow (`POST /tenants` + email verification) so law firms can register themselves. This turns LexPro from a client-deployed tool into a true SaaS.

**C. Usage-based billing signals.**  
You already track time entries and invoices. Add metered billing signals (storage used, API calls, number of active cases) to support tiered plans.

### 🤖 AI / Automation

**D. AI document summarisation.**  
You have a document vault. Add an "Summarise" button that sends the document to an LLM API (Claude/OpenAI) and returns a plain-language summary. This is a high-value, low-effort feature for lawyers reviewing long filings.

**E. Deadline prediction & conflict detection.**  
Calendar events have case linkages. Build an engine that flags: upcoming hearings with no assigned lawyer, cases with no recent time entries, overlapping court dates for the same lawyer.

**F. Invoice auto-generation from time entries.**  
Time entries have `is_billable` and `is_billed` flags. Add a "Generate Invoice" button on the billing page that auto-populates invoice line items from unbilled time entries for a selected client/case.

### 🔒 Security & Compliance

**G. Audit log.**  
Law firms are regulated and need to know who accessed or changed client data. Add an `AuditLog` table (user_id, tenant_id, action, resource, timestamp) and log all write operations via a FastAPI middleware or SQLAlchemy event listener.

**H. Two-factor authentication.**  
Lawyers handle sensitive client data. Add TOTP-based 2FA (via `pyotp`) as an opt-in for admins and partners.

**I. Data encryption at rest.**  
For enterprise plans, offer encrypted document storage (client-side encryption keys or AWS KMS).

### 📊 Analytics & Reporting

**J. Matter profitability report.**  
You have all the data: case fee, time entries with rates, invoice amounts. Build a per-case P&L report showing budgeted fee vs. actual billed hours vs. collected — this is the #1 report senior partners want.

**K. Staff utilisation dashboard.**  
Aggregate time entries by staff member: billable hours this week/month, utilisation rate vs. target, unbilled hours value. Exportable as PDF/Excel.

**L. Aged debtors report.**  
Group overdue invoices by 30/60/90/120+ days. Auto-generate a PDF that a firm's accounts team can send to clients.

### 🏗️ Engineering / Scale

**M. Background job queue.**  
Add Celery + Redis (or Dramatiq) for: sending invoice reminder emails, generating PDF reports, document OCR/indexing. The current synchronous-only approach won't scale.

**N. WebSocket / SSE for real-time updates.**  
When a hearing is added or an invoice goes overdue, other users on the same tenant should see the update without a page refresh. Add Server-Sent Events on the dashboard stats endpoint.

**O. Multi-region deployment.**  
Add a deployment guide for AWS Kenya (af-south-1) or Azure East Africa. Data residency is important for regulated industries in Kenya.

**P. Public API + webhooks.**  
Expose a documented REST API (the FastAPI docs are already there) with API key authentication for integrations. Add webhooks for events like `invoice.paid`, `case.hearing_scheduled` — this enables integration with Kenyan court systems, M-Pesa, and accounting software like QuickBooks or Odoo.

---

## 4. Prioritised Roadmap

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Wire all "New X" buttons to API (create/edit forms) | Medium | Critical — app is read-only |
| P0 | Real file upload for documents (S3/R2) | Medium | Core feature gap |
| P0 | Alembic migration files | Low | Data safety |
| P0 | Rotate hardcoded secrets | Low | Security |
| P1 | Fix N+1 queries in list endpoints | Medium | Performance |
| P1 | Monthly billing endpoint (real chart data) | Low | Accuracy |
| P1 | Apply RBAC to routes | Low | Security |
| P1 | Pagination on all list endpoints | Low | Scale |
| P1 | Invoice auto-generation from time entries | Medium | High-value feature |
| P2 | Refresh token flow | Medium | UX |
| P2 | Self-service tenant signup | Medium | Growth |
| P2 | M-Pesa + Stripe subscription billing | High | Revenue |
| P2 | Audit log | Medium | Compliance |
| P2 | Background jobs (Celery/Redis) | Medium | Scale |
| P3 | AI document summarisation | Low | Differentiator |
| P3 | Matter profitability report | Medium | Differentiator |
| P3 | Staff utilisation dashboard | Medium | Differentiator |
| P3 | 2FA | Medium | Enterprise sales |
| P3 | Webhooks / Public API | High | Ecosystem |

---

## 5. Quick Wins (Can Ship This Week)

1. **Fix the billing chart** — replace the 5 hardcoded rows with a real `/dashboard/monthly-billing` endpoint. ~2 hours.
2. **Add pagination** — add `skip: int = 0, limit: int = 50` to all list routers. ~1 hour.
3. **Apply RBAC to delete endpoints** — wrap `delete_client`, `delete_case`, etc. with `require_role("Admin", "Senior Partner")`. ~30 minutes.
4. **Generate first Alembic migration** — `alembic revision --autogenerate -m "initial"`. ~15 minutes.
5. **Add an overdue invoice auto-flag job** — a simple cron endpoint that sets invoices past `due` date to `Overdue` status. ~1 hour.

---

*This is a strong foundation. The tech stack choices are excellent for a Kenyan legal SaaS. The biggest gap between "prototype" and "shippable product" is wiring the mutation UI and adding real file storage — once those land, LexPro has a genuinely differentiated product in an underserved market.*
