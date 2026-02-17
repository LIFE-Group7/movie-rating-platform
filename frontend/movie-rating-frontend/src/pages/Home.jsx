import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { movies, getAllGenres } from "../data/mockMovies";
import "./Home.css";

// Main landing page that displays a grid of movie cards
// Includes a genre filter section that redirects to search page
function Home() {
  const navigate = useNavigate();

  // Get all unique genres from movies collection
  const availableGenres = getAllGenres();

  // Redirects to search page with genre query parameter
  const handleGenreClick = (genre) => {
    navigate(`/search?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="home">
      <h2>Rated & Recommended Movies</h2>

      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {/* Genre filter section displayed below movie grid */}
      <div className="genre-filter-section">
        <h3>Filter by Genre</h3>
        <div className="genre-tags">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              className="genre-tag"
              onClick={() => handleGenreClick(genre)}
              aria-label={`Filter by ${genre}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
