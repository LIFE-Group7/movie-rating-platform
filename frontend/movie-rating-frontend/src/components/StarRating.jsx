import { useMemo, useState } from "react";

/**
 * Interactive (or read-only) 5-star rating widget.
 *
 * Internally uses a 0–10 scale so half-stars map to integer steps.
 * - `rating`         — current value on a 0–10 scale.
 * - `onRatingChange` — called with the new 0–10 value on click.
 * - `readOnly`       — disables hover and click interactions.
 */
function StarRating({
  rating = 0,
  onRatingChange = () => {},
  readOnly = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);
  // Show hover preview while the user is pointing; fall back to the committed value.
  const displayRating = hoverRating || rating;

  /**
   * Resolve whether the cursor is over the left (half-star) or right (full-star)
   * half of the hovered star, returning the corresponding 0–10 step value.
   */
  const resolveHalfValue = (event, starIndex) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - left;
    const isLeftHalf = mouseX < width / 2;
    return isLeftHalf ? starIndex * 2 - 1 : starIndex * 2;
  };

  /**
   * Return the fill percentage (0, 50, or 100) for a given star position.
   * Converts the 0–10 display value to a 0–5 scale before comparing so fractions
   * below 0.5 stars render as empty and ≥ 0.5 render as half-filled.
   */
  const getFill = useMemo(() => {
    return (starIndex) => {
      const valueOutOf5 = displayRating / 2; // convert 0–10 → 0–5
      const diff = valueOutOf5 - (starIndex - 1);
      if (diff >= 1) return 100; // full star
      if (diff >= 0.5) return 50; // half star
      return 0; // empty star
    };
  }, [displayRating]);

  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPct = getFill(starIndex);
          return (
            <button
              key={starIndex}
              type="button"
              disabled={readOnly}
              onMouseMove={(e) => {
                if (readOnly) return;
                setHoverRating(resolveHalfValue(e, starIndex));
              }}
              onMouseLeave={() => setHoverRating(0)}
              onClick={(e) => {
                if (readOnly) return;
                onRatingChange(resolveHalfValue(e, starIndex));
              }}
              className={`relative w-8 h-8 text-2xl leading-none ${
                readOnly
                  ? "cursor-default opacity-95"
                  : "cursor-pointer hover:scale-110 transition-transform"
              }`}
              aria-label={`Rate ${starIndex} stars`}
            >
              {/* Unfilled background star */}
              <span className="absolute inset-0 text-white/25 select-none">
                ★
              </span>

              {/* Filled star clipped to fillPct width — creates the half-fill effect */}
              <span
                className="absolute inset-0 text-yellow-400 select-none overflow-hidden"
                style={{ width: `${fillPct}%` }}
              >
                ★
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-xs font-semibold text-white/60">
        {displayRating ? `${displayRating}/10` : "No rating"}
      </div>
    </div>
  );
}

export default StarRating;
