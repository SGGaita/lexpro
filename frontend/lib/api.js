const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lexpro_token");
}

async function request(method, path, body = null) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
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
    create: (data) => request("POST", "/clients", data),
    update: (id, data) => request("PUT", `/clients/${id}`, data),
    delete: (id) => request("DELETE", `/clients/${id}`),
  },

  // Cases
  cases: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/cases${q ? "?" + q : ""}`);
    },
    create: (data) => request("POST", "/cases", data),
    update: (id, data) => request("PUT", `/cases/${id}`, data),
    delete: (id) => request("DELETE", `/cases/${id}`),
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
    create: (data) => request("POST", "/documents", data),
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
};

export default api;
