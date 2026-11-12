import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Button, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, CircularProgress, Alert, Divider, Popover,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Tooltip,
} from "@mui/material";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GavelIcon from "@mui/icons-material/Gavel";
import SyncIcon from "@mui/icons-material/Sync";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import LaunchIcon from "@mui/icons-material/Launch";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonOutlineIcon from "@mui/icons-material/Person";
import { useRouter } from "next/router";

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES = ["Court Hearing", "Pre-Trial Conference", "Deadline", "Regulatory Meeting", "Client Meeting", "Case Hearing"];
const PRIORITIES  = ["Critical", "High", "Medium", "Low"];
const DAYS_SHORT  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS      = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TYPE_COLOR = {
  "Court Hearing":       "#E74C3C",
  "Pre-Trial Conference":"#4A90D9",
  "Deadline":            "#F39C12",
  "Regulatory Meeting":  "#2ECC71",
  "Client Meeting":      "#9B59B6",
  "Case Hearing":        "#D4A843",  // gold — auto-synced from cases
  "Google Calendar":     "#4285F4",  // Google blue — external events
};
const PRIORITY_COLOR = { Critical:"#E74C3C", High:"#F39C12", Medium:"#4A90D9", Low:"#2ECC71" };

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(d) {
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function urgencyLabel(du) {
  if (du < 0) return null;
  if (du === 0) return { label: "Today", color: "#E74C3C" };
  if (du === 1) return { label: "Tomorrow", color: "#E74C3C" };
  if (du <= 3)  return { label: `${du} days`, color: "#E74C3C" };
  if (du <= 7)  return { label: `${du} days`, color: "#F39C12" };
  return null;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "var(--accent-gold)" }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2, flex: 1, minWidth: 110, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: -14, right: -14, width: 64, height: 64, borderRadius: "50%", background: `${color}18` }} />
      <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</Typography>
    </Box>
  );
}

// ─── Case Picker Modal ────────────────────────────────────────────────────────

function CasePickerModal({ open, onClose, onSelect, selectedId }) {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.cases.list().then(setCases).catch(() => {}).finally(() => setLoading(false));
  }, [open]);

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    return c.title?.toLowerCase().includes(q) || c.case_no?.toLowerCase().includes(q) || c.client_name?.toLowerCase().includes(q);
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Link a Case</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{cases.length} cases</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField fullWidth size="small" placeholder="Search cases…" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} /></InputAdornment> }} />
      </Box>
      <DialogContent sx={{ pt: 0, px: 1 }}>
        {loading ? <Box sx={{ textAlign: "center", py: 3 }}><CircularProgress size={24} /></Box> : (
          <List dense>
            {filtered.map((c) => {
              const sel = c.id === selectedId;
              return (
                <ListItem key={c.id} onClick={() => { onSelect(c); onClose(); }}
                  sx={{ borderRadius: "8px", cursor: "pointer", mb: 0.5, background: sel ? "rgba(212,168,67,0.08)" : "transparent", "&:hover": { background: "var(--bg-elevated)" } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 34, height: 34, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", fontSize: "0.7rem", fontWeight: 600 }}>
                      {c.case_no?.slice(0, 2) || "CA"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: "0.82rem", fontWeight: sel ? 600 : 400 }}>{c.title}</Typography>}
                    secondary={<Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{c.case_no || "No #"} · {c.client_name || "No client"}</Typography>}
                  />
                  {sel && <Chip label="Linked" size="small" sx={{ fontSize: "0.62rem", height: 20, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", border: "none" }} />}
                </ListItem>
              );
            })}
            {!filtered.length && <Box sx={{ textAlign: "center", py: 3 }}><Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No cases found</Typography></Box>}
          </List>
        )}
      </DialogContent>
      {selectedId && (
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" onClick={() => { onSelect(null); onClose(); }} sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Clear</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// ─── Staff Picker Modal ───────────────────────────────────────────────────────

function StaffPickerModal({ open, onClose, onSelect, selectedId }) {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.staff.list().then(setStaff).catch(() => {}).finally(() => setLoading(false));
  }, [open]);

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.role?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  const roleColor = (role = "") => {
    if (role.includes("Partner")) return "#D4A843";
    if (role.includes("Senior")) return "#4A90D9";
    if (role.includes("Associate")) return "#2ECC71";
    if (role.includes("Paralegal")) return "#9B59B6";
    return "#8B9BB4";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Assign Lawyer / Staff</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{staff.length} members</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField fullWidth size="small" placeholder="Search staff…" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} /></InputAdornment> }} />
      </Box>
      <DialogContent sx={{ pt: 0, px: 1 }}>
        {loading ? <Box sx={{ textAlign: "center", py: 3 }}><CircularProgress size={24} /></Box> : (
          <List dense>
            {filtered.map((s) => {
              const sel = s.id === selectedId;
              const rc = roleColor(s.role);
              return (
                <ListItem key={s.id} onClick={() => { onSelect(s); onClose(); }}
                  sx={{ borderRadius: "8px", cursor: "pointer", mb: 0.5, background: sel ? "rgba(212,168,67,0.08)" : "transparent", "&:hover": { background: "var(--bg-elevated)" } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 34, height: 34, background: `${rc}20`, color: rc, fontSize: "0.7rem", fontWeight: 700 }}>
                      {s.name?.substring(0, 2).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: "0.82rem", fontWeight: sel ? 600 : 400 }}>{s.name}</Typography>}
                    secondary={<Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{s.role}{s.specialty ? ` · ${s.specialty}` : ""}</Typography>}
                  />
                  {sel && <Chip label="Assigned" size="small" sx={{ fontSize: "0.62rem", height: 20, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", border: "none" }} />}
                </ListItem>
              );
            })}
            {!filtered.length && <Box sx={{ textAlign: "center", py: 3 }}><Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No staff found</Typography></Box>}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Event Form Dialog ────────────────────────────────────────────────────────

const BLANK_FORM = { title: "", type: "Court Hearing", date: "", time: "", court: "", priority: "Medium", notes: "", case_id: "", lawyer_id: "" };

function EventFormDialog({ open, onClose, onSaved, editEvent, defaultDate }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [linkedCase, setLinkedCase] = useState(null);
  const [linkedLawyer, setLinkedLawyer] = useState(null);
  const [casePickerOpen, setCasePickerOpen] = useState(false);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editEvent) {
      const d = new Date(editEvent.date);
      const dateStr = d.toISOString().slice(0, 10);
      setForm({
        title: editEvent.title || "",
        type: editEvent.type || "Court Hearing",
        date: dateStr,
        time: editEvent.time || "",
        court: editEvent.court || "",
        priority: editEvent.priority || "Medium",
        notes: editEvent.notes || "",
        case_id: editEvent.case_id || "",
        lawyer_id: editEvent.lawyer_id || "",
      });
      setLinkedCase(editEvent.case_id ? { id: editEvent.case_id, title: editEvent.case_title } : null);
      setLinkedLawyer(editEvent.lawyer_id ? { id: editEvent.lawyer_id, name: editEvent.lawyer_name } : null);
    } else {
      const d = defaultDate ? defaultDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      setForm({ ...BLANK_FORM, date: d });
      setLinkedCase(null);
      setLinkedLawyer(null);
    }
    setError("");
  }, [open, editEvent, defaultDate]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.date) { setError("Date is required."); return; }
    setSaving(true); setError("");

    const timeStr = form.time || "00:00";
    const isoDate = new Date(`${form.date}T${timeStr}:00`).toISOString();

    const payload = {
      title: form.title,
      type: form.type,
      date: isoDate,
      time: form.time ? formatTime12(form.time) : "",
      court: form.court || null,
      priority: form.priority,
      notes: form.notes || null,
      case_id: linkedCase?.id || null,
      lawyer_id: linkedLawyer?.id || null,
    };

    try {
      const saved = editEvent
        ? await api.calendar.update(editEvent.id, payload)
        : await api.calendar.create(payload);
      onSaved(saved, !!editEvent);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>{editEvent ? "Edit Event" : "New Event"}</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.8rem" }}>{error}</Alert>}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Event Title *" size="small" fullWidth value={form.title} onChange={(e) => set("title", e.target.value)} sx={inputSx} />

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField label="Type" size="small" fullWidth select value={form.type} onChange={(e) => set("type", e.target.value)} sx={inputSx} SelectProps={{ native: true }}>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </TextField>
              <TextField label="Priority" size="small" fullWidth select value={form.priority} onChange={(e) => set("priority", e.target.value)} sx={inputSx} SelectProps={{ native: true }}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </TextField>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField label="Date *" size="small" fullWidth type="date" value={form.date} onChange={(e) => set("date", e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />
              <TextField label="Time" size="small" fullWidth type="time" value={form.time} onChange={(e) => set("time", e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />
            </Box>

            <TextField label="Court / Location" size="small" fullWidth value={form.court} onChange={(e) => set("court", e.target.value)} placeholder="e.g. Milimani Law Courts, Court 3" sx={inputSx} />

            {/* Case + Lawyer pickers */}
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>Case</Typography>
                {linkedCase ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <GavelIcon sx={{ fontSize: 14, color: "var(--accent-gold)", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.78rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{linkedCase.title}</Typography>
                    <IconButton size="small" onClick={() => setLinkedCase(null)}><CloseIcon sx={{ fontSize: 13 }} /></IconButton>
                  </Box>
                ) : (
                  <Button variant="outlined" size="small" startIcon={<AttachFileIcon sx={{ fontSize: 13 }} />} onClick={() => setCasePickerOpen(true)}
                    sx={{ fontSize: "0.75rem", borderColor: "var(--border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)" } }}>
                    Link case
                  </Button>
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>Lawyer</Typography>
                {linkedLawyer ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: "0.55rem", background: "rgba(212,168,67,0.2)", color: "var(--accent-gold)" }}>{linkedLawyer.name?.substring(0, 2)}</Avatar>
                    <Typography sx={{ fontSize: "0.78rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{linkedLawyer.name}</Typography>
                    <IconButton size="small" onClick={() => setLinkedLawyer(null)}><CloseIcon sx={{ fontSize: 13 }} /></IconButton>
                  </Box>
                ) : (
                  <Button variant="outlined" size="small" startIcon={<PersonAddIcon sx={{ fontSize: 13 }} />} onClick={() => setStaffPickerOpen(true)}
                    sx={{ fontSize: "0.75rem", borderColor: "var(--border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)" } }}>
                    Assign lawyer
                  </Button>
                )}
              </Box>
            </Box>

            <TextField label="Notes" size="small" fullWidth multiline rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} sx={inputSx} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={onClose} sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}
            startIcon={saving && <CircularProgress size={12} color="inherit" />}
            sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
            {saving ? "Saving…" : editEvent ? "Save Changes" : "Create Event"}
          </Button>
        </DialogActions>
      </Dialog>

      <CasePickerModal open={casePickerOpen} onClose={() => setCasePickerOpen(false)}
        selectedId={linkedCase?.id} onSelect={setLinkedCase} />
      <StaffPickerModal open={staffPickerOpen} onClose={() => setStaffPickerOpen(false)}
        selectedId={linkedLawyer?.id} onSelect={setLinkedLawyer} />
    </>
  );
}

function formatTime12(t24) {
  if (!t24) return "";
  const [h, m] = t24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ event, open, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      await api.calendar.delete(event.id);
      onDeleted(event.id);
      onClose();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Delete Event</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1, fontSize: "0.8rem" }}>{error}</Alert>}
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Delete <strong>{event?.title}</strong>? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cancel</Button>
        <Button variant="contained" onClick={handleDelete} disabled={loading}
          sx={{ fontSize: "0.8rem", background: "#E74C3C", color: "#fff", "&:hover": { background: "#c0392b" } }}>
          {loading ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Event Popover (grid chip click) ─────────────────────────────────────────

function EventPopover({ event, anchorEl, onClose, onEdit, onDelete }) {
  const router = useRouter();
  const open = Boolean(anchorEl);
  if (!event) return null;

  const isCase = !!event.isCase;
  const color = TYPE_COLOR[event.type] || "#8B9BB4";
  const du = daysUntil(event.date);
  const urg = urgencyLabel(du);

  const navBtn = (label, icon, onClick, highlight = false) => (
    <Button fullWidth size="small" startIcon={icon}
      onClick={() => { onClose(); onClick(); }}
      sx={{
        justifyContent: "flex-start", fontSize: "0.78rem", textTransform: "none",
        borderRadius: "8px", px: 1.25, py: 0.7,
        color: highlight ? "var(--accent-gold)" : "var(--text-secondary)",
        background: highlight ? "rgba(212,168,67,0.07)" : "transparent",
        border: highlight ? "1px solid rgba(212,168,67,0.2)" : "1px solid transparent",
        "&:hover": {
          background: highlight ? "rgba(212,168,67,0.14)" : "var(--bg-elevated)",
          color: highlight ? "var(--accent-gold)" : "var(--text-primary)",
          borderColor: highlight ? "rgba(212,168,67,0.4)" : "var(--border)",
        },
      }}>
      {label}
    </Button>
  );

  return (
    <Popover open={open} anchorEl={anchorEl} onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", p: 0, width: 260, overflow: "hidden" } }}>

      {/* Header strip */}
      <Box sx={{ background: `${color}12`, borderBottom: "1px solid var(--border)", px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.4 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.62rem", color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{event.type}</Typography>
              {urg && du >= 0 && <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: urg.color }}>· {urg.label}</Typography>}
            </Box>
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.25 }}>{event.title}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", mt: 0.3 }}>
              {new Date(event.date).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              {event.time && ` · ${event.time}`}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: -0.5, mr: -0.75, color: "var(--text-muted)" }}>
            <CloseIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Details */}
      <Box sx={{ px: 2, py: 1.25 }}>
        {event.court && (
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 0.75 }}>
            📍 {event.court}
          </Typography>
        )}
        {event.client_name && (
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 0.75 }}>
            👤 {event.client_name}
          </Typography>
        )}
        {event.lawyer_name && !isCase && (
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 0.75 }}>
            ⚖ {event.lawyer_name}
          </Typography>
        )}
        {isCase && (
          <Box sx={{ background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.18)", borderRadius: "8px", px: 1.25, py: 0.75, mb: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <GavelIcon sx={{ fontSize: 11, color: "var(--accent-gold)" }} />
              <Typography sx={{ fontSize: "0.65rem", color: "var(--accent-gold)", fontWeight: 600 }}>Synced from Cases</Typography>
            </Box>
            {event.case_no && <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", mt: 0.25 }}>{event.case_no}</Typography>}
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ px: 1.5, pb: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {event.isGoogleEvent ? (
          <>
            <Box sx={{ px: 0.5, pb: 0.5 }}>
              <Chip label="From Google Calendar" size="small" sx={{ fontSize: "0.6rem", height: 18, background: "rgba(66,133,244,0.12)", color: "#4285F4", border: "none" }} />
            </Box>
            {event.google_html_link && navBtn("Open in Google Calendar", <OpenInNewIcon sx={{ fontSize: 14 }} />, () => window.open(event.google_html_link, "_blank"), true)}
          </>
        ) : event.isCase ? (
          <>
            {navBtn("Open Case", <GavelIcon sx={{ fontSize: 14 }} />, () => router.push(`/cases?id=${event.case_id}`), true)}
            {event.client_id && navBtn("Open Client", <PersonOutlineIcon sx={{ fontSize: 14 }} />, () => router.push(`/clients?id=${event.client_id}`))}
          </>
        ) : (
          <>
            {navBtn("Edit Event", <EditIcon sx={{ fontSize: 14 }} />, () => onEdit(event))}
            <Button fullWidth size="small" startIcon={<DeleteOutlinedIcon sx={{ fontSize: 14 }} />}
              onClick={() => { onClose(); onDelete(event); }}
              sx={{ justifyContent: "flex-start", fontSize: "0.78rem", textTransform: "none", borderRadius: "8px", px: 1.25, py: 0.7, color: "#E74C3C", border: "1px solid transparent", "&:hover": { background: "rgba(231,76,60,0.08)", borderColor: "rgba(231,76,60,0.2)" } }}>
              Delete Event
            </Button>
          </>
        )}
      </Box>
    </Popover>
  );
}

// ─── Event Card (list + day panel) ───────────────────────────────────────────

function EventCard({ event, onEdit, onDelete, compact = false }) {
  const router = useRouter();
  const d = new Date(event.date);
  const du = daysUntil(event.date);
  const isPast = du < 0;
  const isCase = !!event.isCase;
  const color = TYPE_COLOR[event.type] || "#8B9BB4";
  const pColor = PRIORITY_COLOR[event.priority] || "#8B9BB4";
  const urg = urgencyLabel(du);

  return (
    <Box sx={{
      background: isCase ? "rgba(212,168,67,0.04)" : "var(--bg-card)",
      border: isCase
        ? `1px dashed rgba(212,168,67,0.4)`
        : `1px solid ${urg && !isPast ? "rgba(231,76,60,0.35)" : "var(--border)"}`,
      borderRadius: "12px", p: compact ? 1.5 : 2,
      opacity: isPast ? 0.6 : 1, transition: "all 0.2s",
      "&:hover": { borderColor: isCase ? "var(--accent-gold)" : "var(--accent-gold-dim)" },
    }}>
      {/* Case source badge */}
      {isCase && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
          <GavelIcon sx={{ fontSize: 11, color: "var(--accent-gold)" }} />
          <Typography sx={{ fontSize: "0.6rem", color: "var(--accent-gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Next Hearing — synced from Cases
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
        <Box sx={{ textAlign: "center", minWidth: 44, background: isPast ? "var(--bg-elevated)" : `${color}12`, borderRadius: "8px", py: 0.75 }}>
          <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: isPast ? "var(--text-muted)" : color, lineHeight: 1 }}>{d.getDate()}</Typography>
          <Typography sx={{ fontSize: "0.58rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{MONTHS[d.getMonth()].slice(0, 3)}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 0.5 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</Typography>
            {urg && !isPast && <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: urg.color, flexShrink: 0 }}>{urg.label}</Typography>}
          </Box>
          <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", mt: 0.2 }}>
            {event.time && <>{event.time}{event.court ? " · " : ""}</>}{event.court}
            {!event.time && !event.court && event.client_name && <span>{event.client_name}</span>}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: isCase || event.notes ? 1 : 0 }}>
        <Chip label={event.type} size="small" sx={{ fontSize: "0.6rem", height: 18, background: `${color}15`, color, border: "none" }} />
        <Chip label={event.priority} size="small" sx={{ fontSize: "0.6rem", height: 18, background: `${pColor}15`, color: pColor, border: "none" }} />
        {event.case_no && <Chip label={event.case_no} size="small" sx={{ fontSize: "0.6rem", height: 18, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none" }} />}
      </Box>

      {/* Google Calendar event badge + link */}
      {event.isGoogleEvent && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
          <Chip label="Google Calendar" size="small" sx={{ fontSize: "0.6rem", height: 18, background: "rgba(66,133,244,0.12)", color: "#4285F4", border: "none" }} />
          {event.google_html_link && (
            <Button size="small" startIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
              onClick={() => window.open(event.google_html_link, "_blank")}
              sx={{ fontSize: "0.7rem", textTransform: "none", color: "#4285F4", p: 0.25, minWidth: 0, "&:hover": { background: "rgba(66,133,244,0.08)" } }}>
              Open
            </Button>
          )}
        </Box>
      )}

      {/* Case hearing — navigation buttons */}
      {isCase && (
        <Box sx={{ display: "flex", gap: 1, mt: 0.5, mb: compact ? 0 : 0.5 }}>
          <Button size="small" variant="outlined" startIcon={<GavelIcon sx={{ fontSize: 12 }} />}
            onClick={() => router.push(`/cases?id=${event.case_id}`)}
            sx={{ flex: 1, fontSize: "0.72rem", textTransform: "none", borderRadius: "8px", py: 0.5, borderColor: "rgba(212,168,67,0.4)", color: "var(--accent-gold)", "&:hover": { borderColor: "var(--accent-gold)", background: "rgba(212,168,67,0.08)" } }}>
            Open Case
          </Button>
          {event.client_id && (
            <Button size="small" variant="outlined" startIcon={<PersonOutlineIcon sx={{ fontSize: 12 }} />}
              onClick={() => router.push(`/clients?id=${event.client_id}`)}
              sx={{ flex: 1, fontSize: "0.72rem", textTransform: "none", borderRadius: "8px", py: 0.5, borderColor: "var(--border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.05)" } }}>
              Open Client
            </Button>
          )}
        </Box>
      )}

      {event.notes && !compact && (
        <Box sx={{ background: "var(--bg-elevated)", borderRadius: "6px", px: 1.5, py: 0.75, mt: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{event.notes}</Typography>
        </Box>
      )}

      {!isCase && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            {event.lawyer_name ? <><span>Lawyer: </span>{event.lawyer_name}</> : <span>No lawyer assigned</span>}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.25 }}>
            <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(event)} sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--accent-gold)" } }}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" onClick={() => onDelete(event)} sx={{ color: "var(--text-muted)", "&:hover": { color: "#E74C3C" } }}><DeleteOutlinedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Calendar Grid ────────────────────────────────────────────────────────────

function CalendarGrid({ events, viewDate, onSelectDay, selectedDay, onAddOnDay, onEdit, onDelete }) {
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const [popover, setPopover] = useState({ anchorEl: null, event: null });

  const days = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = firstDow - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, prevDays - i), cur: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), cur: true });
    while (cells.length % 7 !== 0) cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDow + 1), cur: false });
    return cells;
  }, [year, month]);

  const eventMap = useMemo(() => {
    const m = {};
    events.forEach((e) => {
      const key = new Date(e.date).toDateString();
      if (!m[key]) m[key] = [];
      m[key].push(e);
    });
    return m;
  }, [events]);

  const today = new Date();
  const openPopover = (e, event) => { e.stopPropagation(); setPopover({ anchorEl: e.currentTarget, event }); };
  const closePopover = () => setPopover({ anchorEl: null, event: null });

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {/* Day headers */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
        {DAYS_SHORT.map((d) => (
          <Typography key={d} sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center", fontWeight: 600, py: 0.75, letterSpacing: "0.05em" }}>{d}</Typography>
        ))}
      </Box>

      {/* Day cells */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
        {days.map(({ date, cur }, i) => {
          const key = date.toDateString();
          const dayEvents = eventMap[key] || [];
          const isToday = isSameDay(date, today);
          const isSel = selectedDay && isSameDay(date, selectedDay);
          const hasUrgent = dayEvents.some((e) => { const du = daysUntil(e.date); return du >= 0 && du <= 7; });

          return (
            <Box key={i} onClick={() => onSelectDay(date)}
              sx={{
                minHeight: 80, borderRadius: "8px", p: 0.75, cursor: "pointer",
                background: isSel ? "rgba(212,168,67,0.1)" : isToday ? "rgba(212,168,67,0.04)" : "var(--bg-card)",
                border: `1px solid ${isSel ? "var(--accent-gold)" : isToday ? "rgba(212,168,67,0.4)" : "var(--border)"}`,
                opacity: cur ? 1 : 0.35,
                transition: "all 0.15s",
                "&:hover": { borderColor: "var(--accent-gold-dim)", background: "rgba(212,168,67,0.05)" },
                position: "relative",
              }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                <Typography sx={{
                  fontSize: "0.8rem", fontWeight: isToday ? 700 : 400,
                  color: isToday ? "var(--accent-gold)" : isSel ? "var(--accent-gold)" : "var(--text-primary)",
                  width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%", background: isToday ? "rgba(212,168,67,0.15)" : "transparent",
                }}>
                  {date.getDate()}
                </Typography>
                {hasUrgent && <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#E74C3C", flexShrink: 0 }} />}
              </Box>

              {dayEvents.slice(0, 3).map((e, j) => {
                const c = TYPE_COLOR[e.type] || "#8B9BB4";
                return (
                  <Tooltip key={j} title={e.isCase ? "Click to open case or client" : "Click for details"} placement="top">
                    <Box onClick={(ev) => openPopover(ev, e)}
                      sx={{
                        fontSize: "0.62rem", color: c, background: `${c}15`,
                        borderRadius: "3px", px: 0.5, py: 0.15, mb: 0.25,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        cursor: "pointer",
                        border: e.isCase ? `1px dashed ${c}50` : "1px solid transparent",
                        transition: "all 0.12s",
                        "&:hover": { background: `${c}28`, transform: "translateX(1px)" },
                      }}>
                      {e.isCase && <GavelIcon sx={{ fontSize: 7, mr: 0.3, verticalAlign: "middle" }} />}
                      {e.time && <span style={{ opacity: 0.7 }}>{e.time} </span>}{e.title}
                    </Box>
                  </Tooltip>
                );
              })}
              {dayEvents.length > 3 && (
                <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", mt: 0.25 }}>+{dayEvents.length - 3} more</Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <EventPopover
        event={popover.event}
        anchorEl={popover.anchorEl}
        onClose={closePopover}
        onEdit={(ev) => { closePopover(); onEdit(ev); }}
        onDelete={(ev) => { closePopover(); onDelete(ev); }}
      />
    </Box>
  );
}

// ─── Day Events Panel ─────────────────────────────────────────────────────────

function DayPanel({ day, events, onEdit, onDelete, onAdd }) {
  const dayEvents = day
    ? events.filter((e) => isSameDay(new Date(e.date), day))
    : events.filter((e) => daysUntil(e.date) >= 0).slice(0, 5);

  const title = day
    ? day.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })
    : "Upcoming Events";

  return (
    <Box sx={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{title}</Typography>
        {day && (
          <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />} onClick={onAdd}
            sx={{ fontSize: "0.72rem", color: "var(--accent-gold)", p: 0, minWidth: 0, "&:hover": { background: "transparent" } }}>
            Add
          </Button>
        )}
      </Box>

      {dayEvents.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, color: "var(--text-muted)" }}>
          <CalendarTodayIcon sx={{ fontSize: 28, opacity: 0.2, mb: 1 }} />
          <Typography sx={{ fontSize: "0.78rem" }}>{day ? "No events this day" : "No upcoming events"}</Typography>
          {day && <Button size="small" onClick={onAdd} sx={{ mt: 1, fontSize: "0.75rem", color: "var(--accent-gold)" }}>Add event</Button>}
        </Box>
      ) : (
        dayEvents.map((e) => (
          <EventCard key={e.id} event={e} onEdit={onEdit} onDelete={onDelete} compact />
        ))
      )}
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

/** Convert a case's next_hearing into a synthetic calendar entry. */
function caseToEvent(c) {
  return {
    id: `case-${c.id}`,
    title: c.title,
    date: c.next_hearing,
    type: "Case Hearing",
    priority: c.priority || "Medium",
    case_id: c.id,
    case_title: c.title,
    case_no: c.case_no || null,
    client_id: c.client_id || null,
    client_name: c.client_name || null,
    court: c.court || null,
    time: null,
    lawyer_name: null,
    notes: c.description || null,
    isCase: true,
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);          // calendar events only
  const [caseEvents, setCaseEvents] = useState([]);  // synthetic from cases
  const [googleEvents, setGoogleEvents] = useState([]); // external from Google
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evData, caseData, gcalStatusData] = await Promise.all([
        api.calendar.list(),
        api.cases.list(),
        api.gcal.status().catch(() => ({ connected: false })),
      ]);
      setEvents(evData);
      const synth = caseData.filter((c) => c.next_hearing).map(caseToEvent);
      setCaseEvents(synth);
      setGcalConnected(gcalStatusData.connected);
      if (gcalStatusData.connected) {
        api.gcal.externalEvents().then(setGoogleEvents).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true); setSyncMsg(null);
    try {
      const r = await api.gcal.sync();
      setSyncMsg({ type: "success", text: `Synced ${r.pushed} events to Google Calendar` });
      // Refresh external events
      api.gcal.externalEvents().then(setGoogleEvents).catch(() => {});
    } catch (e) {
      setSyncMsg({ type: "error", text: e.message || "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { load(); }, [load]);

  // Merge calendar events + case hearings + Google external events
  const allEvents = useMemo(() => [...events, ...caseEvents, ...googleEvents], [events, caseEvents, googleEvents]);

  const filtered = useMemo(() => {
    return allEvents.filter((e) => typeFilter === "All" || e.type === typeFilter);
  }, [allEvents, typeFilter]);

  // Stats (based on merged set)
  const now = new Date();
  const upcoming = allEvents.filter((e) => new Date(e.date) >= now);
  const urgent = upcoming.filter((e) => daysUntil(e.date) <= 7);
  const thisMonth = allEvents.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const handleSaved = (event, isEdit) => {
    setEvents((prev) => isEdit ? prev.map((e) => e.id === event.id ? event : e) : [event, ...prev]);
  };

  const handleDeleted = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const openAdd = (day = null) => {
    setEditTarget(null);
    setDefaultDate(day || selectedDay || new Date());
    setFormOpen(true);
  };

  const openEdit = (event) => {
    setEditTarget(event);
    setDefaultDate(null);
    setFormOpen(true);
  };

  // List view grouped by month
  const groupedByMonth = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    const groups = {};
    sorted.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!groups[key]) groups[key] = { label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, events: [] };
      groups[key].events.push(e);
    });
    return Object.values(groups);
  }, [filtered]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday  = () => { setViewDate(new Date()); setSelectedDay(new Date()); };

  return (
    <Layout title="Court Calendar">
      {/* Sync message */}
      {syncMsg && (
        <Alert severity={syncMsg.type} sx={{ mb: 2, fontSize: "0.8rem", borderRadius: "10px" }} onClose={() => setSyncMsg(null)}>
          {syncMsg.text}
        </Alert>
      )}

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <StatCard label="Total Events" value={allEvents.length} />
        <StatCard label="Case Hearings" value={caseEvents.length} color="#D4A843" />
        <StatCard label="This Month" value={thisMonth.length} color="#4A90D9" />
        <StatCard label="Urgent (≤7 days)" value={urgent.length} color="#E74C3C" />
        {gcalConnected && <StatCard label="From Google" value={googleEvents.length} color="#4285F4" />}
      </Box>

      {/* Urgent banner */}
      {urgent.length > 0 && (
        <Box sx={{ background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.25)", borderRadius: "10px", px: 2, py: 1.25, display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <WarningAmberIcon sx={{ color: "#E74C3C", fontSize: 18 }} />
          <Typography sx={{ fontSize: "0.82rem", color: "#E74C3C", fontWeight: 500, flex: 1 }}>
            {urgent.length} event{urgent.length > 1 ? "s" : ""} within 7 days — {urgent.map((e) => e.title).slice(0, 2).join(", ")}{urgent.length > 2 ? ` +${urgent.length - 2} more` : ""}
          </Typography>
        </Box>
      )}

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        {/* Month nav */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", px: 1, py: 0.5 }}>
          <IconButton size="small" onClick={prevMonth}><ChevronLeftIcon sx={{ fontSize: 18 }} /></IconButton>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, minWidth: 130, textAlign: "center" }}>
            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </Typography>
          <IconButton size="small" onClick={nextMonth}><ChevronRightIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        <Button size="small" onClick={goToday}
          sx={{ fontSize: "0.75rem", border: "1px solid var(--border)", color: "var(--text-secondary)", px: 1.5, borderRadius: "8px", "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)" } }}>
          Today
        </Button>

        {/* Type filter */}
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {["All", ...EVENT_TYPES].map((t) => {
            const active = typeFilter === t;
            const c = TYPE_COLOR[t];
            const label = t === "All" ? "All"
              : t === "Case Hearing" ? "Case Hearings"
              : t.split(" ")[0];
            return (
              <Chip key={t} label={label} size="small" onClick={() => setTypeFilter(t)} sx={{
                fontSize: "0.7rem", cursor: "pointer", height: 24,
                background: active ? (c ? `${c}15` : "rgba(212,168,67,0.15)") : "var(--bg-card)",
                color: active ? (c || "var(--accent-gold)") : "var(--text-secondary)",
                border: active ? `1px solid ${c || "var(--accent-gold)"}` : "1px solid var(--border)",
              }} />
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* View toggle */}
        <Box sx={{ display: "flex", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
          {[{ mode: "calendar", Icon: CalendarViewMonthIcon }, { mode: "list", Icon: ViewListIcon }].map(({ mode, Icon }) => (
            <IconButton key={mode} size="small" onClick={() => setViewMode(mode)}
              sx={{ borderRadius: 0, px: 1.25, background: viewMode === mode ? "rgba(212,168,67,0.12)" : "transparent", color: viewMode === mode ? "var(--accent-gold)" : "var(--text-muted)" }}>
              <Icon sx={{ fontSize: 18 }} />
            </IconButton>
          ))}
        </Box>

        {/* Google Calendar sync */}
        {gcalConnected ? (
          <Tooltip title="Push all events to Google Calendar">
            <Button size="small" onClick={handleSync} disabled={syncing}
              startIcon={syncing ? <CircularProgress size={13} color="inherit" /> : <SyncIcon sx={{ fontSize: 15 }} />}
              sx={{ fontSize: "0.75rem", border: "1px solid rgba(66,133,244,0.4)", color: "#4285F4", borderRadius: "8px", "&:hover": { background: "rgba(66,133,244,0.08)", borderColor: "#4285F4" } }}>
              {syncing ? "Syncing…" : "Sync Google"}
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title="Connect Google Calendar in Settings">
            <Button size="small" onClick={() => router.push("/settings")}
              sx={{ fontSize: "0.75rem", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "8px", "&:hover": { borderColor: "rgba(66,133,244,0.4)", color: "#4285F4" } }}>
              + Google Calendar
            </Button>
          </Tooltip>
        )}

        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => openAdd()}
          sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
          Add Event
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress size={32} sx={{ color: "var(--accent-gold)" }} /></Box>
      ) : viewMode === "calendar" ? (
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <CalendarGrid events={filtered} viewDate={viewDate} selectedDay={selectedDay}
            onSelectDay={(d) => setSelectedDay((prev) => prev && isSameDay(prev, d) ? null : d)}
            onAddOnDay={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />
          <DayPanel day={selectedDay} events={filtered} onEdit={openEdit} onDelete={setDeleteTarget} onAdd={() => openAdd(selectedDay)} />
        </Box>
      ) : (
        /* List view */
        <Box>
          {groupedByMonth.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10, color: "var(--text-muted)" }}>
              <CalendarTodayIcon sx={{ fontSize: 42, opacity: 0.2, mb: 1.5 }} />
              <Typography sx={{ fontSize: "0.95rem", mb: 0.5 }}>No events yet</Typography>
              <Button variant="contained" size="small" onClick={() => openAdd()}
                sx={{ mt: 1, background: "var(--accent-gold)", color: "#000" }}>Add First Event</Button>
            </Box>
          ) : (
            groupedByMonth.map((group) => (
              <Box key={group.label} sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, mb: 1.5 }}>{group.label}</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 1.5 }}>
                  {group.events.map((e) => (
                    <EventCard key={e.id} event={e} onEdit={openEdit} onDelete={setDeleteTarget} />
                  ))}
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}

      {/* Dialogs */}
      <EventFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={handleSaved} editEvent={editTarget} defaultDate={defaultDate} />

      {deleteTarget && (
        <DeleteDialog event={deleteTarget} open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
    </Layout>
  );
}
