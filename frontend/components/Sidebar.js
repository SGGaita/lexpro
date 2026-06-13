import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, Typography, Avatar, Divider, Menu, MenuItem, Badge } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import GavelIcon from "@mui/icons-material/Gavel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BadgeIcon from "@mui/icons-material/Badge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useApp } from "../context/AppContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Clients", href: "/clients", icon: PeopleIcon },
  { label: "Cases", href: "/cases", icon: GavelIcon },
  { label: "Billing", href: "/billing", icon: ReceiptIcon },
  { label: "Documents", href: "/documents", icon: FolderIcon },
  { label: "Calendar", href: "/calendar", icon: CalendarMonthIcon },
  { label: "Staff", href: "/staff", icon: BadgeIcon },
  { label: "Time Tracking", href: "/time-tracking", icon: AccessTimeIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const { currentTenant, tenants, stats, currentUser, logout } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);

  if (!currentTenant) return null;

  return (
    <Box sx={{ width: "var(--sidebar-width)", minHeight: "100vh", background: "var(--bg-surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100 }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          Lex<span style={{ color: "var(--text-primary)", fontStyle: "italic" }}>Pro</span>
        </Typography>
        <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", mt: 0.5 }}>Legal Management Suite</Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ display: "flex", alignItems: "center", gap: 1.5, background: "var(--bg-elevated)", borderRadius: "10px", px: 1.5, py: 1.2, cursor: "pointer", border: "1px solid var(--border)", transition: "all 0.2s", "&:hover": { borderColor: "var(--accent-gold)", background: "var(--bg-card)" } }}>
          <Avatar sx={{ width: 32, height: 32, background: currentTenant.color || "#D4A843", fontSize: "0.65rem", fontWeight: 700 }}>{currentTenant.logo}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTenant.name}</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{currentTenant.plan}</Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} />
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { minWidth: 220, mt: 0.5 } }}>
          <Box sx={{ px: 2, py: 1 }}><Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Switch Firm</Typography></Box>
          {tenants.map((t) => (
            <MenuItem key={t.id} onClick={() => { setAnchorEl(null); router.push("/"); }} sx={{ gap: 1.5, py: 1.2, background: t.id === currentTenant.id ? "var(--bg-card) !important" : undefined }}>
              <Avatar sx={{ width: 28, height: 28, background: t.color, fontSize: "0.6rem", fontWeight: 700 }}>{t.logo}</Avatar>
              <Box>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{t.name}</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{t.specialty}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, py: 1, overflowY: "auto" }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = router.pathname === href || router.pathname.startsWith(href + "/");
          const badgeCount = label === "Billing" ? (stats?.overdueInvoices || 0) : label === "Calendar" ? (stats?.upcomingHearings || 0) : 0;
          return (
            <Link key={href} href={href} passHref>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mx: 1.5, px: 1.5, py: 1.1, borderRadius: "8px", cursor: "pointer", mb: 0.3, background: active ? "rgba(212, 168, 67, 0.12)" : "transparent", borderLeft: active ? "2px solid var(--accent-gold)" : "2px solid transparent", transition: "all 0.15s", "&:hover": { background: "rgba(212, 168, 67, 0.07)", borderLeftColor: "var(--accent-gold-dim)" } }}>
                <Badge badgeContent={badgeCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.55rem", minWidth: 14, height: 14 } }}>
                  <Icon sx={{ fontSize: 18, color: active ? "var(--accent-gold)" : "var(--text-muted)" }} />
                </Badge>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: active ? 600 : 400, color: active ? "var(--accent-gold)" : "var(--text-secondary)" }}>{label}</Typography>
              </Box>
            </Link>
          );
        })}
      </Box>
      <Divider />
      {currentUser && (
        <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, background: "var(--accent-gold)", color: "#000", fontSize: "0.7rem", fontWeight: 700 }}>{currentUser.avatar || currentUser.name?.substring(0, 2)}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{currentUser.role}</Typography>
          </Box>
          <Typography onClick={logout} sx={{ fontSize: "0.65rem", color: "var(--text-muted)", cursor: "pointer", "&:hover": { color: "#E74C3C" } }}>Out</Typography>
        </Box>
      )}
    </Box>
  );
}
