import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";
import ClapperboardIcon from "./icons/ClapperboardIcon";

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const initials = useMemo(() => {
    const parts = String(username).trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  }, [username]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
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

          <div className="flex-1 hidden md:block">
            <SearchBar
              placeholder="Search movies or shows..."
              onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
            />
          </div>

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
                      Watchlist
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
                    {isAdmin && (
                      <>
                        <div className="h-px bg-white/10" />
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/admin");
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-colors"
                        >
                          Dashboard
                        </button>
                      </>
                    )}

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
