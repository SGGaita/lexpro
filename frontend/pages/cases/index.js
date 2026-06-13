import { useState } from "react";
import { Box, Typography, Button, Avatar, Chip, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab } from "@mui/material";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GavelIcon from "@mui/icons-material/Gavel";

const priorityColor = { Critical: "#E74C3C", High: "#F39C12", Medium: "#4A90D9", Low: "#2ECC71" };
const statusColor = { Active: "#2ECC71", Pending: "#F39C12", Closed: "#8B9BB4" };
const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1 }).format(n);

export default function Cases() {
  const { tenantData } = useApp();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [selected, setSelected] = useState(null);

  const statuses = ["All", "Active", "Pending", "Closed"];
  const filtered = tenantData.cases.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "All" || c.status === tab;
    return matchSearch && matchTab;
  });

  return (
    <Layout title="Cases">
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <TextField placeholder="Search cases..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} /></InputAdornment> }}
          sx={{ 
            width: 280,
            "& .MuiInputBase-input": { fontSize: "0.8rem", padding: "7px 10px" }
          }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} size="small" sx={{ fontSize: "0.75rem", padding: "6px 14px" }}>New Case</Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ marginBottom: "16px", borderBottom: "1px solid var(--border)" }}>
        {statuses.map((s) => (
          <Tab key={s} label={`${s} ${s !== "All" ? `(${tenantData.cases.filter((c) => c.status === s).length})` : ""}`} value={s} sx={{ fontSize: "0.75rem", textTransform: "none", minHeight: "42px" }} />
        ))}
      </Tabs>

      <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid var(--border)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Case</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Next Hearing</TableCell>
              <TableCell align="right">Fee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} onClick={() => setSelected(c)} sx={{ cursor: "pointer" }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar sx={{ width: 28, height: 28, background: `${priorityColor[c.priority]}15`, borderRadius: "7px", flexShrink: 0 }}>
                      <GavelIcon sx={{ fontSize: 13, color: priorityColor[c.priority] }} />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 500, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</Typography>
                      <Typography sx={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>{c.caseNo}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Typography sx={{ fontSize: "0.78rem" }}>{c.client}</Typography></TableCell>
                <TableCell><Chip label={c.type} size="small" sx={{ fontSize: "0.62rem", height: "20px", background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none", maxWidth: 140 }} /></TableCell>
                <TableCell><Typography sx={{ fontSize: "0.78rem" }}>{c.assignedTo}</Typography></TableCell>
                <TableCell><Chip label={c.status} size="small" sx={{ fontSize: "0.62rem", height: "20px", background: `${statusColor[c.status]}15`, color: statusColor[c.status], border: "none" }} /></TableCell>
                <TableCell><Chip label={c.priority} size="small" sx={{ fontSize: "0.62rem", height: "20px", background: `${priorityColor[c.priority]}15`, color: priorityColor[c.priority], border: "none" }} /></TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "0.74rem", color: c.nextHearing ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {c.nextHearing ? new Date(c.nextHearing).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right"><Typography sx={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--accent-gold)" }}>{fmt(c.fee)}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Case Detail Dialog */}
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600 }}>{selected.title}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{selected.caseNo} · {selected.court}</Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ background: "var(--bg-elevated)", borderRadius: "10px", p: 2, mb: 2 }}>
                <Typography sx={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{selected.description}</Typography>
              </Box>
              <Grid container spacing={2}>
                {[
                  { l: "Client", v: selected.client },
                  { l: "Practice Area", v: selected.type },
                  { l: "Assigned Lawyer", v: selected.assignedTo },
                  { l: "Date Filed", v: new Date(selected.filed).toLocaleDateString() },
                  { l: "Next Hearing", v: selected.nextHearing ? new Date(selected.nextHearing).toLocaleDateString() : "N/A" },
                  { l: "Court", v: selected.court },
                  { l: "Status", v: selected.status },
                  { l: "Priority", v: selected.priority },
                  { l: "Fee", v: fmt(selected.fee) },
                ].map(({ l, v }) => (
                  <Grid item xs={6} md={4} key={l}>
                    <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.3 }}>{l}</Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
              <Button onClick={() => setSelected(null)} sx={{ color: "var(--text-secondary)" }}>Close</Button>
              <Button variant="outlined" size="small" sx={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Add Time Entry</Button>
              <Button variant="contained" size="small">View Full Case</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
}
