import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchMovieById } from "../api/contentApi";
import ReviewForm from "../components/ReviewForm";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * Movie detail page.
 * Loads film data from the mock dataset by URL param `id`.
 * Adds the film to the WatchlistContext recently-viewed history on mount.
 * Hosts the ReviewForm and optimistically updates the displayed rating after submission.
 */
function MovieDetails() {
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

  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track how many reviews were submitted this session so the displayed rating
  // can be updated incrementally without a real API round-trip.
  const [sessionReviewCount, setSessionReviewCount] = useState(0);
  const reviewsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setMovieData(null);
        setLoading(true);
        const movie = await fetchMovieById(id);
        if (isMounted) {
          setMovieData(movie);
          addRecentlyViewed(movie);
        }
      } catch (err) {
        console.error("Failed to load movie:", err);
        if (isMounted) setMovieData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id, addRecentlyViewed]);

  // Scroll to the review form when navigated here with the scrollToReview flag
  // (e.g. from a "write a review" deep-link elsewhere in the app).
  useEffect(() => {
    if (location.state?.scrollToReview && !loading && movieData) {
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [location, loading, movieData]);

  /**
   * Optimistically update the displayed rating after a user submits a review.
   * Uses a proper running-average formula — mirrors the ShowDetails logic.
   * BUG FIX: previous code hardcoded 10 as the assumed existing review count,
   * causing the average to drift toward the mock base rating over time.
   * TODO: remove once ratings are fetched live from the backend.
   */
  const handleReviewSubmitted = (reviewData) => {
    if (!movieData) return;
    const currentRating = movieData.rating || 0;
    const nextCount = sessionReviewCount + 1;
    const updatedRating =
      (currentRating * nextCount + reviewData.rating) / (nextCount + 1);
    setSessionReviewCount(nextCount);
    setMovieData({
      ...movieData,
      rating: parseFloat(updatedRating.toFixed(1)),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-pulse text-lg font-semibold text-white/50">
          Loading movie...
        </div>
      </div>
    );
  }

  if (!movieData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4">
        <h2 className="text-2xl font-bold mb-2">Movie not found</h2>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movieData.id);
  const genres = movieData.genres || (movieData.genre ? [movieData.genre] : []);
  const reviewMovieData = { ...movieData, type: movieData.type || "movie" };
  const posterImageUrl =
    movieData.imageUrl ||
    `https://placehold.co/400x600?text=${encodeURIComponent(movieData.title || "Movie").replace(/%20/g, "+")}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent z-10" />
        <img
          src={movieData.backdropUrl ?? movieData.imageUrl}
          alt={movieData.title}
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-20 -mt-32 md:-mt-48">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Poster Card */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-56 md:w-80">
            <img
              src={posterImageUrl}
              alt={movieData.title}
              className="block w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1 pt-2 md:pt-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
              {movieData.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6 text-sm font-medium text-white/80">
              <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">
                {movieData.rating && movieData.rating > 0
                  ? `★ ${movieData.rating.toFixed(1)}`
                  : "Not rated"}
              </span>
              {movieData.year && (
                <>
                  <span>•</span>
                  <span>{movieData.year}</span>
                </>
              )}
              {movieData.duration && (
                <>
                  <span>•</span>
                  <span>{movieData.duration}</span>
                </>
              )}
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
                Rate this movie
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate("/login");
                  else if (inWatchlist) removeFromWatchlist(movieData.id);
                  else addToWatchlist(movieData);
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
              {movieData.director && (
                <div>
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-1">
                    Director
                  </h3>
                  <p className="text-white font-medium">{movieData.director}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Overview</h3>
                <p className="text-white/70 leading-relaxed max-w-3xl mx-auto md:mx-0">
                  {movieData.description || "No overview available."}
                </p>
              </div>

              {movieData.cast && (
                <div>
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-1">
                    Cast
                  </h3>
                  <p className="text-white/80">{movieData.cast.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsRef} className="mt-20 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4">
            Reviews & Ratings
          </h2>
          <ReviewForm
            movie={reviewMovieData}
            onSubmitSuccess={handleReviewSubmitted}
          />
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
