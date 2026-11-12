"""
Google Calendar integration — OAuth 2.0 + two-way sync.

Flow:
  1. Admin visits Settings → clicks "Connect Google Calendar"
  2. Frontend calls GET /gcal/auth-url → gets an OAuth URL
  3. Browser redirects to Google; user approves
  4. Google redirects back to GET /gcal/oauth/callback
  5. Backend exchanges code → stores access_token + refresh_token in DB
  6. Backend redirects browser to /calendar?gcal=connected

Sync:
  - Push (LexPro → Google): auto-pushed on every calendar CRUD operation
  - Pull (Google → LexPro): GET /gcal/events returns external Google events
  - Manual full sync: POST /gcal/sync
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel

from app.database import get_db
from app.models import GoogleCalendarToken, CalendarEvent, Case, Tenant
from app.config import settings
from app.routers.auth import get_current_user, get_current_tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gcal", tags=["Google Calendar"])

SCOPES = ["https://www.googleapis.com/auth/calendar"]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _build_flow():
    """Create an OAuth flow from config. Returns None if credentials not set."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return None
    try:
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                }
            },
            scopes=SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URI,
        )
        return flow
    except Exception as e:
        logger.error(f"Failed to build OAuth flow: {e}")
        return None


def _build_service(access_token: str, refresh_token: str, expiry: Optional[datetime]):
    """Build an authorized Google Calendar service."""
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=SCOPES,
    )
    if expiry:
        # Make expiry timezone-aware for comparison
        creds.expiry = expiry.replace(tzinfo=timezone.utc) if expiry.tzinfo is None else expiry

    return build("calendar", "v3", credentials=creds, cache_discovery=False)


async def get_token(tenant_id: str, db: AsyncSession) -> Optional[GoogleCalendarToken]:
    result = await db.execute(
        select(GoogleCalendarToken).where(GoogleCalendarToken.tenant_id == tenant_id)
    )
    return result.scalar_one_or_none()


async def get_service(tenant_id: str, db: AsyncSession):
    """Get an authorised Calendar service, refreshing the token if needed."""
    tok = await get_token(tenant_id, db)
    if not tok:
        return None, None

    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build

        expiry = tok.token_expiry
        if expiry and expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        creds = Credentials(
            token=tok.access_token,
            refresh_token=tok.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=SCOPES,
        )
        creds.expiry = expiry

        # Refresh if expired
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            tok.access_token = creds.token
            tok.token_expiry = creds.expiry.replace(tzinfo=None) if creds.expiry else None
            await db.commit()

        svc = build("calendar", "v3", credentials=creds, cache_discovery=False)
        return svc, tok
    except Exception as e:
        logger.error(f"Failed to build Calendar service: {e}")
        return None, tok


def _lexpro_event_body(event: CalendarEvent, case_title: Optional[str] = None) -> dict:
    """Convert a CalendarEvent to a Google Calendar event dict."""
    start_dt = event.date
    if start_dt.tzinfo is None:
        start_dt = start_dt.replace(tzinfo=timezone.utc)
    end_dt = start_dt + timedelta(hours=1)

    description_parts = []
    if event.notes:
        description_parts.append(event.notes)
    if case_title:
        description_parts.append(f"Case: {case_title}")
    description_parts.append("— Synced from LexPro")

    return {
        "summary": event.title,
        "description": "\n".join(description_parts),
        "location": event.court or "",
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "Africa/Nairobi"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "Africa/Nairobi"},
        "extendedProperties": {
            "private": {
                "lexpro_source": "true",
                "lexpro_id": event.id,
                "lexpro_type": event.type.value if hasattr(event.type, "value") else str(event.type),
            }
        },
    }


def _case_event_body(case: Case) -> dict:
    """Convert a Case's next_hearing to a Google Calendar event dict."""
    start_dt = case.next_hearing
    if start_dt.tzinfo is None:
        start_dt = start_dt.replace(tzinfo=timezone.utc)
    end_dt = start_dt + timedelta(hours=2)
    return {
        "summary": f"[Hearing] {case.title}",
        "description": f"Case: {case.case_no or ''}\n{case.description or ''}\n— Synced from LexPro Cases",
        "location": case.court or "",
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "Africa/Nairobi"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "Africa/Nairobi"},
        "extendedProperties": {
            "private": {
                "lexpro_source": "true",
                "lexpro_id": f"case-{case.id}",
                "lexpro_type": "Case Hearing",
            }
        },
    }


# ─── Public helpers (called by calendar router) ───────────────────────────────

async def push_event(event: CalendarEvent, db: AsyncSession, *, case_title: str = None):
    """Push a single LexPro calendar event to Google. Stores google_event_id."""
    svc, tok = await get_service(event.tenant_id, db)
    if not svc:
        return
    try:
        body = _lexpro_event_body(event, case_title)
        if event.google_event_id:
            svc.events().update(
                calendarId=tok.calendar_id, eventId=event.google_event_id, body=body
            ).execute()
        else:
            result = svc.events().insert(calendarId=tok.calendar_id, body=body).execute()
            event.google_event_id = result["id"]
            await db.commit()
    except Exception as e:
        logger.warning(f"GCal push failed for event {event.id}: {e}")


async def delete_event(tenant_id: str, google_event_id: str, db: AsyncSession):
    """Delete a synced event from Google Calendar."""
    if not google_event_id:
        return
    svc, tok = await get_service(tenant_id, db)
    if not svc:
        return
    try:
        svc.events().delete(calendarId=tok.calendar_id, eventId=google_event_id).execute()
    except Exception as e:
        logger.warning(f"GCal delete failed for google_event_id {google_event_id}: {e}")


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/status")
async def gcal_status(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Return connection status for this tenant."""
    if not settings.GOOGLE_CLIENT_ID:
        return {"configured": False, "connected": False, "message": "Google credentials not configured"}

    tok = await get_token(tenant.id, db)
    if not tok:
        return {"configured": True, "connected": False}

    return {
        "configured": True,
        "connected": True,
        "calendar_id": tok.calendar_id,
        "calendar_name": tok.calendar_name,
        "last_sync": tok.last_sync.isoformat() if tok.last_sync else None,
    }


@router.get("/auth-url")
async def gcal_auth_url(
    tenant: Tenant = Depends(get_current_tenant),
    _user=Depends(get_current_user),
):
    """Generate a Google OAuth URL. Admin clicks this to begin the auth flow."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google Calendar credentials not configured on this server.")

    flow = _build_flow()
    if not flow:
        raise HTTPException(status_code=503, detail="Failed to initialise OAuth flow.")

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=tenant.id,  # pass tenant_id through state so callback knows which tenant
    )
    return {"url": auth_url}


@router.get("/oauth/callback")
async def gcal_oauth_callback(
    code: str,
    state: str,  # tenant_id
    db: AsyncSession = Depends(get_db),
):
    """Google redirects here after the user approves. Exchange code for tokens."""
    flow = _build_flow()
    if not flow:
        return RedirectResponse(f"{settings.APP_BASE_URL}/settings?gcal=error")

    try:
        flow.fetch_token(code=code)
        creds = flow.credentials

        # Get the calendar name
        from googleapiclient.discovery import build
        svc = build("calendar", "v3", credentials=creds, cache_discovery=False)
        cal_meta = svc.calendars().get(calendarId="primary").execute()
        cal_name = cal_meta.get("summary", "Primary Calendar")

        # Expiry — strip timezone for DB storage
        expiry = creds.expiry
        if expiry and expiry.tzinfo:
            expiry = expiry.replace(tzinfo=None)

        # Upsert token
        existing = await get_token(state, db)
        if existing:
            existing.access_token = creds.token
            existing.refresh_token = creds.refresh_token or existing.refresh_token
            existing.token_expiry = expiry
            existing.calendar_name = cal_name
        else:
            db.add(GoogleCalendarToken(
                tenant_id=state,
                access_token=creds.token,
                refresh_token=creds.refresh_token,
                token_expiry=expiry,
                calendar_id="primary",
                calendar_name=cal_name,
            ))
        await db.commit()

    except Exception as e:
        logger.error(f"OAuth callback failed: {e}")
        return RedirectResponse(f"{settings.APP_BASE_URL}/settings?gcal=error")

    return RedirectResponse(f"{settings.APP_BASE_URL}/settings?gcal=connected")


@router.delete("/disconnect", status_code=204)
async def gcal_disconnect(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Revoke and remove the stored token."""
    tok = await get_token(tenant.id, db)
    if tok:
        # Best-effort revoke
        try:
            import requests as req_lib
            req_lib.post("https://oauth2.googleapis.com/revoke", params={"token": tok.access_token})
        except Exception:
            pass
        await db.execute(delete(GoogleCalendarToken).where(GoogleCalendarToken.tenant_id == tenant.id))
        await db.commit()


@router.get("/events")
async def gcal_external_events(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Return events from Google Calendar that were NOT created by LexPro.
    These are displayed as read-only "external" entries in the LexPro calendar.
    """
    svc, tok = await get_service(tenant.id, db)
    if not svc:
        return []

    try:
        time_min = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
        time_max = (datetime.utcnow() + timedelta(days=180)).isoformat() + "Z"

        result = svc.events().list(
            calendarId=tok.calendar_id,
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy="startTime",
            maxResults=100,
        ).execute()

        external = []
        for ev in result.get("items", []):
            # Skip events we pushed from LexPro
            private_props = ev.get("extendedProperties", {}).get("private", {})
            if private_props.get("lexpro_source") == "true":
                continue

            start = ev.get("start", {})
            start_str = start.get("dateTime") or (start.get("date") + "T00:00:00Z")
            external.append({
                "id": f"gcal-{ev['id']}",
                "title": ev.get("summary", "(No title)"),
                "date": start_str,
                "type": "Google Calendar",
                "priority": "Medium",
                "notes": ev.get("description", ""),
                "court": ev.get("location", ""),
                "isGoogleEvent": True,
                "google_html_link": ev.get("htmlLink", ""),
            })
        return external
    except Exception as e:
        logger.warning(f"Failed to fetch Google events: {e}")
        return []


@router.post("/sync")
async def gcal_sync(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Full push sync: push all LexPro events + case hearings to Google Calendar.
    Returns a count of pushed events.
    """
    svc, tok = await get_service(tenant.id, db)
    if not svc:
        raise HTTPException(status_code=400, detail="Google Calendar not connected.")

    pushed = 0
    errors = 0

    # Push calendar events
    ev_result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.tenant_id == tenant.id)
    )
    events = ev_result.scalars().all()

    for ev in events:
        try:
            body = _lexpro_event_body(ev)
            if ev.google_event_id:
                try:
                    svc.events().update(
                        calendarId=tok.calendar_id, eventId=ev.google_event_id, body=body
                    ).execute()
                except Exception:
                    # Event may have been deleted in Google — re-create
                    result = svc.events().insert(calendarId=tok.calendar_id, body=body).execute()
                    ev.google_event_id = result["id"]
            else:
                result = svc.events().insert(calendarId=tok.calendar_id, body=body).execute()
                ev.google_event_id = result["id"]
            pushed += 1
        except Exception as e:
            logger.warning(f"Sync push failed for event {ev.id}: {e}")
            errors += 1

    # Push case hearings (next_hearing dates)
    case_result = await db.execute(
        select(Case).where(Case.tenant_id == tenant.id, Case.next_hearing.isnot(None))
    )
    cases = case_result.scalars().all()

    for c in cases:
        try:
            body = _case_event_body(c)
            # Search for existing by extended property
            existing = svc.events().list(
                calendarId=tok.calendar_id,
                privateExtendedProperty=f"lexpro_id=case-{c.id}",
            ).execute().get("items", [])

            if existing:
                svc.events().update(
                    calendarId=tok.calendar_id, eventId=existing[0]["id"], body=body
                ).execute()
            else:
                svc.events().insert(calendarId=tok.calendar_id, body=body).execute()
            pushed += 1
        except Exception as e:
            logger.warning(f"Sync push failed for case hearing {c.id}: {e}")
            errors += 1

    tok.last_sync = datetime.utcnow()
    await db.commit()

    return {"pushed": pushed, "errors": errors, "synced_at": tok.last_sync.isoformat()}
