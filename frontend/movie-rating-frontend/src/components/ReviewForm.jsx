import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useReviews } from "../contexts/ReviewContext";
import StarRating from "./StarRating";

/**
 * Review submission form for a single movie or show.
 *
 * Renders a "please log in" prompt when the user is not authenticated so
 * the component can be placed on detail pages without an extra auth check.
 * After a successful submit `onSubmitSuccess` is called with the submitted data
 * so the parent can optimistically update its displayed rating.
 */
function ReviewForm({ movie, onSubmitSuccess = () => {} }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addReview, getReviewForItem } = useReviews();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Named constant so the limit appears in one place and UI messages stay in sync.
  const MAX_CHARACTERS = 2000;
  const currentCharCount = reviewText.length;
  const isCharLimitExceeded = currentCharCount > MAX_CHARACTERS;
  const isFormValid =
    rating > 0 && reviewText.trim() !== "" && !isCharLimitExceeded;

  const movieType = movie?.type || "movie";
  const titleLabel = movieType === "show" ? "show" : "movie";
  const existingReview = getReviewForItem({
    movieId: movie?.id,
    type: movieType,
  });
  const isAlreadyReviewed = Boolean(existingReview);

  /**
   * Validate, simulate API submission, persist to ReviewContext, then notify parent.
   * The 700 ms delay mimics a real network round-trip so the UI feedback feels
   * natural — remove once the real backend endpoint is integrated.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("You must be logged in to submit a review.");
      setTimeout(() => navigate("/login"), 900);
      return;
    }
    if (rating === 0) return setError("Please select a star rating.");
    if (reviewText.trim() === "") return setError("Please write a review.");
    if (isCharLimitExceeded)
      return setError("Review exceeds maximum character limit.");

    setIsSubmitting(true);
    try {
      // TODO: replace with real API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 700));

      const saved = addReview({
        movieId: movie.id,
        movieTitle: movie.title,
        movieImageUrl: movie.imageUrl,
        rating,
        comment: reviewText.trim(),
        type: movieType,
      });

      if (!saved) {
        setError("You already reviewed this title.");
        setSuccess(false);
        return;
      }

      setSuccess(true);
      // Brief success window before resetting the form and notifying the parent.
      setTimeout(() => {
        setRating(0);
        setReviewText("");
        setSuccess(false);
        onSubmitSuccess({
          rating,
          reviewText: reviewText.trim(),
          movieId: movie.id,
        });
      }, 900);
    } catch (err) {
      setError(err?.message || "Failed to submit review. Please try again.");
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a login prompt instead of the form for unauthenticated visitors.
  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
        <div className="text-sm text-white/80 font-semibold">
          Please log in to submit a review.
        </div>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold text-sm"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (isAlreadyReviewed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
        <h3 className="text-lg font-extrabold tracking-tight">
          Review already submitted
        </h3>
        <p className="text-sm text-white/55 mt-1">
          You already rated this{" "}
          <span className="text-white/85 font-semibold">{titleLabel}</span>.
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3">
            <div className="text-xs font-bold text-white/50 uppercase mb-2">
              Your rating
            </div>
            <StarRating rating={existingReview.rating} readOnly />
          </div>
          <div>
            <div className="text-xs font-bold text-white/50 uppercase mb-2">
              Your review
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {existingReview.comment || (
                <em className="text-white/30">No written review.</em>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/my-reviews")}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold text-sm"
        >
          Manage in My Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
      <h3 className="text-lg font-extrabold tracking-tight">Write a review</h3>
      <p className="text-sm text-white/55 mt-1">
        Rate <span className="text-white/85 font-semibold">{movie?.title}</span>{" "}
        and share your thoughts.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <div className="text-sm font-bold text-white/80 mb-2">
            Your rating
          </div>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-white/80">Your review</div>
            <div
              className={`text-xs font-semibold ${isCharLimitExceeded ? "text-red-300" : "text-white/45"}`}
            >
              {currentCharCount}/{MAX_CHARACTERS}
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              setError("");
            }}
            rows={5}
            placeholder="What did you like? What didn’t work for you?"
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition"
          />
          {isCharLimitExceeded && (
            <div className="mt-2 text-xs font-semibold text-red-300">
              Please shorten your review to {MAX_CHARACTERS} characters.
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Review submitted!
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting || success}
          className={`w-full px-4 py-3 rounded-2xl font-extrabold text-sm transition-all ${
            !isFormValid || isSubmitting
              ? "bg-white/10 text-white/35 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {isSubmitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
