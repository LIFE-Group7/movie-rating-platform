import { Outlet, NavLink } from "react-router-dom";
import ClapperboardIcon from "../components/icons/ClapperboardIcon";

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
