import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./ForgotPassword.css";

function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (event) => {
    setEmail(event.target.value);

    if (errors.email || errors.submit) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setSuccessMessage(
        "If an account exists for this email, a password reset link has been sent.",
      );
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        setErrors({
          submit: "Network error. Please check your connection and try again.",
        });
      } else {
        setErrors({
          submit: "Unable to process request right now. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h2>Forgot Password</h2>
          <p>Enter your email and we will send you a reset link</p>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
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

          {errors.submit && (
            <div className="error-message error-submit" role="alert">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="forgot-password-button"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>
            Remembered your password? <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
