import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

// Site-wide navigation with integrated search
// Search bar navigates to search page with query
// Shows login/register links or logout button based on auth state
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

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
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          CineMatch
        </Link>
        <div className="nav-links">
          <Link
            to="/watchlist"
            className={`nav-link ${isActive("/watchlist") ? "active" : ""}`}
          >
            Watchlist
          </Link>

          {/* Show Login/Register links if not authenticated */}
          {!isAuthenticated ? (
            <>
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
            </>
          ) : (
            <>
              <Link
                to="/my-reviews"
                className={`nav-link ${isActive("/my-reviews") ? "active" : ""}`}
              >
                My Reviews
              </Link>
              {/* Show user username and logout button if authenticated */}
              <span className="nav-user">
                Welcome, {user?.username || "User"}
              </span>
              <button
                className="nav-link logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          )}
        </div>

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
            className="navbar-search-button"
            aria-label="Search"
          >
            🔍
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Navbar;
