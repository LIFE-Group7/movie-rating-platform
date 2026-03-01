const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5243";
const REQUEST_TIMEOUT_MS = 10_000;

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const buildError = (message, status = 0) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Shared fetch wrapper with auth header, timeout, and error normalization.
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
      let message = `Request failed (${response.status})`;
      try {
        const body = await response.text();
        const json = JSON.parse(body);
        message = json?.message ?? json?.title ?? body ?? message;
      } catch {
        message = String(message);
      }
      throw buildError(message, response.status);
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return response.json();

    return response.text();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") throw buildError("timeout", 0);
    if (err.status !== undefined) throw err;

    throw buildError(err.message ?? "Network error", 0);
  }
};

export const get = (path) => apiFetch(path, { method: "GET" });
export const post = (path, body) =>
  apiFetch(path, { method: "POST", body: JSON.stringify(body) });
export const put = (path, body) =>
  apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
export const del = (path) => apiFetch(path, { method: "DELETE" });
