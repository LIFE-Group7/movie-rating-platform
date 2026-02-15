import { useParams, useNavigate } from "react-router-dom";
import { movies } from "../data/mockMovies";
import "./MovieDetails.css";

// Displays detailed view of a single movie
// Route parameter :id determines which movie to display
function MovieDetails() {
  const { id } = useParams(); // Get the :id from the URL
  const navigate = useNavigate(); // For navigation

  // Find the movie with matching id (convert id to number since URL params are strings)
  const movie = movies.find((m) => m.id === parseInt(id));

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
          <p className="genre-tag">{movie.genre}</p>

          <div className="description">
            <h3>Description</h3>
            <p>{movie.description || "No description available yet."}</p>
          </div>

          <div className="actions">
            <button className="rate-button">Rate this movie</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
