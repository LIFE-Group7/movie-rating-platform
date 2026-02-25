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
    createMovieReview,
    updateMovieReview,
    deleteMovieReview,
    createShowReview,
    updateShowReview, 
    deleteShowReview, 
    fetchUserReviews,
} from "../api/reviewApi";

const ReviewsContext = createContext();

/*const normalizeType = (type) => type ?? "movie";*/

const matchesReview = (review, movieId, type = "movie") => {
    if (movieId == null) return false;
    if (review?.movieId == null) return false;
    return (
        Number(review.movieId) === Number(movieId) &&
        normalizeType(review.type) === normalizeType(type)
    );
};

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

  // Fetch from DB on mount or auth change
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setReviews([]);
      return;
    }

    const load = async () => {
      try {
        const apiReviews = await fetchUserReviews();
        setReviews(
            Array.isArray(apiReviews)
                ? apiReviews.map((review) => ({
                    ...review,
                    movieImageUrl:
                        review.movieImageUrl ?? review.movieCoverImageUrl ?? null,
                    type: normalizeType(review.type),
                })) 
                : [],
        );
      } catch (err) {
          console.error("Failed to load reviews from API", err);
          setReviews([]);
      }
    };

    load();
  }, [isAuthenticated, user?.email]);
  
  const addReview = useCallback(
    async (reviewData) => {
        if (!isAuthenticated) return false;

      const { movieId, movieTitle, movieImageUrl, rating, comment, type } =
        reviewData;
      const reviewType = normalizeType(type);

      // Fast duplicate check against local state before hitting the network
      const alreadyReviewed = reviews.some((r) =>
        matchesReview(r, movieId, reviewType),
      );
      if (alreadyReviewed) return false;

        try {
            if (reviewType === "show") {
                await createShowReview({
                    showId: movieId,
                    rating,
                    comment,
                });
            } else {
                await createMovieReview({
                    movieId,
                    rating,
                    comment,
                });
            }

            const newReview = {
                movieId,
                movieTitle,
                movieImageUrl, // Backend returns 'movieCoverImageUrl', handle map if needed later
                rating,
                comment: comment || "",
                type: reviewType,
                createdAt: new Date().toISOString(),
                updatedAt: null,
            };

            setReviews((prev) => [newReview, ...prev]);
            return true;
        } catch (err) {
            console.error("Failed to create review", err);
            return false;
        }
    }, 
      [isAuthenticated, reviews],
  );
  
  const updateReview = useCallback(
      async (movieId, updatedFields, type = "movie") => {
          if (!isAuthenticated) return false;

          try {
              const normalizedType = normalizeType(type);
              if (normalizedType === "show") {
                  await updateShowReview({
                      showId: movieId,
                      rating: updatedFields.rating,
                      comment: updatedFields.comment,
                  });
              } else {
                  await updateMovieReview({
                      movieId,
                      rating: updatedFields.rating,
                      comment: updatedFields.comment,
                  });
              }

              setReviews((prev) =>
                  prev.map((review) => {
                      if (!matchesReview(review, movieId, type)) return review;
                      return {
                          ...review,
                          ...updatedFields,
                          updatedAt: new Date().toISOString(),
                      };
                  }),
              );
              return true;
          } catch (err) {
              console.error("Failed to update review", err);
              return false;
          }
    }, 
      [isAuthenticated],
  );

  // Permanently remove a review by movieId
  const deleteReview = useCallback(
      async (movieId, type = "movie") => {
          if (!isAuthenticated) return;

          try {
              if (normalizeType(type) === "show") {
                  await deleteShowReview(movieId);
              } else {
                  await deleteMovieReview(movieId);
              }

              setReviews((prev) =>
                  prev.filter((r) => !matchesReview(r, movieId, type)),
              );
          } catch (err) {
              console.error("Failed to delete review", err);
          }
      },
    [isAuthenticated],
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
