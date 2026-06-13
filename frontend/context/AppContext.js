import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState({
    clients: [], cases: [], invoices: [], documents: [],
    events: [], timeEntries: [], staff: [],
  });
  const [stats, setStats] = useState({
    activeCases: 0, totalClients: 0, totalStaff: 0,
    pendingInvoices: 0, overdueInvoices: 0, totalRevenue: 0,
    totalBilled: 0, unbilledHours: 0, upcomingHearings: 0, collectionRate: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("lexpro_token");
    const savedUser = localStorage.getItem("lexpro_user");
    const savedTenant = localStorage.getItem("lexpro_tenant");
    if (token && savedUser && savedTenant) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setCurrentTenant(JSON.parse(savedTenant));
        setIsAuthenticated(true);
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshAll();
  }, [isAuthenticated]);

  const refreshAll = useCallback(async () => {
    try {
      const [statsData, clients, cases, invoices, documents, events, staff, timeEntries] = await Promise.all([
        api.dashboard.stats(),
        api.clients.list(),
        api.cases.list(),
        api.billing.list(),
        api.documents.list(),
        api.calendar.list(),
        api.staff.list(),
        api.time.list(),
      ]);
      setStats({
        activeCases: statsData.active_cases,
        totalClients: statsData.total_clients,
        totalStaff: statsData.total_staff,
        pendingInvoices: statsData.pending_invoices,
        overdueInvoices: statsData.overdue_invoices,
        totalRevenue: statsData.total_revenue,
        totalBilled: statsData.total_billed,
        unbilledHours: statsData.unbilled_hours,
        upcomingHearings: statsData.upcoming_hearings,
        collectionRate: statsData.collection_rate,
      });
      setTenantData({ clients, cases, invoices, documents, events, timeEntries, staff });
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem("lexpro_token", res.access_token);
    localStorage.setItem("lexpro_user", JSON.stringify(res.user));
    localStorage.setItem("lexpro_tenant", JSON.stringify(res.tenant));
    setCurrentUser(res.user);
    setCurrentTenant(res.tenant);
    setIsAuthenticated(true);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("lexpro_token");
    localStorage.removeItem("lexpro_user");
    localStorage.removeItem("lexpro_tenant");
    setCurrentUser(null);
    setCurrentTenant(null);
    setIsAuthenticated(false);
    setTenantData({ clients: [], cases: [], invoices: [], documents: [], events: [], timeEntries: [], staff: [] });
  };

  return (
    <AppContext.Provider value={{
      currentTenant, currentUser, tenants, isAuthenticated, loading,
      tenantData, stats, login, logout, refreshAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
