import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Button, Avatar, Chip, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, CircularProgress, Alert, Tooltip, Divider,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import api from "../../lib/api";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_TYPES = ["Individual", "Corporate", "Government", "Partnership", "Trust", "NGO / Non-Profit"];

const INDUSTRIES = [
  "Agriculture", "Aviation", "Banking & Finance", "Construction",
  "Education", "Energy & Utilities", "Healthcare", "Hospitality",
  "Insurance", "Manufacturing", "Media & Entertainment", "Mining",
  "NGO / Non-Profit", "Real Estate", "Retail & FMCG",
  "Technology", "Telecommunications", "Transport & Logistics", "Other",
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

const fmt = (n) => new Intl.NumberFormat("en-KE", {
  style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1,
}).format(n || 0);

const filterOpts = createFilterOptions({ limit: 12 });

const EMPTY_FORM = {
  name: "", type: "Individual", contact: "", email: "",
  phone: "", industries: [], address: "", country: "",
};

// Helpers for multi-industry field (stored as comma-string in DB)
const toIndustryArr = (str) => str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];
const fromIndustryArr = (arr) => arr.join(", ");

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <Box sx={{
      flex: 1, minWidth: 130,
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "14px", p: "14px 18px",
      position: "relative", overflow: "hidden",
    }}>
      <Box sx={{
        position: "absolute", right: -10, top: -10,
        width: 60, height: 60, borderRadius: "50%",
        background: `${color}10`,
      }} />
      <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 0.8 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "1.7rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
          {value}
        </Typography>
        <Icon sx={{ fontSize: 20, color, opacity: 0.7, mb: 0.2 }} />
      </Box>
    </Box>
  );
}

// ─── Client Form Dialog ───────────────────────────────────────────────────────

function ClientFormDialog({ open, onClose, initial, onSaved }) {
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync form when dialog opens / initial changes
  useMemo(() => {
    if (open) {
      setForm(initial
        ? { ...initial, industries: toIndustryArr(initial.industry), country: initial.country || "" }
        : EMPTY_FORM
      );
      setError(null);
    }
  }, [open, initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Client name is required."); return; }
    setLoading(true); setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type || "Individual",
        contact: form.contact || null,
        email: form.email || null,
        phone: form.phone || null,
        industry: fromIndustryArr(form.industries) || null,
        address: form.address || null,
        country: form.country || null,
      };
      isEdit ? await api.clients.update(initial.id, payload) : await api.clients.create(payload);
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700 }}>
          {isEdit ? "Edit Client" : "New Client"}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--border)" }} />

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.78rem" }}>{error}</Alert>}

        {/* Section: Basic Info */}
        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
          Basic Information
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Client / Company Name *" fullWidth size="small"
              value={form.name} onChange={set("name")} autoFocus
            />
            {/* Type — freeSolo Autocomplete */}
            <Autocomplete
              freeSolo size="small" sx={{ width: 240, flexShrink: 0 }}
              options={CLIENT_TYPES}
              value={form.type}
              onInputChange={(_, val) => setForm((f) => ({ ...f, type: val }))}
              renderInput={(params) => <TextField {...params} label="Client Type" />}
            />
          </Box>

          {/* Industries — multi-select + freeSolo */}
          <Autocomplete
            multiple freeSolo size="small"
            options={INDUSTRIES}
            filterOptions={filterOpts}
            value={form.industries}
            onChange={(_, val) => setForm((f) => ({ ...f, industries: val }))}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={index} label={option} size="small"
                  {...getTagProps({ index })}
                  sx={{ fontSize: "0.7rem", height: 22 }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Industry / Sector"
                placeholder={form.industries.length ? "" : "Select or type custom industry…"}
                helperText="Select multiple or type a custom sector and press Enter"
              />
            )}
          />
        </Box>

        {/* Section: Contact Details */}
        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
          Contact Details
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <TextField
            label="Contact Person" fullWidth size="small"
            value={form.contact} onChange={set("contact")}
            placeholder="Primary contact name"
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Email Address" fullWidth size="small" type="email"
              value={form.email} onChange={set("email")}
            />
            <TextField
              label="Phone Number" fullWidth size="small"
              value={form.phone} onChange={set("phone")}
              placeholder="+254 700 000 000"
            />
          </Box>
        </Box>

        {/* Section: Address */}
        <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
          Address
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Physical Address" fullWidth size="small" multiline rows={2}
            value={form.address} onChange={set("address")}
            placeholder="Street address, building, floor…"
          />
          <Autocomplete
            freeSolo size="small"
            options={COUNTRIES}
            value={form.country}
            onInputChange={(_, val) => setForm((f) => ({ ...f, country: val }))}
            renderInput={(params) => (
              <TextField {...params} label="Country" placeholder="Select or type country" />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}
          sx={{ color: "var(--text-secondary)", textTransform: "none" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, minWidth: 120 }}>
          {loading
            ? <CircularProgress size={16} sx={{ color: "#0A0F1A" }} />
            : isEdit ? "Save Changes" : "Create Client"
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({ client, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.clients.delete(client.id);
      onDeleted();
      onClose();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(client)} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" } }}>
      <DialogTitle>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700 }}>
          Delete Client
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: "0.78rem" }}>{error}</Alert>}
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Delete <strong style={{ color: "var(--text-primary)" }}>{client?.name}</strong>? All associated cases, invoices, and documents will also be permanently removed.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}
          sx={{ color: "var(--text-secondary)", textTransform: "none" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleDelete} disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, background: "#E74C3C", "&:hover": { background: "#c0392b" } }}>
          {loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Delete Client"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered, onNew }) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Box sx={{
        width: 58, height: 58, borderRadius: "16px",
        background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2,
      }}>
        <GroupsIcon sx={{ fontSize: 26, color: "var(--accent-gold)" }} />
      </Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, mb: 0.5 }}>
        {filtered ? "No clients match" : "No clients yet"}
      </Typography>
      <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)", mb: 3 }}>
        {filtered ? "Try adjusting your search or filters." : "Add your first client to get started."}
      </Typography>
      {!filtered && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNew}
          sx={{ textTransform: "none", fontWeight: 600 }}>
          Add First Client
        </Button>
      )}
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TYPE_FILTERS = ["All", "Corporate", "Individual", "Government"];

export default function Clients() {
  const { tenantData, refreshAll, currentUser } = useApp();
  const clients = tenantData.clients || [];
  const router = useRouter();

  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stats
  const stats = useMemo(() => ({
    total:      clients.length,
    corporate:  clients.filter((c) => c.type === "Corporate").length,
    individual: clients.filter((c) => c.type === "Individual").length,
    government: clients.filter((c) => c.type === "Government").length,
  }), [clients]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const matchType   = typeFilter === "All" || c.type === typeFilter;
      const matchSearch = !q || [c.name, c.contact, c.industry, c.email, c.country]
        .some((v) => v?.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [clients, search, typeFilter]);

  const openCreate     = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit       = (c) => { setEditTarget(c); setFormOpen(true); };
  const handleRowClick = (c) => router.push(`/clients/${c.id}`);
  const handleSaved    = () => refreshAll();
  const handleDeleted  = () => refreshAll();

  return (
    <Layout title="Clients">

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <StatCard label="Total Clients"  value={stats.total}      color="var(--accent-gold)" icon={GroupsIcon} />
        <StatCard label="Corporate"      value={stats.corporate}  color="#4A90D9"            icon={BusinessIcon} />
        <StatCard label="Individual"     value={stats.individual} color="#D4A843"            icon={PersonIcon} />
        <StatCard label="Government"     value={stats.government} color="#2ECC71"            icon={AccountBalanceIcon} />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search clients…" size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: "var(--text-muted)" }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 260, "& .MuiInputBase-input": { fontSize: "0.8rem" } }}
        />

        <Box sx={{ display: "flex", gap: 0.75 }}>
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f;
            return (
              <Chip key={f} label={f} size="small" onClick={() => setTypeFilter(f)}
                sx={{
                  fontSize: "0.68rem", height: 26, cursor: "pointer",
                  background: active ? "rgba(212,168,67,0.15)" : "var(--bg-elevated)",
                  color: active ? "var(--accent-gold)" : "var(--text-secondary)",
                  border: `1px solid ${active ? "rgba(212,168,67,0.4)" : "var(--border)"}`,
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />

        <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          size="small" onClick={openCreate}
          sx={{ fontSize: "0.76rem", textTransform: "none", fontWeight: 600, px: 2 }}>
          New Client
        </Button>
      </Box>

      {/* Content */}
      <Box>
          <Box sx={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "14px", overflow: "hidden",
          }}>
            {filtered.length === 0 ? (
              <EmptyState filtered={search || typeFilter !== "All"} onNew={openCreate} />
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ background: "transparent" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{
                      "& .MuiTableCell-head": {
                        fontSize: "0.62rem", textTransform: "uppercase",
                        letterSpacing: "0.1em", color: "var(--text-muted)",
                        fontWeight: 600, py: 1.4,
                        borderBottom: "1px solid var(--border)",
                        background: "var(--bg-elevated)",
                      },
                    }}>
                      <TableCell>Client</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Industry</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell align="center">Cases</TableCell>
                      <TableCell align="right">Billed</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((c) => {
                      const Icon    = TYPE_ICON[c.type]  || PersonIcon;
                      const color   = TYPE_COLOR[c.type] || "var(--accent-gold)";
                      const indList = toIndustryArr(c.industry);

                      return (
                        <TableRow key={c.id} onClick={() => handleRowClick(c)} sx={{
                          cursor: "pointer",
                          "&:hover": { background: "var(--bg-elevated)" },
                          "& .MuiTableCell-root": { py: 1.3, borderBottom: "1px solid var(--border)" },
                          "&:last-child .MuiTableCell-root": { borderBottom: "none" },
                        }}>

                          {/* Name */}
                          <TableCell sx={{ minWidth: 160 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                              <Avatar sx={{ width: 30, height: 30, background: `${color}18`, borderRadius: "8px", flexShrink: 0 }}>
                                <Icon sx={{ fontSize: 14, color }} />
                              </Avatar>
                              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{c.name}</Typography>
                            </Box>
                          </TableCell>

                          {/* Type */}
                          <TableCell>
                            <Chip label={c.type} size="small" sx={{ fontSize: "0.62rem", height: 20, background: `${color}15`, color, border: "none" }} />
                          </TableCell>

                          {/* Industry */}
                          <TableCell sx={{ maxWidth: 160 }}>
                            {indList.length > 0 ? (
                              <Box sx={{ display: "flex", gap: 0.4, flexWrap: "wrap" }}>
                                <Chip label={indList[0]} size="small" sx={{ fontSize: "0.6rem", height: 18, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none" }} />
                                {indList.length > 1 && (
                                  <Chip label={`+${indList.length - 1}`} size="small" sx={{ fontSize: "0.6rem", height: 18, background: "var(--bg-elevated)", color: "var(--text-muted)", border: "none" }} />
                                )}
                              </Box>
                            ) : (
                              <Typography sx={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>—</Typography>
                            )}
                          </TableCell>

                          {/* Contact */}
                          <TableCell>
                            <Typography sx={{ fontSize: "0.76rem" }}>{c.contact || "—"}</Typography>
                            {c.email && <Typography sx={{ fontSize: "0.63rem", color: "var(--text-muted)" }}>{c.email}</Typography>}
                          </TableCell>

                          {/* Location */}
                          <TableCell>
                            {c.country ? (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                <PublicIcon sx={{ fontSize: 12, color: "var(--text-muted)" }} />
                                <Typography sx={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>{c.country}</Typography>
                              </Box>
                            ) : (
                              <Typography sx={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>—</Typography>
                            )}
                          </TableCell>

                          {/* Cases */}
                          <TableCell align="center">
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-gold)" }}>
                              {c.case_count ?? 0}
                            </Typography>
                          </TableCell>

                          {/* Billed */}
                          <TableCell align="right">
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{fmt(c.total_billed)}</Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip label={c.status} size="small" sx={{
                              fontSize: "0.62rem", height: 20, border: "none",
                              background: c.status === "Active" ? "rgba(46,204,113,0.12)" : "rgba(231,76,60,0.12)",
                              color: c.status === "Active" ? "#2ECC71" : "#E74C3C",
                            }} />
                          </TableCell>

                          {/* Row actions */}
                          <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ pr: 1 }}>
                            <Box sx={{ display: "flex", gap: 0.25, justifyContent: "flex-end" }}>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openEdit(c)}>
                                  <EditIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => setDeleteTarget(c)}>
                                  <DeleteOutlinedIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Footer */}
                <Box sx={{ px: 2.5, py: 1.2, borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                  <Typography sx={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                    {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
                    {typeFilter !== "All" && ` · ${typeFilter}`}
                    {search && ` · "${search}"`}
                  </Typography>
                </Box>
              </TableContainer>
            )}
          </Box>
        </Box>

      {/* Dialogs */}
      <ClientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editTarget}
        onSaved={handleSaved}
      />
      <DeleteDialog
        client={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </Layout>
  );
}
