import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import MovieCard from "../components/MovieCard";
import ShowCard from "../components/ShowCard";

// ── Inline SVG icons for the grid/list view toggle ────────────────────────────
function GridIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

/**
 * Watchlist page — "My Library".
 * Shows the user's saved watchlist in either grid or list view.
 * Also surfaces a "Recently Viewed" section below the main watchlist.
 *
 * Both movies and shows share the same watchlist array; a show is distinguished
 * from a movie by the presence of a `seasons` field.  This duck-typing check
 * (`hasOwnProperty("seasons")`) is an intentional simplification until the
 * backend returns a proper `type` discriminant on every item.
 */
function Watchlist() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { watchlist, recentlyViewed } = useWatchlist();

  // "grid" renders MovieCard/ShowCard; "list" renders a compact row layout.
  const [viewMode, setViewMode] = useState("grid");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-6 text-white">
        <h2 className="text-3xl font-bold mb-4">Your Watchlist</h2>
        <p className="text-white/60 max-w-md mb-8">
          Track what you want to watch and keep a history of what you’ve seen.
        </p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 font-bold hover:bg-blue-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-white/10 font-bold hover:bg-white/15 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Render the items array in the currently selected view mode.
   * Extracted into its own function so it can be reused for both the watchlist
   * section and the recently-viewed section without duplicating the JSX.
   */
  const renderContent = (items) => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {items.map((item) => {
            const isShow = Object.prototype.hasOwnProperty.call(
              item,
              "seasons",
            );
            return isShow ? (
              <ShowCard key={`w-${item.id}`} show={item} />
            ) : (
              <MovieCard key={`w-${item.id}`} movie={item} />
            );
          })}
        </div>
      );
    }

    // List view
    return (
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const isShow = Object.prototype.hasOwnProperty.call(item, "seasons");
          const genres = item.genres || (item.genre ? [item.genre] : []);
          return (
            <div
              key={`list-${item.id}`}
              role="link"
              tabIndex={0}
              onClick={() =>
                navigate(isShow ? `/show/${item.id}` : `/movie/${item.id}`)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(isShow ? `/show/${item.id}` : `/movie/${item.id}`);
                }
              }}
              className="flex gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-20 md:w-28 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover aspect-[2/3]"
                  />
                ) : null}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center py-2 flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/55 mb-2 font-medium">
                  {isShow && (
                    <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Series
                    </span>
                  )}
                  <span className="text-yellow-400">
                    ★ {item.rating?.toFixed(1) || "N/A"}
                  </span>
                  {isShow ? (
                    <span>{item.seasons} Seasons</span>
                  ) : (
                    <span>{item.year || "N/A"}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/70"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              My Library
            </h1>
            <p className="text-white/50">
              Manage your saved content and viewing history.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              <ListIcon />
            </button>
          </div>
        </header>

        {/* ── 1. Watchlist Section ── */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4">
            Saved to Watchlist
          </h2>

          {watchlist.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <div className="text-4xl mb-4 opacity-30">🔖</div>
              <h3 className="text-xl font-bold mb-2">
                Your watchlist is empty
              </h3>
              <p className="text-white/50 mb-6">
                Save movies and shows to track what you want to watch next.
              </p>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition-colors"
              >
                Browse Content
              </Link>
            </div>
          ) : (
            renderContent(watchlist)
          )}
        </section>

        {/* ── 2. Recently Viewed Section ── */}
        {recentlyViewed.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-zinc-700 pl-4 text-white/80">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 opacity-75 hover:opacity-100 transition-opacity duration-300">
              {recentlyViewed.map((item) => {
                const isShow = Object.prototype.hasOwnProperty.call(
                  item,
                  "seasons",
                );
                return isShow ? (
                  <ShowCard key={`h-${item.id}`} show={item} />
                ) : (
                  <MovieCard key={`h-${item.id}`} movie={item} />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
