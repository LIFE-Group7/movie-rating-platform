import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

// ── localStorage key bases ────────────────────────────────────────────────────
// Scoped per user (see getScopedKey) so separate accounts on the same browser
// never share or overwrite each other's data.
const WATCHLIST_KEY = "watchlistItems";
const RECENTLY_VIEWED_KEY = "recentlyViewedItems";
const USER_RATINGS_KEY = "userMovieRatings";

// Cap recently-viewed history to prevent unbounded localStorage growth.
const MAX_RECENTLY_VIEWED = 10;

const WatchlistContext = createContext();

/**
 * Safely read and parse a JSON value from localStorage.
 * Returns the fallback value when the key is absent or the stored data is
 * malformed — avoids crashing the app on corrupt persisted state.
 */
const readFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Build a user-scoped localStorage key so each user's data is isolated.
 * Unauthenticated access uses "guest" as a sentinel — data written under
 * that key is discarded when the user logs in under a real email.
 */
const getScopedKey = (baseKey, email) => `${baseKey}:${email || "guest"}`;

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};

export function WatchlistProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [userRatings, setUserRatings] = useState({});

  // Clear in-memory state when the user logs out or auth is not yet resolved.
  // All persistent data uses scoped keys (keyed by email), so nothing in
  // localStorage needs to be removed here — the data is invisible to other
  // accounts and will be reloaded on next login.
  // BUG FIX: previously removed bare non-scoped keys (`WATCHLIST_KEY` etc.)
  // which were never written to in this context; removing them was dead-code
  // cleanup that could accidentally clobber unrelated storage consumers.
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setWatchlist([]);
      setRecentlyViewed([]);
      setUserRatings({});
      return;
    }

    setWatchlist(readFromStorage(getScopedKey(WATCHLIST_KEY, user.email), []));
    setRecentlyViewed(
      readFromStorage(getScopedKey(RECENTLY_VIEWED_KEY, user.email), []),
    );
    setUserRatings(
      readFromStorage(getScopedKey(USER_RATINGS_KEY, user.email), {}),
    );
  }, [isAuthenticated, user?.email]);

  const addToWatchlist = useCallback(
    (movie) => {
      if (!isAuthenticated || !user?.email) return false;

      // `added` is captured outside the setState callback so callers can know
      // whether the item was actually inserted (vs. a silently ignored duplicate).
      let added = false;
      const watchlistStorageKey = getScopedKey(WATCHLIST_KEY, user.email);

      setWatchlist((previous) => {
        const exists = previous.some((item) => item.id === movie.id);
        if (exists) return previous; // one title per watchlist — enforce silently

        added = true;
        const now = new Date().toISOString();
        const watchlistMovie = {
          ...movie,
          addedAt: now, // timestamp used for "oldest item" derivation in createdAt
        };

        const next = [watchlistMovie, ...previous];
        localStorage.setItem(watchlistStorageKey, JSON.stringify(next));
        return next;
      });

      return added;
    },
    [isAuthenticated, user?.email],
  );

  // Remove a title from the watchlist by its unique id.
  const removeFromWatchlist = useCallback(
    (movieId) => {
      if (!isAuthenticated || !user?.email) return;

      const watchlistStorageKey = getScopedKey(WATCHLIST_KEY, user.email);
      setWatchlist((previous) => {
        const next = previous.filter((item) => item.id !== movieId);
        localStorage.setItem(watchlistStorageKey, JSON.stringify(next));
        return next;
      });
    },
    [isAuthenticated, user?.email],
  );

  // Pure predicate — does not mutate state. Used by cards to set button label.
  const isInWatchlist = useCallback(
    (movieId) => watchlist.some((item) => item.id === movieId),
    [watchlist],
  );

  /**
   * Push a title onto the front of recently-viewed history.
   * Deduplicates by id (re-visiting moves the entry to the top) and trims to
   * MAX_RECENTLY_VIEWED so history never grows unboundedly.
   */
  const addRecentlyViewed = useCallback(
    (movie) => {
      if (!isAuthenticated || !user?.email) return;

      const recentlyViewedStorageKey = getScopedKey(
        RECENTLY_VIEWED_KEY,
        user.email,
      );
      setRecentlyViewed((previous) => {
        const now = new Date().toISOString();
        const item = {
          ...movie,
          viewedAt: now,
        };

        const withoutCurrent = previous.filter((m) => m.id !== movie.id);
        const next = [item, ...withoutCurrent].slice(0, MAX_RECENTLY_VIEWED);
        localStorage.setItem(recentlyViewedStorageKey, JSON.stringify(next));
        return next;
      });
    },
    [isAuthenticated, user?.email],
  );

  /**
   * Store a numeric rating (0–10) for a movie.
   * Validates the value before writing — returns false and does nothing on
   * out-of-range or non-finite input, preventing corrupted persisted state.
   */
  const setRatingForMovie = useCallback(
    (movieId, rating) => {
      if (!isAuthenticated || !user?.email) return false;

      const safeRating = Number(rating);
      if (!Number.isFinite(safeRating) || safeRating < 0 || safeRating > 10) {
        return false;
      }

      const userRatingsStorageKey = getScopedKey(USER_RATINGS_KEY, user.email);

      setUserRatings((previous) => {
        const next = {
          ...previous,
          [movieId]: safeRating,
        };
        localStorage.setItem(userRatingsStorageKey, JSON.stringify(next));
        return next;
      });

      return true;
    },
    [isAuthenticated, user?.email],
  );

  // Return the user's stored rating for a movie, or null if none has been set.
  const getRatingForMovie = useCallback(
    (movieId) => userRatings[movieId] ?? null,
    [userRatings],
  );

  /**
   * ISO timestamp of the *oldest* item currently in the watchlist.
   * Exposed so the UI can show "watching since…" style metadata.
   * Returns null when the watchlist is empty.
   */
  const createdAt = useMemo(() => {
    if (watchlist.length === 0) return null;
    const oldest = watchlist.reduce((currentOldest, movie) => {
      if (!currentOldest) return movie.addedAt;
      return new Date(movie.addedAt) < new Date(currentOldest)
        ? movie.addedAt
        : currentOldest;
    }, null);
    return oldest;
  }, [watchlist]);

  const value = useMemo(
    () => ({
      watchlist,
      recentlyViewed,
      userRatings,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      addRecentlyViewed,
      setRatingForMovie,
      getRatingForMovie,
      createdAt,
    }),
    [
      watchlist,
      recentlyViewed,
      userRatings,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      addRecentlyViewed,
      setRatingForMovie,
      getRatingForMovie,
      createdAt,
    ],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}
