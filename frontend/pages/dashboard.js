import { Box, Typography, Grid, Avatar, LinearProgress, Chip } from "@mui/material";
import Layout from "../components/Layout";
import { useApp } from "../context/AppContext";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GavelIcon from "@mui/icons-material/Gavel";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 1 }).format(n);

function StatCard({ icon: Icon, label, value, sub, color, progress }) {
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, borderRadius: "50%", transform: "translate(20px,-20px)" }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "9px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ fontSize: 18, color }} />
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", mt: 0.5 }}>{sub}</Typography>}
      {progress !== undefined && <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.5, height: 3, borderRadius: 2 }} />}
    </Box>
  );
}

export default function Dashboard() {
  const { stats, tenantData, currentTenant } = useApp();

  const casesByType = tenantData.cases.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(casesByType).map(([name, value]) => ({ name, value }));
  const COLORS = ["#D4A843", "#4A90D9", "#2ECC71", "#E74C3C", "#9B59B6", "#F39C12"];

  const billingData = [
    { month: "Jan", billed: 2800000, collected: 2500000 },
    { month: "Feb", billed: 3200000, collected: 2900000 },
    { month: "Mar", billed: 2100000, collected: 1800000 },
    { month: "Apr", billed: 4100000, collected: 3600000 },
    { month: "May", billed: 3700000, collected: 2100000 },
  ];

  const upcomingEvents = tenantData.events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const recentCases = tenantData.cases.filter((c) => c.status === "Active").slice(0, 4);

  const priorityColor = { Critical: "#E74C3C", High: "#F39C12", Medium: "#4A90D9", Low: "#2ECC71" };

  return (
    <Layout title={`${currentTenant?.name || 'Dashboard'} — Dashboard`}>
      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={GavelIcon} label="Active Cases" value={stats.activeCases} sub={`${tenantData.cases.length} total cases`} color="#D4A843" progress={(stats.activeCases / tenantData.cases.length) * 100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={PeopleIcon} label="Clients" value={stats.totalClients} sub="Active client base" color="#4A90D9" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={TrendingUpIcon} label="Revenue Collected" value={fmt(stats.totalRevenue)} sub="2025 YTD" color="#2ECC71" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={AccessTimeIcon} label="Unbilled Hours" value={`${stats.unbilledHours}h`} sub={`${fmt(stats.unbilledHours * 15000)} est. value`} color="#F39C12" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Billing Chart */}
        <Grid item xs={12} md={7}>
          <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5 }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, mb: 0.5 }}>Billing vs Collections</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 2.5 }}>Monthly performance — 2025</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={billingData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: "#8B9BB4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8B9BB4", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip contentStyle={{ background: "#1A2436", border: "1px solid #1E3050", borderRadius: 8, color: "#E8DCC8", fontSize: 12 }} formatter={(v) => [fmt(v)]} />
                <Bar dataKey="billed" fill="#1E3050" radius={[4, 4, 0, 0]} name="Billed" />
                <Bar dataKey="collected" fill="#D4A843" radius={[4, 4, 0, 0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Cases by Type */}
        <Grid item xs={12} md={5}>
          <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5 }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, mb: 0.5 }}>Cases by Practice Area</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 2 }}>Distribution of active matters</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PieChart width={130} height={130}>
                <Pie data={pieData} cx={60} cy={60} innerRadius={38} outerRadius={60} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
              <Box sx={{ flex: 1 }}>
                {pieData.map((d, i) => (
                  <Box key={d.name} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>{d.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Recent Active Cases */}
        <Grid item xs={12} md={7}>
          <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5 }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, mb: 0.5 }}>Active Cases</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 2 }}>Current matters requiring attention</Typography>
            {recentCases.map((c) => (
              <Box key={c.id} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.2, borderBottom: "1px solid var(--border)", "&:last-child": { borderBottom: "none", pb: 0 } }}>
                <Avatar sx={{ width: 34, height: 34, background: `${priorityColor[c.priority]}20`, borderRadius: "8px" }}>
                  <GavelIcon sx={{ fontSize: 16, color: priorityColor[c.priority] }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{c.client} · {c.assignedTo}</Typography>
                </Box>
                <Chip label={c.priority} size="small" sx={{ fontSize: "0.65rem", background: `${priorityColor[c.priority]}15`, color: priorityColor[c.priority], border: "none", height: 22 }} />
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={5}>
          <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5 }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, mb: 0.5 }}>Upcoming Hearings</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 2 }}>Scheduled court dates & deadlines</Typography>
            {upcomingEvents.length === 0 && (
              <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", py: 3 }}>No upcoming events</Typography>
            )}
            {upcomingEvents.map((e) => {
              const d = new Date(e.date);
              const daysUntil = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <Box key={e.id} sx={{ display: "flex", gap: 2, py: 1.2, borderBottom: "1px solid var(--border)", "&:last-child": { borderBottom: "none", pb: 0 }, alignItems: "flex-start" }}>
                  <Box sx={{ textAlign: "center", minWidth: 40 }}>
                    <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: daysUntil <= 7 ? "var(--accent-red)" : "var(--accent-gold)", lineHeight: 1 }}>
                      {d.getDate()}
                    </Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      {d.toLocaleString("en", { month: "short" })}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{e.title}</Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{e.time} · {e.court}</Typography>
                  </Box>
                  {daysUntil <= 7 && <WarningAmberIcon sx={{ fontSize: 14, color: "var(--accent-amber)", mt: 0.3 }} />}
                </Box>
              );
            })}
          </Box>
        </Grid>

        {/* Overdue Invoices Alert */}
        {stats.overdueInvoices > 0 && (
          <Grid item xs={12}>
            <Box sx={{ background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.25)", borderRadius: "12px", px: 2.5, py: 1.8, display: "flex", alignItems: "center", gap: 2 }}>
              <WarningAmberIcon sx={{ color: "#E74C3C" }} />
              <Typography sx={{ fontSize: "0.85rem", color: "#E74C3C", fontWeight: 500 }}>
                {stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? "s" : ""} require immediate attention
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer", "&:hover": { color: "#E74C3C" } }}>
                View Billing →
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Layout>
  );
}
