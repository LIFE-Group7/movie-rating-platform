const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5243";
const REQUEST_TIMEOUT_MS = 10_000;

// Registered once by AuthContext; called on every 401 response.
let unauthorizedHandler = null;

/** Registers the callback invoked on every 401 response (FE-05). */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

/** Normalises any error into a thrown Error with a .status property. */
const buildError = (message, status = 0) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Core fetch wrapper used by all public helpers.
 *
 * Responsibilities:
 *  - Prepends VITE_API_BASE_URL to every relative path.
 *  - Attaches Bearer token from localStorage when one exists.
 *  - Enforces a 10 s hard timeout via AbortController.
 *  - Normalises non-2xx responses and network errors into thrown Errors.
 *  - Calls the registered unauthorizedHandler on 401 so AuthContext
 *    can log the user out without the API layer knowing about React state.
 */
export const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      unauthorizedHandler?.();
      throw buildError("Session expired. Please log in again.", 401);
    }

    if (!response.ok) {
      // Backend may return a plain string or a JSON object with a message field.
      let message = `Request failed (${response.status})`;
      try {
        const body = await response.text();
        const json = JSON.parse(body);
        message = json?.message ?? json?.title ?? body ?? message;
      } catch {
        // Body was not JSON — keep the default message.
      }
      throw buildError(message, response.status);
    }

    if (response.status === 204) return null; // No Content — nothing to parse.

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return response.json();

    return response.text();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") throw buildError("timeout", 0);
    if (err.status !== undefined) throw err; // Already normalised — re-throw.

    throw buildError(err.message ?? "Network error", 0);
  }
};

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const get = (path) => apiFetch(path, { method: "GET" });
export const post = (path, body) =>
  apiFetch(path, { method: "POST", body: JSON.stringify(body) });
export const put = (path, body) =>
  apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
export const del = (path) => apiFetch(path, { method: "DELETE" });
