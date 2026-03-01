import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAuthInputClass, mapAuthSubmitError } from "../utils/authUi";

/**
 * Login page.
 * Redirects to home immediately if the user is already authenticated
 * (e.g. navigating to /login while logged in via a bookmarked URL).
 */
function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Skip the login page when the user is already signed in.
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  /**
   * Clear the field-level error as soon as the user starts correcting it —
   * avoids stale error messages lingering while the user types a fix.
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name] || errors.submit) {
      setErrors((p) => ({ ...p, [name]: "", submit: "" }));
    }
  };

  // Returns a map of field name → error message; empty object means valid.
  const validateForm = () => {
    const next = {};
    if (!formData.username.trim()) next.username = "Username is required";
    if (!formData.password) next.password = "Password is required";
    return next;
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
      await login(formData.username, formData.password);
      navigate("/");
    } catch (error) {
      setErrors({
        submit: mapAuthSubmitError(error, {
          fallback: "Invalid username or password. Please try again.",
          networkMessage: "Network error. Check connection and try again.",
          customMatchers: [
            {
              predicate: (msg) => msg.includes("Too many login attempts"),
              message: (msg) => msg,
            },
          ],
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
            Welcome back
          </div>
          <div className="text-sm text-white/55 mt-1">
            Sign in to continue rating movies.
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errors.submit && (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errors.submit}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-white/75 mb-2">
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={getAuthInputClass(Boolean(errors.username))}
                placeholder="your_username"
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

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-white/75 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={getAuthInputClass(Boolean(errors.password))}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <div className="mt-2 text-xs font-semibold text-red-300">
                  {errors.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-2xl px-4 py-3 font-extrabold text-sm transition-colors ${
                isSubmitting
                  ? "bg-white/10 text-white/35 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-sm pt-2">
              <Link
                to="/forgot-password"
                className="text-white/60 hover:text-white transition-colors font-semibold"
              >
                Forgot password?
              </Link>
              <div className="text-white/50">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-400 hover:text-blue-300 font-bold"
                >
                  Create one
                </Link>
              </div>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-white/35 mt-6">
          CineMatch · Dark UI refresh
        </div>
      </div>
    </div>
  );
}

export default Login;
