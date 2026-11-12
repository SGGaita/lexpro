import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, Button, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Alert, Divider, List, ListItem,
  ListItemAvatar, ListItemText, Avatar, LinearProgress, Tooltip,
} from "@mui/material";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import SearchIcon from "@mui/icons-material/Search";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import GavelIcon from "@mui/icons-material/Gavel";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CasesIcon from "@mui/icons-material/Cases";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  "Court Filing", "Contract", "Evidence",
  "Legal Instrument", "Report", "Correspondence",
];

const TYPE_COLOR = {
  "Court Filing":    "#E74C3C",
  "Contract":        "#4A90D9",
  "Evidence":        "#F39C12",
  "Legal Instrument":"#D4A843",
  "Report":          "#2ECC71",
  "Correspondence":  "#8B9BB4",
};

// ─── File icon ────────────────────────────────────────────────────────────────

function FileIcon({ name = "", size = 22, sx = {} }) {
  const ext = name.split(".").pop()?.toLowerCase();
  const props = { sx: { fontSize: size, ...sx } };
  if (ext === "pdf") return <PictureAsPdfIcon {...props} sx={{ ...props.sx, color: "#E74C3C" }} />;
  if (["doc","docx"].includes(ext)) return <ArticleIcon {...props} sx={{ ...props.sx, color: "#4A90D9" }} />;
  if (["xls","xlsx","csv"].includes(ext)) return <ArticleIcon {...props} sx={{ ...props.sx, color: "#2ECC71" }} />;
  if (["jpg","jpeg","png","gif","webp"].includes(ext)) return <ImageIcon {...props} sx={{ ...props.sx, color: "#9B59B6" }} />;
  if (["zip","rar","7z"].includes(ext)) return <FolderZipIcon {...props} sx={{ ...props.sx, color: "#E67E22" }} />;
  return <InsertDriveFileIcon {...props} sx={{ ...props.sx, color: "#8B9BB4" }} />;
}

function fileIconBg(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "rgba(231,76,60,0.12)";
  if (["doc","docx"].includes(ext)) return "rgba(74,144,217,0.12)";
  if (["xls","xlsx","csv"].includes(ext)) return "rgba(46,204,113,0.12)";
  if (["jpg","jpeg","png","gif","webp"].includes(ext)) return "rgba(155,89,182,0.12)";
  return "rgba(139,155,180,0.12)";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "var(--accent-gold)" }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2, flex: 1, minWidth: 120, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: -14, right: -14, width: 70, height: 70, borderRadius: "50%", background: `${color}18` }} />
      <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color }}>{value}</Typography>
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
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Link a Case</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{cases.length} case{cases.length !== 1 ? "s" : ""} available</Typography>
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
                    <Avatar sx={{ width: 36, height: 36, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", fontSize: "0.75rem", fontWeight: 600 }}>
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
            {!loading && filtered.length === 0 && (
              <Box sx={{ textAlign: "center", py: 3, color: "var(--text-muted)" }}>
                <Typography sx={{ fontSize: "0.8rem" }}>No cases found</Typography>
              </Box>
            )}
          </List>
        )}
      </DialogContent>

      {selectedId && (
        <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button size="small" onClick={() => { onSelect(null); onClose(); }} sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Clear selection</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// ─── Upload Dialog ────────────────────────────────────────────────────────────

function UploadDialog({ open, onClose, onUploaded }) {
  const fileInputRef = useRef();
  const dropRef = useRef();
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("Correspondence");
  const [tags, setTags] = useState("");
  const [linkedCase, setLinkedCase] = useState(null);
  const [casePickerOpen, setCasePickerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const reset = () => {
    setFile(null); setName(""); setType("Correspondence"); setTags("");
    setLinkedCase(null); setDragging(false); setUploading(false);
    setProgress(0); setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setName(f.name);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file) { setError("Please select a file."); return; }
    setError(""); setUploading(true); setProgress(10);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name || file.name);
    fd.append("type", type);
    if (linkedCase) fd.append("case_id", linkedCase.id);
    fd.append("tags", tags);

    try {
      setProgress(50);
      const doc = await api.documents.upload(fd);
      setProgress(100);
      onUploaded(doc);
      handleClose();
    } catch (e) {
      setError(e.message);
      setUploading(false);
      setProgress(0);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      background: "var(--bg-elevated)",
      "& fieldset": { borderColor: "var(--border)" },
      "&:hover fieldset": { borderColor: "var(--accent-gold-dim)" },
      "&.Mui-focused fieldset": { borderColor: "var(--accent-gold)" },
    },
    "& .MuiInputLabel-root": { color: "var(--text-muted)" },
    "& .MuiInputBase-input": { color: "var(--text-primary)" },
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>Upload Document</Typography>
          <IconButton onClick={handleClose} size="small"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.8rem" }}>{error}</Alert>}

          {/* Drop zone */}
          <Box ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${dragging ? "var(--accent-gold)" : file ? "var(--accent-gold-dim)" : "var(--border)"}`,
              borderRadius: "12px", p: 3, mb: 2.5, textAlign: "center", cursor: file ? "default" : "pointer",
              background: dragging ? "rgba(212,168,67,0.06)" : file ? "rgba(212,168,67,0.03)" : "var(--bg-elevated)",
              transition: "all 0.2s",
            }}>
            {file ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                <Box sx={{ width: 42, height: 42, borderRadius: "10px", background: fileIconBg(file.name), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileIcon name={file.name} size={22} />
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>{file.name}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                </Box>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setFile(null); setName(""); }} sx={{ ml: "auto" }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 36, color: "var(--text-muted)", mb: 1, opacity: 0.5 }} />
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, mb: 0.5 }}>Drag & drop a file, or click to browse</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Supports any file type · Max 50 MB</Typography>
              </>
            )}
            <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files?.[0])} />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Document Name" size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />

            <TextField label="Document Type" size="small" fullWidth select value={type} onChange={(e) => setType(e.target.value)} sx={inputSx}
              SelectProps={{ native: true }}>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </TextField>

            {/* Case picker */}
            <Box>
              <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>Linked Case</Typography>
              {linkedCase ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <CasesIcon sx={{ fontSize: 16, color: "var(--accent-gold)" }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{linkedCase.title}</Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{linkedCase.case_no || "No #"}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setLinkedCase(null)}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              ) : (
                <Button variant="outlined" size="small" startIcon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setCasePickerOpen(true)}
                  sx={{ fontSize: "0.75rem", borderColor: "var(--border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--accent-gold-dim)", color: "var(--accent-gold)" } }}>
                  Link to a case (optional)
                </Button>
              )}
            </Box>

            <TextField label="Tags (comma-separated)" size="small" fullWidth placeholder="e.g. urgent, signed, nda" value={tags} onChange={(e) => setTags(e.target.value)} sx={inputSx} />
          </Box>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 4, "& .MuiLinearProgress-bar": { background: "var(--accent-gold)" }, background: "var(--bg-elevated)" }} />
              <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)", mt: 0.5, textAlign: "center" }}>Uploading…</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={handleClose} sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cancel</Button>
          <Button variant="contained" disabled={uploading || !file} onClick={handleSubmit}
            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadIcon sx={{ fontSize: 16 }} />}
            sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
            {uploading ? "Uploading…" : "Upload Document"}
          </Button>
        </DialogActions>
      </Dialog>

      <CasePickerModal open={casePickerOpen} onClose={() => setCasePickerOpen(false)}
        selectedId={linkedCase?.id} onSelect={setLinkedCase} />
    </>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ doc, open, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      await api.documents.delete(doc.id);
      onDeleted(doc.id);
      onClose();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Delete Document</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1, fontSize: "0.8rem" }}>{error}</Alert>}
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Permanently delete <strong>{doc?.name}</strong>? This also removes the file from storage.
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

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ doc, onDelete, onDownload }) {
  const color = TYPE_COLOR[doc.type] || "#8B9BB4";
  const tags = doc.tags ? doc.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <Box sx={{ width: 280, flexShrink: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top band */}
      <Box sx={{ height: 5, background: color }} />

      <Box sx={{ p: 2.5, flex: 1, overflow: "auto" }}>
        {/* File icon + name */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 2.5 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "14px", background: fileIconBg(doc.name), display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
            <FileIcon name={doc.name} size={32} />
          </Box>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, wordBreak: "break-word", lineHeight: 1.3, mb: 0.5 }}>{doc.name}</Typography>
          <Chip label={doc.type} size="small" sx={{ fontSize: "0.65rem", background: `${color}15`, color, border: "none", height: 20 }} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Details */}
        {[
          ["Size", doc.size || "—"],
          ["Case", doc.case_title || "—"],
          ["Client", doc.client_name || "—"],
          ["Uploaded", doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"],
          ["By", doc.uploaded_by || "—"],
        ].map(([label, value]) => (
          <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.2 }}>
            <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.1 }}>{label}</Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)", textAlign: "right", maxWidth: 150, wordBreak: "break-word" }}>{value}</Typography>
          </Box>
        ))}

        {tags.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.8 }}>Tags</Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} size="small" sx={{ fontSize: "0.62rem", height: 18, background: "var(--bg-elevated)", color: "var(--text-muted)", border: "none" }} />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 1.5, display: "flex", gap: 1 }}>
        <Button fullWidth size="small" variant="contained" startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
          onClick={() => onDownload(doc)}
          sx={{ fontSize: "0.75rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
          Download
        </Button>
        <IconButton size="small" onClick={() => onDelete(doc)}
          sx={{ border: "1px solid var(--border)", borderRadius: "8px", color: "#E74C3C", "&:hover": { background: "rgba(231,76,60,0.08)" } }}>
          <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onUpload }) {
  return (
    <Box sx={{ textAlign: "center", py: 10, color: "var(--text-muted)" }}>
      <DescriptionIcon sx={{ fontSize: 48, mb: 2, opacity: 0.25 }} />
      <Typography sx={{ fontSize: "1rem", fontWeight: 500, mb: 0.5 }}>No documents yet</Typography>
      <Typography sx={{ fontSize: "0.8rem", mb: 3 }}>Upload court filings, contracts, evidence and more</Typography>
      <Button variant="contained" startIcon={<UploadIcon />} onClick={onUpload}
        sx={{ fontSize: "0.82rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
        Upload Document
      </Button>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.documents.list();
      setDocs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Keep selected in sync after reload
  useEffect(() => {
    if (selected) {
      const updated = docs.find((d) => d.id === selected.id);
      setSelected(updated || null);
    }
  }, [docs]);

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = d.name?.toLowerCase().includes(q) ||
      d.client_name?.toLowerCase().includes(q) ||
      d.case_title?.toLowerCase().includes(q) ||
      d.tags?.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || d.type === typeFilter;
    return matchSearch && matchType;
  });

  // Stats
  const stats = {
    total: docs.length,
    court: docs.filter((d) => d.type === "Court Filing").length,
    contract: docs.filter((d) => d.type === "Contract").length,
    evidence: docs.filter((d) => d.type === "Evidence").length,
    recent: docs.filter((d) => {
      const days = (Date.now() - new Date(d.uploaded_at)) / 86400000;
      return days <= 30;
    }).length,
  };

  const handleUploaded = (doc) => {
    setDocs((prev) => [doc, ...prev]);
    setSelected(doc);
  };

  const handleDeleted = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleDownload = async (doc) => {
    try { await api.documents.download(doc.id, doc.name); }
    catch (e) { alert(e.message); }
  };

  const tableCellSx = { fontSize: "0.78rem", color: "var(--text-secondary)", borderColor: "var(--border)", py: 1.2, px: 1.5 };
  const headerCellSx = { fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, borderColor: "var(--border)", py: 1, px: 1.5, background: "var(--bg-elevated)" };

  return (
    <Layout title="Document Vault">
      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <StatCard label="Total Docs" value={stats.total} />
        <StatCard label="Court Filings" value={stats.court} color="#E74C3C" />
        <StatCard label="Contracts" value={stats.contract} color="#4A90D9" />
        <StatCard label="Evidence" value={stats.evidence} color="#F39C12" />
        <StatCard label="Last 30 Days" value={stats.recent} color="#2ECC71" />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <TextField placeholder="Search name, case, client, tags…" size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} /></InputAdornment> }}
          sx={{ width: 280 }} />

        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {["All", ...DOC_TYPES].map((t) => {
            const active = typeFilter === t;
            const color = TYPE_COLOR[t];
            return (
              <Chip key={t} label={t} size="small" onClick={() => setTypeFilter(t)} sx={{
                fontSize: "0.72rem", cursor: "pointer", height: 26,
                background: active ? (color ? `${color}15` : "rgba(212,168,67,0.15)") : "var(--bg-card)",
                color: active ? (color || "var(--accent-gold)") : "var(--text-secondary)",
                border: active ? `1px solid ${color || "var(--accent-gold)"}` : "1px solid var(--border)",
              }} />
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{filtered.length} document{filtered.length !== 1 ? "s" : ""}</Typography>
        <Button variant="contained" size="small" startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
          onClick={() => setUploadOpen(true)}
          sx={{ fontSize: "0.8rem", background: "var(--accent-gold)", color: "#000", "&:hover": { background: "var(--accent-gold-dim)" } }}>
          Upload Document
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress size={32} sx={{ color: "var(--accent-gold)" }} /></Box>
      ) : docs.length === 0 ? (
        <EmptyState onUpload={() => setUploadOpen(true)} />
      ) : (
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {/* Table */}
          <Box sx={{ flex: 1, minWidth: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Name</TableCell>
                    <TableCell sx={headerCellSx}>Type</TableCell>
                    <TableCell sx={headerCellSx}>Case / Client</TableCell>
                    <TableCell sx={headerCellSx}>Size</TableCell>
                    <TableCell sx={headerCellSx}>Uploaded</TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 80 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((doc) => {
                    const isSel = selected?.id === doc.id;
                    const color = TYPE_COLOR[doc.type] || "#8B9BB4";
                    return (
                      <TableRow key={doc.id} onClick={() => setSelected(isSel ? null : doc)}
                        sx={{ cursor: "pointer", background: isSel ? "rgba(212,168,67,0.05)" : "transparent", "&:hover": { background: "var(--bg-elevated)" }, "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={tableCellSx}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 30, height: 30, borderRadius: "7px", background: fileIconBg(doc.name), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <FileIcon name={doc.name} size={16} />
                            </Box>
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: isSel ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                              {doc.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={tableCellSx}>
                          <Chip label={doc.type} size="small" sx={{ fontSize: "0.62rem", height: 20, background: `${color}15`, color, border: "none" }} />
                        </TableCell>
                        <TableCell sx={tableCellSx}>
                          <Typography sx={{ fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{doc.case_title || "—"}</Typography>
                          {doc.client_name && <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{doc.client_name}</Typography>}
                        </TableCell>
                        <TableCell sx={tableCellSx}>{doc.size || "—"}</TableCell>
                        <TableCell sx={tableCellSx}>
                          <Typography sx={{ fontSize: "0.75rem" }}>
                            {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </Typography>
                          {doc.uploaded_by && <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{doc.uploaded_by}</Typography>}
                        </TableCell>
                        <TableCell sx={{ ...tableCellSx, textAlign: "right" }}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                            <Tooltip title="Download">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                sx={{ color: "var(--text-muted)", "&:hover": { color: "var(--accent-gold)" } }}>
                                <DownloadIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc); }}
                                sx={{ color: "var(--text-muted)", "&:hover": { color: "#E74C3C" } }}>
                                <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ ...tableCellSx, textAlign: "center", py: 4 }}>
                        <DescriptionIcon sx={{ fontSize: 28, opacity: 0.2, mb: 1 }} />
                        <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No documents match your filters</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Detail panel */}
          {selected && (
            <DetailPanel doc={selected} onDelete={setDeleteTarget} onDownload={handleDownload} />
          )}
        </Box>
      )}

      {/* Dialogs */}
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />

      {deleteTarget && (
        <DeleteDialog doc={deleteTarget} open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
    </Layout>
  );
}
