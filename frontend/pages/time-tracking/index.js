import { useState } from "react";
import { Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Avatar } from "@mui/material";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);
const fmtC = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1 }).format(n);
const avatarColors = { "Diana Kariuki": "#D4A843", "Grace Njeri": "#F39C12", "Peter Maina": "#4A90D9", "James Omondi": "#2ECC71", "Aisha Waweru": "#9B59B6", "Tobias Odhiambo": "#D4A843", "Naomi Achieng": "#4A90D9", "Irene Wanjiru": "#D4A843", "Samuel Mwangi": "#2ECC71" };

function TimeStatCard({ label, value, sub, color, Icon }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "8px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ fontSize: 16, color }} />
        </Box>
        <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 0.3 }}>{sub}</Typography>}
    </Box>
  );
}

export default function TimeTracking() {
  const { tenantData } = useApp();
  const [filter, setFilter] = useState("All");
  const entries = tenantData.timeEntries;

  const totalHours = entries.reduce((s, e) => s + e.hours, 0);
  const billableHours = entries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
  const billedHours = entries.filter((e) => e.billed).reduce((s, e) => s + e.hours, 0);
  const unbilledValue = entries.filter((e) => e.billable && !e.billed).reduce((s, e) => s + e.hours * e.rate, 0);

  const filtered = filter === "All" ? entries : filter === "Billable" ? entries.filter((e) => e.billable) : filter === "Unbilled" ? entries.filter((e) => e.billable && !e.billed) : entries.filter((e) => !e.billable);

  // Summarize by lawyer
  const byLawyer = entries.reduce((acc, e) => {
    if (!acc[e.lawyer]) acc[e.lawyer] = { hours: 0, billable: 0, value: 0 };
    acc[e.lawyer].hours += e.hours;
    if (e.billable) { acc[e.lawyer].billable += e.hours; acc[e.lawyer].value += e.hours * e.rate; }
    return acc;
  }, {});

  return (
    <Layout title="Time Tracking">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><TimeStatCard label="Total Hours" value={`${totalHours}h`} sub="All entries" color="#D4A843" Icon={AccessTimeIcon} /></Grid>
        <Grid item xs={6} md={3}><TimeStatCard label="Billable Hours" value={`${billableHours}h`} sub={`${Math.round((billableHours / totalHours) * 100)}% of total`} color="#4A90D9" Icon={AccessTimeIcon} /></Grid>
        <Grid item xs={6} md={3}><TimeStatCard label="Unbilled Value" value={fmtC(unbilledValue)} sub="Ready to invoice" color="#F39C12" Icon={AttachMoneyIcon} /></Grid>
        <Grid item xs={6} md={3}><TimeStatCard label="Billed Hours" value={`${billedHours}h`} sub="Already invoiced" color="#2ECC71" Icon={CheckCircleIcon} /></Grid>
      </Grid>

      {/* By Lawyer Summary */}
      <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2.5, mb: 3 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 2 }}>Hours by Lawyer</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {Object.entries(byLawyer).map(([name, data]) => {
            const initials = name.split(" ").map((n) => n[0]).join("");
            const color = avatarColors[name] || "#D4A843";
            return (
              <Box key={name} sx={{ display: "flex", alignItems: "center", gap: 1.5, background: "var(--bg-elevated)", borderRadius: "10px", px: 2, py: 1.2, minWidth: 200 }}>
                <Avatar sx={{ width: 32, height: 32, background: color, fontSize: "0.68rem", fontWeight: 700, color: "#0A0F1A", borderRadius: "8px" }}>{initials}</Avatar>
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{name.split(" ")[0]}</Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{data.hours}h total · {data.billable}h billable</Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-gold)" }}>{fmtC(data.value)}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        {["All", "Billable", "Unbilled", "Non-Billable"].map((f) => (
          <Chip key={f} label={f} size="small" onClick={() => setFilter(f)}
            sx={{ fontSize: "0.72rem", cursor: "pointer", background: filter === f ? "rgba(212,168,67,0.15)" : "var(--bg-card)", color: filter === f ? "var(--accent-gold)" : "var(--text-secondary)", border: filter === f ? "1px solid var(--accent-gold)" : "1px solid var(--border)" }} />
        ))}
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} size="small">Log Time</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid var(--border)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Lawyer</TableCell>
              <TableCell>Client / Case</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Hours</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Billable</TableCell>
              <TableCell align="center">Billed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((entry) => {
              const initials = entry.lawyer.split(" ").map((n) => n[0]).join("");
              const color = avatarColors[entry.lawyer] || "#D4A843";
              return (
                <TableRow key={entry.id}>
                  <TableCell><Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{new Date(entry.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, background: color, fontSize: "0.58rem", fontWeight: 700, color: "#0A0F1A", borderRadius: "6px" }}>{initials}</Avatar>
                      <Typography sx={{ fontSize: "0.78rem" }}>{entry.lawyer.split(" ")[0]}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>{entry.client}</Typography>
                    {!entry.billable && <Chip label="Internal" size="small" sx={{ fontSize: "0.6rem", height: 16, background: "var(--bg-elevated)", color: "var(--text-muted)", border: "none", mt: 0.3 }} />}
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.description}</Typography></TableCell>
                  <TableCell align="center"><Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--accent-gold)" }}>{entry.hours}</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{fmt(entry.rate)}</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>{entry.billable ? fmt(entry.hours * entry.rate) : "—"}</Typography></TableCell>
                  <TableCell align="center">
                    {entry.billable ? <CheckCircleIcon sx={{ fontSize: 16, color: "#2ECC71" }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} />}
                  </TableCell>
                  <TableCell align="center">
                    {entry.billed ? <CheckCircleIcon sx={{ fontSize: 16, color: "#2ECC71" }} /> : entry.billable ? <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "var(--F39C12)" }} /> : <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>N/A</Typography>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
}
