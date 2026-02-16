import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

// User authentication page with form validation
// Prepares credentials for backend API authentication
function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Form field state - tracks user credentials
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Error state - stores validation and auth error messages
  const [errors, setErrors] = useState({});

  // Loading state - prevents double submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show/hide password state
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Update form data for the changed field
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        [name]: "",
      }));
    }

    // Clear submit error when user makes changes
    if (errors.submit) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        submit: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation - required, must match email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation - required
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form before submission
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the login function from AuthContext
      await login(formData.email, formData.password);

      // Redirect to home page (useEffect will handle this, but we can also do it here)
      navigate("/");
    } catch (error) {
      // Better error handling for different failure scenarios
      if (error.message.includes("Too many login attempts")) {
        setErrors({
          submit: error.message,
        });
      } else if (error.message.includes("Failed to fetch")) {
        // Network error
        setErrors({
          submit: "Network error. Please check your connection and try again.",
        });
      } else if (error.message === "timeout") {
        // Request timeout
        setErrors({
          submit: "Request took too long. Please try again.",
        });
      } else {
        // Generic authentication error
        setErrors({
          submit: "Invalid email or password. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue rating movies</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "input-error" : ""}
              placeholder="your.email@example.com"
              disabled={isSubmitting}
              autoComplete="email"
              aria-label="Email address"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-message">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="password-field-wrapper">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "input-error" : ""}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
              aria-label="Password"
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <span id="password-error" className="error-message">
                {errors.password}
              </span>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message error-submit" role="alert">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Link to Register */}
        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
