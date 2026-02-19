import { useState } from "react";
import "./StarRating.css";

/**
 * Controlled half-star rating component.
 * Each star reads the mouse X position against its bounding rect
 * to determine left (odd) or right (even) half — producing a 1–10 scale.
 *
 * @param {number}   rating         - Current selected rating (0–10)
 * @param {function} onRatingChange - Callback fired with the new 1–10 value
 * @param {boolean}  readOnly       - If true, disables all interaction
 */
function StarRating({
  rating = 0,
  onRatingChange = () => {},
  readOnly = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  /**
   * Resolve a 1–10 value from the mouse position within a star button.
   * Left half of star N → odd value (N*2 - 1), right half → even value (N*2).
   */
  const resolveHalfValue = (event, starIndex) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - left;
    const isLeftHalf = mouseX < width / 2;
    return isLeftHalf ? starIndex * 2 - 1 : starIndex * 2;
  };

  const handleMouseMove = (event, starIndex) => {
    if (readOnly) return;
    setHoverRating(resolveHalfValue(event, starIndex));
  };

  const handleClick = (event, starIndex) => {
    if (readOnly) return;
    onRatingChange(resolveHalfValue(event, starIndex));
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="star-rating">
      <div className="stars-container" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const leftValue = starIndex * 2 - 1;
          const rightValue = starIndex * 2;

          const isFull = displayRating >= rightValue;
          const isHalf = !isFull && displayRating >= leftValue;

          return (
            <button
              key={starIndex}
              type="button"
              className={`star-wrapper ${readOnly ? "readonly" : ""}`}
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onClick={(e) => handleClick(e, starIndex)}
              disabled={readOnly}
              aria-label={`Rate between ${leftValue} and ${rightValue} out of 10`}
            >
              {/* Grey base star — always fully visible underneath */}
              <span className="star-char star-bg">★</span>

              {/* Gold overlay — width 0 / 50% / 100% clips to empty / half / full */}
              <span
                className={`star-char star-fill ${
                  isFull ? "full" : isHalf ? "half" : ""
                }`}
              >
                ★
              </span>
            </button>
          );
        })}
      </div>

      {rating > 0 && <span className="rating-text">{rating}/10</span>}
    </div>
  );
}

export default StarRating;
