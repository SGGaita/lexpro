import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Button, Chip, TextField, InputAdornment,
  Avatar, Divider, Tooltip, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem,
} from "@mui/material";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShieldIcon from "@mui/icons-material/Shield";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import LockIcon from "@mui/icons-material/Lock";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ["Admin", "Senior Partner", "Partner", "Associate", "Junior Associate", "Paralegal"];
const STATUSES = ["Active", "Inactive", "On Leave"];

const ROLE_COLOR = {
  "Admin":           "#E74C3C",
  "Senior Partner":  "#D4A843",
  "Partner":         "#F39C12",
  "Associate":       "#4A90D9",
  "Junior Associate":"#2ECC71",
  "Paralegal":       "#9B59B6",
};
const AVATAR_BG = ["#D4A843","#4A90D9","#2ECC71","#E74C3C","#9B59B6","#F39C12","#1ABC9C","#E67E22"];

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

const fmtKES = (n) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n || 0);

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "var(--accent-gold)", Icon }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2, flex: 1, minWidth: 120, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: -14, right: -14, width: 60, height: 60, borderRadius: "50%", background: `${color}18` }} />
      <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {Icon && <Icon sx={{ fontSize: 16, color, opacity: 0.7 }} />}
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</Typography>
      </Box>
    </Box>
  );
}

// ─── Specialty Tag Input ──────────────────────────────────────────────────────

function SpecialtyInput({ tags, onChange }) {
  const [inputVal, setInputVal] = useState("");

  const addTag = (val) => {
    const trimmed = val.trim().replace(/,+$/, "").trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInputVal("");
  };

  const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));

  const handleKeyDown = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === "Backspace" && !inputVal && tags.length) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => { if (inputVal.trim()) addTag(inputVal); };

  return (
    <Box sx={{
      ...inputSx["& .MuiOutlinedInput-root"],
      border: "1px solid var(--border)", borderRadius: "8px",
      background: "var(--bg-elevated)", px: 1.25, pt: 0.75, pb: 0.5,
      cursor: "text", transition: "border-color 0.2s",
      "&:focus-within": { borderColor: "var(--accent-gold)" },
      "&:hover": { borderColor: "var(--accent-gold-dim)" },
    }}>
      <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", mb: 0.5, letterSpacing: "0.03em" }}>
        Specialties
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: tags.length ? 0.75 : 0 }}>
        {tags.map((t, i) => (
          <Chip key={i} label={t} size="small" onDelete={() => removeTag(i)}
            deleteIcon={<CloseIcon sx={{ fontSize: "11px !important" }} />}
            sx={{
              fontSize: "0.7rem", height: 22,
              background: "rgba(212,168,67,0.12)", color: "var(--accent-gold)",
              border: "1px solid rgba(212,168,67,0.25)",
              "& .MuiChip-deleteIcon": { color: "rgba(212,168,67,0.6)", "&:hover": { color: "var(--accent-gold)" } },
            }} />
        ))}
      </Box>
      <input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length ? "Add another…" : "e.g. Commercial Litigation, Family Law…"}
        style={{
          background: "transparent", border: "none", outline: "none",
          color: "var(--text-primary)", fontSize: "0.85rem",
          width: "100%", padding: "2px 0 4px",
          fontFamily: "inherit",
        }}
      />
      <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", mt: 0.25 }}>
        Press Enter or comma to add · Backspace to remove last
      </Typography>
    </Box>
  );
}

// ─── Staff Form Dialog ────────────────────────────────────────────────────────

const BLANK = { name: "", email: "", password: "", phone: "", role: "Associate", billable_rate: "10000", status: "Active" };

function StaffFormDialog({ open, onClose, onSaved, editMember }) {
  const [form, setForm] = useState(BLANK);
  const [specialties, setSpecialties] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowPassword(false);
    if (editMember) {
      setForm({
        name: editMember.name || "",
        email: editMember.email || "",
        password: "",
        phone: editMember.phone || "",
        role: editMember.role || "Associate",
        billable_rate: String(editMember.billable_rate || 10000),
        status: editMember.status || "Active",
      });
      // Parse comma-separated specialties into array
      const sp = editMember.specialty
        ? editMember.specialty.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      setSpecialties(sp);
    } else {
      setForm(BLANK);
      setSpecialties([]);
    }
    setError("");
  }, [open, editMember]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const rc = ROLE_COLOR[form.role] || "#8B9BB4";
  const initials = form.name ? form.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const avatarBg = AVATAR_BG[ROLES.indexOf(form.role) % AVATAR_BG.length];

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Full name is required."); return; }
    if (!form.email.trim()) { setError("Email address is required."); return; }
    if (!editMember && !form.password.trim()) { setError("Password is required for new staff."); return; }
    setSaving(true); setError("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      specialty: specialties.length ? specialties.join(", ") : null,
      billable_rate: parseFloat(form.billable_rate) || 10000,
      status: form.status,
    };
    if (!editMember) payload.password = form.password;
    if (editMember && form.password.trim()) payload.password = form.password;

    try {
      const saved = editMember
        ? await api.staff.update(editMember.id, payload)
        : await api.staff.create(payload);
      onSaved(saved, !!editMember);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", overflow: "hidden" } }}>

      {/* Header band */}
      <Box sx={{ background: `linear-gradient(135deg, ${avatarBg}22 0%, transparent 60%)`, borderBottom: "1px solid var(--border)", px: 3, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Live avatar preview */}
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 56, height: 56, background: avatarBg, fontSize: "1.1rem", fontWeight: 700, color: "#0A0F1A", borderRadius: "14px", border: "2px solid var(--border)", transition: "background 0.3s" }}>
              {initials}
            </Avatar>
            <Box sx={{ position: "absolute", bottom: -3, right: -3, background: `${rc}20`, border: `1.5px solid ${rc}`, borderRadius: "6px", px: 0.5, py: 0.1 }}>
              <Typography sx={{ fontSize: "0.5rem", color: rc, fontWeight: 700, whiteSpace: "nowrap" }}>{form.role.split(" ")[0].toUpperCase()}</Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {editMember ? "Edit Staff Member" : "Add Staff Member"}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 0.2 }}>
              {editMember ? `Editing ${editMember.name}` : "Fill in the details below to add a new team member"}
            </Typography>
          </Box>

          <IconButton onClick={onClose} size="small" sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--text-primary)" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.8rem", borderRadius: "8px" }} onClose={() => setError("")}>{error}</Alert>}

        {/* Section: Identity */}
        <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, mb: 1.25 }}>
          Identity
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2.5 }}>
          <TextField label="Full Name *" size="small" fullWidth value={form.name}
            onChange={(e) => set("name", e.target.value)} sx={inputSx}
            placeholder="e.g. Jane Wanjiku Kamau" />
          <TextField label="Email Address *" size="small" fullWidth type="email" value={form.email}
            onChange={(e) => set("email", e.target.value)} sx={inputSx}
            placeholder="e.g. jane@firm.co.ke" />
          <TextField label="Phone Number" size="small" fullWidth value={form.phone}
            onChange={(e) => set("phone", e.target.value)} sx={inputSx}
            placeholder="+254 7XX XXX XXX" />
          <TextField label={editMember ? "New Password (leave blank to keep)" : "Password *"} size="small" fullWidth
            type={showPassword ? "text" : "password"} value={form.password}
            onChange={(e) => set("password", e.target.value)} sx={inputSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((p) => !p)} sx={{ color: "var(--text-muted)" }}>
                    <Typography sx={{ fontSize: "0.6rem" }}>{showPassword ? "HIDE" : "SHOW"}</Typography>
                  </IconButton>
                </InputAdornment>
              ),
            }} />
        </Box>

        {/* Section: Role & Status */}
        <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, mb: 1.25 }}>
          Role & Status
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 2.5 }}>
          <TextField label="Role" size="small" fullWidth select value={form.role}
            onChange={(e) => set("role", e.target.value)} sx={inputSx}
            SelectProps={{ MenuProps: { disablePortal: true } }}>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: "0.82rem" }}>{r}</MenuItem>
            ))}
          </TextField>
          <TextField label="Status" size="small" fullWidth select value={form.status}
            onChange={(e) => set("status", e.target.value)} sx={inputSx}
            SelectProps={{ MenuProps: { disablePortal: true } }}>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField label="Billable Rate (KES/hr)" size="small" fullWidth type="number"
            value={form.billable_rate} onChange={(e) => set("billable_rate", e.target.value)}
            sx={inputSx} inputProps={{ min: 0, step: 500 }} />
        </Box>

        {/* Section: Specialties */}
        <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, mb: 1.25 }}>
          Practice Areas / Specialties
        </Typography>
        <SpecialtyInput tags={specialties} onChange={setSpecialties} />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid var(--border)", gap: 1 }}>
        <Button onClick={onClose} sx={{ fontSize: "0.8rem", color: "var(--text-muted)", "&:hover": { color: "var(--text-primary)" } }}>
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={handleSubmit} disabled={saving}
          startIcon={saving ? <CircularProgress size={13} color="inherit" /> : null}
          sx={{ fontSize: "0.82rem", px: 3, background: "var(--accent-gold)", color: "#000", borderRadius: "8px", fontWeight: 600, "&:hover": { background: "var(--accent-gold-dim)" } }}>
          {saving ? "Saving…" : editMember ? "Save Changes" : "Add Team Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ member, open, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      await api.staff.delete(member.id);
      onDeleted(member.id);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to delete.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Remove Staff Member</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.8rem" }}>{error}</Alert>}
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Remove <strong>{member?.name}</strong> from this firm? Their cases will be unassigned but not deleted.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cancel</Button>
        <Button variant="contained" onClick={handleDelete} disabled={loading}
          sx={{ fontSize: "0.8rem", background: "#E74C3C", color: "#fff", "&:hover": { background: "#c0392b" } }}>
          {loading ? "Removing…" : "Remove"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────

function MemberRow({ member, index, selected, onClick, onEdit, onDelete, onSetDefault, staffCount }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const isSelected = selected?.id === member.id;
  const rc = ROLE_COLOR[member.role] || "#8B9BB4";
  const initials = member.name?.substring(0, 2).toUpperCase() || "??";
  const bgColor = AVATAR_BG[index % AVATAR_BG.length];

  const canDelete = !member.is_default_admin && !(member.role === "Admin" && staffCount.admins <= 1);
  const deleteTooltip = member.is_default_admin
    ? "Default admin cannot be deleted — set another admin as default first"
    : member.role === "Admin" && staffCount.admins <= 1
    ? "Cannot remove the only admin account"
    : "Remove member";

  const canSetDefault = member.role === "Admin" && !member.is_default_admin;

  return (
    <Box onClick={onClick} sx={{
      display: "flex", alignItems: "center", gap: 2,
      px: 2, py: 1.5, cursor: "pointer",
      background: isSelected ? "rgba(212,168,67,0.07)" : "transparent",
      borderLeft: `2px solid ${isSelected ? "var(--accent-gold)" : "transparent"}`,
      borderBottom: "1px solid var(--border)",
      transition: "all 0.15s",
      "&:hover": { background: isSelected ? "rgba(212,168,67,0.07)" : "var(--bg-elevated)" },
    }}>
      {/* Avatar */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Avatar sx={{ width: 36, height: 36, background: bgColor, fontSize: "0.75rem", fontWeight: 700, color: "#0A0F1A", borderRadius: "10px" }}>
          {member.avatar || initials}
        </Avatar>
        {member.is_default_admin && (
          <Box sx={{ position: "absolute", bottom: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#D4A843", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--bg-card)" }}>
            <StarIcon sx={{ fontSize: 8, color: "#000" }} />
          </Box>
        )}
      </Box>

      {/* Name + email */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name}</Typography>
          {member.is_default_admin && (
            <Chip label="Default Admin" size="small" icon={<ShieldIcon sx={{ fontSize: "10px !important" }} />}
              sx={{ fontSize: "0.58rem", height: 17, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", border: "none", "& .MuiChip-icon": { color: "var(--accent-gold)" } }} />
          )}
        </Box>
        <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.email}</Typography>
      </Box>

      {/* Role */}
      <Box sx={{ width: 130, flexShrink: 0, display: { xs: "none", md: "block" } }}>
        <Chip label={member.role} size="small" sx={{ fontSize: "0.65rem", height: 20, background: `${rc}15`, color: rc, border: "none" }} />
      </Box>

      {/* Specialty */}
      <Box sx={{ width: 150, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {member.specialty || "—"}
        </Typography>
      </Box>

      {/* Rate */}
      <Box sx={{ width: 110, flexShrink: 0, display: { xs: "none", md: "block" } }}>
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
          {fmtKES(member.billable_rate)}<span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 400 }}>/hr</span>
        </Typography>
      </Box>

      {/* Status */}
      <Box sx={{ width: 70, flexShrink: 0, display: { xs: "none", sm: "block" } }}>
        <Chip label={member.status} size="small" sx={{
          fontSize: "0.62rem", height: 18,
          background: member.status === "Active" ? "rgba(46,204,113,0.12)" : member.status === "On Leave" ? "rgba(243,156,18,0.12)" : "rgba(142,150,165,0.12)",
          color: member.status === "Active" ? "#2ECC71" : member.status === "On Leave" ? "#F39C12" : "#8B9BB4",
          border: "none",
        }} />
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 0.25, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(member)} sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--accent-gold)" } }}>
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={deleteTooltip}>
          <span>
            <IconButton size="small" onClick={() => canDelete && onDelete(member)} disabled={!canDelete}
              sx={{ color: canDelete ? "var(--text-muted)" : "var(--text-muted)", opacity: canDelete ? 1 : 0.35, "&:hover": canDelete ? { color: "#E74C3C" } : {} }}>
              {member.is_default_admin ? <LockIcon sx={{ fontSize: 14 }} /> : <DeleteOutlinedIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </span>
        </Tooltip>
        {canSetDefault && (
          <Tooltip title="Set as Default Admin">
            <IconButton size="small" onClick={() => onSetDefault(member)} sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--accent-gold)" } }}>
              <StarIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ member, index, onEdit, onDelete, onSetDefault, onClose, staffCount }) {
  if (!member) return null;
  const rc = ROLE_COLOR[member.role] || "#8B9BB4";
  const bgColor = AVATAR_BG[index % AVATAR_BG.length];
  const initials = member.name?.substring(0, 2).toUpperCase() || "??";
  const canDelete = !member.is_default_admin && !(member.role === "Admin" && staffCount.admins <= 1);
  const canSetDefault = member.role === "Admin" && !member.is_default_admin;

  return (
    <Box sx={{ width: 300, flexShrink: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ background: `${bgColor}18`, px: 2.5, pt: 2.5, pb: 2, position: "relative" }}>
        <IconButton size="small" onClick={onClose} sx={{ position: "absolute", top: 10, right: 10, color: "var(--text-muted)" }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 52, height: 52, background: bgColor, fontSize: "1.1rem", fontWeight: 700, color: "#0A0F1A", borderRadius: "14px" }}>
              {member.avatar || initials}
            </Avatar>
            {member.is_default_admin && (
              <Box sx={{ position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#D4A843", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)" }}>
                <StarIcon sx={{ fontSize: 10, color: "#000" }} />
              </Box>
            )}
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>{member.name}</Typography>
            <Chip label={member.role} size="small" sx={{ fontSize: "0.65rem", height: 20, background: `${rc}20`, color: rc, border: "none" }} />
          </Box>
        </Box>
        {member.is_default_admin && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, background: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.25)", borderRadius: "8px", px: 1.5, py: 0.75 }}>
            <ShieldIcon sx={{ fontSize: 14, color: "var(--accent-gold)" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "var(--accent-gold)", fontWeight: 600 }}>Default Admin — Protected Account</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Contact */}
        <Box>
          <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>Contact</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmailIcon sx={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.email}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{member.phone || "—"}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "var(--border)" }} />

        {/* Details */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {[
            { label: "Specialty", value: member.specialty || "—", icon: WorkIcon },
            { label: "Status", value: member.status },
            { label: "Billable Rate", value: `${fmtKES(member.billable_rate)}/hr` },
            { label: "Joined", value: new Date(member.joined).toLocaleDateString("en-KE", { year: "numeric", month: "short" }), icon: CalendarTodayIcon },
          ].map(({ label, value }) => (
            <Box key={label}>
              <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.3 }}>{label}</Typography>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: "var(--border)" }} />

        {/* Actions */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button fullWidth variant="outlined" size="small" startIcon={<EditIcon sx={{ fontSize: 14 }} />} onClick={() => onEdit(member)}
            sx={{ fontSize: "0.78rem", borderColor: "var(--border)", color: "var(--text-secondary)", justifyContent: "flex-start", "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)" } }}>
            Edit Profile
          </Button>

          {canSetDefault && (
            <Button fullWidth variant="outlined" size="small" startIcon={<StarIcon sx={{ fontSize: 14, color: "var(--accent-gold)" }} />} onClick={() => onSetDefault(member)}
              sx={{ fontSize: "0.78rem", borderColor: "rgba(212,168,67,0.3)", color: "var(--accent-gold)", justifyContent: "flex-start", "&:hover": { borderColor: "var(--accent-gold)", background: "rgba(212,168,67,0.05)" } }}>
              Set as Default Admin
            </Button>
          )}

          {canDelete ? (
            <Button fullWidth variant="outlined" size="small" startIcon={<DeleteOutlinedIcon sx={{ fontSize: 14 }} />} onClick={() => onDelete(member)}
              sx={{ fontSize: "0.78rem", borderColor: "rgba(231,76,60,0.3)", color: "#E74C3C", justifyContent: "flex-start", "&:hover": { borderColor: "#E74C3C", background: "rgba(231,76,60,0.05)" } }}>
              Remove Member
            </Button>
          ) : (
            <Tooltip title={member.is_default_admin ? "Set another admin as default before removing" : "Promote another user to Admin first"}>
              <Box>
                <Button fullWidth variant="outlined" size="small" disabled startIcon={<LockIcon sx={{ fontSize: 14 }} />}
                  sx={{ fontSize: "0.78rem", justifyContent: "flex-start", opacity: 0.45 }}>
                  {member.is_default_admin ? "Protected Account" : "Cannot Remove Sole Admin"}
                </Button>
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [settingDefault, setSettingDefault] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.staff.list();
      setStaff(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const roles = useMemo(() => ["All", ...new Set(staff.map((s) => s.role))], [staff]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter((s) => {
      const matchRole = roleFilter === "All" || s.role === roleFilter;
      const matchSearch = !q || [s.name, s.email, s.specialty, s.role].some((v) => v?.toLowerCase().includes(q));
      return matchRole && matchSearch;
    });
  }, [staff, search, roleFilter]);

  // Stats
  const staffCount = useMemo(() => ({
    total: staff.length,
    active: staff.filter((s) => s.status === "Active").length,
    admins: staff.filter((s) => s.role === "Admin").length,
    billingCapacity: staff.filter((s) => s.status === "Active").reduce((sum, s) => sum + (s.billable_rate || 0), 0),
  }), [staff]);

  const handleSaved = (member, isEdit) => {
    setStaff((prev) => isEdit ? prev.map((s) => s.id === member.id ? member : s) : [member, ...prev]);
    if (isEdit && selected?.id === member.id) setSelected(member);
  };

  const handleDeleted = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleSetDefault = async (member) => {
    setSettingDefault(member.id);
    setActionError("");
    try {
      const updated = await api.staff.setDefaultAdmin(member.id);
      setStaff((prev) => prev.map((s) => s.id === updated.id ? updated : { ...s, is_default_admin: false }));
      if (selected?.id === updated.id) setSelected(updated);
    } catch (e) {
      setActionError(e.message || "Failed to set default admin.");
    } finally {
      setSettingDefault(null);
    }
  };

  const openAdd = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (m) => { setEditTarget(m); setFormOpen(true); };

  const selectedIndex = selected ? filtered.findIndex((s) => s.id === selected.id) : -1;

  return (
    <Layout title="Staff & Lawyers">
      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <StatCard label="Total Members" value={staffCount.total} Icon={GroupIcon} />
        <StatCard label="Active" value={staffCount.active} color="#2ECC71" Icon={CheckCircleIcon} />
        <StatCard label="Admins" value={staffCount.admins} color="#E74C3C" Icon={AdminPanelSettingsIcon} />
        <StatCard label="Billing Capacity/hr" value={fmtKES(staffCount.billingCapacity)} color="#4A90D9" Icon={WorkIcon} />
      </Box>

      {actionError && (
        <Alert severity="error" onClose={() => setActionError("")} sx={{ mb: 2, fontSize: "0.8rem" }}>{actionError}</Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <TextField size="small" placeholder="Search by name, email, role…" value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ ...inputSx, width: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} /></InputAdornment> }} />

        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {roles.map((r) => {
            const active = roleFilter === r;
            const c = ROLE_COLOR[r];
            return (
              <Chip key={r} label={r} size="small" onClick={() => setRoleFilter(r)} sx={{
                fontSize: "0.7rem", cursor: "pointer", height: 24,
                background: active ? (c ? `${c}15` : "rgba(212,168,67,0.15)") : "var(--bg-card)",
                color: active ? (c || "var(--accent-gold)") : "var(--text-secondary)",
                border: active ? `1px solid ${c || "var(--accent-gold)"}` : "1px solid var(--border)",
              }} />
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{filtered.length} member{filtered.length !== 1 ? "s" : ""}</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={openAdd}
          sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
          Add Staff
        </Button>
      </Box>

      {/* Table + Detail Panel */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {/* Table */}
        <Box sx={{ flex: 1, minWidth: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
          {/* Table header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.25, background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
            <Box sx={{ width: 36, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Name</Typography>
            </Box>
            <Box sx={{ width: 130, flexShrink: 0, display: { xs: "none", md: "block" } }}>
              <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Role</Typography>
            </Box>
            <Box sx={{ width: 150, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
              <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Specialty</Typography>
            </Box>
            <Box sx={{ width: 110, flexShrink: 0, display: { xs: "none", md: "block" } }}>
              <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Rate/hr</Typography>
            </Box>
            <Box sx={{ width: 70, flexShrink: 0, display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Status</Typography>
            </Box>
            <Box sx={{ width: 90, flexShrink: 0 }}>
              <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Actions</Typography>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress size={28} sx={{ color: "var(--accent-gold)" }} /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <GroupIcon sx={{ fontSize: 36, opacity: 0.15, mb: 1 }} />
              <Typography sx={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>No staff members found</Typography>
              <Button size="small" onClick={openAdd} sx={{ mt: 1.5, color: "var(--accent-gold)", fontSize: "0.78rem" }}>Add first member</Button>
            </Box>
          ) : (
            filtered.map((member, i) => (
              <MemberRow
                key={member.id}
                member={member}
                index={i}
                selected={selected}
                onClick={() => setSelected((prev) => prev?.id === member.id ? null : member)}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onSetDefault={handleSetDefault}
                staffCount={staffCount}
              />
            ))
          )}
        </Box>

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            member={selected}
            index={selectedIndex >= 0 ? selectedIndex : 0}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onSetDefault={handleSetDefault}
            onClose={() => setSelected(null)}
            staffCount={staffCount}
          />
        )}
      </Box>

      {/* Dialogs */}
      <StaffFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={handleSaved} editMember={editTarget} />

      {deleteTarget && (
        <DeleteDialog member={deleteTarget} open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
    </Layout>
  );
}
