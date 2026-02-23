import { createContext, useState, useContext, useEffect } from "react";

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext();

/**
 * Custom hook that enforces usage within an AuthProvider.
 * Throws a descriptive error rather than silently returning undefined,
 * making misconfigured component trees immediately obvious in development.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ── Rate-limiting constants ───────────────────────────────────────────────────
// After MAX_LOGIN_ATTEMPTS failed logins the user is locked out for LOCKOUT_TIME.
// These match typical industry defaults; adjust when real backend is integrated.
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

// ── Provider ──────────────────────────────────────────────────────────────────
// Wraps the entire app so any component can access auth state without prop drilling.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // `isLoading` stays true until the persisted session check resolves — prevents
  // a flash of unauthenticated UI on page refresh.
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Check if user is already logged in on app startup
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        // Parse user data from localStorage
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        // TODO: Verify token is still valid with backend
        // For now, we trust the token
      } catch (error) {
        console.error("Failed to restore session:", error);
        // Clear invalid data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Handle login
  const login = async (email, password) => {
    // Check if user is locked out
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000 / 60);
      throw new Error(
        `Too many login attempts. Try again in ${remainingTime} minutes.`,
      );
    }

    // Reset lockout if time has passed
    if (lockoutTime && Date.now() >= lockoutTime) {
      setLockoutTime(null);
      setLoginAttempts(0);
    }

    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      //
      // if (!response.ok) {
      //   // Increment failed attempts on API error
      //   const newAttempts = loginAttempts + 1;
      //   setLoginAttempts(newAttempts);
      //
      //   // Lock out after max attempts
      //   if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      //     setLockoutTime(Date.now() + LOCKOUT_TIME);
      //   }
      //
      //   throw new Error('Invalid email or password');
      // }
      //
      // const data = await response.json();
      // const userData = { email, userId: data.userId };

      // Simulate API call with slight delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock successful login - extract username from email
      const username = email.split("@")[0];
      const role = email === "admin@cinematch.com" ? "admin" : "user";
      const userData = { username, email, role };
      const mockToken = "mock-jwt-token";

      // Store in localStorage for persistence
      localStorage.setItem("authToken", mockToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setLoginAttempts(0);
      setLockoutTime(null);

      return userData;
    } catch (error) {
      // Increment failed login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Lock out after max attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutTime(Date.now() + LOCKOUT_TIME);
        throw new Error(
          `Too many login attempts. Try again in ${LOCKOUT_TIME / 1000 / 60} minutes.`,
        );
      }

      throw error;
    }
  };

  // Handle registration
  const register = async (username, email, password) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, email, password })
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Registration failed');
      // }
      //
      // const data = await response.json();

      // Simulate API call with slight delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("User registered:", { username, email });

      // Registration successful - don't auto-login, require manual login
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Handle forgot password request
  const forgotPassword = async (email) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Failed to send reset link');
      // }

      // Simulate API call with slight delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Password reset requested for:", email);

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Clear all auth state and persisted tokens on logout.
  // loginAttempts and lockoutTime are also reset so the next login starts fresh.
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setLoginAttempts(0);
    setLockoutTime(null);
  };

  // Returns true when the account is temporarily locked due to too many failures.
  const isLockedOut = () => {
    return lockoutTime && Date.now() < lockoutTime;
  };

  // Returns the number of seconds remaining in the current lockout period (0 if none).
  const getLockoutTimeRemaining = () => {
    if (!lockoutTime) return 0;
    const remaining = lockoutTime - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === "admin",
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
