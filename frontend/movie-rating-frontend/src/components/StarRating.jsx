import { useState } from "react";
import "./StarRating.css";

/**
 * Controlled star rating component
 * Allows user to select a rating from 1-5 stars
 * @param {number} rating - Current selected rating (0-5)
 * @param {function} onRatingChange - Callback when rating changes
 * @param {boolean} readOnly - If true, disables interaction
 */
function StarRating({
  rating = 0,
  onRatingChange = () => {},
  readOnly = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starValue) => {
    if (!readOnly) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readOnly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // Determine which stars should be filled (based on hover or selected rating)
  const displayRating = hoverRating || rating;

  return (
    <div className="star-rating">
      <div className="stars-container" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className={`star ${starValue <= displayRating ? "filled" : "empty"} ${
              readOnly ? "readonly" : ""
            }`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
            disabled={readOnly}
          >
            ★
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="rating-text">
          {rating}/5 Star{rating !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

export default StarRating;
