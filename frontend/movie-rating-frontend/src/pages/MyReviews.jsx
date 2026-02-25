import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useReviews } from "../contexts/ReviewContext";
import StarRating from "../components/StarRating";

// ── Inline edit form rendered inside an existing review card ─────────────────
function ReviewEditForm({ review, onSave, onCancel }) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Persist changes to the parent — parent calls ReviewContext.updateReview.
   * Guard against submitting a zero-star rating to keep data consistent.
   */
  const handleSave = async () => {
    if (rating === 0) return;
    setIsSaving(true);
    try {
      await onSave({ rating, comment });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="bg-zinc-900/50 p-4 rounded-xl border border-blue-500/30">
      <div className="mb-4">
        <label className="text-xs font-bold text-white/50 uppercase mb-1 block">
          Rating
        </label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      <div className="mb-4">
        <label className="text-xs font-bold text-white/50 uppercase mb-1 block">
          Your Review
        </label>
        <textarea
          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

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
  const { isAuthenticated } = useAuth();

  // ReviewContext already scopes reviews to the current user's localStorage key,
  // so no further userId filtering is needed here.
  // BUG FIX: was `removeReview` (undefined) — correct name is `deleteReview`.
  const { reviews, updateReview, deleteReview } = useReviews();

  // Track which review card is currently open for editing.
  // Uses movieId as the identifier because review objects have no `id` field.
  const [editingReviewKey, setEditingReviewKey] = useState(null);

  // Redirect unauthenticated users rather than showing an empty page.
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ReviewContext stores `createdAt` (ISO string); sort newest-first.
  // BUG FIX: was sorting by `review.timestamp` which is never stored in context.
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  /**
   * Apply edited fields to a review and close the edit form.
   * ReviewContext.updateReview stamps an `updatedAt` timestamp automatically.
   */
  const handleUpdate = async (movieId, type, updatedFields) => {
    await updateReview(movieId, updatedFields, type);
    setEditingReviewKey(null);
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
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              // BUG FIX: was `review.id` (undefined) — movieId is the unique key.
              <div
                key={buildReviewKey(review.movieId, review.type)}
                className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/7 transition-colors"
              >
                {/* Poster Thumbnail */}
                <div className="flex-shrink-0 w-24 md:w-32 rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
                  {review.movieImageUrl ? (
                    <img
                      src={review.movieImageUrl}
                      alt={review.movieTitle}
                      className="w-full h-auto object-cover aspect-[2/3]"
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
                            deleteReview(review.movieId, review.type || "movie")
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
                      <p className="text-white/80 text-sm leading-relaxed">
                        {review.comment || (
                          <em className="text-white/30">No written review.</em>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReviews;
