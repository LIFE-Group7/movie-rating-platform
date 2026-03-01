/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  addWatchlistItem,
  fetchWatchlist,
  removeWatchlistItem,
} from "../api/watchlistApi";
import { fetchMovieById, fetchShowById } from "../api/contentApi";

const RECENTLY_VIEWED_KEY = "recentlyViewedItems";
const USER_RATINGS_KEY = "userMovieRatings";

const MAX_RECENTLY_VIEWED = 10;

const normalizeMediaType = (value) => {
  const lowerValue = String(value || "").toLowerCase();
  return lowerValue === "show" ? "show" : "movie";
};

const inferMediaType = (item) => {
  if (item?.mediaType) return normalizeMediaType(item.mediaType);
  if (item?.type) return normalizeMediaType(item.type);
  if (item?.seasons) return "show";
  return "movie";
};

const mapWatchlistItemFromApi = (item) => {
  const mediaType = normalizeMediaType(item.mediaType);

  return {
    id: item.mediaId,
    watchlistId: item.watchlistId,
    mediaType,
    type: mediaType,
    title: item.title,
    imageUrl: item.coverImageUrl,
    rating: item.averageRating,
    addedAt: item.addedAt,
    genres: [],
  };
};

const enrichWatchlistItem = async (item) => {
  const baseItem = mapWatchlistItemFromApi(item);

  try {
    if (baseItem.mediaType === "show") {
      const show = await fetchShowById(baseItem.id);
      return {
        ...show,
        watchlistId: baseItem.watchlistId,
        mediaType: "show",
        addedAt: baseItem.addedAt,
      };
    }

    const movie = await fetchMovieById(baseItem.id);
    return {
      ...movie,
      watchlistId: baseItem.watchlistId,
      mediaType: "movie",
      addedAt: baseItem.addedAt,
    };
  } catch {
    return baseItem;
  }
};

const WatchlistContext = createContext();

// Fallback protects against missing or malformed persisted JSON.
const readFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// Scope persisted data to the active user.
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
  const hasAuthSession = isAuthenticated && Boolean(user?.email);

  const syncWatchlist = useCallback(async () => {
    const response = await fetchWatchlist();
    const nextWatchlist = Array.isArray(response)
      ? await Promise.all(response.map(enrichWatchlistItem))
      : [];
    setWatchlist(nextWatchlist);
  }, []);

  useEffect(() => {
    if (!hasAuthSession) return;

    let isMounted = true;

    const loadWatchlist = async () => {
      try {
        await syncWatchlist();
        if (!isMounted) return;

        setRecentlyViewed(
          readFromStorage(getScopedKey(RECENTLY_VIEWED_KEY, user.email), []),
        );
        setUserRatings(
          readFromStorage(getScopedKey(USER_RATINGS_KEY, user.email), {}),
        );
      } catch {
        if (!isMounted) return;
        setWatchlist([]);
      }
    };

    loadWatchlist();

    return () => {
      isMounted = false;
    };
  }, [hasAuthSession, user?.email, syncWatchlist]);

  const visibleWatchlist = useMemo(
    () => (hasAuthSession ? watchlist : []),
    [hasAuthSession, watchlist],
  );
  const visibleRecentlyViewed = useMemo(
    () => (hasAuthSession ? recentlyViewed : []),
    [hasAuthSession, recentlyViewed],
  );
  const visibleUserRatings = useMemo(
    () => (hasAuthSession ? userRatings : {}),
    [hasAuthSession, userRatings],
  );

  const addToWatchlist = useCallback(
    async (movie) => {
      if (!isAuthenticated || !user?.email) return false;

      const mediaType = inferMediaType(movie);

      try {
        await addWatchlistItem(
          movie.id,
          mediaType === "show" ? "Show" : "Movie",
        );
        await syncWatchlist();
      } catch {
        return false;
      }

      return true;
    },
    [isAuthenticated, user?.email, syncWatchlist],
  );

  const removeFromWatchlist = useCallback(
    async (movieId) => {
      if (!isAuthenticated || !user?.email) return;

      const itemToRemove = watchlist.find((item) => item.id === movieId);
      if (!itemToRemove) return;

      let watchlistId = itemToRemove.watchlistId;

      if (!watchlistId) {
        try {
          const response = await fetchWatchlist();
          const nextWatchlist = Array.isArray(response)
            ? await Promise.all(response.map(enrichWatchlistItem))
            : [];
          const resolvedItem = nextWatchlist.find(
            (item) => item.id === movieId,
          );
          watchlistId = resolvedItem?.watchlistId;
          setWatchlist(nextWatchlist);
        } catch {
          return;
        }
      }

      if (!watchlistId) return;

      try {
        await removeWatchlistItem(watchlistId);
        await syncWatchlist();
      } catch {
        return;
      }
    },
    [isAuthenticated, user?.email, watchlist, syncWatchlist],
  );

  const isInWatchlist = useCallback(
    (movieId) => visibleWatchlist.some((item) => item.id === movieId),
    [visibleWatchlist],
  );

  // Keep recently viewed de-duplicated and capped.
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
    [isAuthenticated, user],
  );

  // Validate before persisting ratings to avoid corrupt local state.
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
    [isAuthenticated, user],
  );

  const getRatingForMovie = useCallback(
    (movieId) => visibleUserRatings[movieId] ?? null,
    [visibleUserRatings],
  );

  const createdAt = useMemo(() => {
    if (visibleWatchlist.length === 0) return null;
    const oldest = visibleWatchlist.reduce((currentOldest, movie) => {
      if (!currentOldest) return movie.addedAt;
      return new Date(movie.addedAt) < new Date(currentOldest)
        ? movie.addedAt
        : currentOldest;
    }, null);
    return oldest;
  }, [visibleWatchlist]);

  const value = useMemo(
    () => ({
      watchlist: visibleWatchlist,
      recentlyViewed: visibleRecentlyViewed,
      userRatings: visibleUserRatings,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      addRecentlyViewed,
      setRatingForMovie,
      getRatingForMovie,
      createdAt,
    }),
    [
      visibleWatchlist,
      visibleRecentlyViewed,
      visibleUserRatings,
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
