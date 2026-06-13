import { useState } from "react";
import { Box, Typography, Button, Avatar, Chip, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from "@mui/material";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1 }).format(n);
const typeIcon = { Corporate: BusinessIcon, Individual: PersonIcon, Government: AccountBalanceIcon };
const typeColor = { Corporate: "#4A90D9", Individual: "#D4A843", Government: "#2ECC71" };

export default function Clients() {
  const { tenantData } = useApp();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = tenantData.clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Clients">
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <TextField
          placeholder="Search clients..." size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} /></InputAdornment> }}
          sx={{ 
            width: 280,
            "& .MuiInputBase-input": { fontSize: "0.8rem", padding: "7px 10px" },
            "& .MuiInputBase-root": { fontSize: "0.8rem" }
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} size="small" sx={{ fontSize: "0.75rem", padding: "6px 14px" }}>
          New Client
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["All", "Corporate", "Individual", "Government"].map((f) => (
          <Chip key={f} label={f} size="small" sx={{
            fontSize: "0.68rem", cursor: "pointer", height: "24px",
            background: f === "All" ? "rgba(212,168,67,0.15)" : "var(--bg-card)",
            color: f === "All" ? "var(--accent-gold)" : "var(--text-secondary)",
          }} />
        ))}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid var(--border)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Cases</TableCell>
              <TableCell align="right">Total Billed</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Since</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((c) => {
              const Icon = typeIcon[c.type] || PersonIcon;
              return (
                <TableRow key={c.id} onClick={() => setSelected(c)} sx={{ cursor: "pointer" }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Avatar sx={{ width: 30, height: 30, background: `${typeColor[c.type]}20`, borderRadius: "7px", flexShrink: 0 }}>
                        <Icon sx={{ fontSize: 14, color: typeColor[c.type] }} />
                      </Avatar>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{c.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={c.type} size="small" sx={{ fontSize: "0.65rem", height: "22px", background: `${typeColor[c.type]}15`, color: typeColor[c.type], border: "none" }} />
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{c.industry}</Typography></TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.76rem" }}>{c.contact}</Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{c.email}</Typography>
                  </TableCell>
                  <TableCell align="center"><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-gold)" }}>{c.cases}</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{fmt(c.totalBilled)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={c.status} size="small" sx={{ fontSize: "0.62rem", height: "20px", background: c.status === "Active" ? "rgba(46,204,113,0.12)" : "rgba(231,76,60,0.12)", color: c.status === "Active" ? "#2ECC71" : "#E74C3C", border: "none" }} />
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{new Date(c.since).toLocaleDateString("en-KE", { year: "numeric", month: "short" })}</Typography></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", pb: 1 }}>
              {selected.name}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {[
                  { l: "Contact Person", v: selected.contact },
                  { l: "Email", v: selected.email },
                  { l: "Phone", v: selected.phone },
                  { l: "Industry", v: selected.industry },
                  { l: "Client Since", v: new Date(selected.since).toLocaleDateString() },
                  { l: "Total Billed", v: fmt(selected.totalBilled) },
                ].map(({ l, v }) => (
                  <Grid item xs={6} key={l}>
                    <Typography sx={{ fontSize: "0.64rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{l}</Typography>
                    <Typography sx={{ fontSize: "0.8rem" }}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelected(null)} sx={{ color: "var(--text-secondary)" }}>Close</Button>
              <Button variant="contained" size="small">View Full Profile</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
}
