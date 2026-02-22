import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Registration page.
 * On success, navigates to /login after a short delay so the user can see the
 * confirmation message — intentionally does NOT auto-login to keep the auth
 * flow explicit (the user must verify credentials by logging in manually).
 */
function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Clear per-field error as soon as the user starts correcting the value.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Returns a map of field name → error message; empty object means all fields valid.
  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    setSuccessMessage("");
    setErrors({});

    try {
      await register(formData.username, formData.email, formData.password);
      setSuccessMessage("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      // Map known API error messages to user-friendly copy.
      const msg = String(error?.message || "");
      if (msg.includes("already exists"))
        setErrors({ submit: "Username or email already taken." });
      else if (msg.includes("Failed to fetch"))
        setErrors({ submit: "Network error. Please try again." });
      else setErrors({ submit: "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Returns the full Tailwind class string for a text input based on error state.
  const inputClass = (hasError) =>
    `w-full rounded-2xl px-4 py-3 text-sm outline-none transition border bg-zinc-950/40 text-white placeholder:text-white/30 ${
      hasError
        ? "border-red-400/40 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/15"
        : "border-white/10 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
    }`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-sm mx-auto px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 shadow-2xl">
          <div className="text-2xl font-extrabold tracking-tight">
            Create account
          </div>
          <div className="text-sm text-white/55 mt-1">
            Join CineMatch to rate and discover movies.
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
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={inputClass(Boolean(errors.username))}
                placeholder="MovieBuff99"
                type="text"
                autoComplete="username"
                disabled={isSubmitting}
              />
              {errors.username && (
                <div className="mt-2 text-xs font-semibold text-red-300">
                  {errors.username}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-white/75 mb-2">
                Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass(Boolean(errors.email))}
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

            <div>
              <label className="block text-sm font-bold text-white/75 mb-2">
                Password
              </label>
              <input
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={inputClass(Boolean(errors.password))}
                placeholder="At least 6 characters"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <div className="mt-2 text-xs font-semibold text-red-300">
                  {errors.password}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-white/75 mb-2">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={inputClass(Boolean(errors.confirmPassword))}
                placeholder="Retype password"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <div className="mt-2 text-xs font-semibold text-red-300">
                  {errors.confirmPassword}
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
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>

            <div className="text-center text-sm text-white/50 pt-2">
              Already have an account?{" "}
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

export default Register;
