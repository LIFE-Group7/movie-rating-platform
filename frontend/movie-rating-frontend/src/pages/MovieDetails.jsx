import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { movies } from "../data/mockMovies";
import ReviewForm from "../components/ReviewForm";
import { useAuth } from "../contexts/AuthContext";
import "./MovieDetails.css";

// Displays detailed view of a single movie
// Route parameter :id determines which movie to display
function MovieDetails() {
  const { id } = useParams(); // Get the :id from the URL
  const navigate = useNavigate(); // For navigation
  const { isAuthenticated } = useAuth(); // Check authentication status

  // Movie state (allows rating to be updated dynamically after review submission)
  const [movieData, setMovieData] = useState(null);
  const [reviewSubmissionCount, setReviewSubmissionCount] = useState(0);
  const reviewsRef = useRef(null);

  // Find the movie with matching id on component mount and when id changes
  useEffect(() => {
    const foundMovie = movies.find((m) => m.id === parseInt(id));
    if (foundMovie) {
      setMovieData(foundMovie);
    }
  }, [id]);

  // Get the current movie data (either from state or original data)
  const movie = movieData;

  /**
   * Handle successful review submission
   * Updates the movie's average rating dynamically
   * In a real app, this would be called after backend confirms submission
   */
  const handleReviewSubmitted = (reviewData) => {
    if (!movie) return;

    // TODO: When backend is connected, this data will come from backend
    // For now, we simulate updating the rating based on new submission

    // Calculate new average rating
    // This is a simple simulation - backend will have the actual calculation
    const allReviews = [
      { rating: movie.rating }, // Existing average (treating as a single "review")
      { rating: reviewData.rating }, // New review
    ];

    const newAverageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;

    // Update movie data with new rating
    setMovieData({
      ...movie,
      rating: parseFloat(newAverageRating.toFixed(1)),
    });

    // Increment submission count to track reviews
    setReviewSubmissionCount((prev) => prev + 1);

    // TODO: In a real app, fetch updated movie data from backend:
    // const response = await fetch(`/api/movies/${movie.id}`);
    // const updatedMovie = await response.json();
    // setMovieData(updatedMovie);
  };

  // If movie not found, show error
  if (!movie) {
    return (
      <div className="movie-details">
        <h2>Movie not found</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="movie-details">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <div className="details-container">
        <img src={movie.imageUrl} alt={movie.title} className="details-image" />

        <div className="details-info">
          <h2>{movie.title}</h2>
          <div className="rating-large">⭐ {movie.rating}/10</div>
          <div className="genres-list">
            {movie.genres &&
              movie.genres.map((genre) => (
                <span key={genre} className="genre-badge">
                  {genre}
                </span>
              ))}
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{movie.description || "No description available yet."}</p>
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
          </div>
        </div>
      </div>

      {/* Review Submission Section */}
      {movie && (
        <div className="reviews-section" ref={reviewsRef}>
          <ReviewForm movie={movie} onSubmitSuccess={handleReviewSubmitted} />
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
