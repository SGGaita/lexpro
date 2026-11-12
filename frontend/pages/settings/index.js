import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Alert, CircularProgress,
  Divider, Chip, IconButton, InputAdornment, Tooltip,
} from "@mui/material";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import { useRouter } from "next/router";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StorageIcon from "@mui/icons-material/Storage";
import BusinessIcon from "@mui/icons-material/Business";
import LinkIcon from "@mui/icons-material/Link";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import SyncIcon from "@mui/icons-material/Sync";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// ─── Shared input style ───────────────────────────────────────────────────────

const inputSx = {
  "& .MuiOutlinedInput-root": {
    background: "var(--bg-elevated)",
    "& fieldset": { borderColor: "var(--border)" },
    "&:hover fieldset": { borderColor: "var(--accent-gold-dim)" },
    "&.Mui-focused fieldset": { borderColor: "var(--accent-gold)" },
  },
  "& .MuiInputLabel-root": { color: "var(--text-muted)", fontSize: "0.82rem" },
  "& .MuiInputBase-input": { color: "var(--text-primary)", fontSize: "0.85rem" },
};

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ icon, title, subtitle, children }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", mb: 2.5 }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: "var(--accent-gold)", display: "flex" }}>{icon}</Box>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 0.2 }}>{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ px: 3, py: 2.5 }}>{children}</Box>
    </Box>
  );
}

// ─── Provider pill ────────────────────────────────────────────────────────────

function ProviderPill({ value, active, onClick, label, desc }) {
  return (
    <Box onClick={onClick} sx={{
      flex: 1, border: `1.5px solid ${active ? "var(--accent-gold)" : "var(--border)"}`,
      borderRadius: "10px", p: 1.5, cursor: "pointer", transition: "all 0.15s",
      background: active ? "rgba(212,168,67,0.07)" : "var(--bg-elevated)",
      "&:hover": { borderColor: "var(--accent-gold-dim)" },
    }}>
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: active ? "var(--accent-gold)" : "var(--text-primary)", mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{desc}</Typography>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google Calendar
  const [gcalStatus, setGcalStatus] = useState(null);
  const [gcalConnecting, setGcalConnecting] = useState(false);
  const [gcalDisconnecting, setGcalDisconnecting] = useState(false);
  const [gcalSyncing, setGcalSyncing] = useState(false);
  const [gcalMsg, setGcalMsg] = useState(null);
  const [gcalNotice, setGcalNotice] = useState(null); // "connected" | "error"

  // Profile form
  const [profile, setProfile] = useState({ name: "", specialty: "", location: "", established: "", color: "#D4A843" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // {type, text}

  // Storage form
  const [storage, setStorage] = useState({
    provider: "lexpro_managed",
    bucket_name: "",
    account_id: "",
    access_key_id: "",
    secret_access_key: "",
    endpoint_url: "",
    region: "",
  });
  const [showSecret, setShowSecret] = useState(false);
  const [storageSaving, setStorageSaving] = useState(false);
  const [storageMsg, setStorageMsg] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // Load GCal status + handle OAuth return
  useEffect(() => {
    api.gcal.status().then(setGcalStatus).catch(() => {});
    if (router.query.gcal === "connected") setGcalNotice("connected");
    if (router.query.gcal === "error") setGcalNotice("error");
  }, [router.query.gcal]);

  const connectGcal = async () => {
    setGcalConnecting(true); setGcalMsg(null);
    try {
      const { url } = await api.gcal.authUrl();
      window.location.href = url;
    } catch (e) {
      setGcalMsg({ type: "error", text: e.message || "Could not generate auth URL. Check server credentials." });
      setGcalConnecting(false);
    }
  };

  const disconnectGcal = async () => {
    setGcalDisconnecting(true); setGcalMsg(null);
    try {
      await api.gcal.disconnect();
      setGcalStatus((s) => ({ ...s, connected: false }));
      setGcalMsg({ type: "success", text: "Google Calendar disconnected." });
    } catch (e) {
      setGcalMsg({ type: "error", text: e.message });
    } finally {
      setGcalDisconnecting(false);
    }
  };

  const syncNow = async () => {
    setGcalSyncing(true); setGcalMsg(null);
    try {
      const r = await api.gcal.sync();
      setGcalStatus((s) => ({ ...s, last_sync: new Date().toISOString() }));
      setGcalMsg({ type: "success", text: `Sync complete — ${r.pushed} events pushed${r.errors ? `, ${r.errors} errors` : ""}.` });
    } catch (e) {
      setGcalMsg({ type: "error", text: e.message });
    } finally {
      setGcalSyncing(false);
    }
  };

  useEffect(() => {
    api.settings.get().then((data) => {
      setSettings(data);
      setProfile({
        name: data.name || "",
        specialty: data.specialty || "",
        location: data.location || "",
        established: data.established || "",
        color: data.color || "#D4A843",
      });
      if (data.storage) {
        setStorage((prev) => ({
          ...prev,
          provider: data.storage.provider || "lexpro_managed",
          bucket_name: data.storage.bucket_name || "",
          account_id: data.storage.account_id || "",
          access_key_id: data.storage.access_key_id || "",
          endpoint_url: data.storage.endpoint_url || "",
          region: data.storage.region || "",
        }));
        setVerifyResult(data.storage.is_verified ? { ok: true, msg: `Connected to bucket '${data.storage.bucket_name}'` } : null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setProfileSaving(true); setProfileMsg(null);
    try {
      await api.settings.updateProfile(profile);
      setProfileMsg({ type: "success", text: "Firm profile updated." });
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message });
    } finally {
      setProfileSaving(false);
    }
  };

  const saveStorage = async () => {
    setStorageSaving(true); setStorageMsg(null); setVerifyResult(null);
    try {
      const payload = { ...storage };
      // Don't send empty secret (means "keep existing")
      if (!payload.secret_access_key) delete payload.secret_access_key;
      const result = await api.settings.updateStorage(payload);
      setStorageMsg({ type: result.is_verified ? "success" : "warning",
        text: result.is_verified
          ? `Saved & verified — connected to '${result.bucket_name}'.`
          : "Saved. Connection could not be verified — check your credentials." });
      setVerifyResult(result.is_verified ? { ok: true, msg: `Connected to '${result.bucket_name}'` } : { ok: false, msg: "Could not verify" });
      // Clear secret from form after save
      setStorage((p) => ({ ...p, secret_access_key: "" }));
    } catch (e) {
      setStorageMsg({ type: "error", text: e.message });
    } finally {
      setStorageSaving(false);
    }
  };

  const testConnection = async () => {
    setVerifying(true); setVerifyResult(null);
    try {
      const r = await api.settings.verifyStorage();
      setVerifyResult({ ok: r.verified, msg: r.message });
    } catch (e) {
      setVerifyResult({ ok: false, msg: e.message });
    } finally {
      setVerifying(false);
    }
  };

  const isCloud = storage.provider === "cloudflare_r2" || storage.provider === "aws_s3";

  if (loading) {
    return <Layout title="Settings"><Box sx={{ textAlign: "center", py: 8 }}><CircularProgress size={32} sx={{ color: "var(--accent-gold)" }} /></Box></Layout>;
  }

  return (
    <Layout title="Settings">
      <Box>

        {/* ── Firm Profile ──────────────────────────────────────────── */}
        <Section icon={<BusinessIcon />} title="Firm Profile" subtitle="Your law firm's public identity">
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
            <TextField label="Firm Name" size="small" fullWidth value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} sx={inputSx} />
            <TextField label="Specialty" size="small" fullWidth value={profile.specialty}
              onChange={(e) => setProfile((p) => ({ ...p, specialty: e.target.value }))}
              placeholder="e.g. Litigation, Corporate Law" sx={inputSx} />
            <TextField label="Location" size="small" fullWidth value={profile.location}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g. Nairobi, Kenya" sx={inputSx} />
            <TextField label="Established" size="small" fullWidth value={profile.established}
              onChange={(e) => setProfile((p) => ({ ...p, established: e.target.value }))}
              placeholder="e.g. 2010" sx={inputSx} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 0.5 }}>Brand Colour</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <input type="color" value={profile.color} onChange={(e) => setProfile((p) => ({ ...p, color: e.target.value }))}
                  style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", borderRadius: 6 }} />
                <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>{profile.color}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Plan:</Typography>
              <Chip label={settings?.plan || "—"} size="small" sx={{ fontSize: "0.7rem", background: "rgba(212,168,67,0.12)", color: "var(--accent-gold)", border: "none" }} />
            </Box>
          </Box>

          {profileMsg && <Alert severity={profileMsg.type} sx={{ mb: 2, fontSize: "0.8rem" }}>{profileMsg.text}</Alert>}
          <Button variant="contained" size="small" startIcon={profileSaving ? <CircularProgress size={12} color="inherit" /> : <SaveIcon sx={{ fontSize: 15 }} />}
            onClick={saveProfile} disabled={profileSaving}
            sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
            {profileSaving ? "Saving…" : "Save Profile"}
          </Button>
        </Section>

        {/* ── Storage Configuration ─────────────────────────────────── */}
        <Section icon={<StorageIcon />} title="Document Storage"
          subtitle="Where uploaded documents are stored. All files for this firm use this configuration.">

          {/* Provider selector */}
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>Storage Provider</Typography>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
            <ProviderPill value="lexpro_managed" active={storage.provider === "lexpro_managed"}
              onClick={() => setStorage((p) => ({ ...p, provider: "lexpro_managed" }))}
              label="LexPro Managed" desc="Stored in LexPro's secure Cloudflare R2 cloud. No setup required." />
            <ProviderPill value="cloudflare_r2" active={storage.provider === "cloudflare_r2"}
              onClick={() => setStorage((p) => ({ ...p, provider: "cloudflare_r2" }))}
              label="Cloudflare R2" desc="Zero egress fees. Recommended for production." />
            <ProviderPill value="aws_s3" active={storage.provider === "aws_s3"}
              onClick={() => setStorage((p) => ({ ...p, provider: "aws_s3" }))}
              label="AWS S3" desc="Amazon S3 or any S3-compatible service." />
          </Box>

          {/* Cloud credentials — shown for R2 / S3 */}
          {isCloud && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2.5 }}>
              <Divider sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", px: 1 }}>
                  {storage.provider === "cloudflare_r2" ? "Cloudflare R2 Credentials" : "AWS S3 Credentials"}
                </Typography>
              </Divider>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField label="Bucket Name" size="small" fullWidth value={storage.bucket_name}
                  onChange={(e) => setStorage((p) => ({ ...p, bucket_name: e.target.value }))}
                  placeholder="lexpro-documents" sx={inputSx} />

                {storage.provider === "cloudflare_r2" ? (
                  <TextField label="Account ID" size="small" fullWidth value={storage.account_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      setStorage((p) => ({
                        ...p, account_id: id,
                        endpoint_url: id ? `https://${id}.r2.cloudflarestorage.com` : p.endpoint_url,
                      }));
                    }}
                    placeholder="abc123def456..." sx={inputSx} />
                ) : (
                  <TextField label="Region" size="small" fullWidth value={storage.region}
                    onChange={(e) => setStorage((p) => ({ ...p, region: e.target.value }))}
                    placeholder="us-east-1" sx={inputSx} />
                )}

                <TextField label="Access Key ID" size="small" fullWidth value={storage.access_key_id}
                  onChange={(e) => setStorage((p) => ({ ...p, access_key_id: e.target.value }))}
                  placeholder="Access Key ID" sx={inputSx} />

                <TextField label="Secret Access Key" size="small" fullWidth
                  type={showSecret ? "text" : "password"}
                  value={storage.secret_access_key}
                  onChange={(e) => setStorage((p) => ({ ...p, secret_access_key: e.target.value }))}
                  placeholder={settings?.storage?.secret_key_masked || "Enter new secret…"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowSecret((v) => !v)} edge="end">
                          {showSecret ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={inputSx}
                  helperText={settings?.storage?.secret_key_masked && !storage.secret_access_key
                    ? `Current: ${settings.storage.secret_key_masked} — leave blank to keep` : ""} />
              </Box>

              <TextField label="Endpoint URL" size="small" fullWidth value={storage.endpoint_url}
                onChange={(e) => setStorage((p) => ({ ...p, endpoint_url: e.target.value }))}
                placeholder={storage.provider === "cloudflare_r2"
                  ? "https://<account-id>.r2.cloudflarestorage.com"
                  : "https://s3.amazonaws.com"}
                sx={inputSx}
                helperText={storage.provider === "cloudflare_r2" ? "Auto-filled when you enter Account ID above" : ""} />

              {/* Verify status */}
              {verifyResult && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: "8px",
                  background: verifyResult.ok ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)",
                  border: `1px solid ${verifyResult.ok ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}` }}>
                  {verifyResult.ok
                    ? <CheckCircleIcon sx={{ fontSize: 16, color: "#2ECC71" }} />
                    : <ErrorIcon sx={{ fontSize: 16, color: "#E74C3C" }} />}
                  <Typography sx={{ fontSize: "0.78rem", color: verifyResult.ok ? "#2ECC71" : "#E74C3C" }}>{verifyResult.msg}</Typography>
                </Box>
              )}
            </Box>
          )}

          {storage.provider === "lexpro_managed" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, borderRadius: "10px", background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.2)", mb: 2 }}>
              <StorageIcon sx={{ fontSize: 20, color: "var(--accent-gold)" }} />
              <Box>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--accent-gold)" }}>LexPro Cloud Storage</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)", mt: 0.3 }}>
                  Your documents are stored in LexPro's secure Cloudflare R2 bucket — no credentials needed.
                  Switch to <strong>BYOS</strong> (Cloudflare R2 or AWS S3) to use your own bucket.
                </Typography>
              </Box>
            </Box>
          )}

          {storageMsg && <Alert severity={storageMsg.type} sx={{ mb: 2, fontSize: "0.8rem" }}>{storageMsg.text}</Alert>}

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="contained" size="small"
              startIcon={storageSaving ? <CircularProgress size={12} color="inherit" /> : <SaveIcon sx={{ fontSize: 15 }} />}
              onClick={saveStorage} disabled={storageSaving}
              sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
              {storageSaving ? "Saving…" : "Save Storage Config"}
            </Button>

            {isCloud && settings?.storage && (
              <Button variant="outlined" size="small"
                startIcon={verifying ? <CircularProgress size={12} color="inherit" /> : <LinkIcon sx={{ fontSize: 15 }} />}
                onClick={testConnection} disabled={verifying}
                sx={{ fontSize: "0.8rem", borderColor: "var(--border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)" } }}>
                {verifying ? "Testing…" : "Test Connection"}
              </Button>
            )}
          </Box>
        </Section>

        {/* ── Getting R2 Credentials hint ────────────────────────────── */}
        {storage.provider === "cloudflare_r2" && (
          <Box sx={{ p: 2, borderRadius: "10px", background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.2)", mb: 2 }}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--accent-gold)", mb: 1 }}>How to get Cloudflare R2 credentials</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              1. Go to <strong>Cloudflare Dashboard → R2 Object Storage</strong><br />
              2. Create a bucket (e.g. <code>lexpro-documents</code>)<br />
              3. Go to <strong>Manage R2 API Tokens</strong> → Create API Token with <em>Object Read & Write</em> permissions<br />
              4. Copy the <strong>Access Key ID</strong>, <strong>Secret Access Key</strong>, and your <strong>Account ID</strong> (shown in the R2 overview)<br />
              5. Paste them above — the endpoint URL is auto-filled
            </Typography>
          </Box>
        )}

        {/* ── Getting AWS S3 Credentials hint ───────────────────────── */}
        {storage.provider === "aws_s3" && (
          <Box sx={{ p: 2, borderRadius: "10px", background: "rgba(212,168,67,0.05)", border: "1px solid rgba(212,168,67,0.2)", mb: 2 }}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--accent-gold)", mb: 1 }}>How to get AWS S3 credentials</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              1. Sign in to <strong>AWS Console → S3</strong> and create a bucket (e.g. <code>lexpro-documents</code>). Choose your preferred region (e.g. <code>us-east-1</code>)<br />
              2. Go to <strong>IAM → Users → Create user</strong>. Give it a name like <em>lexpro-s3-user</em><br />
              3. Attach the policy <strong>AmazonS3FullAccess</strong> (or a custom policy scoped to your bucket)<br />
              4. Open the user → <strong>Security credentials → Create access key</strong> → choose <em>Application running outside AWS</em><br />
              5. Copy the <strong>Access Key ID</strong> and <strong>Secret Access Key</strong> — the secret is shown only once<br />
              6. Set the <strong>Endpoint URL</strong> to <code>https://s3.amazonaws.com</code> (or your regional endpoint, e.g. <code>https://s3.us-east-1.amazonaws.com</code>)<br />
              7. Paste all values above and click <strong>Save Storage Config</strong>
            </Typography>
            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
              <OpenInNewIcon sx={{ fontSize: 13, color: "var(--text-muted)" }} />
              <Typography
                component="a"
                href="https://console.aws.amazon.com/s3"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: "0.72rem", color: "var(--accent-gold)", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                Open AWS S3 Console
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Google Calendar ───────────────────────────────────────── */}
        <Section icon={<CalendarMonthIcon />} title="Google Calendar" subtitle="Sync firm events with a shared Google Calendar">

          {/* OAuth return notice */}
          {gcalNotice === "connected" && (
            <Alert severity="success" sx={{ mb: 2, fontSize: "0.82rem", borderRadius: "8px" }} onClose={() => setGcalNotice(null)}>
              Google Calendar connected successfully! Run a sync below to push all existing events.
            </Alert>
          )}
          {gcalNotice === "error" && (
            <Alert severity="error" sx={{ mb: 2, fontSize: "0.82rem", borderRadius: "8px" }} onClose={() => setGcalNotice(null)}>
              Google OAuth failed. Check that your Client ID and Secret are correct in the server .env file.
            </Alert>
          )}
          {gcalMsg && (
            <Alert severity={gcalMsg.type} sx={{ mb: 2, fontSize: "0.82rem", borderRadius: "8px" }} onClose={() => setGcalMsg(null)}>
              {gcalMsg.text}
            </Alert>
          )}

          {!gcalStatus ? (
            <Box sx={{ textAlign: "center", py: 3 }}><CircularProgress size={22} sx={{ color: "var(--accent-gold)" }} /></Box>
          ) : !gcalStatus.configured ? (
            /* Not configured on server */
            <Box sx={{ background: "rgba(243,156,18,0.06)", border: "1px solid rgba(243,156,18,0.25)", borderRadius: "10px", p: 2.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", mb: 1, color: "#F39C12" }}>Server not configured</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                To enable Google Calendar sync, add these variables to your server <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>.env</code> file and rebuild:
              </Typography>
              <Box sx={{ mt: 1.5, p: 1.5, background: "var(--bg-elevated)", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 2 }}>
                GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com<br />
                GOOGLE_CLIENT_SECRET=your-client-secret<br />
                GOOGLE_REDIRECT_URI=http://192.168.100.90/api/v1/gcal/oauth/callback<br />
                APP_BASE_URL=http://192.168.100.90
              </Box>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 1.5 }}>
                See setup guide below for how to get these credentials from Google Cloud Console.
              </Typography>
            </Box>
          ) : gcalStatus.connected ? (
            /* Connected */
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, p: 2, background: "rgba(46,204,113,0.06)", border: "1px solid rgba(46,204,113,0.25)", borderRadius: "10px" }}>
                <CheckCircleIcon sx={{ color: "#2ECC71", fontSize: 22, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#2ECC71" }}>Connected</Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Calendar: <strong>{gcalStatus.calendar_name || gcalStatus.calendar_id}</strong>
                    {gcalStatus.last_sync && <> · Last sync: {new Date(gcalStatus.last_sync).toLocaleString("en-KE")}</>}
                  </Typography>
                </Box>
                <Button size="small" startIcon={gcalDisconnecting ? <CircularProgress size={12} /> : <LinkOffIcon sx={{ fontSize: 14 }} />}
                  onClick={disconnectGcal} disabled={gcalDisconnecting}
                  sx={{ fontSize: "0.75rem", color: "#E74C3C", border: "1px solid rgba(231,76,60,0.3)", borderRadius: "8px", "&:hover": { background: "rgba(231,76,60,0.08)", borderColor: "#E74C3C" } }}>
                  Disconnect
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button variant="contained" startIcon={gcalSyncing ? <CircularProgress size={14} color="inherit" /> : <SyncIcon sx={{ fontSize: 16 }} />}
                  onClick={syncNow} disabled={gcalSyncing}
                  sx={{ fontSize: "0.82rem", background: "var(--accent-gold)", color: "#000", fontWeight: 600, borderRadius: "8px", textTransform: "none", "&:hover": { background: "var(--accent-gold-dim)" } }}>
                  {gcalSyncing ? "Syncing…" : "Sync Now"}
                </Button>
                <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", alignSelf: "center" }}>
                  Pushes all LexPro events + case hearings to Google Calendar
                </Typography>
              </Box>

              <Box sx={{ mt: 2.5, p: 2, background: "var(--bg-elevated)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>How sync works</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { fontSize: "0.75rem", color: "var(--text-secondary)", mb: 0.5, lineHeight: 1.6 } }}>
                  <li>Events created/edited/deleted in LexPro are <strong>automatically pushed</strong> to Google Calendar in real time</li>
                  <li>Case hearing dates from the Cases page are pushed during a manual <em>Sync Now</em></li>
                  <li>Events you create directly in Google Calendar appear in the LexPro calendar as read-only <strong>Google Calendar</strong> entries</li>
                </Box>
              </Box>
            </Box>
          ) : (
            /* Not connected */
            <Box>
              <Typography sx={{ fontSize: "0.82rem", color: "var(--text-secondary)", mb: 2, lineHeight: 1.7 }}>
                Connect a Google account to sync all firm calendar events and case hearings to a shared Google Calendar.
                New events created in LexPro will be pushed automatically.
              </Typography>
              <Button variant="contained" onClick={connectGcal} disabled={gcalConnecting}
                startIcon={gcalConnecting ? <CircularProgress size={14} color="inherit" /> : (
                  <Box component="img" src="https://www.google.com/favicon.ico" sx={{ width: 16, height: 16 }} />
                )}
                sx={{ fontSize: "0.85rem", background: "#fff", color: "#333", fontWeight: 600, borderRadius: "8px", textTransform: "none", border: "1px solid #ddd", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", "&:hover": { background: "#f5f5f5", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" } }}>
                {gcalConnecting ? "Redirecting to Google…" : "Sign in with Google"}
              </Button>
            </Box>
          )}

          {/* Setup guide */}
          <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid var(--border)" }}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--accent-gold)", mb: 1.5, display: "flex", alignItems: "center", gap: 0.75 }}>
              <OpenInNewIcon sx={{ fontSize: 14 }} /> Google Cloud setup guide
            </Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5, "& li": { fontSize: "0.75rem", color: "var(--text-secondary)", mb: 0.75, lineHeight: 1.7 } }}>
              <li>Go to <strong>console.cloud.google.com</strong> → Create a new project (e.g. <em>LexPro</em>)</li>
              <li>Navigate to <strong>APIs & Services → Library</strong> → search for <em>Google Calendar API</em> → Enable it</li>
              <li>Go to <strong>APIs & Services → OAuth consent screen</strong> → choose <em>External</em> → fill in App name, support email, and add your email as a test user. Leave the app in <em>Testing</em> status — this is fine for internal firm use</li>
              <li>Go to <strong>APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID</strong> → Application type: <em>Web application</em></li>
              <li>Under <strong>Authorized redirect URIs</strong> add: <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>http://192.168.100.90/api/v1/gcal/oauth/callback</code></li>
              <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong> and add them to the server <code>.env</code> file as shown above</li>
              <li>Rebuild the backend: <code>docker compose up --build -d</code></li>
            </Box>
          </Box>
        </Section>

      </Box>
    </Layout>
  );
}
