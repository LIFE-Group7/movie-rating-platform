import { get, post, put } from "./apiClient";

/**
 * POST /api/Reviews
 * Body: { movieId, rating, comment }
 * The user identity comes from the JWT Bearer token (handled by apiClient).
 * NOTE: If your backend uses a different field name (e.g. "showId", "contentId"),
 * adjust the body shape here to match the actual DTO.
 */
export const createReview = (reviewData) => post("/api/Reviews", reviewData);

/**
 * PUT /api/Reviews
 * Body: { movieId, rating, comment }
 */
export const updateReview = (reviewData) => put("/api/Reviews", reviewData);

/**
 * GET /api/Reviews/user
 * Returns the authenticated user's reviews.
 */
export const fetchUserReviews = () => get("/api/Reviews/user");
