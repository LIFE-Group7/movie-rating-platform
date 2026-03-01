import { del, get, post } from "./apiClient";

export const fetchWatchlist = () => get("/api/watchlist");

export const addWatchlistItem = (mediaId, mediaType) =>
  post("/api/watchlist", { mediaId, mediaType });

export const removeWatchlistItem = (watchlistId) =>
  del(`/api/watchlist/${watchlistId}`);
