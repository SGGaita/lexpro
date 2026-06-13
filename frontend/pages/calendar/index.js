import { useState } from "react";
import { Box, Typography, Button, Chip, Grid, Avatar, Divider } from "@mui/material";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import AddIcon from "@mui/icons-material/Add";
import GavelIcon from "@mui/icons-material/Gavel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const typeColor = { "Court Hearing": "#E74C3C", "Pre-Trial Conference": "#4A90D9", "Deadline": "#F39C12", "Regulatory Meeting": "#2ECC71" };
const priorityColor = { Critical: "#E74C3C", High: "#F39C12", Medium: "#4A90D9", Low: "#2ECC71" };

function EventCard({ event }) {
  const d = new Date(event.date);
  const now = new Date();
  const daysUntil = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntil <= 7 && daysUntil >= 0;
  const isPast = daysUntil < 0;
  const color = typeColor[event.type] || "#8B9BB4";
  const pColor = priorityColor[event.priority] || "#8B9BB4";

  return (
    <Box sx={{ background: "var(--bg-card)", border: `1px solid ${isUrgent ? "rgba(231,76,60,0.4)" : "var(--border)"}`, borderRadius: "12px", p: 2, opacity: isPast ? 0.5 : 1, transition: "all 0.2s", "&:hover": { borderColor: "var(--accent-gold-dim)" } }}>
      <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
        <Box sx={{ textAlign: "center", minWidth: 48, background: isPast ? "var(--bg-elevated)" : `${color}10`, borderRadius: "8px", py: 1, px: 0.5 }}>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: isPast ? "var(--text-muted)" : color, lineHeight: 1 }}>
            {d.getDate()}
          </Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
            {d.toLocaleString("en", { month: "short" })}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, flex: 1 }}>{event.title}</Typography>
            {isUrgent && <WarningAmberIcon sx={{ fontSize: 16, color: "#E74C3C", flexShrink: 0 }} />}
          </Box>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 0.3 }}>{event.time} · {event.court}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        <Chip label={event.type} size="small" sx={{ fontSize: "0.62rem", height: 20, background: `${color}15`, color, border: "none" }} />
        <Chip label={event.priority} size="small" sx={{ fontSize: "0.62rem", height: 20, background: `${pColor}15`, color: pColor, border: "none" }} />
      </Box>

      {event.notes && (
        <Box sx={{ background: "var(--bg-elevated)", borderRadius: "6px", px: 1.5, py: 1, mt: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{event.notes}</Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
        <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          <span style={{ color: "var(--text-secondary)" }}>Lawyer:</span> {event.lawyer}
        </Typography>
        {!isPast && (
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: daysUntil <= 3 ? "#E74C3C" : daysUntil <= 7 ? "#F39C12" : "var(--text-muted)" }}>
            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
          </Typography>
        )}
        {isPast && <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Completed</Typography>}
      </Box>
    </Box>
  );
}

export default function Calendar() {
  const { tenantData } = useApp();
  const [filter, setFilter] = useState("Upcoming");

  const now = new Date();
  const sorted = [...tenantData.events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = sorted.filter((e) => new Date(e.date) >= now);
  const past = sorted.filter((e) => new Date(e.date) < now);
  const urgent = upcoming.filter((e) => {
    const d = Math.ceil((new Date(e.date) - now) / (1000 * 60 * 60 * 24));
    return d <= 7;
  });

  const display = filter === "Upcoming" ? upcoming : filter === "Past" ? past : urgent;

  return (
    <Layout title="Court Calendar">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {["Upcoming", "Urgent", "Past"].map((f) => {
            const count = f === "Upcoming" ? upcoming.length : f === "Urgent" ? urgent.length : past.length;
            return (
              <Chip key={f} label={`${f} (${count})`} size="small" onClick={() => setFilter(f)}
                sx={{ fontSize: "0.72rem", cursor: "pointer", background: filter === f ? (f === "Urgent" ? "rgba(231,76,60,0.15)" : "rgba(212,168,67,0.15)") : "var(--bg-card)", color: filter === f ? (f === "Urgent" ? "#E74C3C" : "var(--accent-gold)") : "var(--text-secondary)", border: filter === f ? `1px solid ${f === "Urgent" ? "#E74C3C" : "var(--accent-gold)"}` : "1px solid var(--border)" }} />
            );
          })}
        </Box>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} size="small">Add Event</Button>
      </Box>

      {urgent.length > 0 && filter !== "Urgent" && filter !== "Past" && (
        <Box sx={{ background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.25)", borderRadius: "10px", px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <WarningAmberIcon sx={{ color: "#E74C3C", fontSize: 18 }} />
          <Typography sx={{ fontSize: "0.82rem", color: "#E74C3C", fontWeight: 500 }}>
            {urgent.length} hearing{urgent.length > 1 ? "s" : ""} within the next 7 days — immediate preparation required
          </Typography>
        </Box>
      )}

      {display.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10, color: "var(--text-muted)" }}>
          <CalendarTodayIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
          <Typography>No events in this category</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {display.map((event) => (
            <Grid item xs={12} md={6} xl={4} key={event.id}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
}
