import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PrivateRoute component - protects routes that require authentication
// If user is not authenticated, redirects to login page
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  // If user is authenticated, render the component
  if (isAuthenticated) {
    return children;
  }

  // If user is not authenticated, redirect to login
  return <Navigate to="/login" replace />;
}

export default PrivateRoute;
