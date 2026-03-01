import { del, get, post, put } from "./apiClient";

export const fetchUserReviews = () => get("/api/Reviews/user");

export const fetchMovieReviews = (movieId) =>
  get(`/api/Reviews/movies/${movieId}`);

export const fetchShowReviews = (showId) => get(`/api/Reviews/shows/${showId}`);

export const createMovieReview = (reviewData) =>
  post("/api/Reviews/movies", reviewData);

export const updateMovieReview = (reviewData) =>
  put("/api/Reviews/movies", reviewData);

export const deleteMovieReview = (movieId) =>
  del(`/api/Reviews/movies/${movieId}`);

export const createShowReview = (reviewData) =>
  post("/api/Reviews/shows", reviewData);

export const updateShowReview = (reviewData) =>
  put("/api/Reviews/shows", reviewData);

export const deleteShowReview = (showId) => del(`/api/Reviews/shows/${showId}`);
