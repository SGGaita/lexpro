import { useState } from "react";
import { Box, Typography, Button, Chip, Grid, Avatar, Divider, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import GavelIcon from "@mui/icons-material/Gavel";

const roleColor = { "Senior Partner": "#D4A843", "Partner": "#F39C12", "Associate": "#4A90D9", "Junior Associate": "#2ECC71", "Paralegal": "#9B59B6" };
const avatarColors = ["#D4A843", "#4A90D9", "#2ECC71", "#E74C3C", "#9B59B6", "#F39C12"];
const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", notation: "compact", maximumFractionDigits: 0 }).format(n);

function StaffCard({ member, index, onClick }) {
  const rColor = roleColor[member.role] || "#8B9BB4";
  const bgColor = avatarColors[index % avatarColors.length];
  return (
    <Box onClick={onClick} sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", p: 2.5, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: "var(--accent-gold-dim)", transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Avatar sx={{ width: 52, height: 52, background: bgColor, fontSize: "1rem", fontWeight: 700, borderRadius: "12px", color: "#0A0F1A" }}>
          {member.avatar}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>{member.name}</Typography>
          <Chip label={member.role} size="small" sx={{ fontSize: "0.65rem", height: 20, background: `${rColor}15`, color: rColor, border: "none", mt: 0.3 }} />
        </Box>
        <Box sx={{ flex: 1 }} />
        <Chip label={member.status} size="small" sx={{ fontSize: "0.62rem", height: 18, background: member.status === "Active" ? "rgba(46,204,113,0.12)" : "rgba(243,156,18,0.12)", color: member.status === "Active" ? "#2ECC71" : "#F39C12", border: "none" }} />
      </Box>

      <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mb: 0.5 }}>Specialty</Typography>
      <Typography sx={{ fontSize: "0.82rem", mb: 2 }}>{member.specialty}</Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={1.5}>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", mb: 0.3 }}>Cases</Typography>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: "var(--accent-gold)" }}>{member.cases}</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", mb: 0.3 }}>Billable Rate</Typography>
          <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{fmt(member.billableRate)}<span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 400 }}>/hr</span></Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 0.6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon sx={{ fontSize: 12, color: "var(--text-muted)" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.email}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhoneIcon sx={{ fontSize: 12, color: "var(--text-muted)" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{member.phone}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function Staff() {
  const { tenantData } = useApp();
  const [selected, setSelected] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");

  const roles = ["All", ...new Set(tenantData.staff.map((s) => s.role))];
  const filtered = roleFilter === "All" ? tenantData.staff : tenantData.staff.filter((s) => s.role === roleFilter);

  const totalBillableCapacity = tenantData.staff.reduce((s, m) => s + m.billableRate * 8, 0);

  return (
    <Layout title="Staff & Lawyers">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {roles.map((r) => (
            <Chip key={r} label={r} size="small" onClick={() => setRoleFilter(r)}
              sx={{ fontSize: "0.72rem", cursor: "pointer", background: roleFilter === r ? "rgba(212,168,67,0.15)" : "var(--bg-card)", color: roleFilter === r ? "var(--accent-gold)" : "var(--text-secondary)", border: roleFilter === r ? "1px solid var(--accent-gold)" : "1px solid var(--border)" }} />
          ))}
        </Box>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{filtered.length} member{filtered.length !== 1 ? "s" : ""}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small">Add Staff</Button>
      </Box>

      <Grid container spacing={2}>
        {filtered.map((member, i) => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <StaffCard member={member} index={i} onClick={() => setSelected(member)} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, background: avatarColors[tenantData.staff.indexOf(selected) % avatarColors.length], borderRadius: "12px", fontSize: "0.9rem", fontWeight: 700, color: "#0A0F1A" }}>
                  {selected.avatar}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600 }}>{selected.name}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{selected.role} · Joined {new Date(selected.joined).toLocaleDateString("en-KE", { year: "numeric", month: "long" })}</Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {[
                  { l: "Specialty", v: selected.specialty },
                  { l: "Email", v: selected.email },
                  { l: "Phone", v: selected.phone },
                  { l: "Active Cases", v: selected.cases },
                  { l: "Billable Rate", v: `KES ${selected.billableRate.toLocaleString()}/hr` },
                  { l: "Status", v: selected.status },
                ].map(({ l, v }) => (
                  <Grid item xs={6} key={l}>
                    <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.3 }}>{l}</Typography>
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 500 }}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelected(null)} sx={{ color: "var(--text-secondary)" }}>Close</Button>
              <Button variant="contained" size="small">View Cases</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
}
