import { useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { useApp } from "../context/AppContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const fmt = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const PRIORITY_COLOR = {
  Critical: "#E74C3C",
  High: "#F39C12",
  Medium: "#4A90D9",
  Low: "#2ECC71",
};

const PIE_COLORS = ["#D4A843", "#4A90D9", "#2ECC71", "#E74C3C", "#9B59B6", "#F39C12"];

function Panel({ title, subtitle, children, sx, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: "1 1 320px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        p: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s",
        "&:hover": onClick ? { borderColor: "var(--accent-gold)" } : {},
        ...sx,
      }}
    >
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", mt: 0.25, mb: 1.5 }}>
          {subtitle}
        </Typography>
      )}
      {!subtitle && <Box sx={{ mb: 1.5 }} />}
      {children}
    </Box>
  );
}

function RowItem({ onClick, children, sx }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1,
        borderBottom: "1px solid var(--border)",
        cursor: onClick ? "pointer" : "default",
        borderRadius: "4px",
        px: onClick ? 0.5 : 0,
        mx: onClick ? -0.5 : 0,
        transition: "background 0.12s",
        "&:last-child": { borderBottom: "none", pb: 0 },
        "&:hover": onClick ? { background: "rgba(212,168,67,0.05)" } : {},
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { stats, tenantData, currentTenant } = useApp();

  // Billing chart — aggregate real invoices by month (last 6 months)
  const billingData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString("en", { month: "short" }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        billed: 0,
        collected: 0,
      });
    }
    (tenantData.invoices || []).forEach((inv) => {
      if (!inv.issued) return;
      const d = new Date(inv.issued);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((x) => x.key === key);
      if (m) {
        m.billed += inv.amount || 0;
        m.collected += inv.paid || 0;
      }
    });
    return months;
  }, [tenantData.invoices]);

  // Cases by type for pie chart
  const pieData = useMemo(() => {
    const acc = {};
    (tenantData.cases || []).forEach((c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [tenantData.cases]);

  // Upcoming events (future dates, sorted, top 5)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (tenantData.events || [])
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [tenantData.events]);

  // Active cases top 5
  const activeCases = useMemo(
    () => (tenantData.cases || []).filter((c) => c.status === "Active").slice(0, 5),
    [tenantData.cases]
  );

  // Overdue invoices detail
  const overdueInvoices = useMemo(
    () => (tenantData.invoices || []).filter((inv) => inv.status === "Overdue"),
    [tenantData.invoices]
  );

  const overdueTotal = useMemo(
    () => overdueInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0),
    [overdueInvoices]
  );

  // Collection rate for display
  const collectionPct = stats.collectionRate ? Math.round(stats.collectionRate) : 0;

  return (
    <Layout title={`${currentTenant?.name || "Dashboard"} — Dashboard`}>

      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: 1.25, mb: 2, flexWrap: "wrap" }}>
        <StatCard
          label="Active Cases"
          value={stats.activeCases}
          sub={`${(tenantData.cases || []).length} total cases`}
          onClick={() => router.push("/cases?status=Active")}
        />
        <StatCard
          label="Clients"
          value={stats.totalClients}
          sub="Active client base"
          onClick={() => router.push("/clients")}
        />
        <StatCard
          label="Revenue Collected"
          value={fmt(stats.totalRevenue)}
          sub={`${collectionPct}% collection rate`}
          accent="var(--accent-green)"
          onClick={() => router.push("/billing")}
        />
        <StatCard
          label="Unbilled Hours"
          value={`${stats.unbilledHours}h`}
          sub={`${fmt(stats.unbilledHours * 15000)} est. value`}
          onClick={() => router.push("/time")}
        />
      </Box>

      {/* Overdue Alert */}
      {overdueInvoices.length > 0 && (
        <Box
          onClick={() => router.push("/billing?status=Overdue")}
          sx={{
            mb: 2,
            background: "rgba(231,76,60,0.06)",
            border: "1px solid rgba(231,76,60,0.2)",
            borderRadius: "8px",
            px: 2,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            transition: "border-color 0.15s",
            "&:hover": { borderColor: "rgba(231,76,60,0.5)" },
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#E74C3C",
              flexShrink: 0,
              boxShadow: "0 0 6px #E74C3C",
            }}
          />
          <Typography sx={{ fontSize: "0.75rem", color: "#E74C3C", fontWeight: 500 }}>
            {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} —
            {" "}{fmt(overdueTotal)} outstanding
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              "&:hover": { color: "#E74C3C" },
            }}
          >
            View Billing →
          </Typography>
        </Box>
      )}

      {/* Charts Row */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <Panel
          title="Billing vs Collections"
          subtitle="Last 6 months — actual invoices"
          sx={{ flex: "2 1 420px" }}
          onClick={() => router.push("/billing")}
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={billingData} barGap={3}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#8B9BB4", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8B9BB4", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A2436",
                  border: "1px solid #1E3050",
                  borderRadius: 6,
                  color: "#E8DCC8",
                  fontSize: 11,
                }}
                formatter={(v) => [fmt(v)]}
              />
              <Bar dataKey="billed" fill="#1E3050" radius={[3, 3, 0, 0]} name="Billed" />
              <Bar dataKey="collected" fill="#D4A843" radius={[3, 3, 0, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Cases by Practice Area"
          subtitle="Distribution of all matters"
          sx={{ flex: "1 1 260px" }}
          onClick={() => router.push("/cases")}
        >
          {pieData.length === 0 ? (
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", py: 2, textAlign: "center" }}>
              No cases yet
            </Typography>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <PieChart width={100} height={100}>
                <Pie
                  data={pieData}
                  cx={45}
                  cy={45}
                  innerRadius={28}
                  outerRadius={45}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <Box sx={{ flex: 1, minWidth: 120 }}>
                {pieData.map((d, i) => (
                  <Box key={d.name} sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: PIE_COLORS[i % PIE_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: "var(--text-secondary)",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {d.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>{d.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Panel>
      </Box>

      {/* Bottom Row */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        {/* Active Cases */}
        <Panel
          title="Active Cases"
          subtitle="Click any case to open it"
          sx={{ flex: "2 1 420px" }}
        >
          {activeCases.length === 0 ? (
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", py: 2, textAlign: "center" }}>
              No active cases
            </Typography>
          ) : (
            <>
              {activeCases.map((c) => (
                <RowItem key={c.id} onClick={() => router.push(`/cases/${c.id}`)}>
                  <Box
                    sx={{
                      width: 3,
                      alignSelf: "stretch",
                      borderRadius: 2,
                      background: PRIORITY_COLOR[c.priority] || "#8B9BB4",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.title}
                    </Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                      {c.client_name} · {c.assigned_to}
                    </Typography>
                  </Box>
                  <Chip
                    label={c.priority}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      background: `${PRIORITY_COLOR[c.priority] || "#8B9BB4"}18`,
                      color: PRIORITY_COLOR[c.priority] || "#8B9BB4",
                      border: "none",
                      height: 20,
                    }}
                  />
                </RowItem>
              ))}
              <Box
                onClick={() => router.push("/cases")}
                sx={{
                  mt: 1.5,
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  textAlign: "right",
                  "&:hover": { color: "var(--accent-gold)" },
                }}
              >
                View all cases →
              </Box>
            </>
          )}
        </Panel>

        {/* Upcoming Hearings */}
        <Panel
          title="Upcoming Hearings"
          subtitle="Scheduled court dates & deadlines"
          sx={{ flex: "1 1 260px" }}
        >
          {upcomingEvents.length === 0 ? (
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", py: 2, textAlign: "center" }}>
              No upcoming events
            </Typography>
          ) : (
            <>
              {upcomingEvents.map((e) => {
                const d = new Date(e.date);
                const daysUntil = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <RowItem key={e.id} onClick={() => router.push("/calendar")} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ textAlign: "center", minWidth: 32 }}>
                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: daysUntil <= 7 ? "#E74C3C" : "var(--text-primary)",
                          lineHeight: 1,
                        }}
                      >
                        {d.getDate()}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.58rem", color: "var(--text-muted)", textTransform: "uppercase" }}
                      >
                        {d.toLocaleString("en", { month: "short" })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.3 }}>
                        {e.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.63rem", color: "var(--text-muted)" }}>
                        {e.time}{e.court ? ` · ${e.court}` : ""}
                      </Typography>
                    </Box>
                    {daysUntil <= 7 && (
                      <Chip
                        label={`${daysUntil}d`}
                        size="small"
                        sx={{
                          fontSize: "0.58rem",
                          height: 18,
                          background: "rgba(231,76,60,0.12)",
                          color: "#E74C3C",
                          border: "none",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </RowItem>
                );
              })}
              <Box
                onClick={() => router.push("/calendar")}
                sx={{
                  mt: 1.5,
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  textAlign: "right",
                  "&:hover": { color: "var(--accent-gold)" },
                }}
              >
                Open calendar →
              </Box>
            </>
          )}
        </Panel>
      </Box>

    </Layout>
  );
}
