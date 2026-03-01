import { useState } from "react";
import { Link } from "react-router-dom";
import { useReviews } from "../contexts/ReviewContext";
import StarRating from "../components/StarRating";
import ReviewEditForm from "../components/reviews/ReviewEditForm";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build the detail-page path for a review.
 * Shows have type "show"; everything else falls back to the movie route.
 */
const buildDetailPath = (movieId, type) =>
  type === "show" ? `/show/${movieId}` : `/movie/${movieId}`;
const buildReviewKey = (movieId, type) => `${type || "movie"}:${movieId}`;

/**
 * Format an ISO timestamp string into a localised date for display.
 * Falls back to an empty string when the value is absent or invalid.
 */
const formatReviewDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

// ── Page component ────────────────────────────────────────────────────────────
function MyReviews() {
  // ReviewContext already scopes reviews to the current user's localStorage key,
  // so no further userId filtering is needed here.
  // BUG FIX: was `removeReview` (undefined) — correct name is `deleteReview`.
  const { reviews, updateReview, deleteReview } = useReviews();

  // Track which review card is currently open for editing.
  // Uses movieId as the identifier because review objects have no `id` field.
  const [editingReviewKey, setEditingReviewKey] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ReviewContext stores `createdAt` (ISO string); sort newest-first.
  // BUG FIX: was sorting by `review.timestamp` which is never stored in context.
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Pagination helpers
  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

  /**
   * Apply edited fields to a review and close the edit form.
   * ReviewContext.updateReview stamps an `updatedAt` timestamp automatically.
   */
  const handleUpdate = async (movieId, type, updatedFields) => {
    await updateReview(movieId, updatedFields, type);
    setEditingReviewKey(null);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-10">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            currentPage === 1
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Previous
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            currentPage === totalPages
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-lg mx-auto px-4 md:px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          My Reviews
        </h1>
        <p className="text-white/50 mb-10">
          You have reviewed{" "}
          <span className="text-white font-bold">{sortedReviews.length}</span>{" "}
          titles.
        </p>

        {sortedReviews.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
            <div className="text-4xl mb-4 opacity-30">⭐</div>
            <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
            <p className="text-white/50 mb-6">
              Rate movies and shows to see them appear here.
            </p>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition-colors"
            >
              Start Rating
            </Link>
          </div>
        ) : (
          /* ── Review list ── */
          <>
            <div className="space-y-6">
              {paginatedReviews.map((review) => (
                // BUG FIX: was `review.id` (undefined) — movieId is the unique key.
                <div
                  key={buildReviewKey(review.movieId, review.type)}
                  className="flex flex-col md:flex-row md:items-start gap-6 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/7 transition-colors"
                >
                  {/* Poster Thumbnail */}
                  <div className="flex-shrink-0 self-start w-24 md:w-32 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
                    {review.movieImageUrl ? (
                      <img
                        src={review.movieImageUrl}
                        alt={review.movieTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Review content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                      <div>
                        {/*
                         * BUG FIX: was always `/movie/...`.
                         * Now uses review.type to route shows to `/show/...`.
                         */}
                        <Link
                          to={buildDetailPath(review.movieId, review.type)}
                          className="text-xl font-bold hover:text-blue-400 transition-colors"
                        >
                          {review.movieTitle}
                        </Link>
                        <div className="text-xs text-white/40 mt-1">
                          {/* BUG FIX: was `review.timestamp` — context stores `createdAt`. */}
                          Reviewed on {formatReviewDate(review.createdAt)}
                          {review.updatedAt && (
                            <span className="ml-2 text-white/25">
                              · Edited {formatReviewDate(review.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons — hidden while the edit form is open */}
                      {editingReviewKey !==
                        buildReviewKey(review.movieId, review.type) && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setEditingReviewKey(
                                buildReviewKey(review.movieId, review.type),
                              )
                            }
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            Edit
                          </button>
                          {/* BUG FIX: was `removeReview` (not exported) — correct is `deleteReview`. */}
                          <button
                            onClick={() =>
                              deleteReview(
                                review.movieId,
                                review.type || "movie",
                              )
                            }
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline edit form or read-only review display */}
                    {editingReviewKey ===
                    buildReviewKey(review.movieId, review.type) ? (
                      <ReviewEditForm
                        review={review}
                        onSave={(updatedFields) =>
                          handleUpdate(
                            review.movieId,
                            review.type || "movie",
                            updatedFields,
                          )
                        }
                        onCancel={() => setEditingReviewKey(null)}
                      />
                    ) : (
                      <div>
                        <div className="mb-3">
                          <StarRating rating={review.rating} readOnly />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white/70">
                            Comment:
                          </p>
                          <p className="text-base text-white/90 leading-7 whitespace-pre-wrap">
                            {review.comment || (
                              <em className="text-white/40">
                                No written review.
                              </em>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}

export default MyReviews;
