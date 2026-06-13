import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Button, TextField, Alert, CircularProgress,
  Chip, Avatar, LinearProgress, Divider, InputAdornment, IconButton,
  MenuItem, Select, FormControl, InputLabel, FormHelperText,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckIcon from "@mui/icons-material/Check";
import { useApp } from "../../context/AppContext";
import api from "../../lib/api";

// ─── Practice areas ───────────────────────────────────────────────────────────
const PRACTICE_AREAS = [
  "Banking & Finance", "Commercial Litigation", "Constitutional & Public Law",
  "Construction & Infrastructure", "Corporate & Commercial", "Criminal Defense",
  "Debt Recovery & Insolvency", "Employment & Labour", "Environmental Law",
  "Estate & Probate", "Family Law", "Immigration",
  "Intellectual Property", "International Trade", "Insurance Law",
  "Maritime & Admiralty", "Mergers & Acquisitions", "Mediation & Arbitration",
  "Non-Profit & NGO Law", "Real Estate & Conveyancing", "Tax Law",
  "Technology & Telecommunications", "Aviation Law", "Healthcare Law",
];

// ─── Years 1900 → current ─────────────────────────────────────────────────────
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1899 },
  (_, i) => String(new Date().getFullYear() - i)
);

// ─── Countries ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Kenya","Uganda","Tanzania","Rwanda","Ethiopia","Nigeria","Ghana","South Africa",
  "Egypt","Morocco","Senegal","Côte d'Ivoire","Cameroon","Zambia","Zimbabwe",
  "Botswana","Namibia","Mozambique","Angola","Algeria","Tunisia","Libya","Sudan",
  "United Kingdom","United States","Canada","Australia","India","Germany","France",
  "Netherlands","Sweden","Switzerland","UAE","Saudi Arabia","Qatar","Singapore",
  "China","Japan","Brazil","Other",
];

const filterOptions = createFilterOptions({ limit: 10 });

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total, labels }) {
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        {labels.map((label, i) => (
          <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", mb: 0.5,
              background: i < current ? "var(--accent-gold)" : i === current ? "rgba(212,168,67,0.2)" : "var(--bg-elevated)",
              border: i === current ? "2px solid var(--accent-gold)" : "2px solid transparent",
              transition: "all 0.3s",
            }}>
              {i < current
                ? <CheckIcon sx={{ fontSize: 14, color: "#000" }} />
                : <Typography sx={{ fontSize: "0.7rem", color: i === current ? "var(--accent-gold)" : "var(--text-muted)", fontWeight: 600 }}>{i + 1}</Typography>
              }
            </Box>
            <Typography sx={{ fontSize: "0.6rem", color: i === current ? "var(--accent-gold)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
      <LinearProgress
        variant="determinate"
        value={(current / (total - 1)) * 100}
        sx={{ height: 2, borderRadius: 1, background: "var(--bg-elevated)", "& .MuiLinearProgress-bar": { background: "var(--accent-gold)" } }}
      />
    </Box>
  );
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────
function Card({ children }) {
  return (
    <Box sx={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: "16px", p: { xs: 3, sm: 4 }, width: "100%",
    }}>
      {children}
    </Box>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
        {title}
      </Typography>
      {sub && <Typography sx={{ fontSize: "0.8rem", color: "var(--text-muted)", mt: 0.5 }}>{sub}</Typography>}
    </Box>
  );
}

// ─── Step 1: Firm Details ─────────────────────────────────────────────────────
function FirmDetails({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name?.trim()) e.name = "Firm name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const logoInitials = data.name
    ? data.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "??";

  const previewLocation = [data.city, data.country].filter(Boolean).join(", ") || "Location";
  const previewAreas = data.practiceAreas?.length ? data.practiceAreas.join(" · ") : "Practice Area";

  return (
    <Card>
      <SectionTitle title="Tell us about your firm" sub="This will appear on your dashboard and invoices." />

      {/* Avatar preview */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2, background: "var(--bg-elevated)", borderRadius: "10px" }}>
        <Avatar sx={{ width: 48, height: 48, background: "var(--accent-gold)", fontSize: "0.85rem", fontWeight: 700, borderRadius: "10px", color: "#0A0F1A" }}>
          {logoInitials}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>{data.name || "Your Firm Name"}</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {previewAreas} · {previewLocation}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Firm Name */}
        <TextField
          label="Firm Name *" fullWidth size="small" value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          error={!!errors.name} helperText={errors.name}
        />

        {/* Practice Areas — multiselect with freeSolo */}
        <Autocomplete
          multiple
          freeSolo
          size="small"
          options={PRACTICE_AREAS}
          filterOptions={filterOptions}
          value={data.practiceAreas || []}
          onChange={(_, val) => onChange({ ...data, practiceAreas: val })}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={index}
                label={option}
                size="small"
                {...getTagProps({ index })}
                sx={{ fontSize: "0.72rem", height: 22 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Practice Areas"
              size="small"
              placeholder={data.practiceAreas?.length ? "" : "e.g. Corporate & Commercial"}
              helperText="Select from the list or type a custom area and press Enter"
            />
          )}
        />

        {/* Established Year */}
        <FormControl size="small" fullWidth>
          <InputLabel>Year Established</InputLabel>
          <Select
            label="Year Established"
            value={data.established || ""}
            onChange={(e) => onChange({ ...data, established: e.target.value })}
          >
            <MenuItem value=""><em>— Select year —</em></MenuItem>
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Location — City / State / Country */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <TextField
            label="City" size="small" fullWidth value={data.city || ""}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="e.g. Nairobi"
          />
          <TextField
            label="State / County" size="small" fullWidth value={data.stateCounty || ""}
            onChange={(e) => onChange({ ...data, stateCounty: e.target.value })}
            placeholder="e.g. Nairobi County"
          />
        </Box>
        <Autocomplete
          size="small"
          options={COUNTRIES}
          value={data.country || null}
          onChange={(_, val) => onChange({ ...data, country: val || "" })}
          renderInput={(params) => (
            <TextField {...params} label="Country" placeholder="Select country" />
          )}
        />
      </Box>

      <Button
        variant="contained" fullWidth sx={{ mt: 3, py: 1.5, fontWeight: 600, textTransform: "none" }}
        onClick={() => validate() && onNext()}
      >
        Continue →
      </Button>
    </Card>
  );
}

// ─── Step 2: Plan Selection ───────────────────────────────────────────────────
const PLANS = [
  {
    id: "Starter",
    price: "KES 4,999 / mo",
    description: "Perfect for solo practitioners and small firms.",
    features: ["Up to 3 staff", "50 active cases", "5 GB storage (LexPro managed)", "Core modules"],
  },
  {
    id: "Professional",
    price: "KES 14,999 / mo",
    description: "Ideal for growing firms with multiple practice areas.",
    features: ["Up to 15 staff", "Unlimited cases", "50 GB storage (LexPro managed)", "All modules + analytics"],
    recommended: true,
  },
  {
    id: "Enterprise",
    price: "Custom pricing",
    description: "For large firms needing full control and custom integrations.",
    features: ["Unlimited staff", "Unlimited everything", "Bring Your Own Storage (R2, S3, Azure)", "Priority support + SLA"],
  },
];

function PlanSelection({ data, onChange, onNext, onBack }) {
  return (
    <Card>
      <SectionTitle title="Choose your plan" sub="You can upgrade or downgrade at any time." />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {PLANS.map((plan) => (
          <Box
            key={plan.id}
            onClick={() => onChange({ ...data, plan: plan.id })}
            sx={{
              border: `1px solid ${data.plan === plan.id ? "var(--accent-gold)" : "var(--border)"}`,
              borderRadius: "12px", p: 2, cursor: "pointer",
              background: data.plan === plan.id ? "rgba(212,168,67,0.05)" : "var(--bg-elevated)",
              transition: "all 0.2s",
              "&:hover": { borderColor: "var(--accent-gold-dim)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{plan.id}</Typography>
                {plan.recommended && (
                  <Chip label="Recommended" size="small" sx={{ fontSize: "0.58rem", height: 18, background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)", border: "none" }} />
                )}
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "var(--accent-gold)", fontWeight: 600 }}>{plan.price}</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-muted)", mb: 1 }}>{plan.description}</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {plan.features.map((f) => (
                <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <CheckIcon sx={{ fontSize: 11, color: "var(--accent-gold)" }} />
                  <Typography sx={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>{f}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
        <Button onClick={onBack} variant="outlined" sx={{ flex: 1, py: 1.5, textTransform: "none", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          ← Back
        </Button>
        <Button variant="contained" sx={{ flex: 2, py: 1.5, fontWeight: 600, textTransform: "none" }} onClick={onNext}>
          Continue →
        </Button>
      </Box>
    </Card>
  );
}

// ─── Step 3: Storage Choice ───────────────────────────────────────────────────
const STORAGE_OPTIONS = [
  {
    id: "lexpro_managed",
    label: "LexPro Managed",
    icon: "☁️",
    description: "Files stored on LexPro's Cloudflare R2 infrastructure. Zero setup, always available.",
    badge: null,
    plans: ["Starter", "Professional", "Enterprise"],
  },
  {
    id: "cloudflare_r2",
    label: "Cloudflare R2",
    icon: "🟠",
    description: "Use your own Cloudflare R2 bucket. You own the data and control access.",
    badge: "Enterprise",
    plans: ["Enterprise"],
  },
  {
    id: "aws_s3",
    label: "Amazon S3",
    icon: "🟡",
    description: "Store files in your own AWS S3 bucket in any region.",
    badge: "Enterprise",
    plans: ["Enterprise"],
  },
  {
    id: "azure_blob",
    label: "Azure Blob Storage",
    icon: "🔵",
    description: "Store files in Microsoft Azure — ideal for firms already on Azure.",
    badge: "Coming Soon",
    plans: [],
  },
];

function StorageChoice({ data, onChange, onNext, onBack, plan }) {
  return (
    <Card>
      <SectionTitle title="Where should your files live?" sub="All options encrypt data at rest. BYOS requires the Enterprise plan." />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {STORAGE_OPTIONS.map((opt) => {
          const locked = !opt.plans.includes(plan);
          const selected = data.provider === opt.id;
          return (
            <Box
              key={opt.id}
              onClick={() => !locked && onChange({ ...data, provider: opt.id })}
              sx={{
                border: `1px solid ${selected ? "var(--accent-gold)" : "var(--border)"}`,
                borderRadius: "12px", p: 2,
                cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.5 : 1,
                background: selected ? "rgba(212,168,67,0.05)" : "var(--bg-elevated)",
                transition: "all 0.2s",
                "&:hover": !locked ? { borderColor: "var(--accent-gold-dim)" } : {},
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontSize: "1.4rem" }}>{opt.icon}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }}>{opt.label}</Typography>
                    {opt.badge && (
                      <Chip
                        label={opt.badge}
                        size="small"
                        sx={{
                          fontSize: "0.58rem", height: 18,
                          background: opt.badge === "Coming Soon" ? "rgba(139,155,180,0.15)" : "rgba(212,168,67,0.15)",
                          color: opt.badge === "Coming Soon" ? "var(--text-muted)" : "var(--accent-gold)",
                          border: "none",
                        }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: "0.73rem", color: "var(--text-muted)", mt: 0.2 }}>{opt.description}</Typography>
                </Box>
                {selected && <CheckCircleIcon sx={{ color: "var(--accent-gold)", fontSize: 20 }} />}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
        <Button onClick={onBack} variant="outlined" sx={{ flex: 1, py: 1.5, textTransform: "none", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          ← Back
        </Button>
        <Button variant="contained" sx={{ flex: 2, py: 1.5, fontWeight: 600, textTransform: "none" }} onClick={onNext}>
          Continue →
        </Button>
      </Box>
    </Card>
  );
}

// ─── Step 4: Connect Storage (BYOS only) ─────────────────────────────────────
function ConnectStorage({ data, onChange, onNext, onBack }) {
  const [testing, setTesting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  const isR2 = data.provider === "cloudflare_r2";
  const isS3 = data.provider === "aws_s3";

  const testConnection = async () => {
    setTesting(true); setError(null); setVerified(false);
    try {
      await api.onboarding.verifyStorage(data);
      setVerified(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setTesting(false);
    }
  };

  const field = (label, key, opts = {}) => (
    <TextField
      label={label} fullWidth size="small" value={data[key] || ""}
      onChange={(e) => { onChange({ ...data, [key]: e.target.value }); setVerified(false); }}
      {...opts}
    />
  );

  const providerLabel = { cloudflare_r2: "Cloudflare R2", aws_s3: "Amazon S3" }[data.provider];

  return (
    <Card>
      <SectionTitle
        title={`Connect ${providerLabel}`}
        sub="Your credentials are encrypted with AES-256 and never shared."
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {field("Bucket Name *", "bucket_name", { placeholder: "e.g. my-firm-documents" })}
        {field("Access Key ID *", "access_key_id")}
        {field("Secret Access Key *", "secret_access_key", { type: "password" })}
        {isR2 && field("Account ID *", "account_id", { placeholder: "Your Cloudflare Account ID" })}
        {isS3 && field("Region", "region", { placeholder: "e.g. af-south-1" })}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, fontSize: "0.78rem" }}>{error}</Alert>}
      {verified && (
        <Alert severity="success" sx={{ mt: 2, fontSize: "0.78rem" }} icon={<CheckCircleIcon fontSize="small" />}>
          Connection verified — bucket is writable.
        </Alert>
      )}

      <Button
        onClick={testConnection}
        disabled={testing || !data.bucket_name || !data.access_key_id || !data.secret_access_key}
        variant="outlined" fullWidth
        sx={{ mt: 2, py: 1.4, textTransform: "none", borderColor: verified ? "var(--accent-green)" : "var(--border)", color: verified ? "var(--accent-green)" : "var(--text-secondary)" }}
      >
        {testing ? <><CircularProgress size={14} sx={{ mr: 1 }} /> Testing…</> : verified ? "✓ Connection Verified" : "Test Connection"}
      </Button>

      <Box sx={{ display: "flex", gap: 1.5, mt: 1.5 }}>
        <Button onClick={onBack} variant="outlined" sx={{ flex: 1, py: 1.5, textTransform: "none", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          ← Back
        </Button>
        <Button
          variant="contained" disabled={!verified}
          sx={{ flex: 2, py: 1.5, fontWeight: 600, textTransform: "none" }}
          onClick={onNext}
        >
          Continue →
        </Button>
      </Box>
    </Card>
  );
}

// ─── Step 5: Admin Account ────────────────────────────────────────────────────
function AdminAccount({ data, onChange, onBack, onSubmit, loading, error }) {
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name?.trim()) e.name = "Name is required";
    if (!data.email?.trim()) e.email = "Email is required";
    if (!data.password || data.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <Card>
      <SectionTitle title="Create your admin account" sub="This will be the primary account for your firm." />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Full Name *" fullWidth size="small" value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          error={!!errors.name} helperText={errors.name}
        />
        <TextField
          label="Phone Number" fullWidth size="small" value={data.phone || ""}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+254 700 000 000"
        />
        <TextField
          label="Email Address *" fullWidth size="small" type="email" value={data.email || ""}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          error={!!errors.email} helperText={errors.email}
        />
        <TextField
          label="Password *" fullWidth size="small"
          type={showPw ? "text" : "password"}
          value={data.password || ""}
          onChange={(e) => onChange({ ...data, password: e.target.value })}
          error={!!errors.password} helperText={errors.password || "Minimum 8 characters"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, fontSize: "0.78rem" }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
        <Button onClick={onBack} disabled={loading} variant="outlined" sx={{ flex: 1, py: 1.5, textTransform: "none", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          ← Back
        </Button>
        <Button
          variant="contained" disabled={loading}
          sx={{ flex: 2, py: 1.5, fontWeight: 600, textTransform: "none" }}
          onClick={() => validate() && onSubmit()}
        >
          {loading ? <CircularProgress size={18} sx={{ color: "#0A0F1A" }} /> : "Create Account & Launch →"}
        </Button>
      </Box>
    </Card>
  );
}

// ─── Step 6: Success ──────────────────────────────────────────────────────────
function Success({ firmName }) {
  const router = useRouter();
  return (
    <Card>
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(46,204,113,0.12)", border: "2px solid #2ECC71",
          display: "flex", alignItems: "center", justifyContent: "center",
          mx: "auto", mb: 2,
        }}>
          <CheckCircleIcon sx={{ fontSize: 32, color: "#2ECC71" }} />
        </Box>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, mb: 0.5 }}>
          Welcome to LexPro!
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-muted)", mb: 3 }}>
          {firmName} is ready. Your dashboard is waiting.
        </Typography>
        <Button
          variant="contained" fullWidth
          sx={{ py: 1.5, fontWeight: 600, textTransform: "none" }}
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard →
        </Button>
      </Box>
    </Card>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
const STEP_LABELS = ["Firm", "Plan", "Storage", "Connect", "Account", "Done"];

export default function Onboarding() {
  const { login } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [firmData, setFirmData] = useState({
    name: "", practiceAreas: [], established: "", city: "", stateCounty: "", country: "",
  });
  const [planData, setPlanData] = useState({ plan: "Professional" });
  const [storageData, setStorageData] = useState({ provider: "lexpro_managed" });
  const [adminData, setAdminData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [done, setDone] = useState(false);

  const isByos = !["lexpro_managed"].includes(storageData.provider);
  // Steps: 0=Firm, 1=Plan, 2=Storage, 3=ConnectStorage(conditional), 4=Admin, 5=Done
  const totalSteps = isByos ? 6 : 5;

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  // When storage choice is set to managed, skip the connect step
  const handleStorageNext = () => {
    if (!isByos) {
      setStep(4); // skip connect storage step, go straight to admin
    } else {
      next();
    }
  };

  const handleStorageBack = () => {
    setStep(1); // back to plan
  };

  const handleConnectBack = () => {
    setStep(2); // back to storage choice
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      // Serialise firm fields for the backend schema
      const locationParts = [firmData.city, firmData.stateCounty, firmData.country].filter(Boolean);
      const firmPayload = {
        name: firmData.name,
        specialty: firmData.practiceAreas?.join(", ") || "",
        established: firmData.established || null,
        location: locationParts.join(", ") || "",
        plan: planData.plan,
      };
      const res = await api.onboarding.register({
        firm: firmPayload,
        admin: adminData,
        storage: storageData,
      });
      // Auto-login: store token + user just like the login flow
      localStorage.setItem("lexpro_token", res.access_token);
      localStorage.setItem("lexpro_user", JSON.stringify(res.user));
      localStorage.setItem("lexpro_tenant", JSON.stringify(res.tenant));
      setDone(true);
      setStep(99); // success screen
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Build visible step index for the indicator (collapse connect-storage when managed)
  const visibleStep = step > 3 && !isByos ? step - 1 : step;
  const visibleLabels = isByos ? STEP_LABELS : STEP_LABELS.filter((_, i) => i !== 3);

  return (
    <Box sx={{
      minHeight: "100vh", background: "var(--bg-base)",
      display: "flex", alignItems: "center", justifyContent: "center",
      px: 2, py: 4,
    }}>
      {/* Ambient glow */}
      <Box sx={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

      <Box sx={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1 }}>
        {/* Brand */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "-0.02em", lineHeight: 1 }}>
            Lex<span style={{ fontStyle: "italic", color: "var(--text-primary)" }}>Pro</span>
          </Typography>
          <Typography sx={{ fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.2em", textTransform: "uppercase", mt: 0.5 }}>
            Legal Management Suite
          </Typography>
        </Box>

        {step !== 99 && (
          <StepIndicator current={visibleStep} total={visibleLabels.length} labels={visibleLabels} />
        )}

        {step === 0 && <FirmDetails data={firmData} onChange={setFirmData} onNext={next} />}
        {step === 1 && <PlanSelection data={planData} onChange={setPlanData} onNext={next} onBack={back} />}
        {step === 2 && <StorageChoice data={storageData} onChange={setStorageData} onNext={handleStorageNext} onBack={back} plan={planData.plan} />}
        {step === 3 && isByos && <ConnectStorage data={storageData} onChange={setStorageData} onNext={next} onBack={handleConnectBack} />}
        {step === 4 && <AdminAccount data={adminData} onChange={setAdminData} onBack={back} onSubmit={handleSubmit} loading={loading} error={submitError} />}
        {step === 99 && <Success firmName={firmData.name} />}

        {/* Login link */}
        {step !== 99 && (
          <Typography sx={{ textAlign: "center", mt: 3, fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <span
              onClick={() => router.push("/")}
              style={{ color: "var(--accent-gold)", cursor: "pointer" }}
            >
              Sign in →
            </span>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
