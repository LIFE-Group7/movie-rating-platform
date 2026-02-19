import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useReviews } from "../contexts/ReviewContext";
import StarRating from "../components/StarRating";
import "./MyReviews.css";

const MAX_COMMENT_CHARACTERS = 2000;

/**
 * Format an ISO timestamp into a readable date string.
 * Uses the browser's locale so dates look natural to every user.
 */
const formatDate = (isoString) => {
  if (!isoString) return "Unknown date";
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ─────────────────────────────────────────────────────────────
// ReviewEditForm
// ─────────────────────────────────────────────────────────────

/**
 * Inline edit form rendered inside a ReviewCard when the user clicks "Edit".
 * Keeping it separate keeps ReviewCard focused on display concerns only.
 *
 * @param {object}   review   - The review being edited
 * @param {function} onSave   - Called with { rating, comment } on success
 * @param {function} onCancel - Called when the user dismisses without saving
 */
function ReviewEditForm({ review, onSave, onCancel }) {
  const [editedRating, setEditedRating] = useState(review.rating);
  const [editedComment, setEditedComment] = useState(review.comment);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const characterCount = editedComment.length;
  const isCharLimitExceeded = characterCount > MAX_COMMENT_CHARACTERS;
  const isFormValid = editedRating > 0 && !isCharLimitExceeded;

  const handleCommentChange = (e) => {
    setEditedComment(e.target.value);
    setError("");
  };

  /**
   * Validate inputs, simulate the API call, then hand off to the parent.
   * The TODO block mirrors the pattern used in ReviewForm.jsx for consistency.
   */
  const handleSave = async () => {
    if (editedRating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (isCharLimitExceeded) {
      setError("Comment exceeds the maximum character limit.");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Replace with real API call when backend is connected
      // await fetch(`/api/reviews/${review.movieId}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      //   },
      //   body: JSON.stringify({ rating: editedRating, comment: editedComment.trim() }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 600));
      onSave({ rating: editedRating, comment: editedComment.trim() });
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="review-edit-form">
      <div className="edit-field">
        <label className="edit-label">Rating</label>
        <StarRating rating={editedRating} onRatingChange={setEditedRating} />
      </div>

      <div className="edit-field">
        <label
          className="edit-label"
          htmlFor={`edit-comment-${review.movieId}`}
        >
          Comment
        </label>
        <textarea
          id={`edit-comment-${review.movieId}`}
          className={`edit-textarea ${isCharLimitExceeded ? "error" : ""}`}
          value={editedComment}
          onChange={handleCommentChange}
          rows={4}
          disabled={isSaving}
        />
        <span
          className={`char-counter ${isCharLimitExceeded ? "exceeded" : ""}`}
        >
          {characterCount}/{MAX_COMMENT_CHARACTERS}
        </span>
      </div>

      {error && (
        <p className="edit-error">
          <span>⚠️</span> {error}
        </p>
      )}

      <div className="edit-actions">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          className="cancel-button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ReviewCard
// ─────────────────────────────────────────────────────────────

/**
 * Displays a single review with movie metadata, the review content,
 * and action buttons. Manages its own edit/delete UI state so the
 * parent list stays simple.
 *
 * @param {object}   review   - The review data object
 * @param {function} onDelete - Called with movieId when deletion is confirmed
 */
function ReviewCard({ review, onDelete }) {
  const { updateReview } = useReviews();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSaveEdit = (updatedFields) => {
    updateReview(review.movieId, updatedFields);
    setIsEditing(false);
  };

  const handleEditClicked = () => {
    // Close delete confirmation if it was open before entering edit mode
    setIsConfirmingDelete(false);
    setIsEditing(true);
  };

  // Show "Edited on…" only when the review has been modified after creation
  const displayDate = review.updatedAt
    ? `Edited ${formatDate(review.updatedAt)}`
    : formatDate(review.createdAt);

  return (
    <article className="review-card">
      <div className="review-card-header">
        {review.movieImageUrl && (
          <img
            src={review.movieImageUrl}
            alt={review.movieTitle}
            className="review-movie-poster"
            onError={(e) => {
              // Hide broken image icons gracefully
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="review-card-meta">
          <Link to={`/movie/${review.movieId}`} className="review-movie-title">
            {review.movieTitle}
          </Link>
          <div className="review-rating-display">⭐ {review.rating}/10</div>
          <span className="review-date">{displayDate}</span>
        </div>
      </div>

      {!isEditing && (
        <p className="review-comment">
          {review.comment || (
            <em className="no-comment">No written comment.</em>
          )}
        </p>
      )}

      {isEditing ? (
        <ReviewEditForm
          review={review}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="review-card-actions">
          <button className="edit-button" onClick={handleEditClicked}>
            ✏️ Edit
          </button>

          {isConfirmingDelete ? (
            <div className="delete-confirm">
              <span className="delete-confirm-prompt">Are you sure?</span>
              <button
                className="confirm-delete-button"
                onClick={() => onDelete(review.movieId)}
              >
                Yes, Delete
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="delete-button"
              onClick={() => setIsConfirmingDelete(true)}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// MyReviews (page)
// ─────────────────────────────────────────────────────────────

/**
 * Lists all reviews submitted by the authenticated user, sorted newest-first.
 * Unauthenticated visitors are redirected to the login page immediately.
 */
function MyReviews() {
  const { isAuthenticated, isLoading } = useAuth();
  const { reviews, deleteReview } = useReviews();

  // Defer the auth check until the context has finished reading localStorage
  if (isLoading) {
    return (
      <div className="my-reviews-page">
        <p className="loading-message">Loading...</p>
      </div>
    );
  }

  // Acceptance criteria: user must be signed in to access this page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Newest reviews first — matches the "based on time when posted" requirement
  const reviewsSortedByDate = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="my-reviews-page">
      <section className="my-reviews-header">
        <h1>My Reviews</h1>
        <p className="my-reviews-subtitle">
          All movies you have reviewed, sorted by most recently posted.
        </p>
      </section>

      {reviewsSortedByDate.length === 0 ? (
        <div className="empty-reviews-state">
          <p>You haven&apos;t reviewed any movies yet.</p>
          <Link to="/" className="browse-movies-link">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="reviews-list">
          {reviewsSortedByDate.map((review) => (
            <ReviewCard
              key={review.movieId}
              review={review}
              onDelete={deleteReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReviews;
