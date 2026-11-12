import { useState } from "react";
import {
  Box, Typography, Button, Container, TextField,
  MenuItem, Alert, CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LandingLayout from "../components/LandingLayout";

const reasons = [
  "Book a Demo",
  "Sales Inquiry",
  "Technical Support",
  "Billing Question",
  "Partnership / Integration",
  "Press / Media",
  "Careers",
  "Other",
];

const offices = [
  {
    city: "Nairobi",
    country: "Kenya",
    address: "Upper Hill, Nairobi",
    phone: "+254 20 430 5678",
    hours: "Mon-Fri 8am-6pm EAT",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", firm: "", reason: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <LandingLayout>
      {/* ── Header ── */}
      <Box
        sx={{
          pt: { xs: 8, md: 11 },
          pb: { xs: 6, md: 7 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 70%)",
        }} />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Typography sx={{
            fontSize: "0.62rem", color: "var(--accent-gold)",
            textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
          }}>
            Get in Touch
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "1.9rem", md: "2.8rem" },
              fontWeight: 600, lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)", mb: 1.5,
            }}
          >
            Let's Start a{" "}
            <Box component="span" sx={{ color: "var(--accent-gold)", fontStyle: "italic" }}>
              Conversation
            </Box>
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 460, mx: "auto" }}>
            Book a personalised demo, ask a question, or just say hello. Our team typically responds within one business day.
          </Typography>
        </Container>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" },
            gap: 5,
            alignItems: "flex-start",
          }}>

            {/* ── Form ── */}
            <Box sx={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              p: { xs: 3, md: 4 },
            }}>
              {submitted ? (
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <Box sx={{
                    width: 52, height: 52, borderRadius: "14px",
                    background: "rgba(46,204,113,0.12)",
                    border: "1px solid rgba(46,204,113,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mx: "auto", mb: 2.5,
                  }}>
                    <Typography sx={{ fontSize: "1.5rem" }}>✓</Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.6rem", fontWeight: 600,
                      color: "var(--text-primary)", mb: 1,
                    }}
                  >
                    Message Sent
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 320, mx: "auto" }}>
                    Thank you for reaching out. A member of our team will get back to you within one business day.
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{
                      mt: 3, fontSize: "0.82rem",
                      color: "var(--text-secondary)", borderColor: "var(--border)",
                      "&:hover": { borderColor: "var(--accent-gold)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.06)" },
                    }}
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", firm: "", reason: "", message: "" }); }}
                  >
                    Send Another Message
                  </Button>
                </Box>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.45rem", fontWeight: 600,
                      color: "var(--text-primary)", mb: 0.4,
                    }}
                  >
                    Send us a Message
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "var(--text-muted)", mb: 3 }}>
                    Fill in the form and we will be in touch shortly.
                  </Typography>

                  <form onSubmit={handleSubmit}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
                      <TextField
                        label="Full Name"
                        value={form.name}
                        onChange={handleChange("name")}
                        size="small"
                        required
                        fullWidth
                        autoFocus
                      />
                      <TextField
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        size="small"
                        required
                        fullWidth
                      />
                      <TextField
                        label="Law Firm / Organisation"
                        value={form.firm}
                        onChange={handleChange("firm")}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="How can we help?"
                        select
                        value={form.reason}
                        onChange={handleChange("reason")}
                        size="small"
                        fullWidth
                        required
                      >
                        {reasons.map((r) => (
                          <MenuItem key={r} value={r}>{r}</MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <TextField
                      label="Message"
                      value={form.message}
                      onChange={handleChange("message")}
                      multiline
                      rows={4}
                      size="small"
                      required
                      fullWidth
                      sx={{ mb: 2 }}
                      placeholder="Tell us about your firm and what you are looking for..."
                    />

                    {error && (
                      <Alert severity="error" sx={{
                        mb: 2, fontSize: "0.75rem",
                        background: "rgba(231,76,60,0.08)",
                        color: "#E74C3C",
                        border: "1px solid rgba(231,76,60,0.2)",
                      }}>
                        {error}
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{ py: 1.25, fontSize: "0.86rem", fontWeight: 600 }}
                    >
                      {loading
                        ? <CircularProgress size={16} sx={{ color: "#0A0F1A" }} />
                        : "Send Message →"
                      }
                    </Button>
                  </form>
                </>
              )}
            </Box>

            {/* ── Sidebar info ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Contact channels */}
              <Box sx={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                p: 2.5,
              }}>
                <Typography sx={{
                  fontSize: "0.62rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.14em",
                  color: "var(--text-muted)", mb: 2,
                }}>
                  Contact Channels
                </Typography>
                {[
                  { icon: EmailIcon, label: "Email us", value: "hello@lexpro.io" },
                  { icon: PhoneIcon, label: "Call us", value: "+254 20 430 5678" },
                  { icon: AccessTimeIcon, label: "Response time", value: "Within 1 business day" },
                ].map(({ icon: Icon, label, value }) => (
                  <Box key={label} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.75 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
                      background: "rgba(212,168,67,0.1)",
                      border: "1px solid rgba(212,168,67,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon sx={{ fontSize: 15, color: "var(--accent-gold)" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", mb: 0.2 }}>{label}</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Offices */}
              <Box sx={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                p: 2.5,
              }}>
                <Typography sx={{
                  fontSize: "0.62rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.14em",
                  color: "var(--text-muted)", mb: 2,
                }}>
                  Our Offices
                </Typography>
                {offices.map((office) => (
                  <Box key={office.city} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.4 }}>
                      <LocationOnIcon sx={{ fontSize: 13, color: "var(--accent-gold)" }} />
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {office.city}, {office.country}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.74rem", color: "var(--text-secondary)", ml: 2.5, mb: 0.2 }}>
                      {office.address}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", ml: 2.5 }}>
                      {office.hours}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Demo CTA card */}
              <Box sx={{
                background: "rgba(212,168,67,0.06)",
                border: "1px solid rgba(212,168,67,0.2)",
                borderRadius: "14px",
                p: 2.5,
                textAlign: "center",
              }}>
                <Typography sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.2rem", fontWeight: 600,
                  color: "var(--text-primary)", mb: 0.75,
                }}>
                  Prefer a Live Demo?
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6, mb: 2 }}>
                  Let one of our product specialists walk you through LexPro live - tailored to your firm's workflow.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ py: 1.1, fontWeight: 600, fontSize: "0.82rem" }}
                  onClick={() => {
                    setForm((f) => ({ ...f, reason: "Book a Demo" }));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Book a Demo →
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </LandingLayout>
  );
}
