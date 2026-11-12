import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Button, Avatar, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, CircularProgress, Alert, Tooltip, Divider,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  LinearProgress,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import api from "../../lib/api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";
import ShieldIcon from "@mui/icons-material/Shield";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// ─── Constants ────────────────────────────────────────────────────────────────

const CASE_TYPES = [
  "Civil Litigation","Criminal Defense","Commercial Dispute","Family Law",
  "Constitutional Law","Employment & Labour","Debt Recovery","Land & Property",
  "Intellectual Property","Immigration","Tax Dispute","Probate & Succession",
  "Judicial Review","Arbitration & Mediation","Banking & Finance",
  "Corporate Advisory","Insurance Dispute","Environmental Law","Other",
];

const COURTS = [
  "Supreme Court of Kenya","Court of Appeal — Nairobi","High Court — Nairobi",
  "High Court — Mombasa","High Court — Kisumu","High Court — Nakuru",
  "Employment & Labour Relations Court","Environment & Land Court — Nairobi",
  "Milimani Commercial Courts","Milimani Law Courts","Chief Magistrates Court — Nairobi",
  "Mombasa Law Courts","Kisumu Law Courts","Nakuru Law Courts",
  "International Arbitration Centre","Nairobi Centre for International Arbitration","Other",
];

const PRIORITY_COLOR = { Critical: "#E74C3C", High: "#F39C12", Medium: "#4A90D9", Low: "#2ECC71" };
const STATUS_COLOR   = { Active: "#2ECC71", Pending: "#F39C12", Closed: "#8B9BB4" };

const DOC_TYPE_COLORS = {
  "Court Filing": "#E74C3C", "Contract": "#4A90D9", "Correspondence": "var(--accent-gold)",
  "Evidence": "#8E44AD", "Invoice": "#2ECC71", "Other": "#95a5a6",
};
const DOC_TYPES = ["Court Filing", "Contract", "Correspondence", "Evidence", "Invoice", "Other"];

const fmt = (n) => new Intl.NumberFormat("en-KE", {
  style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1,
}).format(n || 0);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—";

function toLocalDT(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const freeSolo = createFilterOptions();

const EMPTY_FORM = {
  title: "", case_no: "", type: "", court: "",
  client_id: "", assigned_user_id: "",
  status: "Active", priority: "Medium",
  fee: "", description: "", next_hearing: "", outcome: "",
  opposing_party: "", opposing_counsel: "",
};

// ─── File icon ────────────────────────────────────────────────────────────────

function FileIcon({ name, sx }) {
  const ext = (name || "").split(".").pop().toLowerCase();
  if (ext === "pdf") return <PictureAsPdfIcon sx={{ color: "#E74C3C", ...sx }} />;
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return <ImageIcon sx={{ color: "#4A90D9", ...sx }} />;
  if (["doc","docx"].includes(ext)) return <ArticleIcon sx={{ color: "#2B5CE6", ...sx }} />;
  return <InsertDriveFileIcon sx={{ color: "var(--text-muted)", ...sx }} />;
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon }) {
  if (!value || value === "—") return null;
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

// ─── Documents Panel ──────────────────────────────────────────────────────────

function CaseDocuments({ caseId, docs, onRefresh }) {
  const fileInputRef  = useRef(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [docType,   setDocType]   = useState("Court Filing");

  const handleFiles = useCallback(async (files) => {
    if (!files?.length) return;
    setUploading(true); setUploadErr(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("case_id", caseId);
        fd.append("doc_type", docType);
        await api.documents.upload(fd);
      }
      onRefresh();
    } catch (e) { setUploadErr(e.message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }, [caseId, docType, onRefresh]);

  const handleDelete = async (doc) => {
    setDeleting(doc.id);
    try { await api.documents.delete(doc.id); onRefresh(); }
    catch (_) {}
    finally { setDeleting(null); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}>
        <Select size="small" value={docType} onChange={(e) => setDocType(e.target.value)}
          sx={{ fontSize: "0.82rem", flex: 1 }}>
          {DOC_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t}</MenuItem>)}
        </Select>
        <Button size="small" variant="outlined" startIcon={<UploadFileIcon sx={{ fontSize: 15 }} />}
          onClick={() => fileInputRef.current?.click()} disabled={uploading}
          sx={{ textTransform: "none", fontSize: "0.8rem", borderColor: "var(--border)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
          Choose File
        </Button>
        <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </Box>

      <Box
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragOver ? "var(--accent-gold)" : "var(--border)"}`,
          borderRadius: "12px", p: 3, textAlign: "center", cursor: "pointer",
          background: dragOver ? "rgba(212,168,67,0.04)" : "var(--bg-elevated)",
          transition: "all 0.15s", mb: 2,
          "&:hover": { borderColor: "var(--accent-gold)", background: "rgba(212,168,67,0.03)" },
        }}>
        {uploading ? (
          <Box>
            <LinearProgress sx={{ mb: 1.5, borderRadius: 4 }} />
            <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Uploading…</Typography>
          </Box>
        ) : (
          <>
            <UploadFileIcon sx={{ fontSize: 28, color: "var(--text-muted)", mb: 1 }} />
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Drop files here or click to browse</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", mt: 0.4 }}>PDF, DOCX, XLSX, images — any format</Typography>
          </>
        )}
      </Box>

      {uploadErr && (
        <Alert severity="error" onClose={() => setUploadErr(null)} sx={{ mb: 2, fontSize: "0.8rem" }}>{uploadErr}</Alert>
      )}

      {docs.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <InsertDriveFileIcon sx={{ fontSize: 32, color: "var(--text-muted)", mb: 1 }} />
          <Typography sx={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No files uploaded yet</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {docs.map((doc) => {
            const typeColor = DOC_TYPE_COLORS[doc.type] || "#95a5a6";
            return (
              <Box key={doc.id} sx={{
                display: "flex", alignItems: "center", gap: 1.5, p: "10px 14px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "10px", "&:hover": { borderColor: "rgba(212,168,67,0.3)" }, transition: "border-color 0.15s",
              }}>
                <FileIcon name={doc.name} sx={{ fontSize: 22, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.3 }}>
                    <Chip label={doc.type} size="small" sx={{ fontSize: "0.6rem", height: 18, border: "none", background: `${typeColor}18`, color: typeColor }} />
                    {doc.size && <Typography sx={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>{doc.size}</Typography>}
                    <Typography sx={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                      {new Date(doc.uploaded_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Tooltip title="Download">
                    <IconButton size="small" onClick={() => api.documents.download(doc.id, doc.name)}>
                      <DownloadIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(doc)} disabled={deleting === doc.id}>
                      {deleting === doc.id
                        ? <CircularProgress size={14} />
                        : <DeleteOutlinedIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} />
                      }
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// ─── Edit Case Dialog ─────────────────────────────────────────────────────────

function EditDialog({ open, onClose, kase, clients, staff, onSaved }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [linkedClient, setLinkedClient] = useState(null);
  const [linkedStaff,  setLinkedStaff]  = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [conflicts, setConflicts] = useState(null);

  useMemo(() => {
    if (open && kase) {
      setForm({
        title: kase.title || "", case_no: kase.case_no || "",
        type: kase.type || "", court: kase.court || "",
        client_id: kase.client_id || "", assigned_user_id: kase.assigned_user_id || "",
        status: kase.status || "Active", priority: kase.priority || "Medium",
        fee: kase.fee || "", description: kase.description || "",
        next_hearing: toLocalDT(kase.next_hearing), outcome: kase.outcome || "",
        opposing_party: kase.opposing_party || "", opposing_counsel: kase.opposing_counsel || "",
      });
      setLinkedClient(kase.client_id ? clients.find((c) => c.id === kase.client_id) || null : null);
      setLinkedStaff(kase.assigned_user_id ? staff.find((s) => s.id === kase.assigned_user_id) || null : null);
      setError(null); setConflicts(null);
    }
  }, [open, kase, clients, staff]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const buildPayload = () => ({
    title: form.title.trim(), case_no: form.case_no || null,
    type: form.type || null, court: form.court || null,
    client_id: form.client_id || null, assigned_user_id: form.assigned_user_id || null,
    status: form.status, priority: form.priority,
    fee: parseFloat(form.fee) || 0, description: form.description || null,
    next_hearing: form.next_hearing ? new Date(form.next_hearing).toISOString() : null,
    outcome: form.outcome || null, opposing_party: form.opposing_party || null,
    opposing_counsel: form.opposing_counsel || null,
  });

  const handleSave = async (override = false) => {
    if (!form.title.trim()) { setError("Case title is required."); return; }
    if (!override && (form.opposing_party || form.client_id)) {
      setLoading(true);
      try {
        const result = await api.conflictCheck({
          client_id: form.client_id || null, opposing_party: form.opposing_party || null,
          assigned_user_id: form.assigned_user_id || null, case_id: kase.id,
        });
        if (result.has_conflicts) { setConflicts(result.conflicts); setLoading(false); return; }
      } catch (_) {}
      finally { setLoading(false); }
    }
    setLoading(true);
    try {
      await api.cases.update(kase.id, buildPayload());
      setConflicts(null); onSaved(); onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700 }}>Edit Case</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--border)" }} />
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.78rem" }}>{error}</Alert>}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <TextField label="Case Title *" fullWidth size="small" value={form.title} onChange={set("title")} autoFocus />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Case Number" size="small" sx={{ flex: 1 }} value={form.case_no} onChange={set("case_no")} />
            <Autocomplete freeSolo size="small" sx={{ flex: 1 }} options={CASE_TYPES}
              value={form.type || null} onInputChange={(_, val) => setForm((f) => ({ ...f, type: val }))}
              onChange={(_, val) => setForm((f) => ({ ...f, type: val || "" }))}
              renderInput={(params) => <TextField {...params} label="Practice Area" />} />
          </Box>
          <Autocomplete freeSolo size="small" fullWidth options={COURTS}
            value={form.court || null} onInputChange={(_, val) => setForm((f) => ({ ...f, court: val }))}
            onChange={(_, val) => setForm((f) => ({ ...f, court: val || "" }))}
            renderInput={(params) => <TextField {...params} label="Court / Tribunal" />} />
          <TextField label="Description / Notes" fullWidth size="small" multiline rows={3}
            value={form.description} onChange={set("description")} />
          {form.status === "Closed" && (
            <TextField label="Case Outcome" fullWidth size="small" multiline rows={3}
              value={form.outcome} onChange={set("outcome")} />
          )}
        </Box>
        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
          Opposing Party
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField label="Opposing Party Name" fullWidth size="small"
            value={form.opposing_party} onChange={set("opposing_party")} />
          <TextField label="Opposing Counsel" fullWidth size="small"
            value={form.opposing_counsel} onChange={set("opposing_counsel")} />
        </Box>
        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
          Status & Schedule
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={form.status} onChange={set("status")}>
              {["Active","Pending","Closed"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={form.priority} onChange={set("priority")}>
              {["Critical","High","Medium","Low"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Legal Fee (KES)" size="small" sx={{ flex: 1, minWidth: 120 }}
            value={form.fee} onChange={set("fee")} type="number" />
          <TextField label="Next Hearing" size="small" sx={{ flex: 1, minWidth: 180 }}
            type="datetime-local" value={form.next_hearing} onChange={set("next_hearing")}
            InputLabelProps={{ shrink: true }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "var(--text-secondary)", textTransform: "none" }}>Cancel</Button>
        <Button variant="contained" onClick={() => handleSave(false)} disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, minWidth: 120 }}>
          {loading ? <CircularProgress size={16} sx={{ color: "#0A0F1A" }} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Conflict warning dialog */}
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
        {(conflicts || []).map((c, i) => {
          const sc = c.severity === "high" ? "#E74C3C" : "#F39C12";
          return (
            <Box key={i} sx={{ p: 1.5, borderRadius: "10px", mb: 1.5, background: `${sc}08`, border: `1px solid ${sc}25`, borderLeft: `3px solid ${sc}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <Chip label={c.severity === "high" ? "HIGH" : "MEDIUM"} size="small"
                  sx={{ fontSize: "0.55rem", height: 16, background: `${sc}18`, color: sc, border: "none", fontWeight: 700 }} />
                <Typography sx={{ fontSize: "0.76rem", fontWeight: 700 }}>{c.title}</Typography>
              </Box>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.detail}</Typography>
            </Box>
          );
        })}
        <Alert severity="warning" sx={{ mt: 1, fontSize: "0.72rem" }}>
          Proceeding despite a conflict requires partner or admin sign-off.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={() => setConflicts(null)} sx={{ color: "var(--text-secondary)", textTransform: "none" }}>Go Back</Button>
        <Button variant="contained" onClick={() => { setConflicts(null); handleSave(true); }}
          sx={{ textTransform: "none", fontWeight: 600, background: "#E74C3C", "&:hover": { background: "#c0392b" } }}>
          Override & Proceed
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ open, onClose, kase, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    try { await api.cases.delete(kase.id); onDeleted(); onClose(); }
    catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700 }}>Delete Case</Typography>
      </DialogTitle>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CaseDetail() {
  const router = useRouter();
  const { id }  = router.query;
  const { tenantData, refreshAll } = useApp();

  const [tab,        setTab]        = useState(0);
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const cases     = tenantData.cases     || [];
  const clients   = tenantData.clients   || [];
  const staff     = tenantData.staff     || [];
  const documents = tenantData.documents || [];

  const kase     = cases.find((c) => c.id === id) || null;
  const caseDocs = documents.filter((d) => d.case_id === id);

  const isLoading = id && tenantData.cases === undefined;

  const pColor = PRIORITY_COLOR[kase?.priority] || "#4A90D9";
  const sColor = STATUS_COLOR[kase?.status]     || "#8B9BB4";

  const handleSaved  = () => refreshAll();
  const handleDeleted = () => { refreshAll(); router.push("/cases"); };

  if (isLoading) {
    return (
      <Layout title="Case">
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress /></Box>
      </Layout>
    );
  }

  if (!isLoading && !kase && tenantData.cases) {
    return (
      <Layout title="Not Found">
        <Box sx={{ textAlign: "center", pt: 10 }}>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 600, mb: 1 }}>Case not found</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/cases")} sx={{ textTransform: "none" }}>Back to Cases</Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={kase?.title || "Case"}>

      {/* ── Breadcrumb ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />} onClick={() => router.push("/cases")}
          sx={{ textTransform: "none", fontSize: "0.82rem", color: "var(--text-muted)", "&:hover": { color: "var(--text-primary)", background: "transparent" } }}>
          Cases
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: 14 }} />}
            onClick={() => setEditOpen(true)}
            sx={{ textTransform: "none", fontSize: "0.8rem", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            Edit
          </Button>
          <Button size="small" startIcon={<DeleteOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ textTransform: "none", fontSize: "0.8rem", color: "#E74C3C", "&:hover": { background: "rgba(231,76,60,0.08)" } }}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* ── Hero card ── */}
      <Box sx={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden", mb: 2.5,
        borderLeft: `4px solid ${pColor}`,
      }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, flexWrap: "wrap" }}>
            {/* Title + meta */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", gap: 0.75, mb: 1, flexWrap: "wrap" }}>
                <Chip label={kase?.status} size="small"
                  sx={{ fontSize: "0.68rem", height: 22, background: `${sColor}18`, color: sColor, border: "none" }} />
                <Chip label={kase?.priority} size="small"
                  sx={{ fontSize: "0.68rem", height: 22, background: `${pColor}18`, color: pColor, border: "none" }} />
                {kase?.type && (
                  <Chip label={kase.type} size="small"
                    sx={{ fontSize: "0.68rem", height: 22, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none" }} />
                )}
              </Box>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                {kase?.title}
              </Typography>
              {kase?.case_no && (
                <Typography sx={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "monospace", mb: 1 }}>
                  {kase.case_no}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mt: 1 }}>
                {kase?.client_name && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
                    onClick={() => kase.client_id && router.push(`/clients/${kase.client_id}`)}>
                    <BusinessIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                    <Typography sx={{ fontSize: "0.8rem", color: kase.client_id ? "var(--accent-gold)" : "var(--text-secondary)",
                      textDecoration: kase.client_id ? "underline" : "none" }}>
                      {kase.client_name}
                    </Typography>
                  </Box>
                )}
                {kase?.assigned_to && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                    <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{kase.assigned_to}</Typography>
                  </Box>
                )}
                {kase?.court && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccountBalanceIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                    <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{kase.court}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Metrics */}
            <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0, flexWrap: "wrap" }}>
              {[
                { label: "Legal Fee",   value: fmt(kase?.fee),             color: "var(--accent-gold)" },
                { label: "Next Hearing", value: kase?.next_hearing ? new Date(kase.next_hearing).toLocaleDateString("en-KE", { day: "numeric", month: "short" }) : "None",
                  color: kase?.next_hearing ? "#F39C12" : "var(--text-muted)" },
                { label: "Documents",   value: caseDocs.length,            color: "#4A90D9" },
              ].map(({ label, value, color }) => (
                <Box key={label} sx={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "12px", p: "12px 18px", textAlign: "center", minWidth: 90,
                }}>
                  <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", mt: 0.4 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            borderTop: "1px solid var(--border)", px: 2, minHeight: 44,
            "& .MuiTabs-indicator": { background: "var(--accent-gold)", height: 2 },
            "& .MuiTab-root": { minHeight: 44, fontSize: "0.78rem", textTransform: "none", color: "var(--text-muted)", fontWeight: 500, px: 2.5 },
            "& .Mui-selected": { color: "var(--accent-gold) !important", fontWeight: 600 },
          }}>
          <Tab label="Overview" />
          <Tab label={`Files (${caseDocs.length})`} />
        </Tabs>
      </Box>

      {/* ── Tab Content ── */}
      <Box sx={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", p: 3 }}>

        {/* Overview tab */}
        {tab === 0 && (
          <Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <InfoRow label="Client"         value={kase?.client_name}   icon={BusinessIcon} />
              <InfoRow label="Assigned To"    value={kase?.assigned_to}   icon={PersonIcon} />
              <InfoRow label="Practice Area"  value={kase?.type}          icon={GavelIcon} />
              <InfoRow label="Court"          value={kase?.court}         icon={AccountBalanceIcon} />
              <InfoRow label="Date Filed"     value={fmtDate(kase?.filed)} icon={EventIcon} />
              <InfoRow label="Next Hearing"   value={fmtDate(kase?.next_hearing)} icon={AccessTimeIcon} />
              <InfoRow label="Opposing Party" value={kase?.opposing_party}  icon={ShieldIcon} />
              <InfoRow label="Opposing Counsel" value={kase?.opposing_counsel} icon={PersonIcon} />
            </Box>

            {kase?.description && (
              <>
                <Divider sx={{ borderColor: "var(--border)", my: 2 }} />
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <DescriptionIcon sx={{ fontSize: 16, color: "var(--text-muted)", mt: 0.2, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.5 }}>Notes</Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{kase.description}</Typography>
                  </Box>
                </Box>
              </>
            )}

            {kase?.outcome && (
              <>
                <Divider sx={{ borderColor: "var(--border)", my: 2 }} />
                <Box sx={{ p: 2, borderRadius: "12px", background: "rgba(149,165,166,0.08)", border: "1px solid rgba(149,165,166,0.2)" }}>
                  <Typography sx={{ fontSize: "0.6rem", color: "#95a5a6", textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.5 }}>Case Outcome</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{kase.outcome}</Typography>
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Files tab */}
        {tab === 1 && kase && (
          <CaseDocuments caseId={kase.id} docs={caseDocs} onRefresh={handleSaved} />
        )}
      </Box>

      {/* Dialogs */}
      <EditDialog open={editOpen} onClose={() => setEditOpen(false)} kase={kase} clients={clients} staff={staff} onSaved={handleSaved} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} kase={kase} onDeleted={handleDeleted} />

    </Layout>
  );
}
