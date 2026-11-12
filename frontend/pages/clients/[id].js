import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Button, Avatar, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, CircularProgress, Alert, Tooltip, Divider,
  Tabs, Tab, Select, MenuItem, FormControlLabel, Switch,
  InputAdornment,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import api from "../../lib/api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicIcon from "@mui/icons-material/Public";
import GavelIcon from "@mui/icons-material/Gavel";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BlockIcon from "@mui/icons-material/Block";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import GroupsIcon from "@mui/icons-material/Groups";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_TYPES = ["Individual", "Corporate", "Government", "Partnership", "Trust", "NGO / Non-Profit"];
const INDUSTRIES = [
  "Agriculture","Aviation","Banking & Finance","Construction","Education",
  "Energy & Utilities","Healthcare","Hospitality","Insurance","Manufacturing",
  "Media & Entertainment","Mining","NGO / Non-Profit","Real Estate","Retail & FMCG",
  "Technology","Telecommunications","Transport & Logistics","Other",
];
const COUNTRIES = [
  "Kenya","Uganda","Tanzania","Rwanda","Ethiopia","Nigeria","Ghana","South Africa",
  "Egypt","Morocco","Senegal","Côte d'Ivoire","Cameroon","Zambia","Zimbabwe",
  "Botswana","Namibia","Mozambique","Angola","Algeria","Tunisia","Sudan",
  "United Kingdom","United States","Canada","Australia","India","Germany","France",
  "Netherlands","Sweden","Switzerland","UAE","Saudi Arabia","Qatar","Singapore",
  "China","Japan","Brazil","Other",
];

const TYPE_ICON  = { Corporate: BusinessIcon, Individual: PersonIcon, Government: AccountBalanceIcon };
const TYPE_COLOR = { Corporate: "#4A90D9", Individual: "#D4A843", Government: "#2ECC71" };

const CASE_STATUS_COLOR = {
  Active:   { bg: "rgba(46,204,113,0.12)",  text: "#2ECC71" },
  Closed:   { bg: "rgba(149,165,166,0.15)", text: "#95a5a6" },
  Archived: { bg: "rgba(149,165,166,0.1)",  text: "#7f8c8d" },
};
const PRIORITY_COLOR = { Critical: "#E74C3C", High: "#E67E22", Medium: "var(--accent-gold)", Low: "#95a5a6" };

const KYC_STATUS_META = {
  Pending:  { color: "#F39C12", bg: "rgba(243,156,18,0.12)",  Icon: HourglassEmptyIcon, label: "Pending" },
  Verified: { color: "#2ECC71", bg: "rgba(46,204,113,0.12)",  Icon: VerifiedUserIcon,   label: "Verified" },
  Rejected: { color: "#E74C3C", bg: "rgba(231,76,60,0.12)",   Icon: BlockIcon,          label: "Rejected" },
  Expired:  { color: "#95a5a6", bg: "rgba(149,165,166,0.12)", Icon: WarningAmberIcon,   label: "Expired" },
};
const RISK_COLOR  = { Low: "#2ECC71", Medium: "#F39C12", High: "#E74C3C" };
const ID_TYPES    = ["National ID", "Passport", "KRA PIN", "Company Registration", "Alien ID", "Other"];
const RISK_LEVELS = ["Low", "Medium", "High"];

const fmt = (n) => new Intl.NumberFormat("en-KE", {
  style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1,
}).format(n || 0);

const toIndustryArr = (str) => str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];
const fromIndustryArr = (arr) => arr.join(", ");
const filterOpts = createFilterOptions({ limit: 12 });

const EMPTY_FORM = { name: "", type: "Individual", contact: "", email: "", phone: "", industries: [], address: "", country: "" };

// ─── Case History Item ────────────────────────────────────────────────────────

function CaseHistoryItem({ c }) {
  const router = useRouter();
  const sc = CASE_STATUS_COLOR[c.status] || CASE_STATUS_COLOR.Active;
  const isClosed = c.status !== "Active";

  return (
    <Box sx={{
      p: 2, mb: 1.5,
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      borderLeft: `3px solid ${isClosed ? "#95a5a6" : "var(--accent-gold)"}`,
      cursor: "pointer",
      "&:hover": { borderColor: "var(--accent-gold)", background: "rgba(212,168,67,0.04)" },
      transition: "all 0.15s",
    }}
    onClick={() => router.push(`/cases/${c.id}`)}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.3, flex: 1 }}>{c.title}</Typography>
        <Chip label={c.status} size="small" sx={{ fontSize: "0.62rem", height: 20, flexShrink: 0, background: sc.bg, color: sc.text, border: "none" }} />
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.75 }}>
        {c.case_no && <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{c.case_no}</Typography>}
        {c.type && <Typography sx={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>· {c.type}</Typography>}
      </Box>
      {c.court && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
          <GavelIcon sx={{ fontSize: 12, color: "var(--text-muted)" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{c.court}</Typography>
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 0.5 }}>
        {c.filed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <EventIcon sx={{ fontSize: 11, color: "var(--text-muted)" }} />
            <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Filed {new Date(c.filed).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
            </Typography>
          </Box>
        )}
        {c.next_hearing && !isClosed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 11, color: "var(--accent-gold)" }} />
            <Typography sx={{ fontSize: "0.68rem", color: "var(--accent-gold)" }}>
              Hearing {new Date(c.next_hearing).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
            </Typography>
          </Box>
        )}
      </Box>
      {isClosed && c.outcome && (
        <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid var(--border)" }}>
          <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.25 }}>Outcome</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{c.outcome}</Typography>
        </Box>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Typography sx={{ fontSize: "0.65rem", color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: 0.3 }}>
          Open case <OpenInNewIcon sx={{ fontSize: 11 }} />
        </Typography>
      </Box>
    </Box>
  );
}

// ─── KYC Tab ──────────────────────────────────────────────────────────────────

function KYCTab({ client, currentUser }) {
  const isPrivileged = ["Admin", "Senior Partner", "Partner"].includes(currentUser?.role);
  const [kyc,     setKyc]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [acting,  setActing]  = useState(false);
  const [err,     setErr]     = useState(null);
  const [msg,     setMsg]     = useState(null);
  const [form,    setForm]    = useState({
    id_type: "", id_number: "", dob: "", nationality: "",
    occupation: "", pep: false, source_of_funds: "", risk_rating: "Low",
    expiry_date: "", notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.kyc.get(client.id);
      setKyc(data);
      setForm({
        id_type:         data.id_type        || "",
        id_number:       data.id_number      || "",
        dob:             data.dob ? data.dob.substring(0, 10) : "",
        nationality:     data.nationality    || "",
        occupation:      data.occupation     || "",
        pep:             data.pep            || false,
        source_of_funds: data.source_of_funds || "",
        risk_rating:     data.risk_rating    || "Low",
        expiry_date:     data.expiry_date ? data.expiry_date.substring(0, 10) : "",
        notes:           data.notes          || "",
      });
    } catch (e) { setErr(e.message); }
    finally     { setLoading(false); }
  }, [client.id]);

  useEffect(() => { load(); }, [load]);

  const set       = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSwitch = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const handleSave = async () => {
    setSaving(true); setErr(null); setMsg(null);
    try {
      const payload = {
        ...form,
        dob:         form.dob         ? new Date(form.dob).toISOString()         : null,
        expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
      };
      const updated = await api.kyc.update(client.id, payload);
      setKyc(updated); setMsg("KYC record saved.");
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const handleVerify = async () => {
    setActing(true); setErr(null); setMsg(null);
    try { const updated = await api.kyc.verify(client.id); setKyc(updated); setMsg("KYC marked as Verified."); }
    catch (e) { setErr(e.message); }
    finally   { setActing(false); }
  };

  const handleReject = async () => {
    setActing(true); setErr(null); setMsg(null);
    try { const updated = await api.kyc.reject(client.id); setKyc(updated); setMsg("KYC marked as Rejected."); }
    catch (e) { setErr(e.message); }
    finally   { setActing(false); }
  };

  if (loading) return <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress size={24} /></Box>;

  const statusMeta = KYC_STATUS_META[kyc?.status] || KYC_STATUS_META.Pending;
  const StatusIcon = statusMeta.Icon;

  return (
    <Box sx={{ maxWidth: 680 }}>
      {/* Status badge */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: 2, borderRadius: "12px", mb: 3,
        background: statusMeta.bg, border: `1px solid ${statusMeta.color}30`,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StatusIcon sx={{ fontSize: 20, color: statusMeta.color }} />
          <Box>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: statusMeta.color }}>
              KYC {statusMeta.label}
            </Typography>
            {kyc?.verified_at && (
              <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {kyc.status === "Verified" ? "Verified" : "Actioned"} by {kyc.verified_by_name || "—"} · {new Date(kyc.verified_at).toLocaleDateString("en-KE")}
              </Typography>
            )}
          </Box>
        </Box>
        <Chip
          label={kyc?.risk_rating || "Low"} size="small"
          sx={{ fontSize: "0.7rem", height: 22, border: "none", fontWeight: 600,
            background: `${RISK_COLOR[kyc?.risk_rating] || "#2ECC71"}18`,
            color: RISK_COLOR[kyc?.risk_rating] || "#2ECC71",
          }}
        />
      </Box>

      {err && <Alert severity="error" onClose={() => setErr(null)} sx={{ mb: 2, fontSize: "0.8rem" }}>{err}</Alert>}
      {msg && <Alert severity="success" onClose={() => setMsg(null)} sx={{ mb: 2, fontSize: "0.8rem" }}>{msg}</Alert>}

      {/* Identity */}
      <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
        Identity
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Select
          size="small" value={form.id_type} onChange={set("id_type")} displayEmpty
          sx={{ flex: 1, fontSize: "0.82rem" }}
        >
          <MenuItem value="" sx={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>ID Type</MenuItem>
          {ID_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t}</MenuItem>)}
        </Select>
        <TextField size="small" placeholder="ID Number" value={form.id_number} onChange={set("id_number")} sx={{ flex: 1 }} />
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField size="small" type="date" label="Date of Birth" value={form.dob} onChange={set("dob")}
          InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
        <TextField size="small" placeholder="Nationality" value={form.nationality} onChange={set("nationality")} sx={{ flex: 1 }} />
      </Box>
      <TextField size="small" placeholder="Occupation / Business Activity" value={form.occupation} onChange={set("occupation")}
        fullWidth sx={{ mb: 2 }} />

      <Divider sx={{ borderColor: "var(--border)", my: 2.5 }} />

      {/* Risk Assessment */}
      <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
        Risk Assessment
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, p: 1.5, background: "var(--bg-elevated)", borderRadius: "10px" }}>
        <Box>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>Politically Exposed Person (PEP)</Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Government official, politician, or family member</Typography>
        </Box>
        <FormControlLabel
          control={<Switch size="small" checked={form.pep} onChange={setSwitch("pep")} />}
          label="" sx={{ m: 0 }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
        <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Risk Rating:</Typography>
        <Box sx={{ display: "flex", gap: 0.75 }}>
          {RISK_LEVELS.map((r) => (
            <Chip key={r} label={r} size="small" clickable
              onClick={() => setForm((f) => ({ ...f, risk_rating: r }))}
              sx={{
                fontSize: "0.7rem", height: 24, cursor: "pointer",
                background: form.risk_rating === r ? `${RISK_COLOR[r]}18` : "var(--bg-elevated)",
                color: form.risk_rating === r ? RISK_COLOR[r] : "var(--text-muted)",
                border: `1px solid ${form.risk_rating === r ? RISK_COLOR[r] + "40" : "var(--border)"}`,
                fontWeight: form.risk_rating === r ? 700 : 400,
              }}
            />
          ))}
        </Box>
      </Box>
      <TextField size="small" placeholder="Source of Funds" multiline rows={2}
        value={form.source_of_funds} onChange={set("source_of_funds")}
        fullWidth sx={{ mb: 2.5 }} />

      <Divider sx={{ borderColor: "var(--border)", my: 2.5 }} />

      {/* Expiry & Notes */}
      <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
        Expiry & Notes
      </Typography>
      <TextField size="small" type="date" label="KYC Expiry Date" value={form.expiry_date} onChange={set("expiry_date")}
        InputLabelProps={{ shrink: true }} fullWidth sx={{ mb: 2 }} />
      <TextField size="small" placeholder="Internal notes on verification…" multiline rows={3}
        value={form.notes} onChange={set("notes")} fullWidth sx={{ mb: 2.5 }} />

      <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
        sx={{ textTransform: "none", fontWeight: 600, mb: 1.5, py: 1 }}>
        {saving ? <CircularProgress size={16} sx={{ color: "#0A0F1A" }} /> : "Save KYC"}
      </Button>

      {isPrivileged && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button fullWidth disabled={acting || kyc?.status === "Verified"} onClick={handleVerify}
            sx={{ textTransform: "none", fontWeight: 600, py: 0.9,
              background: "rgba(46,204,113,0.12)", color: "#2ECC71",
              "&:hover": { background: "rgba(46,204,113,0.2)" }, "&:disabled": { opacity: 0.4 },
            }}>
            <VerifiedUserIcon sx={{ fontSize: 16, mr: 0.75 }} />
            {acting ? <CircularProgress size={14} /> : "Verify KYC"}
          </Button>
          <Button fullWidth disabled={acting || kyc?.status === "Rejected"} onClick={handleReject}
            sx={{ textTransform: "none", fontWeight: 600, py: 0.9,
              background: "rgba(231,76,60,0.1)", color: "#E74C3C",
              "&:hover": { background: "rgba(231,76,60,0.18)" }, "&:disabled": { opacity: 0.4 },
            }}>
            <BlockIcon sx={{ fontSize: 16, mr: 0.75 }} />
            {acting ? <CircularProgress size={14} /> : "Reject KYC"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ─── Edit Client Dialog ───────────────────────────────────────────────────────

function EditDialog({ open, onClose, client, onSaved }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useMemo(() => {
    if (open && client) {
      setForm({ ...client, industries: toIndustryArr(client.industry), country: client.country || "" });
      setError(null);
    }
  }, [open, client]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Client name is required."); return; }
    setLoading(true); setError(null);
    try {
      await api.clients.update(client.id, {
        name: form.name.trim(), type: form.type || "Individual",
        contact: form.contact || null, email: form.email || null,
        phone: form.phone || null, industry: fromIndustryArr(form.industries) || null,
        address: form.address || null, country: form.country || null,
      });
      onSaved();
      onClose();
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700 }}>Edit Client</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--border)" }} />
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.78rem" }}>{error}</Alert>}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Client / Company Name *" fullWidth size="small" value={form.name} onChange={set("name")} autoFocus />
            <Autocomplete freeSolo size="small" sx={{ width: 240, flexShrink: 0 }} options={CLIENT_TYPES}
              value={form.type} onInputChange={(_, val) => setForm((f) => ({ ...f, type: val }))}
              renderInput={(params) => <TextField {...params} label="Client Type" />} />
          </Box>
          <Autocomplete multiple freeSolo size="small" options={INDUSTRIES} filterOptions={filterOpts}
            value={form.industries} onChange={(_, val) => setForm((f) => ({ ...f, industries: val }))}
            renderTags={(value, getTagProps) => value.map((option, index) => (
              <Chip key={index} label={option} size="small" {...getTagProps({ index })} sx={{ fontSize: "0.7rem", height: 22 }} />
            ))}
            renderInput={(params) => <TextField {...params} label="Industry / Sector" />} />
          <TextField label="Contact Person" fullWidth size="small" value={form.contact} onChange={set("contact")} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Email" fullWidth size="small" type="email" value={form.email} onChange={set("email")} />
            <TextField label="Phone" fullWidth size="small" value={form.phone} onChange={set("phone")} />
          </Box>
          <TextField label="Physical Address" fullWidth size="small" multiline rows={2} value={form.address} onChange={set("address")} />
          <Autocomplete freeSolo size="small" options={COUNTRIES} value={form.country}
            onInputChange={(_, val) => setForm((f) => ({ ...f, country: val }))}
            renderInput={(params) => <TextField {...params} label="Country" />} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "var(--text-secondary)", textTransform: "none" }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, minWidth: 120 }}>
          {loading ? <CircularProgress size={16} sx={{ color: "#0A0F1A" }} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ open, onClose, client, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    try { await api.clients.delete(client.id); onDeleted(); onClose(); }
    catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700 }}>Delete Client</Typography>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.78rem" }}>{error}</Alert>}
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Delete <strong style={{ color: "var(--text-primary)" }}>{client?.name}</strong>? All associated cases, invoices, and documents will also be permanently removed.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "var(--text-secondary)", textTransform: "none" }}>Cancel</Button>
        <Button variant="contained" onClick={handleDelete} disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, background: "#E74C3C", "&:hover": { background: "#c0392b" } }}>
          {loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Delete Client"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "flex-start" }}>
      {Icon && <Icon sx={{ fontSize: 16, color: "var(--text-muted)", mt: 0.2, flexShrink: 0 }} />}
      <Box>
        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.2 }}>{label}</Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{value}</Typography>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientDetail() {
  const router = useRouter();
  const { id }  = router.query;
  const { tenantData, refreshAll, currentUser } = useApp();

  const [tab,        setTab]        = useState(0);
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const clients  = tenantData.clients || [];
  const allCases = tenantData.cases   || [];

  const client      = clients.find((c) => c.id === id) || null;
  const clientCases = allCases.filter((c) => c.client_id === id);
  const activeCases = clientCases.filter((c) => c.status === "Active");
  const closedCases = clientCases.filter((c) => c.status !== "Active");

  const isLoading = id && tenantData.clients === undefined;

  const Icon  = TYPE_ICON[client?.type]  || PersonIcon;
  const color = TYPE_COLOR[client?.type] || "var(--accent-gold)";
  const industries = toIndustryArr(client?.industry);

  const handleSaved = async () => { await refreshAll(); };
  const handleDeleted = () => { refreshAll(); router.push("/clients"); };

  if (isLoading) {
    return (
      <Layout title="Client">
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!isLoading && !client && tenantData.clients) {
    return (
      <Layout title="Not Found">
        <Box sx={{ textAlign: "center", pt: 10 }}>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 600, mb: 1 }}>Client not found</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/clients")}
            sx={{ textTransform: "none" }}>Back to Clients</Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={client?.name || "Client"}>

      {/* ── Breadcrumb / Back ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={() => router.push("/clients")}
          sx={{ textTransform: "none", fontSize: "0.82rem", color: "var(--text-muted)",
            "&:hover": { color: "var(--text-primary)", background: "transparent" } }}>
          Clients
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: 14 }} />}
            onClick={() => setEditOpen(true)}
            sx={{ textTransform: "none", fontSize: "0.8rem", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            Edit
          </Button>
          <Button size="small" startIcon={<DeleteOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ textTransform: "none", fontSize: "0.8rem", color: "#E74C3C",
              "&:hover": { background: "rgba(231,76,60,0.08)" } }}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* ── Hero card ── */}
      <Box sx={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden", mb: 2.5,
        borderTop: `4px solid ${color}`,
      }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
            {/* Avatar */}
            <Avatar sx={{ width: 60, height: 60, background: `${color}20`, borderRadius: "14px", flexShrink: 0 }}>
              <Icon sx={{ fontSize: 28, color }} />
            </Avatar>

            {/* Name + meta */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                {client?.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                <Chip label={client?.type} size="small"
                  sx={{ fontSize: "0.68rem", height: 22, background: `${color}18`, color, border: "none" }} />
                {industries.map((ind) => (
                  <Chip key={ind} label={ind} size="small"
                    sx={{ fontSize: "0.65rem", height: 20, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none" }} />
                ))}
              </Box>
              {/* Quick contacts */}
              <Box sx={{ display: "flex", gap: 2, mt: 1.5, flexWrap: "wrap" }}>
                {client?.email && (
                  <Box component="a" href={`mailto:${client.email}`}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, textDecoration: "none" }}>
                    <EmailIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{client.email}</Typography>
                  </Box>
                )}
                {client?.phone && (
                  <Box component="a" href={`tel:${client.phone}`}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, textDecoration: "none" }}>
                    <PhoneIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{client.phone}</Typography>
                  </Box>
                )}
                {(client?.address || client?.country) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      {[client.address, client.country].filter(Boolean).join(", ")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Metrics */}
            <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0, flexWrap: "wrap" }}>
              {[
                { label: "Active Cases",  value: activeCases.length,       color: "var(--accent-gold)" },
                { label: "Closed Cases",  value: closedCases.length,       color: "#95a5a6" },
                { label: "Total Billed",  value: fmt(client?.total_billed), color: "#2ECC71" },
              ].map(({ label, value, color: c }) => (
                <Box key={label} sx={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "12px", p: "12px 18px", textAlign: "center", minWidth: 100,
                }}>
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: c, lineHeight: 1 }}>{value}</Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", mt: 0.4 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            borderTop: "1px solid var(--border)",
            px: 2,
            minHeight: 44,
            "& .MuiTabs-indicator": { background: "var(--accent-gold)", height: 2 },
            "& .MuiTab-root": { minHeight: 44, fontSize: "0.78rem", textTransform: "none", color: "var(--text-muted)", fontWeight: 500, px: 2.5 },
            "& .Mui-selected": { color: "var(--accent-gold) !important", fontWeight: 600 },
          }}>
          <Tab label="Overview" />
          <Tab label={`Cases (${clientCases.length})`} />
          <Tab label="KYC" />
        </Tabs>
      </Box>

      {/* ── Tab Content ── */}
      <Box sx={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", p: 3 }}>

        {/* Overview tab */}
        {tab === 0 && (
          <Box>
            <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 2 }}>
              Contact Details
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, mb: 3 }}>
              <InfoRow label="Contact Person" value={client?.contact} icon={PersonIcon} />
              <InfoRow label="Email" value={client?.email} icon={EmailIcon} />
              <InfoRow label="Phone" value={client?.phone} icon={PhoneIcon} />
              <InfoRow label="Country" value={client?.country} icon={PublicIcon} />
              <InfoRow label="Address" value={client?.address} icon={LocationOnIcon} />
              <InfoRow label="Client Status" value={client?.status} />
              <InfoRow label="Client Since"
                value={client?.since ? new Date(client.since).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) : null} />
            </Box>
            {industries.length > 0 && (
              <>
                <Divider sx={{ borderColor: "var(--border)", my: 2 }} />
                <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
                  Industry
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {industries.map((ind) => (
                    <Chip key={ind} label={ind} size="small"
                      sx={{ fontSize: "0.72rem", height: 24, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }} />
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Cases tab */}
        {tab === 1 && (
          <Box>
            {clientCases.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <GavelIcon sx={{ fontSize: 36, color: "var(--text-muted)", mb: 1.5 }} />
                <Typography sx={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No cases on file for this client</Typography>
              </Box>
            ) : (
              <Box>
                {activeCases.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: "var(--accent-gold)" }} />
                      <Typography sx={{ fontSize: "0.68rem", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                        Active — {activeCases.length}
                      </Typography>
                    </Box>
                    {activeCases.map((c) => <CaseHistoryItem key={c.id} c={c} />)}
                  </Box>
                )}
                {closedCases.length > 0 && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: "#95a5a6" }} />
                      <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                        Closed — {closedCases.length}
                      </Typography>
                    </Box>
                    {closedCases.map((c) => <CaseHistoryItem key={c.id} c={c} />)}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* KYC tab */}
        {tab === 2 && client && <KYCTab client={client} currentUser={currentUser} />}
      </Box>

      {/* Dialogs */}
      <EditDialog open={editOpen} onClose={() => setEditOpen(false)} client={client} onSaved={handleSaved} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} client={client} onDeleted={handleDeleted} />

    </Layout>
  );
}
