import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Guard component — redirects unauthenticated users to /login.
 *
 * Waits for the auth session check (isLoading) to finish before deciding so
 * users who refresh on a protected page don't get incorrectly bounced.
 */
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Render a loading indicator while the persisted session is being restored.
  // Without this guard, isAuthenticated would briefly be false on every refresh,
  // causing a redirect to /login even for logged-in users.
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-zinc-950 text-white">
        <div className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="text-sm font-semibold text-white/80">Loading…</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default PrivateRoute;
