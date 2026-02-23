import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * Compact movie card used in grid and carousel layouts.
 * Clicking anywhere on the card navigates to the movie detail page.
 * The hover overlay exposes "Details" and "Save/Saved" quick-action buttons.
 */
function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { isAuthenticated } = useAuth();

  // Normalise either `genres` array or legacy `genre` string into one shape.
  const movieGenres = movie?.genres || (movie?.genre ? [movie.genre] : []);
  const inWatchlist = isInWatchlist(movie.id);
  const [isHovering, setIsHovering] = useState(false);

  // Memoised so the number format isn't recomputed on every render cycle.
  const ratingText = useMemo(() => {
    const r = Number(movie?.rating);
    return Number.isFinite(r) ? r.toFixed(1) : "–";
  }, [movie?.rating]);

  const openDetails = () => navigate(`/movie/${movie.id}`);

  /**
   * Toggle watchlist membership from the card without opening the detail page.
   * Stops event propagation so the card's own click handler doesn't fire.
   * Unauthenticated users are redirected to /login instead of silently failing.
   */
  const toggleWatchlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (inWatchlist) removeFromWatchlist(movie.id);
    else addToWatchlist(movie);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetails();
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={`Open details for ${movie.title}`}
      className="cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/7 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 flex flex-col"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black w-full">
        {movie?.imageUrl ? (
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur text-yellow-300 border border-white/10">
            ★ {ratingText}
          </span>
        </div>

        {/* Hover overlay — the visible watchlist / details buttons live here */}
        <div className={`absolute inset-0 transition-opacity ${isHovering ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDetails();
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-white text-zinc-950 text-[13px] font-bold hover:bg-white/90 transition-colors"
            >
              Details
            </button>
            <button
              type="button"
              onClick={toggleWatchlist}
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-[13px] font-semibold hover:bg-white/15 transition-colors"
            >
              {inWatchlist ? (isHovering ? "Unsave" : "Saved") : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Info Area - Fixed Height */}
      <div className="p-3 flex flex-col justify-between flex-1 min-h-[104px]">
        <h3
          className="text-[13px] font-bold text-white leading-tight line-clamp-2"
          title={movie.title}
        >
          {movie.title}
        </h3>

        {/* Genres container - line-clamp-1 prevents wrapping to new lines */}
        <div className="mt-1.5 flex gap-1.5 overflow-hidden w-full">
          {movieGenres.length > 0 ? (
            movieGenres.map((g) => (
              <span
                key={g}
                className="whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-white/65 flex-shrink-0"
              >
                {g}
              </span>
            ))
          ) : (
            <span className="h-[22px]" /> /* Empty spacer to maintain layout height */
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
