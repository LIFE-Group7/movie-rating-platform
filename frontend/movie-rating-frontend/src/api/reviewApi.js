import { del, get, post, put } from "./apiClient";

/**
 * GET /api/Reviews/user
 * Returns the authenticated user's reviews.
 */
export const fetchUserReviews = () => get("/api/Reviews/user");

/**
 * GET /api/Reviews/movies/{movieId}
 * Returns all reviews for a movie.
 */
export const fetchMovieReviews = (movieId) =>
  get(`/api/Reviews/movies/${movieId}`);

/**
 * GET /api/Reviews/shows/{showId}
 * Returns all reviews for a show.
 */
export const fetchShowReviews = (showId) =>
  get(`/api/Reviews/shows/${showId}`);

/**
 * POST /api/Reviews/movies
 */
export const createMovieReview = (reviewData) =>
  post("/api/Reviews/movies", reviewData);

/**
 * PUT /api/Reviews/movies
 */
export const updateMovieReview = (reviewData) => put("/api/Reviews/movies", reviewData);

/**
 * DEL /api/Reviews/movies/{movieId}
 */
export const deleteMovieReview = (movieId) =>
  del(`/api/Reviews/movies/${movieId}`);

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
 * DEL /api/Reviews/shows/{showId}
 */
export const deleteShowReview = (showId) => del(`/api/Reviews/shows/${showId}`);
