import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAuthInputClass, mapAuthSubmitError } from "../utils/authUi";

/**
 * Forgot-password page.
 * Submits the email to AuthContext.forgotPassword which currently simulates
 * the API call.  The success message is intentionally vague ("if an account
 * exists…") to avoid leaking whether a given email is registered — a standard
 * security practice.
 */
function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Clear any existing errors as soon as the user edits the email field.
  const handleInputChange = (event) => {
    setEmail(event.target.value);
    if (errors.email || errors.submit) setErrors({});
  };

  // Returns a map of field name → error message; empty object means valid.
  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailPattern.test(email))
      newErrors.email = "Please enter a valid email address";

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
    setSuccessMessage("");
    setErrors({});

    try {
      // forgotPassword may be synchronous in the mock; wrap in Promise.resolve
      // so the await is safe regardless of the actual return type.
      await Promise.resolve(forgotPassword(email));
      setSuccessMessage("If an account exists, a reset link has been sent.");
    } catch (error) {
      setErrors({
        submit: mapAuthSubmitError(error, {
          fallback: "Unable to process request. Please try again.",
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-sm mx-auto px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 shadow-2xl">
          <div className="text-2xl font-extrabold tracking-tight">
            Reset password
          </div>
          <div className="text-sm text-white/55 mt-1">
            Enter your email and we’ll send you a link to reset it.
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errors.submit && (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errors.submit}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 font-semibold">
                {successMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-white/75 mb-2">
                Email
              </label>
              <input
                name="email"
                value={email}
                onChange={handleInputChange}
                className={getAuthInputClass(Boolean(errors.email))}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="mt-2 text-xs font-semibold text-red-300">
                  {errors.email}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-2xl px-4 py-3 font-extrabold text-sm transition-colors mt-2 ${
                isSubmitting
                  ? "bg-white/10 text-white/35 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isSubmitting ? "Sending link…" : "Send reset link"}
            </button>

            <div className="text-center text-sm text-white/50 pt-2">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-bold"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
