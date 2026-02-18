import { Link } from "react-router-dom";
import "./MovieCard.css";

// Presentational component that displays movie information in a card format
// Receives a movie object as a prop and renders its details with all genres
function MovieCard({ movie }) {
  // Get all genres for the movie with backward compatibility
  const movieGenres = movie.genres || (movie.genre ? [movie.genre] : []);

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
        <img src={movie.imageUrl} alt={movie.title} />
        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p className="rating">⭐ {movie.rating}/10</p>

          {/* Display all genres as compact tags */}
          {movieGenres.length > 0 && (
            <div className="genres-list">
              {movieGenres.map((genre) => (
                <span key={genre} className="genre-badge">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
