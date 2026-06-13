import { useState } from "react";
import { Box, Typography, Button, Chip, TextField, InputAdornment, Grid, Avatar, Divider } from "@mui/material";
import Layout from "../../components/Layout";
import { useApp } from "../../context/AppContext";
import SearchIcon from "@mui/icons-material/Search";
import UploadIcon from "@mui/icons-material/Upload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";

const typeColor = {
  "Court Filing": "#E74C3C",
  "Contract": "#4A90D9",
  "Evidence": "#F39C12",
  "Legal Instrument": "#D4A843",
  "Report": "#2ECC71",
};

function DocCard({ doc }) {
  const isPdf = doc.name.endsWith(".pdf");
  const color = typeColor[doc.type] || "#8B9BB4";
  return (
    <Box sx={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", p: 2, transition: "all 0.2s", "&:hover": { borderColor: "var(--accent-gold-dim)", transform: "translateY(-1px)" } }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "8px", background: isPdf ? "rgba(231,76,60,0.12)" : "rgba(74,144,217,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isPdf ? <PictureAsPdfIcon sx={{ fontSize: 20, color: "#E74C3C" }} /> : <DescriptionIcon sx={{ fontSize: 20, color: "#4A90D9" }} />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, lineHeight: 1.3, wordBreak: "break-word" }}>{doc.name}</Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", mt: 0.5 }}>{doc.size}</Typography>
        </Box>
      </Box>

      <Chip label={doc.type} size="small" sx={{ fontSize: "0.62rem", background: `${color}15`, color, border: "none", mb: 1.5, height: 20 }} />

      <Divider sx={{ my: 1 }} />

      <Typography sx={{ fontSize: "0.72rem", color: "var(--text-secondary)", mb: 0.3 }}>{doc.client}</Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
        <Box>
          <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
            {new Date(doc.uploaded).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>by {doc.uploadedBy}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {doc.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} size="small" sx={{ fontSize: "0.58rem", height: 18, background: "var(--bg-elevated)", color: "var(--text-muted)", border: "none" }} />
          ))}
        </Box>
      </Box>

      <Button size="small" startIcon={<DownloadIcon sx={{ fontSize: 13 }} />}
        sx={{ mt: 1.5, fontSize: "0.72rem", color: "var(--text-muted)", p: 0, "&:hover": { color: "var(--accent-gold)", background: "transparent" } }}>
        Download
      </Button>
    </Box>
  );
}

export default function Documents() {
  const { tenantData } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const allTypes = ["All", ...new Set(tenantData.documents.map((d) => d.type))];

  const filtered = tenantData.documents.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.client.toLowerCase().includes(search.toLowerCase()) || d.tags.some((t) => t.includes(search.toLowerCase()));
    const matchType = typeFilter === "All" || d.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <Layout title="Document Vault">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <TextField placeholder="Search documents..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} /></InputAdornment> }}
          sx={{ width: 300 }} />
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{filtered.length} document{filtered.length !== 1 ? "s" : ""}</Typography>
        <Button variant="contained" startIcon={<UploadIcon />} size="small">Upload Document</Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {allTypes.map((t) => (
          <Chip key={t} label={t} size="small" onClick={() => setTypeFilter(t)}
            sx={{ fontSize: "0.72rem", cursor: "pointer", background: typeFilter === t ? "rgba(212,168,67,0.15)" : "var(--bg-card)", color: typeFilter === t ? "var(--accent-gold)" : "var(--text-secondary)", border: typeFilter === t ? "1px solid var(--accent-gold)" : "1px solid var(--border)" }} />
        ))}
      </Box>

      <Grid container spacing={2}>
        {filtered.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <DocCard doc={doc} />
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 8, color: "var(--text-muted)" }}>
              <DescriptionIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
              <Typography>No documents found</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Layout>
  );
}
