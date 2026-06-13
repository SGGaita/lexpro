import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Box, Typography, Button, TextField, Alert,
  CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <Box sx={{
        position: "absolute",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,168,67,0.05) 0%, transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      <Box sx={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>

        {/* Brand */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.4rem", fontWeight: 700,
            color: "var(--accent-gold)", letterSpacing: "-0.02em", lineHeight: 1,
          }}>
            Lex<span style={{ fontStyle: "italic", color: "var(--text-primary)" }}>Pro</span>
          </Typography>
          <Typography sx={{
            fontSize: "0.62rem", color: "var(--text-muted)",
            letterSpacing: "0.2em", textTransform: "uppercase", mt: 0.5,
          }}>
            Legal Management Suite
          </Typography>
          <Box sx={{ width: 32, height: 1, background: "var(--accent-gold)", opacity: 0.4, mx: "auto", mt: 1.5 }} />
        </Box>

        {/* Login card */}
        <Box sx={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          p: { xs: 3, sm: 4 },
        }}>
          <Typography sx={{
            fontSize: "0.65rem", color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.12em",
            mb: 3, textAlign: "center",
          }}>
            Sign in to your account
          </Typography>

          <form onSubmit={handleLogin}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                required
                fullWidth
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="small"
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                        {showPw
                          ? <VisibilityOffIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} />
                          : <VisibilityIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2, fontSize: "0.75rem",
                  background: "rgba(231,76,60,0.08)",
                  color: "#E74C3C",
                  border: "1px solid rgba(231,76,60,0.2)",
                  "& .MuiAlert-icon": { fontSize: 18 },
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5, fontSize: "0.88rem",
                fontWeight: 600, borderRadius: "8px", textTransform: "none",
              }}
            >
              {loading
                ? <CircularProgress size={18} sx={{ color: "#0A0F1A" }} />
                : "Sign In →"
              }
            </Button>
          </form>
        </Box>

        {/* Register link */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            New law firm?{" "}
            <Link href="/onboarding" passHref>
              <span style={{ color: "var(--accent-gold)", cursor: "pointer", fontWeight: 600 }}>
                Register your firm →
              </span>
            </Link>
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}
