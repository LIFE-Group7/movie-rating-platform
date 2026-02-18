import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import "./MovieCard.css";

// Presentational component that displays movie information in a card format
// Receives a movie object as a prop and renders its details with all genres
function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { isAuthenticated } = useAuth();

  // Get all genres for the movie with backward compatibility
  const movieGenres = movie.genres || (movie.genre ? [movie.genre] : []);
  const movieInWatchlist = isInWatchlist(movie.id);

  const handleToggleWatchlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (movieInWatchlist) {
      removeFromWatchlist(movie.id);
      return;
    }

    addToWatchlist(movie);
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-card-link">
        <img src={movie.imageUrl} alt={movie.title} />
        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p className="rating">⭐ {movie.rating}/10</p>

        </div>
      </Link>

      <div className="movie-card-bottom-row">
        {movieGenres.length > 0 && (
          <div className="genres-list">
            {movieGenres.map((genre) => (
              <span key={genre} className="genre-badge">
                {genre}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          className="watchlist-add-btn"
          onClick={handleToggleWatchlist}
          title={
            movieInWatchlist ? "Remove from watchlist" : "Add to watchlist"
          }
          aria-label={
            movieInWatchlist
              ? `Remove ${movie.title} from watchlist`
              : `Add ${movie.title} to watchlist`
          }
        >
          <span className="watchlist-btn-icon" aria-hidden="true">
            {movieInWatchlist ? "−" : "+"}
          </span>
          <span className="watchlist-btn-text">
            {movieInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default MovieCard;
