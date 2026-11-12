import Link from "next/link";
import { Box, Typography, Button, Container, Chip } from "@mui/material";
import BalanceIcon from "@mui/icons-material/Balance";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import LandingLayout from "../components/LandingLayout";

const features = [
  {
    icon: FolderOpenIcon,
    title: "Case Management",
    description: "Track every matter from intake to resolution. Assign attorneys, set deadlines, and monitor progress with full audit trails.",
    color: "var(--accent-gold)",
  },
  {
    icon: PeopleIcon,
    title: "Client Portal",
    description: "Give clients secure, real-time visibility into their cases. Reduce call volume and strengthen relationships with a branded portal.",
    color: "var(--accent-blue)",
  },
  {
    icon: ReceiptLongIcon,
    title: "Billing & Invoicing",
    description: "Generate invoices, track payments, and manage trust accounts. Support for hourly, flat-fee and retainer billing structures.",
    color: "var(--accent-green)",
  },
  {
    icon: DescriptionIcon,
    title: "Document Management",
    description: "Centralise all your documents with version control, secure storage, and one-click sharing - always linked to the right matter.",
    color: "var(--accent-amber)",
  },
  {
    icon: CalendarMonthIcon,
    title: "Court Calendar",
    description: "Sync hearings, deadlines, and appointments across your firm. Never miss a critical date with smart conflict detection.",
    color: "#9B59B6",
  },
  {
    icon: AccessTimeIcon,
    title: "Time Tracking",
    description: "Capture billable hours effortlessly with timers, manual entry, and automatic time rounding to maximise revenue recovery.",
    color: "var(--accent-red)",
  },
];

const stats = [
  { value: "100+", label: "Law Firms" },
  { value: "5k+", label: "Cases Managed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.9★", label: "Average Rating" },
];

const testimonials = [
  {
    quote: "LexPro transformed how our firm operates. We reduced admin overhead by 40% in the first quarter.",
    author: "Amara Osei",
    role: "Managing Partner, Osei & Associates",
    initials: "AO",
  },
  {
    quote: "The billing module alone paid for the subscription within a month. Our collections improved dramatically.",
    author: "James Kariuki",
    role: "Senior Partner, Kariuki Law Group",
    initials: "JK",
  },
  {
    quote: "Finally a legal management platform that feels modern. Our clients love the portal - it sets us apart.",
    author: "Nadia Mensah",
    role: "Director, Mensah Legal Chambers",
    initials: "NM",
  },
];

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <Box
      sx={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        p: 2.5,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: color,
          background: "var(--bg-elevated)",
          transform: "translateY(-2px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        },
      }}
    >
      <Box
        sx={{
          width: 36, height: 36, borderRadius: "10px",
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          mb: 1.75,
        }}
      >
        <Icon sx={{ fontSize: 18, color }} />
      </Box>
      <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", mb: 0.75 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
        {description}
      </Typography>
    </Box>
  );
}

export default function LandingPage() {
  return (
    <LandingLayout>
      {/* ── Hero ── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 8, md: 11 },
          pb: { xs: 7, md: 9 },
        }}
      >
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 50% at 50% -10%, rgba(212,168,67,0.1) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 60%, rgba(74,144,217,0.05) 0%, transparent 60%)
          `,
        }} />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto" }}>
            <Chip
              label="Built for Kenyan law firms"
              size="small"
              sx={{
                mb: 3,
                background: "rgba(212,168,67,0.1)",
                border: "1px solid rgba(212,168,67,0.3)",
                color: "var(--accent-gold)",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            />

            <Typography
              component="h1"
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "2rem", md: "2.9rem", lg: "3.4rem" },
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                mb: 2,
              }}
            >
              The Modern Legal{" "}
              <Box component="span" sx={{ color: "var(--accent-gold)", fontStyle: "italic" }}>
                Management Suite
              </Box>{" "}
              for Growing Firms
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "0.88rem", md: "0.95rem" },
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                maxWidth: 520,
                mx: "auto",
                mb: 3.5,
              }}
            >
              Streamline case management, billing, documents, and client communication - all in one beautifully designed platform built for legal professionals.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" passHref>
                <Button
                  variant="contained"
                  sx={{ px: 3, py: 1.1, fontSize: "0.85rem", fontWeight: 600 }}
                >
                  Get a Free Demo →
                </Button>
              </Link>
              <Link href="/pricing" passHref>
                <Button
                  variant="outlined"
                  sx={{
                    px: 3, py: 1.1, fontSize: "0.85rem",
                    color: "var(--text-secondary)", borderColor: "var(--border)",
                    "&:hover": { borderColor: "var(--accent-gold)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.06)" },
                  }}
                >
                  View Pricing
                </Button>
              </Link>
            </Box>

            {/* Dashboard preview mockup */}
            <Box
              sx={{
                mt: 6,
                mx: "auto",
                maxWidth: 820,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
              }}
            >
              {/* Browser chrome */}
              <Box sx={{ px: 2, py: 1, background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 1 }}>
                {["#E74C3C", "#F39C12", "#2ECC71"].map((c) => (
                  <Box key={c} sx={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
                ))}
                <Box sx={{
                  flex: 1, mx: 2, background: "var(--bg-card)",
                  borderRadius: "5px", py: 0.4, px: 1.25,
                  display: "flex", alignItems: "center", gap: 0.75,
                }}>
                  <SecurityIcon sx={{ fontSize: 9, color: "var(--accent-green)" }} />
                  <Typography sx={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>app.lexpro.io/dashboard</Typography>
                </Box>
              </Box>

              {/* Dashboard content */}
              <Box sx={{ p: 2, display: "grid", gridTemplateColumns: "180px 1fr", gap: 1.5, minHeight: 260 }}>
                {/* Sidebar mock */}
                <Box sx={{ background: "var(--bg-elevated)", borderRadius: "10px", p: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2.5 }}>
                    <BalanceIcon sx={{ color: "var(--accent-gold)", fontSize: 14 }} />
                    <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-gold)" }}>
                      Lex<span style={{ fontStyle: "italic", color: "var(--text-primary)" }}>Pro</span>
                    </Typography>
                  </Box>
                  {["Dashboard", "Clients", "Cases", "Billing", "Documents"].map((item, i) => (
                    <Box key={item} sx={{
                      py: 0.55, px: 0.75, mb: 0.4, borderRadius: "7px",
                      background: i === 0 ? "rgba(212,168,67,0.1)" : "transparent",
                      border: i === 0 ? "1px solid rgba(212,168,67,0.2)" : "1px solid transparent",
                    }}>
                      <Typography sx={{ fontSize: "0.68rem", color: i === 0 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Main content mock */}
                <Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25, mb: 1.5 }}>
                    {[
                      { label: "Active Cases", val: "47", color: "var(--accent-gold)" },
                      { label: "Clients", val: "123", color: "var(--accent-blue)" },
                      { label: "Revenue (Mo.)", val: "$28.4k", color: "var(--accent-green)" },
                    ].map((c) => (
                      <Box key={c.label} sx={{ background: "var(--bg-elevated)", borderRadius: "8px", p: 1.25, border: "1px solid var(--border)" }}>
                        <Typography sx={{ fontSize: "0.56rem", color: "var(--text-muted)", mb: 0.4 }}>{c.label}</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: c.color }}>{c.val}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ background: "var(--bg-elevated)", borderRadius: "8px", p: 1.25, border: "1px solid var(--border)" }}>
                    <Typography sx={{ fontSize: "0.56rem", color: "var(--text-muted)", mb: 1.25 }}>RECENT CASES</Typography>
                    {["Kamau v. Waweru - Hearing Thu 4 Sep", "NBO Holdings Ltd - Contract Review", "Estate of J. Mwangi - Probate Filing"].map((c) => (
                      <Box key={c} sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent-gold)", flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "0.64rem", color: "var(--text-secondary)" }}>{c}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Stats ── */}
      <Box sx={{ py: 4, borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 3 }}>
            {stats.map((s) => (
              <Box key={s.label} sx={{ textAlign: "center" }}>
                <Typography sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2rem", fontWeight: 600,
                  color: "var(--accent-gold)", lineHeight: 1,
                }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", mt: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box id="features" sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography sx={{
              fontSize: "0.62rem", color: "var(--accent-gold)",
              textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
            }}>
              Everything You Need
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "1.6rem", md: "2.2rem" },
                fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Built for the Way Lawyers Work
            </Typography>
            <Typography sx={{ fontSize: "0.86rem", color: "var(--text-secondary)", mt: 1.5, maxWidth: 460, mx: "auto", lineHeight: 1.65 }}>
              From first client meeting to final invoice - LexPro handles every step of your legal workflow.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 2.5 }}>
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Why LexPro ── */}
      <Box sx={{ py: { xs: 7, md: 9 }, background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 6, alignItems: "center" }}>
            <Box>
              <Typography sx={{
                fontSize: "0.62rem", color: "var(--accent-gold)",
                textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
              }}>
                Why LexPro
              </Typography>
              <Typography
                component="h2"
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                  fontWeight: 600, color: "var(--text-primary)",
                  lineHeight: 1.2, letterSpacing: "-0.02em", mb: 2,
                }}
              >
                Designed for Kenyan Law Firms First
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.75, mb: 3 }}>
                Most legal software is built for Western jurisdictions and retrofitted for Kenya. LexPro was built here - understanding local court systems, fee structures, and client expectations from day one.
              </Typography>
              {[
                { icon: SecurityIcon, text: "Bank-grade encryption & data residency in Kenya" },
                { icon: SpeedIcon, text: "Fast, reliable - works on any connection" },
                { icon: BalanceIcon, text: "Built around Kenyan court & billing conventions" },
              ].map(({ icon: Icon, text }) => (
                <Box key={text} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.5 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: "7px",
                    background: "rgba(212,168,67,0.1)",
                    border: "1px solid rgba(212,168,67,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, mt: 0.1,
                  }}>
                    <Icon sx={{ fontSize: 14, color: "var(--accent-gold)" }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.75 }}>
              {[
                { label: "Time to set up", value: "< 1 day", sub: "No migration headaches" },
                { label: "Hours saved / week", value: "12 hrs", sub: "Per attorney average" },
                { label: "Revenue recovered", value: "+22%", sub: "From better billing" },
                { label: "Client satisfaction", value: "4.9/5", sub: "Based on client reviews" },
              ].map((c) => (
                <Box key={c.label} sx={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  p: 2,
                }}>
                  <Typography sx={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.7rem", fontWeight: 600,
                    color: "var(--accent-gold)", lineHeight: 1,
                  }}>
                    {c.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", mt: 0.5 }}>
                    {c.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)", mt: 0.2 }}>
                    {c.sub}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography sx={{
              fontSize: "0.62rem", color: "var(--accent-gold)",
              textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
            }}>
              Trusted by Legal Professionals
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "1.6rem", md: "2.2rem" },
                fontWeight: 600, color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              What Our Clients Say
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 2.5 }}>
            {testimonials.map((t) => (
              <Box key={t.author} sx={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                p: 2.75,
              }}>
                <Typography sx={{
                  fontSize: "1.2rem",
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--accent-gold)",
                  lineHeight: 1, mb: 1.5,
                }}>
                  "
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.7, mb: 2.5, fontStyle: "italic" }}>
                  {t.quote}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "8px",
                    background: "rgba(212,168,67,0.12)",
                    border: "1px solid rgba(212,168,67,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent-gold)" }}>
                      {t.initials}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {t.author}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {t.role}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA Banner ── */}
      <Box
        sx={{
          py: { xs: 7, md: 9 },
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,168,67,0.07) 0%, transparent 70%)",
        }} />
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "1.7rem", md: "2.4rem" },
              fontWeight: 600, color: "var(--text-primary)",
              letterSpacing: "-0.02em", lineHeight: 1.2, mb: 1.5,
            }}
          >
            Ready to Modernise Your Practice?
          </Typography>
          <Typography sx={{ fontSize: "0.88rem", color: "var(--text-secondary)", mb: 3.5, lineHeight: 1.7 }}>
            Join Kenyan law firms already using LexPro. Book a personalised demo and see how we can transform your firm in 30 days.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" passHref>
              <Button variant="contained" sx={{ px: 3.5, py: 1.1, fontSize: "0.85rem", fontWeight: 600 }}>
                Book Your Free Demo →
              </Button>
            </Link>
            <Link href="/pricing" passHref>
              <Button
                variant="outlined"
                sx={{
                  px: 3, py: 1.1, fontSize: "0.85rem",
                  color: "var(--text-secondary)", borderColor: "var(--border)",
                  "&:hover": { borderColor: "var(--accent-gold)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.06)" },
                }}
              >
                See Pricing
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </LandingLayout>
  );
}
