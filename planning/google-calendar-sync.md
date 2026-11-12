# Google Calendar Sync — Configuration Guide

This guide covers everything needed to enable two-way Google Calendar sync in LexPro.

---

## How It Works

| Direction | Trigger | What syncs |
|---|---|---|
| LexPro → Google | Automatic on create/edit/delete | All calendar events |
| LexPro → Google | Manual "Sync Now" | Case hearing dates from Cases page |
| Google → LexPro | On calendar page load | External Google events (read-only) |

Events pushed from LexPro are tagged with a `lexpro_source` metadata flag so they are never double-imported back.

---

## Step 1 — Google Cloud Console Setup

### 1.1 Create a Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `LexPro` (or anything) → **Create**

### 1.2 Enable the Calendar API
1. Navigate to **APIs & Services → Library**
2. Search for **Google Calendar API** → click it → **Enable**

### 1.3 Configure the OAuth Consent Screen
1. Go to **APIs & Services → OAuth consent screen**
2. User Type: **External** → **Create**
3. Fill in:
   - **App name**: `LexPro`
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click through Scopes (no changes needed) → Save
5. Under **Test users**, add the Google account you will use to connect
6. Leave the app in **Testing** status — this is fine for internal firm use and avoids needing Google's full app verification

> **Note:** In Testing mode, only accounts listed as Test Users can complete the OAuth flow. Add each Google account that will connect.

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials → + Create Credentials → OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Name: `LexPro Web`
4. Under **Authorized redirect URIs**, click **+ Add URI** and enter:
   ```
   http://192.168.100.90/api/v1/gcal/oauth/callback
   ```
   Replace `192.168.100.90` with your server's IP or domain if different.
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** — you will need these in Step 2

---

## Step 2 — Server Configuration

### 2.1 Add Environment Variables

Open (or create) `C:\projects\lexpro\backend\.env` and add:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://192.168.100.90/api/v1/gcal/oauth/callback
APP_BASE_URL=http://192.168.100.90
```

Adjust the IP/domain to match your deployment URL.

### 2.2 Run the Database Migration

These columns are added by `create_all` on startup, but if the DB already exists, run manually:

```bash
docker exec lexprodb psql -U lexpro -d lexprodb -c \
  "ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(500);"

docker exec lexprodb psql -U lexpro -d lexprodb -c \
  "CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMP,
    calendar_id VARCHAR(300) DEFAULT 'primary',
    calendar_name VARCHAR(300),
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );"
```

### 2.3 Rebuild the Backend

```bash
cd C:\projects\lexpro
docker compose up --build -d
```

---

## Step 3 — Connect in LexPro

1. Log in to LexPro as an **Admin**
2. Click the firm name dropdown (top-left sidebar) → **Settings**
3. Scroll to the **Google Calendar** section
4. Click **Sign in with Google**
5. You will be redirected to Google — select the account you added as a test user and approve
6. You are returned to Settings with a "Connected" confirmation
7. Click **Sync Now** to push all existing LexPro events and case hearings to Google Calendar

---

## What Appears in the Calendar

| Entry type | Colour | Editable in LexPro |
|---|---|---|
| LexPro events (Court Hearing, Deadline, etc.) | Red / Blue / Orange etc. | ✅ Yes |
| Case hearings (synced from Cases) | Gold | ❌ Read-only (edit via Cases page) |
| Google Calendar events (external) | Google Blue `#4285F4` | ❌ Read-only (opens in Google Calendar) |

---

## Troubleshooting

### "Server not configured" shown in Settings
The `GOOGLE_CLIENT_ID` env var is missing or empty. Add it to `.env` and rebuild the backend.

### OAuth redirect fails / "redirect_uri_mismatch"
The redirect URI in Google Cloud Console must exactly match `GOOGLE_REDIRECT_URI` in `.env` — including the protocol (`http` vs `https`) and trailing slash (or lack of one).

### "Access blocked: app not verified"
The OAuth consent screen is in Testing mode but the Google account used is not listed as a Test User. Add it under **OAuth consent screen → Test users**.

### Google events not appearing in LexPro calendar
External events load on page open. Refresh the calendar page after connecting. If still empty, the Google account may have no events in the ±180-day window that LexPro fetches.

### Sync pushes 0 events
Confirm the Google Calendar connection is still valid in Settings. If the refresh token expired (rare in Testing mode), disconnect and reconnect.

### HTTP vs HTTPS
Google OAuth requires HTTPS for production (Published) apps. For **Testing** status apps, HTTP on non-localhost IPs is permitted. If you move to a public domain with HTTPS, update both `GOOGLE_REDIRECT_URI` in `.env` and the Authorized Redirect URI in Google Cloud Console.

---

## Moving to Production (future)

When the firm is ready to make the app publicly available or wants to remove the Testing restriction:

1. Go to **OAuth consent screen → Publish App**
2. Google will ask you to verify the app — this involves confirming domain ownership and going through a review for sensitive scopes (Calendar access counts as sensitive)
3. Update `GOOGLE_REDIRECT_URI` to use an HTTPS URL
4. Update the Authorized Redirect URI in Google Cloud Console to match

For an internal firm tool, staying in Testing mode indefinitely is perfectly fine — it is not a production limitation for private use.

---

## File & Code Reference

| File | Purpose |
|---|---|
| `backend/app/routers/gcal.py` | OAuth flow, sync endpoints, push/pull helpers |
| `backend/app/models/__init__.py` | `GoogleCalendarToken` model, `google_event_id` on `CalendarEvent` |
| `backend/app/config.py` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `APP_BASE_URL` |
| `frontend/lib/api.js` | `api.gcal.*` methods |
| `frontend/pages/settings/index.js` | Connect/disconnect UI, sync button |
| `frontend/pages/calendar/index.js` | Sync button, Google event display, stat card |
