import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { movies } from "../data/mockMovies";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import "./MovieDetails.css";

// Displays detailed view of a single movie
// Route parameter :id determines which movie to display
function MovieDetails() {
  const { id } = useParams(); // Get the :id from the URL
  const navigate = useNavigate(); // For navigation
  const { addToWatchlist, isInWatchlist, setRatingForMovie, addRecentlyViewed } =
    useWatchlist();
  const { isAuthenticated } = useAuth();

  // Find the movie with matching id (convert id to number since URL params are strings)
  const movie = movies.find((m) => m.id === parseInt(id));

  useEffect(() => {
    if (!movie) return;

    return () => {
      addRecentlyViewed(movie);
    };
  }, [movie?.id, addRecentlyViewed]);

  // If movie not found, show error
  if (!movie) {
    return (
      <div className="movie-details">
        <h2>Movie not found</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const handleWatchlistAdd = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    addToWatchlist(movie);
  };

  const handleLeaveReview = () => {
    const input = window.prompt("Leave a rating from 0 to 10:", "8");
    if (input === null) return;
    const success = setRatingForMovie(movie.id, Number(input));
    if (!success) {
      window.alert("Please enter a valid rating between 0 and 10.");
      return;
    }

    window.alert("Your rating was saved.");
  };

  const movieInWatchlist = isInWatchlist(movie.id);

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
          <p className="genre-tag">{movie.genre}</p>

          <div className="description">
            <h3>Description</h3>
            <p>{movie.description || "No description available yet."}</p>
          </div>

          <div className="actions">
            <button
              className="watchlist-button"
              onClick={handleWatchlistAdd}
              disabled={movieInWatchlist}
            >
              {movieInWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
            </button>
            <button className="rate-button" onClick={handleLeaveReview}>
              Leave rating / review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
