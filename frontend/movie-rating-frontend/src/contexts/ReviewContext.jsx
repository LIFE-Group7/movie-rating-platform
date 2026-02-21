import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

// localStorage key prefix — scoped per user email to prevent data leaking between accounts
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

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};

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

      setReviews((previous) => {
        const alreadyReviewed = previous.some((r) => r.movieId === movieId);
        if (alreadyReviewed) return previous;

        const newReview = {
          movieId,
          movieTitle,
          movieImageUrl,
          rating,
          comment: comment || "",
          type: type || "movie",
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
    (movieId, updatedFields) => {
      if (!isAuthenticated || !user?.email) return false;

      setReviews((previous) => {
        const next = previous.map((review) => {
          if (review.movieId !== movieId) return review;
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
    (movieId) => {
      if (!isAuthenticated || !user?.email) return;

      setReviews((previous) => {
        const next = previous.filter((review) => review.movieId !== movieId);
        persistReviews(next);
        return next;
      });
    },
    [isAuthenticated, user?.email, persistReviews],
  );

  // True if the user already has a review for the given movie
  const hasReviewedMovie = useCallback(
    (movieId) => reviews.some((review) => review.movieId === movieId),
    [reviews],
  );

  // Return the user's review object for a movie, or null if none exists
  const getReviewForMovie = useCallback(
    (movieId) => reviews.find((review) => review.movieId === movieId) ?? null,
    [reviews],
  );

  const value = useMemo(
    () => ({
      reviews,
      addReview,
      updateReview,
      deleteReview,
      hasReviewedMovie,
      getReviewForMovie,
    }),
    [
      reviews,
      addReview,
      updateReview,
      deleteReview,
      hasReviewedMovie,
      getReviewForMovie,
    ],
  );

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  );
}
