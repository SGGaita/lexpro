import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, Typography, Avatar, Divider, Menu, MenuItem } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useApp } from "../context/AppContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clients", href: "/clients" },
  { label: "Cases", href: "/cases" },
  { label: "Billing", href: "/billing" },
  { label: "Documents", href: "/documents" },
  { label: "Calendar", href: "/calendar" },
  { label: "Staff", href: "/staff" },
  { label: "Time Tracking", href: "/time-tracking" },
];

export default function Sidebar() {
  const router = useRouter();
  const { currentTenant, tenants, stats, currentUser, logout } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);

  if (!currentTenant) return null;

  return (
    <Box
      sx={{
        width: "var(--sidebar-width)",
        minHeight: "100vh",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          Lex<span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Pro</span>
        </Typography>
        <Typography sx={{ fontSize: "0.58rem", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", mt: 0.4 }}>
          Legal Management Suite
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            background: "var(--bg-elevated)",
            borderRadius: "8px",
            px: 1.25,
            py: 1,
            cursor: "pointer",
            border: "1px solid var(--border)",
            transition: "border-color 0.15s",
            "&:hover": { borderColor: "var(--accent-gold-dim)" },
          }}
        >
          <Avatar sx={{ width: 28, height: 28, background: currentTenant.color || "#D4A843", fontSize: "0.6rem", fontWeight: 700 }}>
            {currentTenant.logo}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentTenant.name}
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{currentTenant.plan}</Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 14, color: "var(--text-muted)" }} />
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { minWidth: 220, mt: 0.5 } }}>
          <MenuItem
            onClick={() => { setAnchorEl(null); router.push("/settings"); }}
            sx={{ gap: 1.25, py: 1 }}
          >
            <Typography sx={{ fontSize: "0.8rem" }}>Settings</Typography>
          </MenuItem>
        </Menu>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, py: 0.75, overflowY: "auto" }}>
        {navItems.map(({ label, href }) => {
          const active = router.pathname === href || router.pathname.startsWith(href + "/");
          const badgeCount =
            label === "Billing" ? stats?.overdueInvoices || 0 : label === "Calendar" ? stats?.upcomingHearings || 0 : 0;
          return (
            <Link key={href} href={href} passHref>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mx: 1.25,
                  px: 1.25,
                  py: 0.85,
                  borderRadius: "6px",
                  cursor: "pointer",
                  mb: 0.15,
                  background: active ? "rgba(212, 168, 67, 0.1)" : "transparent",
                  borderLeft: active ? "2px solid var(--accent-gold)" : "2px solid transparent",
                  transition: "background 0.15s",
                  "&:hover": { background: "rgba(212, 168, 67, 0.06)" },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--accent-gold)" : "var(--text-secondary)",
                  }}
                >
                  {label}
                </Typography>
                {badgeCount > 0 && (
                  <Typography
                    sx={{
                      ml: "auto",
                      fontSize: "0.58rem",
                      fontWeight: 600,
                      color: "var(--accent-red)",
                      background: "rgba(231,76,60,0.12)",
                      px: 0.6,
                      py: 0.1,
                      borderRadius: "4px",
                      lineHeight: 1.4,
                    }}
                  >
                    {badgeCount}
                  </Typography>
                )}
              </Box>
            </Link>
          );
        })}
      </Box>
      <Divider />
      {currentUser && (
        <Box sx={{ px: 1.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar sx={{ width: 30, height: 30, background: "var(--accent-gold)", color: "#000", fontSize: "0.65rem", fontWeight: 700 }}>
            {currentUser.avatar || currentUser.name?.substring(0, 2)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentUser.name}
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{currentUser.role}</Typography>
          </Box>
          <Typography onClick={logout} sx={{ fontSize: "0.6rem", color: "var(--text-muted)", cursor: "pointer", "&:hover": { color: "#E74C3C" } }}>
            Out
          </Typography>
        </Box>
      )}
    </Box>
  );
}
