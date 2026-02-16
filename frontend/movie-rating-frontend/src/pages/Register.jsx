import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Register.css";

// User registration page with form validation
// Prepares user data for backend API submission
function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form field state - tracks user input
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Error state - stores validation messages per field
  const [errors, setErrors] = useState({});

  // Loading state - prevents double submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success message state
  const [successMessage, setSuccessMessage] = useState("");

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation - required, minimum 3 characters
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation - required, must match email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation - required, minimum 6 characters
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation - must match password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      // Call the register function from AuthContext
      await register(formData.username, formData.email, formData.password);

      setSuccessMessage("Registration successful! Redirecting to login...");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Better error handling for different failure scenarios
      if (error.message.includes("Failed to fetch")) {
        // Network error
        setErrors({
          submit: "Network error. Please check your connection and try again.",
        });
      } else if (error.message === "timeout") {
        // Request timeout
        setErrors({
          submit: "Request took too long. Please try again.",
        });
      } else if (error.message.includes("already exists")) {
        // Email/username already exists
        setErrors({
          submit:
            "Email or username already in use. Please try a different one.",
        });
      } else {
        // Generic registration error
        setErrors({
          submit: "Registration failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join us to rate and discover movies</p>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? "input-error" : ""}
              placeholder="Choose a username"
              disabled={isSubmitting}
              aria-label="Username"
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username && (
              <span id="username-error" className="error-message">
                {errors.username}
              </span>
            )}
          </div>

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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "input-error" : ""}
              placeholder="At least 6 characters"
              disabled={isSubmitting}
              aria-label="Password"
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <span id="password-error" className="error-message">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? "input-error" : ""}
              placeholder="Re-enter your password"
              disabled={isSubmitting}
              aria-label="Confirm password"
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
            />
            {errors.confirmPassword && (
              <span id="confirmPassword-error" className="error-message">
                {errors.confirmPassword}
              </span>
            )}
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
            className="register-button"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Link to Login */}
        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
