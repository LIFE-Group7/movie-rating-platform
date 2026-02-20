import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { shows } from "../data/mockShows";
import ReviewForm from "../components/ReviewForm";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import "./ShowDetails.css";

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
  const reviewsRef = useRef(null);

  // Fetch show on mount and when id changes
  useEffect(() => {
    const foundShow = shows.find((s) => s.id === parseInt(id));
    if (foundShow) {
      setShowData(foundShow);
      addRecentlyViewed(foundShow);
    } else {
      setShowData(null);
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
   * Updates show rating dynamically after review is submitted
   */
  const handleReviewSubmitted = (reviewData) => {
    if (!showData) return;

    // Calculate new average rating
    const allReviews = [
      { rating: showData.rating },
      { rating: reviewData.rating },
    ];

    const newAverageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;

    setShowData({
      ...showData,
      rating: parseFloat(newAverageRating.toFixed(1)),
    });
  };

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (showInWatchlist) {
      removeFromWatchlist(showData.id);
      return;
    }

    addToWatchlist(showData);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="show-details">
        <p>Loading...</p>
      </div>
    );
  }

  // If show not found, show error
  if (!showData) {
    return (
      <div className="show-details">
        <h2>Show not found</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const showInWatchlist = isInWatchlist(showData.id);

  return (
    <div className="show-details">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <div className="details-container">
        <img
          src={showData.imageUrl}
          alt={showData.title}
          className="details-image"
        />

        <div className="details-info">
          <h2>{showData.title}</h2>
          <div className="rating-large">⭐ {showData.rating}/10</div>
          <div className="genres-list">
            {showData.genres &&
              showData.genres.map((genre) => (
                <span key={genre} className="genre-badge">
                  {genre}
                </span>
              ))}
          </div>

          <div className="show-details-meta">
            <div className="show-meta-item">
              <span className="meta-label">Seasons</span>
              <span className="meta-value">{showData.seasons}</span>
            </div>
            <div className="show-meta-item">
              <span className="meta-label">Episodes</span>
              <span className="meta-value">{showData.episodes}</span>
            </div>
            <div className="show-meta-item">
              <span className="meta-label">Status</span>
              <span
                className={`meta-value show-status-badge ${showData.status === "Ongoing" ? "status-ongoing" : "status-ended"}`}
              >
                <span className="status-dot" aria-hidden="true"></span>
                {showData.status}
              </span>
            </div>
            <div className="show-meta-item">
              <span className="meta-label">Year</span>
              <span className="meta-value">{showData.year}</span>
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{showData.description || "No description available yet."}</p>
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
              Rate this show
            </button>
            <button
              className={`watchlist-button${showInWatchlist ? " is-remove" : ""}`}
              onClick={handleWatchlistToggle}
            >
              {showInWatchlist
                ? "Remove from Watchlist"
                : "+ Add to Watchlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Review Submission Section */}
      <div className="reviews-section" ref={reviewsRef}>
        <ReviewForm movie={showData} onSubmitSuccess={handleReviewSubmitted} />
      </div>
    </div>
  );
}

export default ShowDetails;
