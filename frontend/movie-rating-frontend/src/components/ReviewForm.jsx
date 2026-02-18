import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "./StarRating";
import "./ReviewForm.css";

/**
 * Review submission form component
 * Allows authenticated users to submit a rating and written review
 * @param {object} movie - The movie being reviewed
 * @param {function} onSubmitSuccess - Callback when review is successfully submitted
 */
function ReviewForm({ movie, onSubmitSuccess = () => {} }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const MAX_CHARACTERS = 2000;
  const currentCharCount = reviewText.length;
  const isCharLimitExceeded = currentCharCount > MAX_CHARACTERS;

  // Validation checks
  const isFormValid = rating > 0 && !isCharLimitExceeded;

  /**
   * Handle review text change
   * Updates state and validates character count
   */
  const handleReviewChange = (e) => {
    const text = e.target.value;
    setReviewText(text);
    setError(""); // Clear error when user starts typing again
  };

  /**
   * Handle form submission
   * Validates form, prepares data, and sends to backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!isAuthenticated) {
      setError("You must be logged in to submit a review");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }

    if (reviewText.trim() === "") {
      setError("Please write a review");
      return;
    }

    if (isCharLimitExceeded) {
      setError("Review exceeds maximum character limit");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // const token = localStorage.getItem("authToken");
      // const response = await fetch(`/api/reviews`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     movieId: movie.id,
      //     rating: rating,
      //     reviewText: reviewText.trim(),
      //   }),
      // });
      //
      // if (response.status === 401) {
      //   // Token expired or invalid - redirect to login
      //   localStorage.removeItem("authToken");
      //   localStorage.removeItem("user");
      //   navigate("/login");
      //   throw new Error("Session expired. Please log in again.");
      // }
      //
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Failed to submit review");
      // }
      //
      // const data = await response.json();

      // Simulate API success with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response structure (will match real API when ready)
      const data = {
        success: true,
        movieId: movie.id,
        rating: rating,
        reviewText: reviewText.trim(),
        userId: user?.userId,
        timestamp: new Date().toISOString(),
      };

      // Show success message
      setSuccess(true);
      setError("");

      // Reset form after successful submission
      setTimeout(() => {
        setRating(0);
        setReviewText("");
        setSuccess(false);

        // Callback to parent component (MovieDetails)
        // This allows parent to refresh movie data and update average rating
        onSubmitSuccess({
          rating,
          reviewText: reviewText.trim(),
          movieId: movie.id,
        });
      }, 1500);
    } catch (err) {
      console.error("Review submission error:", err);
      setError(err.message || "Failed to submit review. Please try again.");
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3 className="form-title">Share Your Review</h3>

      {!isAuthenticated && (
        <div className="auth-prompt">
          <p>Please log in to submit a review</p>
          <button className="login-button" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      )}

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="review-form">
          {/* Star Rating Section */}
          <div className="form-section">
            <label htmlFor="rating" className="section-label">
              Your Rating <span className="required">*</span>
            </label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          {/* Review Text Section */}
          <div className="form-section">
            <label htmlFor="review" className="section-label">
              Your Review <span className="required">*</span>
            </label>
            <textarea
              id="review"
              className={`review-textarea ${isCharLimitExceeded ? "error" : ""}`}
              value={reviewText}
              onChange={handleReviewChange}
              placeholder="Share your thoughts about this movie..."
              rows={5}
              disabled={isSubmitting || success}
              maxLength={MAX_CHARACTERS + 100} // Allow slight overflow for UX
            />
            <div
              className={`char-counter ${isCharLimitExceeded ? "exceeded" : ""}`}
            >
              {currentCharCount}/{MAX_CHARACTERS}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              Thank you! Your review has been submitted.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={!isFormValid || isSubmitting || success}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ReviewForm;
