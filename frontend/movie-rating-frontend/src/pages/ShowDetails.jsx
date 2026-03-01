import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchShowById } from "../api/contentApi";
import ReviewForm from "../components/ReviewForm";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * TV-show detail page — mirrors MovieDetails but uses the shows dataset and
 * displays show-specific fields (seasons, ongoing/ended status).
 * Passes `showData` as the `movie` prop to ReviewForm since ReviewForm is
 * content-type agnostic; the `type` field on the object disambiguates.
 */
function ShowDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addRecentlyViewed,
  } = useWatchlist();
  const { isAuthenticated } = useAuth();

  const [showData, setShowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReviewCount, setUserReviewCount] = useState(0);
  const reviewsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setShowData(null);
        setLoading(true);
        const show = await fetchShowById(id);
        if (isMounted) {
          setShowData(show);
          addRecentlyViewed(show);
        }
      } catch (err) {
        console.error("Failed to load show:", err);
        if (isMounted) setShowData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id, addRecentlyViewed]);

  useEffect(() => {
    if (location.state?.scrollToReview && !loading && showData) {
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [location, loading, showData]);

  const handleReviewSubmitted = (reviewData) => {
    if (!showData) return;
    const currentRating = showData.rating || 0;
    const count = userReviewCount + 1;
    // Treat the mock base rating as 1 existing data point and blend in every new
    // user review using a running-average formula to keep the displayed rating fair.
    // TODO: remove once ratings are fetched live from the backend.
    const newRating = (currentRating * count + reviewData.rating) / (count + 1);
    setUserReviewCount(count);
    setShowData({ ...showData, rating: parseFloat(newRating.toFixed(1)) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-pulse text-lg font-semibold text-white/50">
          Loading show...
        </div>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4">
        <h2 className="text-2xl font-bold mb-2">Show not found</h2>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(showData.id);
  const genres = showData.genres || (showData.genre ? [showData.genre] : []);
  const isOngoing = showData.status === "Ongoing";
  const reviewShowData = { ...showData, type: showData.type || "show" };
  const posterImageUrl =
    showData.imageUrl ||
    `https://placehold.co/400x600?text=${encodeURIComponent(showData.title || "Show").replace(/%20/g, "+")}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent z-10" />
        <img
          src={showData.backdropUrl ?? showData.imageUrl}
          alt={showData.title}
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-20 -mt-32 md:-mt-48">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Poster Card */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-56 md:w-80">
            <img
              src={posterImageUrl}
              alt={showData.title}
              className="block w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1 pt-2 md:pt-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
              {showData.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6 text-sm font-medium text-white/80">
              <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">
                {showData.rating && showData.rating > 0
                  ? `★ ${showData.rating.toFixed(1)}`
                  : "Not rated"}
              </span>
              <span>•</span>
              <span>{showData.seasons} Seasons</span>
              <span>•</span>
              <span
                className={`flex items-center gap-1.5 ${isOngoing ? "text-emerald-400" : "text-white/60"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isOngoing ? "bg-emerald-400" : "bg-white/40"}`}
                />
                {showData.status}
              </span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/10 text-white/80"
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-10 max-w-md mx-auto md:mx-0">
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate("/login");
                  else
                    reviewsRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
                className="flex-1 px-6 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Rate this show
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate("/login");
                  else if (inWatchlist) removeFromWatchlist(showData.id);
                  else addToWatchlist(showData);
                }}
                className={`flex-1 px-6 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  inWatchlist
                    ? "bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30"
                    : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02]"
                }`}
              >
                {inWatchlist ? (
                  <>
                    <span className="text-lg"></span> Remove from Watchlist
                  </>
                ) : (
                  <>
                    <span className="text-lg">+</span> Add to Watchlist
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              {showData.director && (
                <div>
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-1">
                    Director
                  </h3>
                  <p className="text-white font-medium">{showData.director}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Overview</h3>
                <p className="text-white/70 leading-relaxed max-w-3xl mx-auto md:mx-0">
                  {showData.description || "No overview available."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsRef} className="mt-20 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4">
            Reviews & Ratings
          </h2>
          <ReviewForm
            movie={reviewShowData}
            onSubmitSuccess={handleReviewSubmitted}
          />
        </div>
      </div>
    </div>
  );
}

export default ShowDetails;
