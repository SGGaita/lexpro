from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 — registers all model metadata
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.onboarding import router as onboarding_router
from app.routers.admin import router as admin_router
from app.routers import (
    clients_router, cases_router, billing_router,
    documents_router, calendar_router, staff_router, time_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (safe — skips existing tables)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Multi-tenant law firm management API — LexPro",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
API = "/api/v1"

app.include_router(onboarding_router, prefix=API)
app.include_router(admin_router,     prefix=API)
app.include_router(auth_router,      prefix=API)
app.include_router(dashboard_router, prefix=API)
app.include_router(clients_router,   prefix=API)
app.include_router(cases_router,     prefix=API)
app.include_router(billing_router,   prefix=API)
app.include_router(documents_router, prefix=API)
app.include_router(calendar_router,  prefix=API)
app.include_router(staff_router,     prefix=API)
app.include_router(time_router,      prefix=API)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
