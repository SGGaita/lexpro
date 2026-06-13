"""
Admin / dev utilities.
These endpoints are only active when DEBUG=true.
"""

from fastapi import APIRouter, HTTPException
from app.config import settings
from app.database import engine, Base

# Import all models so their metadata is registered before create_all
import app.models  # noqa: F401

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/init-db", summary="Drop and recreate all tables (dev only)")
async def init_db():
    if not settings.DEBUG:
        raise HTTPException(403, detail="Only available in DEBUG mode.")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    return {"status": "ok", "message": "All tables dropped and recreated."}


@router.post("/create-tables", summary="Create tables if they don't exist (safe)")
async def create_tables():
    if not settings.DEBUG:
        raise HTTPException(403, detail="Only available in DEBUG mode.")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    return {"status": "ok", "message": "Tables created (existing tables unchanged)."}
