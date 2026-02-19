import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { movies } from "../data/mockMovies";
import ReviewForm from "../components/ReviewForm";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import "./MovieDetails.css";

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
  const reviewsRef = useRef(null);

  // Fetch movie on mount and when id changes
  useEffect(() => {
    const foundMovie = movies.find((m) => m.id === parseInt(id));
    if (foundMovie) {
      setMovieData(foundMovie);
      addRecentlyViewed(foundMovie);
    } else {
      setMovieData(null);
    }
    setLoading(false);
  }, [id, addRecentlyViewed]);

  // Auto-scroll to review section if coming from watchlist
  useEffect(() => {
    if (location.state?.scrollToReview) {
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location]);

  /**
   * Handle successful review submission
   * Updates movie rating dynamically after review is submitted
   */
  const handleReviewSubmitted = (reviewData) => {
    if (!movieData) return;

    // Calculate new average rating
    const allReviews = [
      { rating: movieData.rating },
      { rating: reviewData.rating },
    ];

    const newAverageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;

    setMovieData({
      ...movieData,
      rating: parseFloat(newAverageRating.toFixed(1)),
    });

    // TODO: When backend is connected, fetch updated movie:
    // const response = await fetch(`/api/movies/${movieData.id}`);
    // const updatedMovie = await response.json();
    // setMovieData(updatedMovie);
  };

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (movieInWatchlist) {
      removeFromWatchlist(movieData.id);
      return;
    }

    addToWatchlist(movieData);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="movie-details">
        <p>Loading...</p>
      </div>
    );
  }

  // If movie not found, show error
  if (!movieData) {
    return (
      <div className="movie-details">
        <h2>Movie not found</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const movieInWatchlist = isInWatchlist(movieData.id);

  return (
    <div className="movie-details">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <div className="details-container">
        <img
          src={movieData.imageUrl}
          alt={movieData.title}
          className="details-image"
        />

        <div className="details-info">
          <h2>{movieData.title}</h2>
          <div className="rating-large">⭐ {movieData.rating}/10</div>
          <div className="genres-list">
            {movieData.genres &&
              movieData.genres.map((genre) => (
                <span key={genre} className="genre-badge">
                  {genre}
                </span>
              ))}
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{movieData.description || "No description available yet."}</p>
          </div>

          <div className="actions">
            <button
              className="rate-button"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                } else {
                  reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Rate this movie
            </button>
            <button
              className={`watchlist-button${movieInWatchlist ? " is-remove" : ""}`}
              onClick={handleWatchlistToggle}
            >
              {movieInWatchlist
                ? "Remove from Watchlist"
                : "+ Add to Watchlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Review Submission Section */}
      <div className="reviews-section" ref={reviewsRef}>
        <ReviewForm movie={movieData} onSubmitSuccess={handleReviewSubmitted} />
      </div>
    </div>
  );
}

export default MovieDetails;
