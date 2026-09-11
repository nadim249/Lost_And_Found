import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/auth.api";

const AuthContext = createContext(undefined);

// Clean & Simple AuthProvider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Loads current logged-in user profile from server
  const refresh = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user profile on initial app load
  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSession = useCallback((res) => {
    if (res.data?.token) localStorage.setItem("token", res.data.token);
    if (res.data?.user) setUser(res.data.user);
  }, []);

  // User Login: Saves JWT token and sets user profile
  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    saveSession(res);
  }, [saveSession]);

  // User Register: Saves JWT token and sets user profile
  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    saveSession(res);
  }, [saveSession]);

  // User Logout: Clears JWT token and resets user profile
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Simple hook to access current user and auth actions
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
