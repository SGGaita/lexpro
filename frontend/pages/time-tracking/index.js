import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Button, Chip, Avatar, Tooltip, IconButton,
  CircularProgress, Alert, Divider, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, List, ListItem, ListItemAvatar, ListItemText,
} from "@mui/material";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtKES = (n) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n || 0);
const fmtKESc = (n) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
const fmtHours = (h) => {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

const AVATAR_BG = ["#D4A843","#4A90D9","#2ECC71","#E74C3C","#9B59B6","#F39C12","#1ABC9C","#E67E22"];
const avatarColor = (name = "", idx = 0) => AVATAR_BG[idx % AVATAR_BG.length];

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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "var(--accent-gold)", Icon }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2, flex: 1, minWidth: 140, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: -12, right: -12, width: 56, height: 56, borderRadius: "50%", background: `${color}18` }} />
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
        <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</Typography>
        {Icon && <Icon sx={{ fontSize: 15, color, opacity: 0.6 }} />}
      </Box>
      <Typography sx={{ fontSize: "1.45rem", fontWeight: 700, color, lineHeight: 1.2 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", mt: 0.4 }}>{sub}</Typography>}
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Link a Case</Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{cases.length} cases</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField fullWidth size="small" placeholder="Search cases…" value={search} onChange={(e) => setSearch(e.target.value)} sx={inputSx}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} /></InputAdornment> }} />
      </Box>
      <DialogContent sx={{ pt: 0, px: 1 }}>
        {loading ? <Box sx={{ textAlign: "center", py: 3 }}><CircularProgress size={22} /></Box> : (
          <List dense>
            {filtered.map((c) => {
              const sel = c.id === selectedId;
              return (
                <ListItem key={c.id} onClick={() => { onSelect(c); onClose(); }}
                  sx={{ borderRadius: "8px", cursor: "pointer", mb: 0.5, background: sel ? "rgba(212,168,67,0.08)" : "transparent", "&:hover": { background: "var(--bg-elevated)" } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", fontSize: "0.65rem", fontWeight: 700, borderRadius: "8px" }}>
                      {c.case_no?.slice(0, 3) || "CA"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: "0.82rem", fontWeight: sel ? 600 : 400 }}>{c.title}</Typography>}
                    secondary={<Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{c.case_no || "No #"} · {c.client_name || "No client"}</Typography>}
                  />
                  {sel && <Chip label="Selected" size="small" sx={{ fontSize: "0.6rem", height: 18, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", border: "none" }} />}
                </ListItem>
              );
            })}
            {!filtered.length && <Box sx={{ textAlign: "center", py: 4 }}><Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No cases found</Typography></Box>}
          </List>
        )}
      </DialogContent>
      {selectedId && (
        <DialogActions sx={{ px: 2, pb: 1.5 }}>
          <Button size="small" onClick={() => { onSelect(null); onClose(); }} sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Clear selection</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// ─── Log Time Dialog ──────────────────────────────────────────────────────────

const BLANK_ENTRY = { date: "", description: "", hours: "1", rate: "10000", is_billable: true };
const HOUR_PRESETS = [0.5, 1, 1.5, 2, 3, 4];

const fieldLabelSx = { fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.6 };

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    background: "var(--bg-elevated)",
    borderRadius: "10px",
    "& fieldset": { borderColor: "var(--border)" },
    "&:hover fieldset": { borderColor: "var(--accent-gold-dim)" },
    "&.Mui-focused fieldset": { borderColor: "var(--accent-gold)", borderWidth: "1.5px" },
    "&.Mui-disabled": { opacity: 0.5 },
  },
  "& .MuiInputBase-input": { color: "var(--text-primary)", fontSize: "0.88rem", py: "10px" },
  "& .MuiInputBase-input::placeholder": { color: "var(--text-muted)", opacity: 1 },
};

function FieldLabel({ children, required }) {
  return (
    <Typography sx={fieldLabelSx}>
      {children}{required && <span style={{ color: "var(--accent-gold)", marginLeft: 2 }}>*</span>}
    </Typography>
  );
}

function LogTimeDialog({ open, onClose, onSaved, editEntry }) {
  const [form, setForm] = useState(BLANK_ENTRY);
  const [linkedCase, setLinkedCase] = useState(null);
  const [casePickerOpen, setCasePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editEntry) {
      const d = new Date(editEntry.date);
      setForm({
        date: d.toISOString().slice(0, 10),
        description: editEntry.description || "",
        hours: String(editEntry.hours),
        rate: String(editEntry.rate),
        is_billable: editEntry.is_billable,
      });
      setLinkedCase(editEntry.case_id ? { id: editEntry.case_id, title: editEntry.case_title || "Linked case", client_name: editEntry.client_name } : null);
    } else {
      setForm({ ...BLANK_ENTRY, date: new Date().toISOString().slice(0, 10) });
      setLinkedCase(null);
    }
    setError("");
  }, [open, editEntry]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const hours = parseFloat(form.hours) || 0;
  const rate  = parseFloat(form.rate) || 0;
  const amount = hours * rate;

  const handleSubmit = async () => {
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!hours || hours <= 0) { setError("Hours must be greater than 0."); return; }
    if (!rate || rate < 0) { setError("Rate is required."); return; }
    setSaving(true); setError("");

    const payload = {
      description: form.description.trim(),
      hours,
      rate,
      is_billable: form.is_billable,
      case_id: linkedCase?.id || null,
      date: form.date ? new Date(form.date).toISOString() : null,
    };

    try {
      const saved = editEntry
        ? await api.time.update(editEntry.id, { description: payload.description, hours: payload.hours, is_billable: payload.is_billable })
        : await api.time.create(payload);
      onSaved(saved, !!editEntry);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", overflow: "hidden" } }}>

        {/* ── Header ── */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 1.5,
          background: "linear-gradient(135deg, rgba(212,168,67,0.06) 0%, transparent 60%)",
        }}>
          <Box sx={{ width: 42, height: 42, borderRadius: "12px", background: "rgba(212,168,67,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AccessTimeIcon sx={{ fontSize: 22, color: "var(--accent-gold)" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
              {editEntry ? "Edit Time Entry" : "Log Time"}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 0.1 }}>
              {editEntry ? "Update hours, description, or billable status" : "Record time spent on a case or task"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--text-primary)", background: "var(--bg-elevated)" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, fontSize: "0.8rem", borderRadius: "10px" }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* ── Row 1: Date + Case ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 2, mb: 2.5 }}>
            {/* Date */}
            <Box>
              <FieldLabel>Date</FieldLabel>
              <TextField fullWidth size="small" type="date" value={form.date}
                onChange={(e) => set("date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...fieldSx, "& .MuiInputBase-input": { fontSize: "0.85rem", color: "var(--text-primary)", py: "10px" } }} />
            </Box>

            {/* Case */}
            <Box>
              <FieldLabel>Case</FieldLabel>
              {linkedCase ? (
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  px: 1.25, py: "9px",
                  background: "rgba(212,168,67,0.07)",
                  border: "1.5px solid rgba(212,168,67,0.35)",
                  borderRadius: "10px",
                  minHeight: "40px",
                }}>
                  <GavelIcon sx={{ fontSize: 14, color: "var(--accent-gold)", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                      {linkedCase.title}
                    </Typography>
                    {linkedCase.client_name && (
                      <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", lineHeight: 1.2 }}>{linkedCase.client_name}</Typography>
                    )}
                  </Box>
                  <IconButton size="small" onClick={() => setLinkedCase(null)} sx={{ p: 0.25 }}>
                    <CloseIcon sx={{ fontSize: 13, color: "var(--text-muted)" }} />
                  </IconButton>
                </Box>
              ) : (
                <Button variant="outlined" fullWidth size="small"
                  onClick={() => setCasePickerOpen(true)} disabled={!!editEntry}
                  startIcon={<GavelIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    height: 40, fontSize: "0.8rem", textTransform: "none", borderRadius: "10px",
                    borderColor: "var(--border)", color: "var(--text-muted)",
                    justifyContent: "flex-start", px: 1.5,
                    "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.04)" },
                    "&.Mui-disabled": { opacity: 0.4 },
                  }}>
                  Link a case <Typography component="span" sx={{ fontSize: "0.7rem", ml: 0.5, opacity: 0.6 }}>(optional)</Typography>
                </Button>
              )}
            </Box>
          </Box>

          {/* ── Row 2: Description ── */}
          <Box sx={{ mb: 2.5 }}>
            <FieldLabel required>Description</FieldLabel>
            <TextField fullWidth size="small" multiline rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Drafted affidavit for client hearing, reviewed contract terms…"
              sx={{
                ...fieldSx,
                "& .MuiInputBase-input": { fontSize: "0.85rem", color: "var(--text-primary)", py: "8px", lineHeight: 1.5 },
              }} />
          </Box>

          {/* ── Row 3: Hours ── */}
          <Box sx={{ mb: 2.5 }}>
            <FieldLabel required>Hours Worked</FieldLabel>

            {/* Quick presets */}
            <Box sx={{ display: "flex", gap: 0.75, mb: 1 }}>
              {HOUR_PRESETS.map((h) => {
                const active = parseFloat(form.hours) === h;
                return (
                  <Box key={h} onClick={() => set("hours", String(h))} sx={{
                    px: 1.1, py: 0.4, borderRadius: "7px", cursor: "pointer", fontSize: "0.72rem", fontWeight: active ? 700 : 400,
                    background: active ? "rgba(212,168,67,0.18)" : "var(--bg-elevated)",
                    color: active ? "var(--accent-gold)" : "var(--text-secondary)",
                    border: active ? "1.5px solid rgba(212,168,67,0.5)" : "1px solid var(--border)",
                    transition: "all 0.12s",
                    userSelect: "none",
                    "&:hover": { background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)", borderColor: "rgba(212,168,67,0.3)" },
                  }}>
                    {h}h
                  </Box>
                );
              })}
              <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", alignSelf: "center", ml: 0.5 }}>or enter custom</Typography>
            </Box>

            <TextField fullWidth size="small" type="number" value={form.hours}
              onChange={(e) => set("hours", e.target.value)}
              inputProps={{ min: 0.25, step: 0.25 }}
              InputProps={{ endAdornment: <Typography sx={{ fontSize: "0.78rem", color: "var(--text-muted)", pr: 0.5 }}>hrs</Typography> }}
              sx={{ ...fieldSx, "& .MuiInputBase-input": { fontSize: "1rem", fontWeight: 600, color: "var(--accent-gold)", py: "10px" } }} />
          </Box>

          {/* ── Row 4: Rate + Amount preview ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
            <Box>
              <FieldLabel required>Hourly Rate</FieldLabel>
              <TextField fullWidth size="small" type="number" value={form.rate}
                onChange={(e) => set("rate", e.target.value)}
                inputProps={{ min: 0, step: 500 }}
                InputProps={{ startAdornment: <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mr: 0.5 }}>KES</Typography> }}
                disabled={!!editEntry}
                sx={{ ...fieldSx, "& .MuiInputBase-input": { fontSize: "0.88rem", color: "var(--text-primary)", py: "10px" } }} />
            </Box>

            <Box>
              <FieldLabel>Estimated Total</FieldLabel>
              <Box sx={{
                height: 40,
                display: "flex", alignItems: "center",
                px: 1.75,
                background: form.is_billable && amount > 0 ? "rgba(212,168,67,0.08)" : "var(--bg-elevated)",
                border: form.is_billable && amount > 0 ? "1.5px solid rgba(212,168,67,0.3)" : "1px solid var(--border)",
                borderRadius: "10px",
                transition: "all 0.2s",
              }}>
                {form.is_billable && amount > 0 ? (
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>KES</Typography>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "-0.02em" }}>
                      {new Intl.NumberFormat("en-KE").format(Math.round(amount))}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {!form.is_billable ? "Non-billable" : "—"}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* ── Row 5: Billing type toggle ── */}
          <Box>
            <FieldLabel>Billing Type</FieldLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
              {/* Billable */}
              <Box onClick={() => set("is_billable", true)} sx={{
                px: 2, py: 1.4, borderRadius: "12px", cursor: "pointer",
                border: form.is_billable ? "1.5px solid rgba(212,168,67,0.55)" : "1px solid var(--border)",
                background: form.is_billable ? "rgba(212,168,67,0.07)" : "var(--bg-elevated)",
                transition: "all 0.15s",
                "&:hover": { borderColor: "rgba(212,168,67,0.4)", background: "rgba(212,168,67,0.05)" },
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                  <Box sx={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    border: form.is_billable ? "4px solid var(--accent-gold)" : "2px solid var(--border)",
                    transition: "all 0.15s",
                  }} />
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: form.is_billable ? 700 : 400, color: form.is_billable ? "var(--accent-gold)" : "var(--text-secondary)" }}>
                    Billable
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.66rem", color: "var(--text-muted)", pl: "22px" }}>
                  Charged to client invoice
                </Typography>
              </Box>

              {/* Internal */}
              <Box onClick={() => set("is_billable", false)} sx={{
                px: 2, py: 1.4, borderRadius: "12px", cursor: "pointer",
                border: !form.is_billable ? "1.5px solid rgba(100,120,160,0.55)" : "1px solid var(--border)",
                background: !form.is_billable ? "rgba(100,120,160,0.07)" : "var(--bg-elevated)",
                transition: "all 0.15s",
                "&:hover": { borderColor: "rgba(100,120,160,0.4)", background: "rgba(100,120,160,0.04)" },
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                  <Box sx={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    border: !form.is_billable ? "4px solid #6478A0" : "2px solid var(--border)",
                    transition: "all 0.15s",
                  }} />
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: !form.is_billable ? 700 : 400, color: !form.is_billable ? "#8B9BB4" : "var(--text-secondary)" }}>
                    Internal
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.66rem", color: "var(--text-muted)", pl: "22px" }}>
                  Admin or overhead time
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* ── Footer ── */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 1.5, background: "var(--bg-elevated)" }}>
          <Button onClick={onClose} sx={{ fontSize: "0.8rem", color: "var(--text-muted)", "&:hover": { color: "var(--text-secondary)" } }}>
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          {form.is_billable && hours > 0 && rate > 0 && (
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Invoice total</Typography>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--accent-gold)" }}>KES {new Intl.NumberFormat("en-KE").format(Math.round(amount))}</Typography>
            </Box>
          )}
          <Button variant="contained" onClick={handleSubmit} disabled={saving}
            startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <AccessTimeIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: "0.85rem", px: 2.5, py: 0.9,
              background: "var(--accent-gold)", color: "#000", fontWeight: 700,
              borderRadius: "10px", textTransform: "none", letterSpacing: 0,
              "&:hover": { background: "var(--accent-gold-dim)" },
              "&.Mui-disabled": { opacity: 0.5 },
            }}>
            {saving ? "Saving…" : editEntry ? "Save Changes" : "Log Time"}
          </Button>
        </Box>
      </Dialog>

      <CasePickerModal open={casePickerOpen} onClose={() => setCasePickerOpen(false)}
        selectedId={linkedCase?.id} onSelect={setLinkedCase} />
    </>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ entry, open, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try { await api.time.delete(entry.id); onDeleted(entry.id); onClose(); }
    catch (e) { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Delete Time Entry</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Delete this entry (<strong>{fmtHours(entry?.hours || 0)}</strong> — {entry?.description?.slice(0, 50)}…)? This cannot be undone.
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

// ─── Staff Hours Strip ────────────────────────────────────────────────────────

function StaffStrip({ entries }) {
  const byLawyer = useMemo(() => {
    const m = {};
    entries.forEach((e) => {
      const name = e.lawyer_name || "Unknown";
      if (!m[name]) m[name] = { hours: 0, billable: 0, value: 0, count: 0 };
      m[name].hours += e.hours;
      m[name].count++;
      if (e.is_billable) { m[name].billable += e.hours; m[name].value += e.amount || (e.hours * e.rate); }
    });
    return Object.entries(m).sort((a, b) => b[1].hours - a[1].hours);
  }, [entries]);

  if (!byLawyer.length) return null;

  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2, mb: 2 }}>
      <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, mb: 1.5 }}>Hours by Lawyer</Typography>
      <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
        {byLawyer.map(([name, data], i) => {
          const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase();
          const color = avatarColor(name, i);
          const pct = Math.round((data.billable / data.hours) * 100) || 0;
          return (
            <Box key={name} sx={{ display: "flex", alignItems: "center", gap: 1.5, background: "var(--bg-elevated)", borderRadius: "10px", px: 1.75, py: 1, minWidth: 190, border: "1px solid var(--border)" }}>
              <Avatar sx={{ width: 34, height: 34, background: color, fontSize: "0.72rem", fontWeight: 700, color: "#0A0F1A", borderRadius: "9px", flexShrink: 0 }}>{initials}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{name.split(" ")[0]}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{fmtHours(data.hours)} · {pct}% billable</Typography>
                </Box>
                {/* Mini progress bar */}
                <Box sx={{ width: "100%", height: 3, background: "var(--border)", borderRadius: 2, mt: 0.4 }}>
                  <Box sx={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s" }} />
                </Box>
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-gold)" }}>{fmtKESc(data.value)}</Typography>
                <Typography sx={{ fontSize: "0.58rem", color: "var(--text-muted)" }}>{data.count} {data.count === 1 ? "entry" : "entries"}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Entry Row ────────────────────────────────────────────────────────────────

function EntryRow({ entry, index, onEdit, onDelete, onMarkBilled }) {
  const [marking, setMarking] = useState(false);
  const initials = (entry.lawyer_name || "?").split(" ").map((n) => n[0]).join("").toUpperCase();
  const color = avatarColor(entry.lawyer_name, index);
  const amount = entry.amount || (entry.hours * entry.rate);

  const handleMarkBilled = async (e) => {
    e.stopPropagation();
    setMarking(true);
    try { await onMarkBilled(entry); } finally { setMarking(false); }
  };

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "100px 140px 180px 1fr 80px 100px 110px 90px 100px",
      alignItems: "center", gap: 1,
      px: 2, py: 1.25,
      borderBottom: "1px solid var(--border)",
      transition: "background 0.12s",
      "&:hover": { background: "var(--bg-elevated)" },
    }}>
      {/* Date */}
      <Typography sx={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
        {new Date(entry.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
      </Typography>

      {/* Lawyer */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Avatar sx={{ width: 26, height: 26, background: color, fontSize: "0.58rem", fontWeight: 700, color: "#0A0F1A", borderRadius: "7px", flexShrink: 0 }}>{initials}</Avatar>
        <Typography sx={{ fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.lawyer_name || "—"}</Typography>
      </Box>

      {/* Case / Client */}
      <Box>
        {entry.client_name && <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.client_name}</Typography>}
        {entry.case_title || entry.case_id
          ? <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.case_title || entry.case_id}</Typography>
          : !entry.client_name && <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Internal</Typography>
        }
      </Box>

      {/* Description */}
      <Tooltip title={entry.description || ""} placement="top">
        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.description || "—"}
        </Typography>
      </Tooltip>

      {/* Hours */}
      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--accent-gold)", textAlign: "center" }}>
        {fmtHours(entry.hours)}
      </Typography>

      {/* Rate */}
      <Typography sx={{ fontSize: "0.73rem", color: "var(--text-muted)", textAlign: "right" }}>
        {fmtKES(entry.rate)}
      </Typography>

      {/* Amount */}
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, textAlign: "right", color: entry.is_billable ? "var(--text-primary)" : "var(--text-muted)" }}>
        {entry.is_billable ? fmtKES(amount) : "—"}
      </Typography>

      {/* Billable badge */}
      <Box sx={{ textAlign: "center" }}>
        <Chip label={entry.is_billable ? "Billable" : "Internal"} size="small" sx={{
          fontSize: "0.6rem", height: 18,
          background: entry.is_billable ? "rgba(46,204,113,0.12)" : "rgba(142,150,165,0.12)",
          color: entry.is_billable ? "#2ECC71" : "#8B9BB4", border: "none",
        }} />
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, justifyContent: "flex-end" }}>
        {entry.is_billable && !entry.is_billed && (
          <Tooltip title="Mark as Billed">
            <IconButton size="small" onClick={handleMarkBilled} disabled={marking}
              sx={{ color: "#F39C12", "&:hover": { color: "#D4A843", background: "rgba(212,168,67,0.1)" } }}>
              {marking ? <CircularProgress size={12} /> : <CheckCircleIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </Tooltip>
        )}
        {entry.is_billed && (
          <Chip label="Billed" size="small" sx={{ fontSize: "0.58rem", height: 17, background: "rgba(46,204,113,0.12)", color: "#2ECC71", border: "none" }} />
        )}
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(entry)} sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--accent-gold)" } }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(entry)} sx={{ color: "var(--text-muted)", "&:hover": { color: "#E74C3C" } }}>
            <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DATE_RANGES = ["All Time", "This Week", "This Month", "Last Month"];

function dateRangeFilter(entries, range) {
  if (range === "All Time") return entries;
  const now = new Date();
  return entries.filter((e) => {
    const d = new Date(e.date);
    if (range === "This Week") {
      const dow = now.getDay();
      const start = new Date(now); start.setDate(now.getDate() - dow); start.setHours(0,0,0,0);
      return d >= start;
    }
    if (range === "This Month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (range === "Last Month") {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lme = new Date(now.getFullYear(), now.getMonth(), 0);
      return d >= lm && d <= lme;
    }
    return true;
  });
}

export default function TimeTracking() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billableFilter, setBillableFilter] = useState("All");
  const [dateRange, setDateRange] = useState("This Month");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setEntries(await api.time.list()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (entry, isEdit) => {
    setEntries((prev) => isEdit ? prev.map((e) => e.id === entry.id ? entry : e) : [entry, ...prev]);
  };

  const handleDeleted = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const handleMarkBilled = async (entry) => {
    const updated = await api.time.update(entry.id, { is_billed: true });
    setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, is_billed: true } : e));
  };

  // Filter chain
  const afterDate = useMemo(() => dateRangeFilter(entries, dateRange), [entries, dateRange]);
  const filtered = useMemo(() => {
    if (billableFilter === "Billable")    return afterDate.filter((e) => e.is_billable);
    if (billableFilter === "Unbilled")    return afterDate.filter((e) => e.is_billable && !e.is_billed);
    if (billableFilter === "Non-Billable") return afterDate.filter((e) => !e.is_billable);
    if (billableFilter === "Billed")      return afterDate.filter((e) => e.is_billed);
    return afterDate;
  }, [afterDate, billableFilter]);

  // Stats from date-filtered (not billable-filtered)
  const stats = useMemo(() => {
    const totalHours   = afterDate.reduce((s, e) => s + e.hours, 0);
    const billableHours = afterDate.filter((e) => e.is_billable).reduce((s, e) => s + e.hours, 0);
    const billedHours  = afterDate.filter((e) => e.is_billed).reduce((s, e) => s + e.hours, 0);
    const unbilledVal  = afterDate.filter((e) => e.is_billable && !e.is_billed).reduce((s, e) => s + (e.amount || e.hours * e.rate), 0);
    const billPct = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;
    return { totalHours, billableHours, billedHours, unbilledVal, billPct };
  }, [afterDate]);

  return (
    <Layout title="Time Tracking">
      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <StatCard label="Total Hours" value={fmtHours(stats.totalHours)} sub={`${afterDate.length} entries`} Icon={AccessTimeIcon} />
        <StatCard label="Billable Hours" value={fmtHours(stats.billableHours)} sub={`${stats.billPct}% of total`} color="#4A90D9" Icon={AttachMoneyIcon} />
        <StatCard label="Unbilled Value" value={fmtKESc(stats.unbilledVal)} sub="Ready to invoice" color="#F39C12" Icon={ReceiptIcon} />
        <StatCard label="Billed Hours" value={fmtHours(stats.billedHours)} sub="Already invoiced" color="#2ECC71" Icon={CheckCircleIcon} />
      </Box>

      {/* Staff strip */}
      <StaffStrip entries={afterDate} />

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.75, flexWrap: "wrap" }}>
        {/* Date range */}
        <Box sx={{ display: "flex", gap: 0.5, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", p: 0.4 }}>
          {DATE_RANGES.map((r) => (
            <Box key={r} onClick={() => setDateRange(r)} sx={{
              px: 1.25, py: 0.4, borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem",
              background: dateRange === r ? "rgba(212,168,67,0.15)" : "transparent",
              color: dateRange === r ? "var(--accent-gold)" : "var(--text-secondary)",
              fontWeight: dateRange === r ? 600 : 400, transition: "all 0.15s",
              "&:hover": { background: "rgba(212,168,67,0.08)" },
            }}>{r}</Box>
          ))}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, borderColor: "var(--border)" }} />

        {/* Billable filter */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {["All", "Billable", "Unbilled", "Billed", "Non-Billable"].map((f) => (
            <Chip key={f} label={f} size="small" onClick={() => setBillableFilter(f)} sx={{
              fontSize: "0.7rem", cursor: "pointer", height: 24,
              background: billableFilter === f ? "rgba(212,168,67,0.15)" : "var(--bg-card)",
              color: billableFilter === f ? "var(--accent-gold)" : "var(--text-secondary)",
              border: billableFilter === f ? "1px solid var(--accent-gold)" : "1px solid var(--border)",
            }} />
          ))}
        </Box>

        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", fontWeight: 600, "&:hover": { background: "var(--accent-gold-dim)" } }}>
          Log Time
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "100px 140px 180px 1fr 80px 100px 110px 90px 100px",
          alignItems: "center", gap: 1, px: 2, py: 1.1,
          background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)",
        }}>
          {["Date", "Lawyer", "Case / Client", "Description", "Hours", "Rate", "Amount", "Type", "Actions"].map((h) => (
            <Typography key={h} sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
              textAlign: ["Hours","Rate","Amount"].includes(h) ? "right" : ["Type","Actions"].includes(h) ? "center" : "left" }}>
              {h}
            </Typography>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress size={28} sx={{ color: "var(--accent-gold)" }} /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AccessTimeIcon sx={{ fontSize: 40, opacity: 0.15, mb: 1.5 }} />
            <Typography sx={{ fontSize: "0.9rem", color: "var(--text-muted)", mb: 0.5 }}>No time entries found</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", mb: 2 }}>
              {billableFilter !== "All" ? `No "${billableFilter}" entries in this period` : "Start logging time for your cases"}
            </Typography>
            <Button size="small" variant="contained" onClick={() => { setEditTarget(null); setFormOpen(true); }}
              sx={{ background: "var(--accent-gold)", color: "#000", fontSize: "0.78rem" }}>
              Log First Entry
            </Button>
          </Box>
        ) : (
          filtered.map((entry, i) => (
            <EntryRow key={entry.id} entry={entry} index={i}
              onEdit={(e) => { setEditTarget(e); setFormOpen(true); }}
              onDelete={setDeleteTarget}
              onMarkBilled={handleMarkBilled} />
          ))
        )}

        {/* Footer totals */}
        {filtered.length > 0 && (
          <Box sx={{
            display: "grid", gridTemplateColumns: "100px 140px 180px 1fr 80px 100px 110px 90px 100px",
            alignItems: "center", gap: 1, px: 2, py: 1.25,
            background: "var(--bg-elevated)", borderTop: "1px solid var(--border)",
          }}>
            <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, gridColumn: "1/4" }}>TOTALS</Typography>
            <Box /> {/* description spacer */}
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-gold)", textAlign: "center" }}>
              {fmtHours(filtered.reduce((s, e) => s + e.hours, 0))}
            </Typography>
            <Box />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, textAlign: "right" }}>
              {fmtKES(filtered.filter((e) => e.is_billable).reduce((s, e) => s + (e.amount || e.hours * e.rate), 0))}
            </Typography>
            <Box /><Box />
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      <LogTimeDialog open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={handleSaved} editEntry={editTarget} />

      {deleteTarget && (
        <DeleteDialog entry={deleteTarget} open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
    </Layout>
  );
}
