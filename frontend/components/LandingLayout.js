import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Typography, Button, Container } from "@mui/material";
import BalanceIcon from "@mui/icons-material/Balance";

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

const socialLinks = [
  { icon: XIcon, href: "https://x.com/lexpro", label: "X (Twitter)" },
  { icon: LinkedInIcon, href: "https://linkedin.com/company/lexpro", label: "LinkedIn" },
  { icon: InstagramIcon, href: "https://instagram.com/lexpro", label: "Instagram" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Security", href: "/contact" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/contact" },
  ],
  Support: [
    { label: "Get a Demo", href: "/contact" },
    { label: "Sign In", href: "/login" },
    { label: "Register", href: "/onboarding" },
  ],
};

export default function LandingLayout({ children }) {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid var(--border)",
          background: "rgba(10,15,26,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
            {/* Logo */}
            <Link href="/" passHref>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
                <BalanceIcon sx={{ color: "var(--accent-gold)", fontSize: 22 }} />
                <Box>
                  <Typography sx={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.5rem", fontWeight: 700,
                    color: "var(--accent-gold)", letterSpacing: "-0.02em", lineHeight: 1,
                  }}>
                    Lex<span style={{ fontStyle: "italic", color: "var(--text-primary)" }}>Pro</span>
                  </Typography>
                  <Typography sx={{ fontSize: "0.5rem", color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    Legal Management Suite
                  </Typography>
                </Box>
              </Box>
            </Link>

            {/* Nav links */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
              {navLinks.map((link) => {
                const active = router.pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} passHref>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        px: 1.5, py: 0.75,
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: active ? "var(--accent-gold)" : "var(--text-secondary)",
                        background: active ? "rgba(212,168,67,0.08)" : "transparent",
                        transition: "all 0.15s",
                        "&:hover": { color: "var(--text-primary)", background: "rgba(255,255,255,0.04)" },
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Link>
                );
              })}
            </Box>

            {/* CTA buttons */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Link href="/login" passHref>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    color: "var(--text-secondary)",
                    borderColor: "var(--border)",
                    fontSize: "0.82rem",
                    px: 2,
                    "&:hover": { borderColor: "var(--accent-gold)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.06)" },
                  }}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/contact" passHref>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ fontSize: "0.82rem", px: 2.5, fontWeight: 600 }}
                >
                  Get Demo
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Page content */}
      <Box sx={{ flex: 1 }}>{children}</Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg-surface)",
          pt: 6, pb: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" }, gap: 4, mb: 4 }}>
            {/* Brand column */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <BalanceIcon sx={{ color: "var(--accent-gold)", fontSize: 20 }} />
                <Typography sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem", fontWeight: 700,
                  color: "var(--accent-gold)", letterSpacing: "-0.02em",
                }}>
                  Lex<span style={{ fontStyle: "italic", color: "var(--text-primary)" }}>Pro</span>
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 260 }}>
                The modern legal management suite built for Kenyan law firms. Manage cases, clients, billing and more from one platform.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ textDecoration: "none" }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: "8px",
                        border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        "&:hover": { borderColor: "var(--accent-gold)", color: "var(--accent-gold)", background: "rgba(212,168,67,0.06)" },
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon />
                    </Box>
                  </a>
                ))}
              </Box>
            </Box>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([section, links]) => (
              <Box key={section}>
                <Typography sx={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--text-muted)",
                  mb: 2,
                }}>
                  {section}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {links.map((link) => (
                    <Link key={link.href} href={link.href} passHref>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "0.84rem",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                          transition: "color 0.15s",
                          "&:hover": { color: "var(--accent-gold)" },
                        }}
                      >
                        {link.label}
                      </Typography>
                    </Link>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Bottom bar */}
          <Box sx={{
            pt: 3,
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} LexPro. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
                <Typography key={t} sx={{ fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer", "&:hover": { color: "var(--text-secondary)" } }}>
                  {t}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
