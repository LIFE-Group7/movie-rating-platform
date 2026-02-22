import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

// Site-wide navigation with integrated search
// Search bar navigates to search page with query
// Shows login/register links or profile dropdown based on auth state
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (event) => {
    event.preventDefault();

    navigate({
      pathname: "/search",
      search: `?q=${encodeURIComponent(searchQuery)}`,
    });
    setSearchQuery("");
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          CineMatch
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search movies..."
            className="navbar-search-input"
            aria-label="Search movies"
          />
          <button
            type="submit"
            className="navbar-search-icon"
            aria-label="Search"
          >
            🔍
          </button>
        </form>

        <div className="nav-right-section">
          <div className="nav-links">
            <Link
              to="/movies"
              className={`nav-link ${isActive("/movies") ? "active" : ""}`}
            >
              Movies
            </Link>
            <Link
              to="/shows"
              className={`nav-link ${isActive("/shows") ? "active" : ""}`}
            >
              Shows
            </Link>
            <Link
              to="/watchlist"
              className={`nav-link ${isActive("/watchlist") ? "active" : ""}`}
            >
              Watchlist
            </Link>
          </div>

        {/* Show Login/Register links if not authenticated */}
        {!isAuthenticated ? (
          <div className="nav-auth">
            <Link
              to="/login"
              className={`nav-link ${isActive("/login") ? "active" : ""}`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`nav-link ${isActive("/register") ? "active" : ""}`}
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="nav-profile" ref={profileMenuRef}>
            <button
              className="profile-icon-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="User profile menu"
            >
              👤
              <span className="dropdown-arrow">▼</span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/my-reviews"
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Your Ratings
                </Link>
                <Link
                  to="/watchlist"
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Your Watchlist
                </Link>
                <Link
                  to="/favorite-actors"
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Your Favorite Actors
                </Link>
                <Link
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Account Settings
                </Link>
                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
