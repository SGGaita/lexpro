import Link from "next/link";
import { Box, Typography, Button, Container, Chip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LandingLayout from "../components/LandingLayout";

const plans = [
  {
    name: "Starter",
    tagline: "Perfect for solo practitioners and small firms",
    price: "$49",
    period: "/month",
    highlight: false,
    features: [
      { text: "Up to 3 users", included: true },
      { text: "Up to 50 active cases", included: true },
      { text: "Client management", included: true },
      { text: "Basic billing & invoicing", included: true },
      { text: "Document storage (5 GB)", included: true },
      { text: "Email support", included: true },
      { text: "Client portal", included: false },
      { text: "Google Calendar sync", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    tagline: "For growing firms that need full capability",
    price: "$129",
    period: "/month",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Up to 15 users", included: true },
      { text: "Unlimited active cases", included: true },
      { text: "Client management", included: true },
      { text: "Full billing & invoicing", included: true },
      { text: "Document storage (50 GB)", included: true },
      { text: "Email + chat support", included: true },
      { text: "Client portal", included: true },
      { text: "Google Calendar sync", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    tagline: "For large firms requiring power and control",
    price: "Custom",
    period: "",
    highlight: false,
    features: [
      { text: "Unlimited users", included: true },
      { text: "Unlimited active cases", included: true },
      { text: "Client management", included: true },
      { text: "Full billing & invoicing", included: true },
      { text: "Document storage (unlimited)", included: true },
      { text: "Email + chat support", included: true },
      { text: "Client portal", included: true },
      { text: "Google Calendar sync", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "API access", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes - all paid plans start with a 14-day free trial. No credit card required. You get full access to every feature in your chosen plan.",
  },
  {
    q: "Can I change plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time. When upgrading you are charged a pro-rated amount for the remainder of your billing cycle.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data is yours. If you cancel, you have 30 days to export everything in standard formats before it is deleted from our servers.",
  },
  {
    q: "Do you offer discounts for African NGOs or public-interest law firms?",
    a: "Yes - we have a dedicated programme for registered Kenyan non-profits and public-interest legal organisations. Contact us for details.",
  },
  {
    q: "Is my data stored in Africa?",
    a: "Yes. All customer data is stored on servers in the region to comply with Kenyan data protection requirements under the Data Protection Act 2019.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, bank transfer, and card (Visa/Mastercard). Invoice billing is available on annual plans.",
  },
];

export default function PricingPage() {
  return (
    <LandingLayout>
      {/* ── Header ── */}
      <Box
        sx={{
          pt: { xs: 8, md: 11 },
          pb: { xs: 6, md: 8 },
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
            Transparent Pricing
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
            Simple Plans,{" "}
            <Box component="span" sx={{ color: "var(--accent-gold)", fontStyle: "italic" }}>
              No Surprises
            </Box>
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 480, mx: "auto", mb: 2.5 }}>
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </Typography>
          <Chip
            label="Save 20% with annual billing"
            size="small"
            sx={{
              background: "rgba(46,204,113,0.1)",
              border: "1px solid rgba(46,204,113,0.3)",
              color: "var(--accent-green)",
              fontSize: "0.72rem", fontWeight: 600,
            }}
          />
        </Container>
      </Box>

      {/* ── Plans ── */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 2.5,
            alignItems: "stretch",
          }}>
            {plans.map((plan) => (
              <Box
                key={plan.name}
                sx={{
                  background: plan.highlight ? "var(--bg-elevated)" : "var(--bg-surface)",
                  border: plan.highlight ? "1px solid rgba(212,168,67,0.5)" : "1px solid var(--border)",
                  borderRadius: "16px",
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: plan.highlight ? "0 0 40px rgba(212,168,67,0.07)" : "none",
                }}
              >
                {plan.badge && (
                  <Box sx={{
                    position: "absolute",
                    top: -11, left: "50%", transform: "translateX(-50%)",
                  }}>
                    <Chip
                      label={plan.badge}
                      size="small"
                      sx={{
                        background: "var(--accent-gold)",
                        color: "#0A0F1A",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        letterSpacing: "0.04em",
                      }}
                    />
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{
                    fontSize: "0.65rem", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.14em",
                    color: plan.highlight ? "var(--accent-gold)" : "var(--text-muted)",
                    mb: 0.75,
                  }}>
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.4, mb: 0.75 }}>
                    <Typography sx={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.4rem", fontWeight: 600,
                      color: "var(--text-primary)", lineHeight: 1,
                    }}>
                      {plan.price}
                    </Typography>
                    {plan.period && (
                      <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {plan.period}
                      </Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {plan.tagline}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, mb: 3 }}>
                  {plan.features.map((f) => (
                    <Box key={f.text} sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
                      {f.included
                        ? <CheckIcon sx={{ fontSize: 14, color: "var(--accent-green)", flexShrink: 0 }} />
                        : <CloseIcon sx={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0, opacity: 0.4 }} />
                      }
                      <Typography sx={{
                        fontSize: "0.8rem",
                        color: f.included ? "var(--text-secondary)" : "var(--text-muted)",
                        opacity: f.included ? 1 : 0.5,
                      }}>
                        {f.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Link href={plan.name === "Enterprise" ? "/contact" : "/onboarding"} passHref>
                  <Button
                    variant={plan.highlight ? "contained" : "outlined"}
                    fullWidth
                    sx={{
                      py: 1.1, fontWeight: 600, fontSize: "0.84rem",
                      ...(plan.highlight ? {} : {
                        color: "var(--text-secondary)",
                        borderColor: "var(--border)",
                        "&:hover": { borderColor: "var(--accent-gold)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.06)" },
                      }),
                    }}
                  >
                    {plan.cta} →
                  </Button>
                </Link>
              </Box>
            ))}
          </Box>

          <Typography sx={{ textAlign: "center", fontSize: "0.76rem", color: "var(--text-muted)", mt: 3 }}>
            Prices in USD or KES equivalent. Annual billing available at 20% discount. M-Pesa and bank transfer accepted.
          </Typography>
        </Container>
      </Box>

      {/* ── FAQ ── */}
      <Box sx={{ py: { xs: 7, md: 9 }, background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography sx={{
              fontSize: "0.62rem", color: "var(--accent-gold)",
              textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, mb: 1.5,
            }}>
              FAQ
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
              Frequently Asked Questions
            </Typography>
          </Box>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
            maxWidth: 860, mx: "auto",
          }}>
            {faqs.map((faq) => (
              <Box key={faq.q} sx={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                p: 2.5,
              }}>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-primary)", mb: 0.75 }}>
                  {faq.q}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {faq.a}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{
        py: { xs: 7, md: 9 },
        textAlign: "center",
        borderTop: "1px solid var(--border)",
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
            Not Sure Which Plan?
          </Typography>
          <Typography sx={{ fontSize: "0.86rem", color: "var(--text-secondary)", mb: 3, lineHeight: 1.7 }}>
            Book a free demo and let our team recommend the right plan for your firm's size and needs.
          </Typography>
          <Link href="/contact" passHref>
            <Button variant="contained" sx={{ px: 3.5, py: 1.1, fontWeight: 600, fontSize: "0.85rem" }}>
              Book a Free Demo →
            </Button>
          </Link>
        </Container>
      </Box>
    </LandingLayout>
  );
}
