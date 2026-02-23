import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * Compact TV-show card — mirrors MovieCard but routes to /show/:id and displays
 * show-specific metadata (season count, ongoing/ended status badge).
 */
function ShowCard({ show }) {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { isAuthenticated } = useAuth();

  // Normalise either `genres` array or legacy `genre` string into one shape.
  const showGenres = show?.genres || (show?.genre ? [show.genre] : []);
  const inWatchlist = isInWatchlist(show.id);
  // Used to colour the status indicator — green dot for ongoing, grey for ended.
  const isOngoing = show?.status === "Ongoing";

  const ratingText = useMemo(() => {
    const r = Number(show?.rating);
    return Number.isFinite(r) ? r.toFixed(1) : "–";
  }, [show?.rating]);

  const openDetails = () => navigate(`/show/${show.id}`);

  /**
   * Toggle watchlist membership without navigating to the detail page.
   * Unauthenticated users are redirected to /login rather than silently failing.
   */
  const toggleWatchlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (inWatchlist) removeFromWatchlist(show.id);
    else addToWatchlist(show);
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
      aria-label={`Open details for ${show.title}`}
      className="group cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/7 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 flex flex-col"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black w-full">
        {show?.imageUrl ? (
          <img
            src={show.imageUrl}
            alt={show.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <span className="text-white/20 text-sm font-bold text-center leading-snug line-clamp-3">
              {show.title}
            </span>
          </div>
        )}

        <span className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[11px] font-extrabold bg-black/60 backdrop-blur border border-white/10 text-white/80 uppercase tracking-wider">
          Series
        </span>

        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur text-yellow-300 border border-white/10">
            ★ {ratingText}
          </span>
        </div>

        {/* Hover overlay — the visible watchlist / details buttons live here */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
              {inWatchlist ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Info Area - Fixed Height */}
      <div className="p-3 flex flex-col justify-between flex-1 min-h-[104px]">
        <div>
          <h3
            className="text-[13px] font-bold text-white leading-tight line-clamp-2"
            title={show.title}
          >
            {show.title}
          </h3>

          {(show?.seasons || show?.status) && (
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/55">
              {show?.seasons && (
                <span className="font-semibold whitespace-nowrap">
                  {show.seasons} season{show.seasons > 1 ? "s" : ""}
                </span>
              )}
              {show?.seasons && show?.status && <span>•</span>}
              {show?.status && (
                <span className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOngoing ? "bg-emerald-400" : "bg-white/30"
                    }`}
                    aria-hidden="true"
                  />
                  {show.status}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Genres container - line-clamp-1 prevents wrapping to new lines */}
        <div className="mt-2 flex gap-1.5 overflow-hidden w-full">
          {showGenres.length > 0 ? (
            showGenres.map((g) => (
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

export default ShowCard;
