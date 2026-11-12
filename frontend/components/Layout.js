import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography } from "@mui/material";
import Sidebar from "./Sidebar";
import { useApp } from "../context/AppContext";

export default function Layout({ children, title }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useApp();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading]);

  if (loading || !isAuthenticated) return null;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: "var(--sidebar-width)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Box sx={{ px: 3, py: 1.75, borderBottom: "1px solid var(--border)", background: "rgba(10,15,26,0.85)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 50 }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, p: 3, background: "var(--bg-base)" }}>{children}</Box>
      </Box>
    </Box>
  );
}
