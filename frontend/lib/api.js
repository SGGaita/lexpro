function getBaseUrl() {
  // In the browser, always call the API on the same host that served the page
  // (avoids hardcoded localhost breaking when accessed via LAN IP or 127.0.0.1).
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lexpro_token");
}

async function request(method, path, body = null) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (res.status === 401) {
    localStorage.removeItem("lexpro_token");
    localStorage.removeItem("lexpro_user");
    localStorage.removeItem("lexpro_tenant");
    window.location.href = "/";
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const api = {
  // Onboarding (public — no auth required)
  onboarding: {
    verifyStorage: (data) => request("POST", "/onboarding/verify-storage", data),
    register: (data) => request("POST", "/onboarding/register", data),
  },

  // Auth
  auth: {
    tenants: () => request("GET", "/auth/tenants"),
    login: (email, password) => request("POST", "/auth/login", { email, password }),
    me: () => request("GET", "/auth/me"),
  },

  // Dashboard
  dashboard: {
    stats: () => request("GET", "/dashboard/stats"),
  },

  // Clients
  clients: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/clients${q ? "?" + q : ""}`);
    },
    get:    (id)       => request("GET",    `/clients/${id}`),
    create: (data)     => request("POST",   "/clients", data),
    update: (id, data) => request("PUT",    `/clients/${id}`, data),
    delete: (id)       => request("DELETE", `/clients/${id}`),
  },

  // Cases
  cases: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/cases${q ? "?" + q : ""}`);
    },
    get:    (id)       => request("GET",    `/cases/${id}`),
    create: (data)     => request("POST",   "/cases", data),
    update: (id, data) => request("PUT",    `/cases/${id}`, data),
    delete: (id)       => request("DELETE", `/cases/${id}`),
  },

  // Billing
  billing: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/billing${q ? "?" + q : ""}`);
    },
    create: (data) => request("POST", "/billing", data),
    update: (id, data) => request("PUT", `/billing/${id}`, data),
  },

  // Documents
  documents: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/documents${q ? "?" + q : ""}`);
    },
    upload: async (formData) => {
      const token = getToken();
      const res = await fetch(`${getBaseUrl()}/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData, // multipart — browser sets Content-Type with boundary
      });
      if (res.status === 401) {
        localStorage.removeItem("lexpro_token");
        window.location.href = "/";
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return res.json();
    },
    download: async (id, name) => {
      const token = getToken();
      const res = await fetch(`${getBaseUrl()}/documents/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name || "document";
      a.click();
      URL.revokeObjectURL(url);
    },
    delete: (id) => request("DELETE", `/documents/${id}`),
  },

  // Calendar
  calendar: {
    list: (upcomingOnly = false) => request("GET", `/calendar${upcomingOnly ? "?upcoming_only=true" : ""}`),
    create: (data) => request("POST", "/calendar", data),
    update: (id, data) => request("PUT", `/calendar/${id}`, data),
    delete: (id) => request("DELETE", `/calendar/${id}`),
  },

  // Staff
  staff: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/staff${q ? "?" + q : ""}`);
    },
    create: (data) => request("POST", "/staff", data),
    update: (id, data) => request("PUT", `/staff/${id}`, data),
    delete: (id) => request("DELETE", `/staff/${id}`),
    setDefaultAdmin: (id) => request("PUT", `/staff/${id}/set-default-admin`),
  },

  // Time Tracking
  time: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/time${q ? "?" + q : ""}`);
    },
    create: (data) => request("POST", "/time", data),
    update: (id, data) => request("PUT", `/time/${id}`, data),
    delete: (id) => request("DELETE", `/time/${id}`),
  },

  // KYC
  kyc: {
    get:    (clientId)       => request("GET", `/kyc/${clientId}`),
    update: (clientId, data) => request("PUT", `/kyc/${clientId}`, data),
    verify: (clientId)       => request("POST", `/kyc/${clientId}/verify`),
    reject: (clientId)       => request("POST", `/kyc/${clientId}/reject`),
  },

  // Conflict check
  conflictCheck: (data) => request("POST", "/cases/conflict-check", data),

  // Google Calendar
  gcal: {
    status: () => request("GET", "/gcal/status"),
    authUrl: () => request("GET", "/gcal/auth-url"),
    disconnect: () => request("DELETE", "/gcal/disconnect"),
    externalEvents: () => request("GET", "/gcal/events"),
    sync: () => request("POST", "/gcal/sync"),
  },

  // Settings
  settings: {
    get: () => request("GET", "/settings"),
    updateProfile: (data) => request("PUT", "/settings/profile", data),
    updateStorage: (data) => request("PUT", "/settings/storage", data),
    verifyStorage: () => request("POST", "/settings/storage/verify"),
  },
};

export default api;
