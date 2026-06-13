import { useState } from "react";
import { Box, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, LinearProgress } from "@mui/material";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);
const fmtC = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1 }).format(n);

const statusStyles = {
  Paid: { bg: "rgba(46,204,113,0.12)", color: "#2ECC71", icon: CheckCircleIcon },
  Pending: { bg: "rgba(243,156,18,0.12)", color: "#F39C12", icon: HourglassEmptyIcon },
  Overdue: { bg: "rgba(231,76,60,0.12)", color: "#E74C3C", icon: WarningIcon },
  Partial: { bg: "rgba(74,144,217,0.12)", color: "#4A90D9", icon: HourglassEmptyIcon },
};

function BillingStatCard({ label, value, sub, color, Icon }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "8px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ fontSize: 17, color }} />
        </Box>
        <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 0.3 }}>{sub}</Typography>}
    </Box>
  );
}

export default function Billing() {
  const { tenantData } = useApp();
  const [filter, setFilter] = useState("All");
  const invoices = tenantData.invoices;

  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paid, 0);
  const totalOutstanding = totalBilled - totalCollected;
  const overdue = invoices.filter((i) => i.status === "Overdue");

  const filtered = filter === "All" ? invoices : invoices.filter((i) => i.status === filter);

  return (
    <Layout title="Billing & Invoices">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><BillingStatCard label="Total Billed" value={fmtC(totalBilled)} color="#D4A843" Icon={ReceiptIcon} /></Grid>
        <Grid item xs={6} md={3}><BillingStatCard label="Collected" value={fmtC(totalCollected)} sub={`${Math.round((totalCollected / totalBilled) * 100)}% collection rate`} color="#2ECC71" Icon={CheckCircleIcon} /></Grid>
        <Grid item xs={6} md={3}><BillingStatCard label="Outstanding" value={fmtC(totalOutstanding)} color="#F39C12" Icon={HourglassEmptyIcon} /></Grid>
        <Grid item xs={6} md={3}><BillingStatCard label="Overdue" value={overdue.length} sub="invoices past due date" color="#E74C3C" Icon={WarningIcon} /></Grid>
      </Grid>

      {/* Collection progress */}
      <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2.5, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>Collection Rate</Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "var(--accent-gold)", fontWeight: 600 }}>
            {Math.round((totalCollected / totalBilled) * 100)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={(totalCollected / totalBilled) * 100} sx={{ height: 6, borderRadius: 3 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Collected: {fmtC(totalCollected)}</Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Outstanding: {fmtC(totalOutstanding)}</Typography>
        </Box>
      </Box>

      {/* Filter + actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        {["All", "Paid", "Pending", "Partial", "Overdue"].map((f) => (
          <Chip key={f} label={f} size="small" onClick={() => setFilter(f)}
            sx={{ fontSize: "0.72rem", cursor: "pointer", background: filter === f ? "rgba(212,168,67,0.15)" : "var(--bg-card)", color: filter === f ? "var(--accent-gold)" : "var(--text-secondary)", border: filter === f ? "1px solid var(--accent-gold)" : "1px solid var(--border)" }} />
        ))}
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} size="small">New Invoice</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid var(--border)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issued</TableCell>
              <TableCell>Due</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((inv) => {
              const style = statusStyles[inv.status] || statusStyles.Pending;
              const Icon = style.icon;
              const balance = inv.amount - inv.paid;
              return (
                <TableRow key={inv.id} sx={{ cursor: "pointer" }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: `${style.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon sx={{ fontSize: 15, color: style.color }} />
                      </Box>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, fontFamily: "monospace", letterSpacing: "0.03em" }}>{inv.number}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: "0.82rem" }}>{inv.client}</Typography></TableCell>
                  <TableCell>
                    <Chip label={inv.status} size="small" sx={{ fontSize: "0.65rem", background: style.bg, color: style.color, border: "none", height: 22 }} />
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{new Date(inv.issued).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</Typography></TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.78rem", color: inv.status === "Overdue" ? "#E74C3C" : "var(--text-secondary)" }}>
                      {new Date(inv.due).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right"><Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>{fmt(inv.amount)}</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ fontSize: "0.85rem", color: "#2ECC71" }}>{fmt(inv.paid)}</Typography></TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: balance > 0 ? (inv.status === "Overdue" ? "#E74C3C" : "var(--accent-gold)") : "var(--text-muted)" }}>
                      {balance > 0 ? fmt(balance) : "—"}
                    </Typography>
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
