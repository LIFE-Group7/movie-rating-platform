import { Outlet, NavLink } from "react-router-dom";

function ClapperboardIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
      <path d="m6.2 5.3 3.1 3.9" />
      <path d="m12.4 3.4 3.1 4" />
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}

/**
 * Minimal wrapper for authentication pages (Login, Register, ForgotPassword).
 * Shows only the logo so users can navigate back home without signing in.
 */
function AuthLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="border-b border-white/5 bg-zinc-950">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3">
          <NavLink
            to="/"
            className="group inline-flex items-center gap-2.5 no-underline focus:outline-none"
            aria-label="CineMatch Home"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              <ClapperboardIcon className="w-5 h-5 fill-white/10" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold tracking-tight">
              <span className="text-white">Cine</span>
              <span className="text-blue-500">Match</span>
            </span>
          </NavLink>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
