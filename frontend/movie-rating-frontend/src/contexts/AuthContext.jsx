/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { post as apiPost, setUnauthorizedHandler } from "../api/apiClient";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

const CLAIM_ID =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_EMAIL =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const CLAIM_ROLE =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const decodeJwtPayload = (token) => {
  try {
    const [, payloadB64] = token.split(".");
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const extractUser = (payload) => ({
  id: payload[CLAIM_ID] ?? null,
  username: payload[CLAIM_NAME] ?? "",
  email: payload[CLAIM_EMAIL] ?? "",
  role: payload[CLAIM_ROLE] ?? "User",
});

// exp is seconds while Date.now() is milliseconds.
const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
    setLoginAttempts(0);
    setLockoutTime(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      if (!isTokenExpired(token)) {
        const payload = decodeJwtPayload(token);
        if (payload) {
          setUser(extractUser(payload));
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
        }
      } else {
        localStorage.removeItem("authToken");
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.replace("/login");
    });
  }, [logout]);

  const login = async (username, password) => {
    if (lockoutTime && Date.now() < lockoutTime) {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 1000 / 60);
      throw new Error(
        `Too many login attempts. Try again in ${remaining} minutes.`,
      );
    }

    if (lockoutTime && Date.now() >= lockoutTime) {
      setLockoutTime(null);
      setLoginAttempts(0);
    }

    try {
      const data = await apiPost("/api/auth/login", { username, password });

      const rawToken = data?.token ?? data?.Token;
      if (!rawToken) throw new Error("Invalid token received from server.");

      const payload = decodeJwtPayload(rawToken);
      if (!payload) throw new Error("Invalid token received from server.");

      const userData = extractUser(payload);

      localStorage.setItem("authToken", rawToken);
      setUser(userData);
      setIsAuthenticated(true);
      setLoginAttempts(0);
      setLockoutTime(null);

      return userData;
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_TIME;
        setLockoutTime(lockUntil);
        throw new Error(
          `Too many login attempts. Try again in ${LOCKOUT_TIME / 1000 / 60} minutes.`,
        );
      }

      throw error;
    }
  };

  const register = async (username, email, password) => {
    await apiPost("/api/auth/register", { username, email, password });
    return { success: true };
  };

  const forgotPassword = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  };

  const isLockedOut = () => lockoutTime !== null && Date.now() < lockoutTime;

  const getLockoutTimeRemaining = () => {
    if (!lockoutTime) return 0;
    const remaining = lockoutTime - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === "Admin",
    login,
    register,
    forgotPassword,
    logout,
    loginAttempts,
    isLockedOut,
    getLockoutTimeRemaining,
    MAX_LOGIN_ATTEMPTS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
