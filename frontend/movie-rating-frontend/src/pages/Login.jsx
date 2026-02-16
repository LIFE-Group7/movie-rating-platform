import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

// User authentication page with form validation
// Prepares credentials for backend API authentication
function Login() {
  const navigate = useNavigate();

  // Form field state - tracks user credentials
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Error state - stores validation and auth error messages
  const [errors, setErrors] = useState({});

  // Loading state - prevents double submission
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password
      //   })
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Invalid credentials');
      // }
      //
      // const data = await response.json();
      // localStorage.setItem('authToken', data.token);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      console.log("User logged in:", {
        email: formData.email,
      });

      // Store mock auth token
      localStorage.setItem("authToken", "mock-jwt-token");

      // Redirect to home page
      navigate("/");
    } catch (error) {
      setErrors({
        submit: "Invalid email or password. Please try again.",
      });
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
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
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
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
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
            <div className="error-message error-submit">{errors.submit}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
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
