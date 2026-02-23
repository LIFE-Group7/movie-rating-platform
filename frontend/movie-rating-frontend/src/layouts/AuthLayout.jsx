import { Outlet } from "react-router-dom";

/**
 * Minimal wrapper for authentication pages (Login, Register, ForgotPassword).
 * Intentionally excludes Navbar and Footer to keep auth flows distraction-free.
 */
function AuthLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
