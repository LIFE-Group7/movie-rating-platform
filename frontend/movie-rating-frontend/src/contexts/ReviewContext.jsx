import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

// ── Storage helpers ───────────────────────────────────────────────────────────

// localStorage key base — the full key is always scoped per user email to
// prevent data leaking between accounts on the same browser.
const USER_REVIEWS_KEY = "userReviews";

const ReviewsContext = createContext();

/**
 * Safely read and parse a JSON value from localStorage.
 * Returns the fallback value if the key is absent or the data is malformed.
 */
const readFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Build a user-scoped localStorage key so each user's reviews
 * are isolated from other accounts on the same browser.
 */
const buildScopedKey = (baseKey, email) => `${baseKey}:${email || "guest"}`;
const normalizeType = (type) => type || "movie";
const matchesReview = (review, movieId, type = "movie") =>
  review.movieId === movieId &&
  normalizeType(review.type) === normalizeType(type);

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};

// ── Provider ──────────────────────────────────────────────────────────────────
// Manages the current user's review list. All reads and writes go through
// localStorage (keyed by email) until a real API is wired up.
export function ReviewsProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);

  // Reload reviews from localStorage whenever the authenticated user changes
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setReviews([]);
      return;
    }

    const storedReviews = readFromStorage(
      buildScopedKey(USER_REVIEWS_KEY, user.email),
      [],
    );
    setReviews(storedReviews);
  }, [isAuthenticated, user?.email]);

  /**
   * Write the updated review list to the current user's scoped localStorage slot.
   * Called after every mutation (add, update, delete).
   */
  const persistReviews = useCallback(
    (updatedReviews) => {
      if (!user?.email) return;
      const storageKey = buildScopedKey(USER_REVIEWS_KEY, user.email);
      localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
    },
    [user?.email],
  );

  /**
   * Persist a new review. Silently ignores duplicate submissions for the
   * same movie — one review per user per movie, matching backend constraint.
   */
  const addReview = useCallback(
    (reviewData) => {
      if (!isAuthenticated || !user?.email) return false;

      const { movieId, movieTitle, movieImageUrl, rating, comment, type } =
        reviewData;
      const reviewType = normalizeType(type);

      setReviews((previous) => {
        const alreadyReviewed = previous.some((r) =>
          matchesReview(r, movieId, reviewType),
        );
        if (alreadyReviewed) return previous;

        const newReview = {
          movieId,
          movieTitle,
          movieImageUrl,
          rating,
          comment: comment || "",
          type: reviewType,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        };

        const next = [newReview, ...previous];
        persistReviews(next);
        return next;
      });

      return true;
    },
    [isAuthenticated, user?.email, persistReviews],
  );

  /**
   * Apply partial updates (rating and/or comment) to an existing review
   * and stamp the updatedAt timestamp so the UI can surface "Edited on…".
   */
  const updateReview = useCallback(
    (movieId, updatedFields, type = "movie") => {
      if (!isAuthenticated || !user?.email) return false;

      setReviews((previous) => {
        const next = previous.map((review) => {
          if (!matchesReview(review, movieId, type)) return review;
          return {
            ...review,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        });
        persistReviews(next);
        return next;
      });

      return true;
    },
    [isAuthenticated, user?.email, persistReviews],
  );

  // Permanently remove a review by movieId
  const deleteReview = useCallback(
    (movieId, type = "movie") => {
      if (!isAuthenticated || !user?.email) return;

      setReviews((previous) => {
        const next = previous.filter(
          (review) => !matchesReview(review, movieId, type),
        );
        persistReviews(next);
        return next;
      });
    },
    [isAuthenticated, user?.email, persistReviews],
  );

  // True if the user already has a review for the given movie
  const hasReviewedMovie = useCallback(
    (movieId, type = "movie") =>
      reviews.some((review) => matchesReview(review, movieId, type)),
    [reviews],
  );

  // Return the user's review object for a movie, or null if none exists
  const getReviewForMovie = useCallback(
    (movieId, type = "movie") =>
      reviews.find((review) => matchesReview(review, movieId, type)) ?? null,
    [reviews],
  );

  // Content-type-aware aliases for detail pages and new callers.
  const hasReviewedItem = useCallback(
    ({ movieId, type = "movie" }) => hasReviewedMovie(movieId, type),
    [hasReviewedMovie],
  );

  const getReviewForItem = useCallback(
    ({ movieId, type = "movie" }) => getReviewForMovie(movieId, type),
    [getReviewForMovie],
  );

  const value = useMemo(
    () => ({
      reviews,
      addReview,
      updateReview,
      deleteReview,
      hasReviewedMovie,
      getReviewForMovie,
      hasReviewedItem,
      getReviewForItem,
    }),
    [
      reviews,
      addReview,
      updateReview,
      deleteReview,
      hasReviewedMovie,
      getReviewForMovie,
      hasReviewedItem,
      getReviewForItem,
    ],
  );

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  );
}
