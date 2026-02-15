import { Link } from "react-router-dom";
import "./MovieCard.css";

// Presentational component that displays movie information in a card format
// Recieves a movie object as a prop and renders its details
function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
        <img src={movie.imageUrl} alt={movie.title} />
        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p className="rating">⭐ {movie.rating}/10</p>
          <p className="genre">{movie.genre}</p>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
