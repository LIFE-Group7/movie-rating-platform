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

  /**
   * SVG Star component with proper fill rendering for half-stars via clip-path.
   */
  const Star = ({ fillPercent = 0, uniqueId }) => (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <defs>
        <clipPath id={`clip-${uniqueId}`}>
          <rect x="0" y="0" width={fillPercent * 0.24} height="24" />
        </clipPath>
      </defs>
      {/* Unfilled star background */}
      <path
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.02 6.215a1 1 0 00.95.69h6.533c.969 0 1.371 1.24.588 1.81l-5.283 3.84a1 1 0 00-.364 1.118l2.02 6.214c.3.922-.755 1.688-1.54 1.118l-5.283-3.84a1 1 0 00-1.176 0l-5.283 3.84c-.784.57-1.838-.196-1.539-1.118l2.02-6.214a1 1 0 00-.364-1.118L.958 11.642c-.783-.57-.38-1.81.588-1.81h6.533a1 1 0 00.95-.69l2.02-6.215z"
        className="fill-white/25"
      />
      {/* Filled star with clip-path for precise half-fill */}
      <path
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.02 6.215a1 1 0 00.95.69h6.533c.969 0 1.371 1.24.588 1.81l-5.283 3.84a1 1 0 00-.364 1.118l2.02 6.214c.3.922-.755 1.688-1.54 1.118l-5.283-3.84a1 1 0 00-1.176 0l-5.283 3.84c-.784.57-1.838-.196-1.539-1.118l2.02-6.214a1 1 0 00-.364-1.118L.958 11.642c-.783-.57-.38-1.81.588-1.81h6.533a1 1 0 00.95-.69l2.02-6.215z"
        className="fill-yellow-400"
        clipPath={`url(#clip-${uniqueId})`}
      />
    </svg>
  );

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
                <Star fillPercent={0} uniqueId={`empty-${starIndex}`} />
              </span>

              {/* Filled star clipped to fillPct width — creates the half-fill effect */}
              <span className="absolute inset-0 text-yellow-400 select-none">
                <Star fillPercent={fillPct} uniqueId={`filled-${starIndex}`} />
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
