import { del, get, post, put } from "./apiClient";

/**
 * POST /api/Reviews/movies
 */
export const createMovieReview = (reviewData) =>
  post("/api/Reviews/movies", reviewData);

/**
 * PUT /api/Reviews/movies
 */
export const updateMovieReview = (reviewData) =>
  put("/api/Reviews/movies", reviewData);

/**
 * POST /api/Reviews/shows
 */
export const createShowReview = (reviewData) =>
  post("/api/Reviews/shows", reviewData);

/**
 * PUT /api/Reviews/shows
 */
export const updateShowReview = (reviewData) =>
  put("/api/Reviews/shows", reviewData);

/**
 * GET /api/Reviews/user
 * Returns the authenticated user's reviews.
 */
export const fetchUserReviews = () => get("/api/Reviews/user");

export const deleteMovieReview = (movieId) =>
  del(`/api/Reviews/movies/${movieId}`);

export const deleteShowReview = (showId) => del(`/api/Reviews/shows/${showId}`);
