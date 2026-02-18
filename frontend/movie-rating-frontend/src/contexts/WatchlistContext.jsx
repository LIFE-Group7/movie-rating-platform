import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const WATCHLIST_KEY = "watchlistItems";
const RECENTLY_VIEWED_KEY = "recentlyViewedItems";
const USER_RATINGS_KEY = "userMovieRatings";
const MAX_RECENTLY_VIEWED = 10;

const WatchlistContext = createContext();

const readFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

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

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setWatchlist([]);
      setRecentlyViewed([]);
      setUserRatings({});

      localStorage.removeItem(WATCHLIST_KEY);
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
      localStorage.removeItem(USER_RATINGS_KEY);
      localStorage.removeItem(getScopedKey(WATCHLIST_KEY, null));
      localStorage.removeItem(getScopedKey(RECENTLY_VIEWED_KEY, null));
      localStorage.removeItem(getScopedKey(USER_RATINGS_KEY, null));
      return;
    }

    setWatchlist(readFromStorage(getScopedKey(WATCHLIST_KEY, user.email), []));
    setRecentlyViewed(
      readFromStorage(getScopedKey(RECENTLY_VIEWED_KEY, user.email), []),
    );
    setUserRatings(readFromStorage(getScopedKey(USER_RATINGS_KEY, user.email), {}));
  }, [isAuthenticated, user?.email]);

  const addToWatchlist = useCallback((movie) => {
    if (!isAuthenticated || !user?.email) return false;

    let added = false;
    const watchlistStorageKey = getScopedKey(WATCHLIST_KEY, user.email);

    setWatchlist((previous) => {
      const exists = previous.some((item) => item.id === movie.id);
      if (exists) return previous;

      added = true;
      const now = new Date().toISOString();
      const watchlistMovie = {
        ...movie,
        addedAt: now,
      };

      const next = [watchlistMovie, ...previous];
      localStorage.setItem(watchlistStorageKey, JSON.stringify(next));
      return next;
    });

    return added;
  }, [isAuthenticated, user?.email]);

  const removeFromWatchlist = useCallback((movieId) => {
    if (!isAuthenticated || !user?.email) return;

    const watchlistStorageKey = getScopedKey(WATCHLIST_KEY, user.email);
    setWatchlist((previous) => {
      const next = previous.filter((item) => item.id !== movieId);
      localStorage.setItem(watchlistStorageKey, JSON.stringify(next));
      return next;
    });
  }, [isAuthenticated, user?.email]);

  const isInWatchlist = useCallback(
    (movieId) => watchlist.some((item) => item.id === movieId),
    [watchlist],
  );

  const addRecentlyViewed = useCallback((movie) => {
    if (!isAuthenticated || !user?.email) return;

    const recentlyViewedStorageKey = getScopedKey(RECENTLY_VIEWED_KEY, user.email);
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
  }, [isAuthenticated, user?.email]);

  const setRatingForMovie = useCallback((movieId, rating) => {
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
  }, [isAuthenticated, user?.email]);

  const getRatingForMovie = useCallback(
    (movieId) => userRatings[movieId] ?? null,
    [userRatings],
  );

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
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  );
}
