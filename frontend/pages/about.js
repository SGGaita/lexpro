import Link from "next/link";
import { Box, Typography, Button, Container } from "@mui/material";
import BalanceIcon from "@mui/icons-material/Balance";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import HandshakeIcon from "@mui/icons-material/Handshake";
import ShieldIcon from "@mui/icons-material/Shield";
import GroupsIcon from "@mui/icons-material/Groups";
import LandingLayout from "../components/LandingLayout";

const values = [
  {
    icon: BalanceIcon,
    title: "Justice Through Technology",
    description: "We believe access to efficient legal tools should not be a luxury. LexPro lowers the operational burden on firms so they can focus on what matters - their clients.",
  },
  {
    icon: LightbulbIcon,
    title: "Built for Africa",
    description: "We are a proudly Kenyan product. Every feature, every workflow, every pricing decision is made with the Kenyan legal market in mind - not as an afterthought.",
  },
  {
    icon: HandshakeIcon,
    title: "Trusted Partnership",
    description: "We treat every firm as a long-term partner. Our success is tied to yours - that is why our support team is available when you need them, not just during the sales process.",
  },
  {
    icon: ShieldIcon,
    title: "Uncompromising Security",
    description: "Client data is sacred. LexPro is built on enterprise-grade infrastructure with encryption at rest and in transit, strict access controls, and regular third-party audits.",
  },
];

const team = [
  { name: "Amani Kariuki", role: "CEO & Co-Founder", initials: "AK", bio: "Former corporate litigator turned software entrepreneur with years of practice at top-tier Kenyan law firms." },
  { name: "Brian Otieno", role: "CTO & Co-Founder", initials: "BO", bio: "Full-stack engineer passionate about building reliable, fast software. Previously worked at a Nairobi-based fintech." },
  { name: "Lilian Wanjiku", role: "Head of Product", initials: "LW", bio: "Product designer obsessed with making complex legal workflows feel effortless for busy Kenyan practitioners." },
  { name: "David Mutua", role: "Head of Customer Success", initials: "DM", bio: "Trained advocate who made the leap into operations. He ensures every firm onboards smoothly and gets real value." },
];

export default function AboutPage() {
  return (
    <LandingLayout>
      {/* ── Hero ── */}
      <Box
        sx={{
          pt: { xs: 8, md: 11 },
          pb: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 70%)",
        }} />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Typography sx={{
            fontSize: "0.62rem", color: "var(--accent-gold)",
            textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
          }}>
            Our Story
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "1.9rem", md: "2.8rem" },
              fontWeight: 600, lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)", mb: 2,
            }}
          >
            Built by Lawyers.{" "}
            <Box component="span" sx={{ color: "var(--accent-gold)", fontStyle: "italic" }}>
              Refined by Engineers.
            </Box>
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 560, mx: "auto" }}>
            LexPro started from a simple frustration - the best legal software was designed for London and New York, not built for Nairobi. We set out to change that.
          </Typography>
        </Container>
      </Box>

      {/* ── Mission ── */}
      <Box sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 6, alignItems: "center" }}>
            <Box>
              <Typography sx={{
                fontSize: "0.62rem", color: "var(--accent-gold)",
                textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
              }}>
                Our Mission
              </Typography>
              <Typography
                component="h2"
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                  fontWeight: 600, color: "var(--text-primary)",
                  lineHeight: 1.25, letterSpacing: "-0.02em", mb: 2,
                }}
              >
                To empower every Kenyan law firm with world-class practice management tools
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.75, mb: 1.5 }}>
                Founded in 2026, LexPro emerged from the experience of practising law at firms that juggled spreadsheets, WhatsApp groups, and disconnected billing tools. There was a better way.
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>
                Today we serve law firms across Kenya, handling thousands of active matters. We are growing fast - but we have not lost the commitment to personal, attentive service that defined us from day one.
              </Typography>
            </Box>

            {/* Timeline */}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {[
                { year: "2026", event: "Founded in Nairobi, Kenya. First firms signed up and onboarded within weeks." },
                { year: "Q2 2026", event: "Launched billing and document management modules. Client portal shipped." },
                { year: "Q3 2026", event: "Google Calendar integration released. Time tracking and staff modules live." },
                { year: "Now", event: "Continuing to build the definitive legal management platform for Kenya and beyond." },
              ].map((item, i, arr) => (
                <Box key={item.year} sx={{ display: "flex", gap: 2.5 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{
                      width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                      background: "var(--accent-gold)",
                      border: "2px solid var(--bg-base)",
                      mt: 0.4,
                    }} />
                    {i < arr.length - 1 && (
                      <Box sx={{ width: 1, flex: 1, background: "var(--border)", my: 0.4 }} />
                    )}
                  </Box>
                  <Box sx={{ pb: i < arr.length - 1 ? 2.5 : 0 }}>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "0.06em", mb: 0.25 }}>
                      {item.year}
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {item.event}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Values ── */}
      <Box sx={{ py: { xs: 7, md: 9 }, background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography sx={{
              fontSize: "0.62rem", color: "var(--accent-gold)",
              textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
            }}>
              What We Stand For
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
              Our Core Values
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 2.5 }}>
            {values.map(({ icon: Icon, title, description }) => (
              <Box key={title} sx={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                p: 2.75,
                display: "flex", gap: 2, alignItems: "flex-start",
              }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                  background: "rgba(212,168,67,0.1)",
                  border: "1px solid rgba(212,168,67,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon sx={{ fontSize: 18, color: "var(--accent-gold)" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", mb: 0.75 }}>
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Team ── */}
      <Box sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography sx={{
              fontSize: "0.62rem", color: "var(--accent-gold)",
              textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
            }}>
              The People Behind LexPro
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
              Meet the Team
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 2.5 }}>
            {team.map((member) => (
              <Box key={member.name} sx={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                p: 2.5,
                textAlign: "center",
                transition: "all 0.2s",
                "&:hover": { borderColor: "rgba(212,168,67,0.4)", transform: "translateY(-2px)" },
              }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: "12px",
                  background: "rgba(212,168,67,0.12)",
                  border: "1px solid rgba(212,168,67,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  mx: "auto", mb: 1.5,
                }}>
                  <Typography sx={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-gold)",
                  }}>
                    {member.initials}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-primary)", mb: 0.25 }}>
                  {member.name}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "var(--accent-gold)", fontWeight: 600, mb: 1.25, letterSpacing: "0.02em" }}>
                  {member.role}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {member.bio}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <GroupsIcon sx={{ color: "var(--accent-gold)", fontSize: 17 }} />
              <Typography sx={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                And a growing team of designers, engineers, and customer success specialists based in Nairobi
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{
        py: { xs: 7, md: 9 },
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,168,67,0.07) 0%, transparent 70%)",
        }} />
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "1.7rem", md: "2.2rem" },
              fontWeight: 600, color: "var(--text-primary)",
              letterSpacing: "-0.02em", mb: 1.5,
            }}
          >
            Want to Join Our Journey?
          </Typography>
          <Typography sx={{ fontSize: "0.86rem", color: "var(--text-secondary)", mb: 3, lineHeight: 1.7 }}>
                Whether you are a Kenyan law firm looking for better tools, or a talented individual who wants to build the future of legal-tech in Kenya - we would love to hear from you.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" passHref>
              <Button variant="contained" sx={{ px: 3, py: 1.1, fontWeight: 600, fontSize: "0.85rem" }}>
                Get in Touch →
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
                View Plans
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </LandingLayout>
  );
}
