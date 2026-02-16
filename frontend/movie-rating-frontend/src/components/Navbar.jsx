import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

// Site-wide navigation with integrated search
// Search bar navigates to search page with query
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path) => location.pathname === path;

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link
            to="/login"
            className={`nav-link ${isActive("/login") ? "active" : ""}`}
          >
            Login
          </Link>
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search movies..."
            className="navbar-search-input"
          />
          <button type="submit" className="navbar-search-button">
            🔍
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Navbar;
