import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";

// ── Inline SVG — avoids an external icon library dependency ──────────────────
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
 * Sticky top navigation bar.
 * - Applies a frosted-glass blur effect after the user scrolls past 8 px.
 * - Closes the profile dropdown when the user clicks outside it or presses Escape.
 * - Shows Login/Register links for guests and a profile menu for logged-in users.
 */
function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Attach scroll listener once and clean it up on unmount.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll(); // initialise immediately so state matches the current scroll position
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the profile dropdown on outside click or Escape key.
  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const username = user?.username || "User";

  // Derive up to two initials from the username for the avatar badge.
  const initials = useMemo(() => {
    const parts = String(username).trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  }, [username]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
    setShowProfileMenu(false);
  };

  const linkBase =
    "px-3 py-2 rounded-xl text-sm font-semibold transition-colors";
  const navLink = ({ isActive }) =>
    `${linkBase} ${
      isActive
        ? "text-white bg-white/10 border border-white/10"
        : "text-white/70 hover:text-white hover:bg-white/5"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        isScrolled
          ? "bg-zinc-950/70 backdrop-blur-xl border-white/10"
          : "bg-zinc-950 border-white/5"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Logo with Icon */}
          <NavLink
            to="/"
            className="group flex items-center gap-2.5 no-underline focus:outline-none"
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

          {/* Center search */}
          <div className="flex-1 hidden md:block">
            <SearchBar
              placeholder="Search movies or shows..."
              onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
            />
          </div>

          {/* Right actions */}
          <nav className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={navLink}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLink}>
                  Register
                </NavLink>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  className="inline-flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center">
                    {initials}
                  </span>
                  <span className="text-sm text-white/80 font-semibold hidden sm:inline">
                    {username}
                  </span>
                  <span className="text-white/60 text-xs">▾</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/watchlist");
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      My Watchlist
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/my-reviews");
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      My Reviews
                    </button>

                    <div className="h-px bg-white/10" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-white/5 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Mobile search */}
        <div className="block md:hidden mt-3">
          <SearchBar
            placeholder="Search movies or shows..."
            onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
