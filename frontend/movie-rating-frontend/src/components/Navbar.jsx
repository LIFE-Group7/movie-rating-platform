import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

// Site-wide navigation component
// Highlights active page using current route location
function Navbar() {
  const location = useLocation();

  // Helper function to check if current route matches nav link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          Home
        </Link>
        <Link
          to="/search"
          className={`nav-link ${isActive("/search") ? "active" : ""}`}
        >
          Search
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
