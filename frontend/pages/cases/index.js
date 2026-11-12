import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Button, Avatar, Chip, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Tooltip, Divider,
  List, ListItem, ListItemAvatar, ListItemText,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import api from "../../lib/api";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// Constants
const CASE_TYPES = [
  "Civil Litigation", "Criminal Defense", "Commercial Dispute",
  "Family Law", "Constitutional Law", "Employment & Labour",
  "Debt Recovery", "Land & Property", "Intellectual Property",
  "Immigration", "Tax Dispute", "Probate & Succession",
  "Judicial Review", "Arbitration & Mediation", "Banking & Finance",
  "Corporate Advisory", "Insurance Dispute", "Environmental Law", "Other",
];

const COURTS = [
  "Supreme Court of Kenya",
  "Court of Appeal — Nairobi",
  "High Court — Nairobi",
  "High Court — Mombasa",
  "High Court — Kisumu",
  "High Court — Nakuru",
  "Employment & Labour Relations Court",
  "Environment & Land Court — Nairobi",
  "Milimani Commercial Courts",
  "Milimani Law Courts",
  "Chief Magistrates Court — Nairobi",
  "Mombasa Law Courts",
  "Kisumu Law Courts",
  "Nakuru Law Courts",
  "International Arbitration Centre",
  "Nairobi Centre for International Arbitration",
  "Other",
];

const PRIORITY_COLOR = { Critical: "#E74C3C", High: "#F39C12", Medium: "#4A90D9", Low: "#2ECC71" };
const STATUS_COLOR   = { Active: "#2ECC71", Pending: "#F39C12", Closed: "#8B9BB4" };

const fmt = (n) => new Intl.NumberFormat("en-KE", {
  style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1,
}).format(n || 0);

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
  : "—";

const EMPTY_FORM = {
  title: "", case_no: "", type: "", court: "",
  client_id: "", assigned_user_id: "",
  status: "Active", priority: "Medium",
  fee: "", description: "", next_hearing: "", outcome: "",
  opposing_party: "", opposing_counsel: "",
};

// Stat Card
function StatCard({ label, value, color, icon: Icon, sub }) {
  return (
    <Box sx={{
      flex: 1, minWidth: 130,
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: "14px", p: "14px 18px", position: "relative", overflow: "hidden",
    }}>
      <Box sx={{ position: "absolute", right: -10, top: -10, width: 60, height: 60, borderRadius: "50%", background: `${color}10` }} />
      <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 0.8 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: "1.7rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
            {value}
          </Typography>
          {sub && <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", mt: 0.3 }}>{sub}</Typography>}
        </Box>
        <Icon sx={{ fontSize: 20, color, opacity: 0.7, mb: 0.2 }} />
      </Box>
    </Box>
  );
}

function toLocalDT(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const freeSolo = createFilterOptions();

// Client Picker Modal
function ClientPickerModal({ open, onClose, clients, selectedId, onSelect }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return clients;
    const lower = q.toLowerCase();
    return clients.filter((c) =>
      c.name.toLowerCase().includes(lower) ||
      c.type?.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower)
    );
  }, [clients, q]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", maxHeight: "80vh" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 700 }}>Assign Client</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", mt: 0.2 }}>{clients.length} client{clients.length !== 1 ? "s" : ""} in your firm</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: 0.3 }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--border)" }} />
      <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
        <TextField autoFocus fullWidth size="small" placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 15, color: "var(--text-muted)", mr: 0.5 }} /> }}
          sx={{ "& .MuiInputBase-input": { fontSize: "0.82rem" } }} />
      </Box>
      <DialogContent sx={{ pt: 1, pb: 1 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <PersonIcon sx={{ fontSize: 32, color: "var(--text-muted)", mb: 1, opacity: 0.4 }} />
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{q ? `No clients match "${q}"` : "No clients yet"}</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {filtered.map((c) => {
              const active = c.id === selectedId;
              const initials = c.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              return (
                <ListItem key={c.id} onClick={() => { onSelect(c); onClose(); }}
                  sx={{ borderRadius: "10px", mb: 0.5, cursor: "pointer", px: 1.5, py: 0.9,
                    background: active ? "rgba(212,168,67,0.07)" : "transparent",
                    border: `1px solid ${active ? "rgba(212,168,67,0.35)" : "transparent"}`,
                    "&:hover": { background: active ? "rgba(212,168,67,0.1)" : "var(--bg-elevated)" } }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32, borderRadius: "9px",
                      background: active ? "rgba(212,168,67,0.2)" : "rgba(255,255,255,0.06)",
                      fontSize: "0.72rem", fontWeight: 700,
                      color: active ? "var(--accent-gold)" : "var(--text-secondary)" }}>
                      {initials}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: active ? "var(--accent-gold)" : "var(--text-primary)" }}>{c.name}</Typography>}
                    secondary={<Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{[c.type, c.email].filter(Boolean).join(" · ")}</Typography>}
                  />
                  {active && <Chip label="Selected" size="small" sx={{ fontSize: "0.58rem", height: 18, background: "rgba(212,168,67,0.18)", color: "var(--accent-gold)", border: "none" }} />}
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      {selectedId && (
        <>
          <Divider sx={{ borderColor: "var(--border)" }} />
          <Box sx={{ px: 2.5, py: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Click another client to reassign, or clear.</Typography>
            <Button size="small" onClick={() => { onSelect(null); onClose(); }} sx={{ fontSize: "0.7rem", color: "#E74C3C", textTransform: "none" }}>Clear</Button>
          </Box>
        </>
      )}
    </Dialog>
  );
}

// Staff Picker Modal
function StaffPickerModal({ open, onClose, staff, selectedId, onSelect }) {
  const [q, setQ] = useState("");
  const ROLE_COLOR = { "Partner": "#D4A843", "Senior Associate": "#4A90D9", "Associate": "#2ECC71", "Paralegal": "#9B59B6", "Admin": "#8B9BB4" };
  const filtered = useMemo(() => {
    if (!q.trim()) return staff;
    const lower = q.toLowerCase();
    return staff.filter((s) => s.name.toLowerCase().includes(lower) || s.role?.toLowerCase().includes(lower));
  }, [staff, q]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", maxHeight: "80vh" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 700 }}>Assign Lawyer / Staff</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", mt: 0.2 }}>{staff.length} member{staff.length !== 1 ? "s" : ""} in your firm</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: 0.3 }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--border)" }} />
      <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
        <TextField autoFocus fullWidth size="small" placeholder="Search staff…" value={q} onChange={(e) => setQ(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 15, color: "var(--text-muted)", mr: 0.5 }} /> }}
          sx={{ "& .MuiInputBase-input": { fontSize: "0.82rem" } }} />
      </Box>
      <DialogContent sx={{ pt: 1, pb: 1 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <PersonIcon sx={{ fontSize: 32, color: "var(--text-muted)", mb: 1, opacity: 0.4 }} />
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{q ? `No staff match "${q}"` : "No staff yet"}</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {filtered.map((s) => {
              const active = s.id === selectedId;
              const initials = s.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              const roleColor = ROLE_COLOR[s.role] || "var(--text-secondary)";
              return (
                <ListItem key={s.id} onClick={() => { onSelect(s); onClose(); }}
                  sx={{ borderRadius: "10px", mb: 0.5, cursor: "pointer", px: 1.5, py: 0.9,
                    background: active ? "rgba(212,168,67,0.07)" : "transparent",
                    border: `1px solid ${active ? "rgba(212,168,67,0.35)" : "transparent"}`,
                    "&:hover": { background: active ? "rgba(212,168,67,0.1)" : "var(--bg-elevated)" } }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32, borderRadius: "9px",
                      background: active ? "rgba(212,168,67,0.2)" : `${roleColor}18`,
                      fontSize: "0.72rem", fontWeight: 700,
                      color: active ? "var(--accent-gold)" : roleColor }}>
                      {initials}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: active ? "var(--accent-gold)" : "var(--text-primary)" }}>{s.name}</Typography>}
                    secondary={<Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{s.role}{s.specialty ? ` · ${s.specialty}` : ""}</Typography>}
                  />
                  {active && <Chip label="Assigned" size="small" sx={{ fontSize: "0.58rem", height: 18, background: "rgba(212,168,67,0.18)", color: "var(--accent-gold)", border: "none" }} />}
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      {selectedId && (
        <>
          <Divider sx={{ borderColor: "var(--border)" }} />
          <Box sx={{ px: 2.5, py: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Click another member to reassign, or clear.</Typography>
            <Button size="small" onClick={() => { onSelect(null); onClose(); }} sx={{ fontSize: "0.7rem", color: "#E74C3C", textTransform: "none" }}>Clear</Button>
          </Box>
        </>
      )}
    </Dialog>
  );
}

// Case Form Dialog
function CaseFormDialog({ open, onClose, initial, onSaved, clients, staff }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [linkedClient, setLinkedClient] = useState(null);
  const [linkedStaff, setLinkedStaff] = useState(null);
  const [conflicts, setConflicts] = useState(null);

  useMemo(() => {
    if (open) {
      setLinkedClient(initial?.client_id ? clients.find((c) => c.id === initial.client_id) || null : null);
      setLinkedStaff(initial?.assigned_user_id ? staff.find((s) => s.id === initial.assigned_user_id) || null : null);
      setForm(initial ? {
        title: initial.title || "", case_no: initial.case_no || "",
        type: initial.type || "", court: initial.court || "",
        client_id: initial.client_id || "", assigned_user_id: initial.assigned_user_id || "",
        status: initial.status || "Active", priority: initial.priority || "Medium",
        fee: initial.fee || "", description: initial.description || "",
        next_hearing: toLocalDT(initial.next_hearing), outcome: initial.outcome || "",
        opposing_party: initial.opposing_party || "", opposing_counsel: initial.opposing_counsel || "",
      } : EMPTY_FORM);
      setError(null);
    }
  }, [open, initial, clients, staff]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const handleClientLink = (client) => { setLinkedClient(client); setForm((f) => ({ ...f, client_id: client?.id || "" })); };
  const handleStaffLink  = (member) => { setLinkedStaff(member);  setForm((f) => ({ ...f, assigned_user_id: member?.id || "" })); };

  const buildPayload = () => ({
    title: form.title.trim(), case_no: form.case_no || null, type: form.type || null,
    court: form.court || null, client_id: form.client_id || null,
    assigned_user_id: form.assigned_user_id || null,
    status: form.status, priority: form.priority, fee: parseFloat(form.fee) || 0,
    description: form.description || null,
    next_hearing: form.next_hearing ? new Date(form.next_hearing).toISOString() : null,
    outcome: form.outcome || null, opposing_party: form.opposing_party || null,
    opposing_counsel: form.opposing_counsel || null,
  });

  const handleSave = async (override = false) => {
    if (!form.title.trim()) { setError("Case title is required."); return; }
    if (!override && (form.opposing_party || form.client_id)) {
      setLoading(true); setError(null);
      try {
        const result = await api.conflictCheck({
          client_id: form.client_id || null, opposing_party: form.opposing_party || null,
          assigned_user_id: form.assigned_user_id || null, case_id: isEdit ? initial.id : null,
        });
        if (result.has_conflicts) { setConflicts(result.conflicts); setLoading(false); return; }
      } catch (_) {}
      finally { setLoading(false); }
    }
    setLoading(true); setError(null);
    try {
      isEdit ? await api.cases.update(initial.id, buildPayload()) : await api.cases.create(buildPayload());
      setConflicts(null); onSaved(); onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700 }}>
          {isEdit ? "Edit Case" : "New Case"}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--border)" }} />
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.78rem" }}>{error}</Alert>}

        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>Case Details</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <TextField label="Case Title *" fullWidth size="small" value={form.title} onChange={set("title")} autoFocus />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Case Number" size="small" sx={{ flex: 1 }} value={form.case_no} onChange={set("case_no")} placeholder="e.g. HC-CV-001/2024" />
            <Autocomplete freeSolo size="small" sx={{ flex: 1 }} options={CASE_TYPES}
              filterOptions={(opts, params) => { const f = freeSolo(opts, params); if (params.inputValue && !opts.includes(params.inputValue)) f.push(params.inputValue); return f; }}
              value={form.type || null}
              onInputChange={(_, val) => setForm((f) => ({ ...f, type: val }))}
              onChange={(_, val) => setForm((f) => ({ ...f, type: val || "" }))}
              renderInput={(params) => <TextField {...params} label="Practice Area" placeholder="Select or type custom…" />} />
          </Box>
          <Autocomplete freeSolo size="small" fullWidth options={COURTS}
            filterOptions={(opts, params) => { const f = freeSolo(opts, params); if (params.inputValue && !opts.includes(params.inputValue)) f.push(params.inputValue); return f; }}
            value={form.court || null}
            onInputChange={(_, val) => setForm((f) => ({ ...f, court: val }))}
            onChange={(_, val) => setForm((f) => ({ ...f, court: val || "" }))}
            renderInput={(params) => <TextField {...params} label="Court / Tribunal" placeholder="Select or type custom court…" />} />
          <TextField label="Description / Notes" fullWidth size="small" multiline rows={3}
            value={form.description} onChange={set("description")} placeholder="Brief case summary, facts, or instructions…" />
          {form.status === "Closed" && (
            <TextField label="Case Outcome" fullWidth size="small" multiline rows={3}
              value={form.outcome} onChange={set("outcome")}
              placeholder="e.g. Judgment in favour of client, KES 2M awarded."
              sx={{ "& .MuiOutlinedInput-root": { borderColor: "rgba(149,165,166,0.5)" }, "& .MuiInputLabel-root": { color: "#95a5a6" } }} />
          )}
        </Box>

        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>Opposing Party</Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField label="Opposing Party Name" fullWidth size="small" value={form.opposing_party} onChange={set("opposing_party")}
            placeholder="Individual or company name" helperText="Used for conflict-of-interest checks" />
          <TextField label="Opposing Counsel" fullWidth size="small" value={form.opposing_counsel} onChange={set("opposing_counsel")} placeholder="Name of their lawyer / firm" />
        </Box>

        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>Assignment</Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", mb: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Client</Typography>
            {linkedClient ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, border: "1px solid rgba(212,168,67,0.4)", borderRadius: "10px", px: 1.5, py: 0.85, background: "rgba(212,168,67,0.04)" }}>
                <Avatar sx={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(212,168,67,0.15)", fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-gold)", flexShrink: 0 }}>
                  {linkedClient.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{linkedClient.name}</Typography>
                  <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{linkedClient.type}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexShrink: 0 }}>
                  <Tooltip title="Change"><IconButton size="small" onClick={() => setPickerOpen(true)} sx={{ p: 0.4 }}><EditIcon sx={{ fontSize: 13, color: "var(--text-muted)" }} /></IconButton></Tooltip>
                  <Tooltip title="Remove"><IconButton size="small" onClick={() => handleClientLink(null)} sx={{ p: 0.4 }}><CloseIcon sx={{ fontSize: 13, color: "var(--text-muted)" }} /></IconButton></Tooltip>
                </Box>
              </Box>
            ) : (
              <Button fullWidth variant="outlined" size="small" onClick={() => setPickerOpen(true)} startIcon={<PersonAddIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: "none", fontSize: "0.8rem", borderColor: "var(--border)", color: "var(--text-secondary)", justifyContent: "flex-start", py: 0.9,
                  "&:hover": { borderColor: "rgba(212,168,67,0.5)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.04)" } }}>
                Assign a client
              </Button>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", mb: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Lawyer / Staff</Typography>
            {linkedStaff ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, border: "1px solid rgba(212,168,67,0.4)", borderRadius: "10px", px: 1.5, py: 0.85, background: "rgba(212,168,67,0.04)" }}>
                <Avatar sx={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(212,168,67,0.15)", fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-gold)", flexShrink: 0 }}>
                  {linkedStaff.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{linkedStaff.name}</Typography>
                  <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{linkedStaff.role}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexShrink: 0 }}>
                  <Tooltip title="Change"><IconButton size="small" onClick={() => setStaffPickerOpen(true)} sx={{ p: 0.4 }}><EditIcon sx={{ fontSize: 13, color: "var(--text-muted)" }} /></IconButton></Tooltip>
                  <Tooltip title="Remove"><IconButton size="small" onClick={() => handleStaffLink(null)} sx={{ p: 0.4 }}><CloseIcon sx={{ fontSize: 13, color: "var(--text-muted)" }} /></IconButton></Tooltip>
                </Box>
              </Box>
            ) : (
              <Button fullWidth variant="outlined" size="small" onClick={() => setStaffPickerOpen(true)} startIcon={<PersonAddIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: "none", fontSize: "0.8rem", borderColor: "var(--border)", color: "var(--text-secondary)", justifyContent: "flex-start", py: 0.9,
                  "&:hover": { borderColor: "rgba(212,168,67,0.5)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.04)" } }}>
                Assign a lawyer / staff
              </Button>
            )}
          </Box>
        </Box>

        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>Status & Schedule</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={form.status} onChange={set("status")}>
              {["Active", "Pending", "Closed"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={form.priority} onChange={set("priority")}>
              {["Critical", "High", "Medium", "Low"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Legal Fee (KES)" size="small" sx={{ flex: 1, minWidth: 120 }} value={form.fee} onChange={set("fee")} type="number" inputProps={{ min: 0 }} />
          <TextField label="Next Hearing" size="small" sx={{ flex: 1, minWidth: 180 }} type="datetime-local" value={form.next_hearing} onChange={set("next_hearing")} InputLabelProps={{ shrink: true }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "var(--text-secondary)", textTransform: "none" }}>Cancel</Button>
        <Button variant="contained" onClick={() => handleSave(false)} disabled={loading} sx={{ textTransform: "none", fontWeight: 600, minWidth: 120 }}>
          {loading ? <CircularProgress size={16} sx={{ color: "#0A0F1A" }} /> : isEdit ? "Save Changes" : "Open Case"}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Conflict Warning Dialog */}
    <Dialog open={Boolean(conflicts?.length)} maxWidth="sm" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(231,76,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberIcon sx={{ fontSize: 18, color: "#E74C3C" }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700 }}>Potential Conflict of Interest</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{conflicts?.length} issue{conflicts?.length !== 1 ? "s" : ""} detected</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--border)" }} />
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {(conflicts || []).map((c, i) => {
            const sc = c.severity === "high" ? "#E74C3C" : "#F39C12";
            return (
              <Box key={i} sx={{ p: 1.5, borderRadius: "10px", background: `${sc}08`, border: `1px solid ${sc}25`, borderLeft: `3px solid ${sc}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                  <Chip label={c.severity === "high" ? "HIGH" : "MEDIUM"} size="small" sx={{ fontSize: "0.55rem", height: 16, background: `${sc}18`, color: sc, border: "none", fontWeight: 700 }} />
                  <Typography sx={{ fontSize: "0.76rem", fontWeight: 700 }}>{c.title}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.detail}</Typography>
              </Box>
            );
          })}
        </Box>
        <Alert severity="warning" sx={{ mt: 2, fontSize: "0.72rem" }}>Proceeding despite a conflict requires partner or admin sign-off.</Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={() => setConflicts(null)} sx={{ color: "var(--text-secondary)", textTransform: "none" }}>Go Back</Button>
        <Button variant="contained" onClick={() => { setConflicts(null); handleSave(true); }}
          sx={{ textTransform: "none", fontWeight: 600, background: "#E74C3C", "&:hover": { background: "#c0392b" }, minWidth: 160 }}>
          Override & Proceed
        </Button>
      </DialogActions>
    </Dialog>

    <ClientPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} clients={clients} selectedId={form.client_id} onSelect={handleClientLink} />
    <StaffPickerModal open={staffPickerOpen} onClose={() => setStaffPickerOpen(false)} staff={staff} selectedId={form.assigned_user_id} onSelect={handleStaffLink} />
    </>
  );
}

// Delete Dialog
function DeleteDialog({ case: kase, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleDelete = async () => {
    setLoading(true);
    try { await api.cases.delete(kase.id); onDeleted(); onClose(); }
    catch (e) { setError(e.message); setLoading(false); }
  };
  return (
    <Dialog open={Boolean(kase)} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle><Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700 }}>Close & Delete Case</Typography></DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.78rem" }}>{error}</Alert>}
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Permanently delete <strong style={{ color: "var(--text-primary)" }}>{kase?.title}</strong>? All linked documents, time entries, and invoices will also be removed.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "var(--text-secondary)", textTransform: "none" }}>Cancel</Button>
        <Button variant="contained" onClick={handleDelete} disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, background: "#E74C3C", "&:hover": { background: "#c0392b" } }}>
          {loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Delete Case"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Empty State
function EmptyState({ filtered, onNew }) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Box sx={{ width: 58, height: 58, borderRadius: "16px", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
        <GavelIcon sx={{ fontSize: 26, color: "var(--accent-gold)" }} />
      </Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, mb: 0.5 }}>{filtered ? "No cases match" : "No cases yet"}</Typography>
      <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)", mb: 3 }}>{filtered ? "Try a different search or filter." : "Open your first case to get started."}</Typography>
      {!filtered && <Button variant="contained" startIcon={<AddIcon />} onClick={onNew} sx={{ textTransform: "none", fontWeight: 600 }}>Open First Case</Button>}
    </Box>
  );
}

function PriorityDot({ priority }) {
  return <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_COLOR[priority] || "#8B9BB4", display: "inline-block", mr: 0.7, flexShrink: 0 }} />;
}

// Main Page
const STATUS_TABS = ["All", "Active", "Pending", "Closed"];

export default function Cases() {
  const router = useRouter();
  const { tenantData, refreshAll } = useApp();
  const cases   = tenantData.cases   || [];
  const clients = tenantData.clients || [];
  const staff   = tenantData.staff   || [];

  const [search, setSearch]                   = useState("");
  const [statusTab, setStatusTab]             = useState("All");
  const [priorityFilter, setPriorityFilter]   = useState("All");
  const [formOpen, setFormOpen]               = useState(false);
  const [editTarget, setEditTarget]           = useState(null);
  const [deleteTarget, setDeleteTarget]       = useState(null);

  const stats = useMemo(() => ({
    total:    cases.length,
    active:   cases.filter((c) => c.status === "Active").length,
    pending:  cases.filter((c) => c.status === "Pending").length,
    closed:   cases.filter((c) => c.status === "Closed").length,
    critical: cases.filter((c) => c.priority === "Critical").length,
    upcoming: cases.filter((c) => c.next_hearing && new Date(c.next_hearing) > new Date()).length,
  }), [cases]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cases.filter((c) => {
      const matchStatus   = statusTab === "All" || c.status === statusTab;
      const matchPriority = priorityFilter === "All" || c.priority === priorityFilter;
      const matchSearch   = !q || [c.title, c.case_no, c.client_name, c.type, c.court].some((v) => v?.toLowerCase().includes(q));
      return matchStatus && matchPriority && matchSearch;
    });
  }, [cases, search, statusTab, priorityFilter]);

  const openCreate     = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit       = (c) => { setEditTarget(c); setFormOpen(true); };
  const handleRowClick = (c) => router.push(`/cases/${c.id}`);
  const handleSaved    = () => refreshAll();
  const handleDeleted  = () => refreshAll();

  return (
    <Layout title="Cases">

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <StatCard label="Total Cases"       value={stats.total}    color="var(--accent-gold)" icon={GavelIcon} />
        <StatCard label="Active"            value={stats.active}   color="#2ECC71"            icon={GavelIcon} />
        <StatCard label="Pending"           value={stats.pending}  color="#F39C12"            icon={AccessTimeIcon} />
        <StatCard label="Upcoming Hearings" value={stats.upcoming} color="#4A90D9"            icon={EventIcon}
          sub={stats.critical > 0 ? `${stats.critical} critical` : null} />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
        <TextField placeholder="Search cases…" size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "var(--text-muted)" }} /></InputAdornment> }}
          sx={{ width: 260, "& .MuiInputBase-input": { fontSize: "0.8rem" } }} />

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {STATUS_TABS.map((s) => {
            const active = statusTab === s;
            const count  = s === "All" ? cases.length : cases.filter((c) => c.status === s).length;
            return (
              <Chip key={s} label={`${s} (${count})`} size="small" onClick={() => setStatusTab(s)}
                sx={{ fontSize: "0.68rem", height: 26, cursor: "pointer",
                  background: active ? `${(STATUS_COLOR[s] || "var(--accent-gold)")}20` : "var(--bg-elevated)",
                  color: active ? (STATUS_COLOR[s] || "var(--accent-gold)") : "var(--text-secondary)",
                  border: `1px solid ${active ? (STATUS_COLOR[s] || "rgba(212,168,67,0.4)") + "60" : "var(--border)"}`,
                  fontWeight: active ? 600 : 400, transition: "all 0.15s" }} />
            );
          })}
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {["All", "Critical", "High", "Medium", "Low"].map((p) => {
            const active = priorityFilter === p;
            const color  = PRIORITY_COLOR[p];
            return p === "All" ? (
              <Chip key="All" label="All Priority" size="small" onClick={() => setPriorityFilter("All")}
                sx={{ fontSize: "0.62rem", height: 24, cursor: "pointer",
                  background: active ? "rgba(212,168,67,0.12)" : "transparent",
                  color: active ? "var(--accent-gold)" : "var(--text-muted)",
                  border: `1px solid ${active ? "rgba(212,168,67,0.3)" : "transparent"}` }} />
            ) : (
              <Tooltip key={p} title={p}>
                <Box onClick={() => setPriorityFilter(p)} sx={{ width: 24, height: 24, borderRadius: "50%",
                  background: active ? color : `${color}30`, border: `2px solid ${active ? color : "transparent"}`,
                  cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", opacity: 0.9 }} />}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />
        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={openCreate}
          sx={{ fontSize: "0.76rem", textTransform: "none", fontWeight: 600, px: 2 }}>
          New Case
        </Button>
      </Box>

      {/* Table */}
      <Box>
        <Box sx={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <EmptyState filtered={search || statusTab !== "All" || priorityFilter !== "All"} onNew={openCreate} />
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ background: "transparent" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& .MuiTableCell-head": { fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 600, py: 1.4, borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" } }}>
                    <TableCell>Case</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Next Hearing</TableCell>
                    <TableCell align="right">Fee</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((c) => {
                    const pColor     = PRIORITY_COLOR[c.priority] || "#4A90D9";
                    const sColor     = STATUS_COLOR[c.status]     || "#8B9BB4";
                    const isUpcoming = c.next_hearing && new Date(c.next_hearing) > new Date();
                    return (
                      <TableRow key={c.id} onClick={() => handleRowClick(c)} sx={{
                        cursor: "pointer",
                        "&:hover": { background: "var(--bg-elevated)" },
                        "& .MuiTableCell-root": { py: 1.3, borderBottom: "1px solid var(--border)" },
                        "&:last-child .MuiTableCell-root": { borderBottom: "none" },
                      }}>
                        <TableCell sx={{ minWidth: 180 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                            <Avatar sx={{ width: 30, height: 30, background: `${pColor}18`, borderRadius: "8px", flexShrink: 0 }}>
                              <GavelIcon sx={{ fontSize: 14, color: pColor }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{c.title}</Typography>
                              {c.case_no && <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{c.case_no}</Typography>}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Typography sx={{ fontSize: "0.76rem" }}>{c.client_name || "—"}</Typography></TableCell>
                        <TableCell>
                          {c.type
                            ? <Chip label={c.type} size="small" sx={{ fontSize: "0.6rem", height: 20, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none", maxWidth: 130 }} />
                            : <Typography sx={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>—</Typography>}
                        </TableCell>
                        <TableCell><Typography sx={{ fontSize: "0.76rem" }}>{c.assigned_to || "Unassigned"}</Typography></TableCell>
                        <TableCell>
                          <Chip label={c.status} size="small" sx={{ fontSize: "0.62rem", height: 20, border: "none", background: `${sColor}18`, color: sColor }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PriorityDot priority={c.priority} />
                            <Typography sx={{ fontSize: "0.74rem", color: pColor }}>{c.priority}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {c.next_hearing ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {isUpcoming && <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: "#F39C12", flexShrink: 0 }} />}
                              <Typography sx={{ fontSize: "0.74rem", color: isUpcoming ? "#F39C12" : "var(--text-muted)" }}>{fmtDate(c.next_hearing)}</Typography>
                            </Box>
                          ) : <Typography sx={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>—</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-gold)" }}>{fmt(c.fee)}</Typography>
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ pr: 1 }}>
                          <Box sx={{ display: "flex", gap: 0.25, justifyContent: "flex-end" }}>
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(c)}><EditIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteTarget(c)}><DeleteOutlinedIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} /></IconButton></Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Box sx={{ px: 2.5, py: 1.2, borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                <Typography sx={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                  {filtered.length} of {cases.length} case{cases.length !== 1 ? "s" : ""}
                  {statusTab !== "All" && ` · ${statusTab}`}
                  {priorityFilter !== "All" && ` · ${priorityFilter} priority`}
                  {search && ` · "${search}"`}
                </Typography>
              </Box>
            </TableContainer>
          )}
        </Box>
      </Box>

      <CaseFormDialog open={formOpen} onClose={() => setFormOpen(false)} initial={editTarget} onSaved={handleSaved} clients={clients} staff={staff} />
      <DeleteDialog case={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
    </Layout>
  );
}
