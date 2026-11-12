import { Box, Typography } from "@mui/material";

export default function StatCard({ label, value, sub, accent }) {
  return (
    <Box
      sx={{
        flex: "1 1 140px",
        minWidth: 130,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        px: 1.75,
        py: 1.25,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.62rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "1.15rem",
          fontWeight: 600,
          color: accent || "var(--text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)", mt: 0.35 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}
