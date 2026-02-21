import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import ShowCard from "../components/ShowCard";
import { movies, getAllGenres } from "../data/mockMovies";
import { shows } from "../data/mockShows";
import "./Home.css";

// Main landing page that displays a grid of movie cards
// Includes a genre filter section that redirects to search page
function Home() {
  const navigate = useNavigate();
  const mainGenres = ["Action", "Drama", "Crime", "Thriller", "Sci-Fi"];
  const trendingMovies = [...movies]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
  const trendingShows = [...shows]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Get all unique genres from movies collection
  const availableGenres = getAllGenres();

  const getGenreMovies = (genre) =>
    movies.filter((movie) => (movie.genres || []).includes(genre)).slice(0, 4);

  // Redirects to search page with genre query parameter
  const handleGenreClick = (genre) => {
    navigate(`/search?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="home">
      <h2>Rated & Recommended</h2>

      <div className="home-section-block">
        <h3>Trending Movies</h3>
      </div>
      <div className="movie-grid">
        {trendingMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className="home-section-block">
        <h3>Trending Shows</h3>
      </div>
      <div className="movie-grid">
        {trendingShows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>

      <div className="home-section-block">
        <h3>All Movies</h3>
      </div>
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className="home-section-block">
        <h3>All Shows</h3>
      </div>
      <div className="movie-grid">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>

      <div className="genre-suggestions-section">
        <h3>Main Genres</h3>
        {mainGenres.map((genre) => (
          <section key={genre} className="genre-preview-block">
            <div className="genre-preview-header">
              <button
                type="button"
                className="genre-title-button"
                onClick={() => handleGenreClick(genre)}
                aria-label={`Open ${genre} genre page`}
              >
                {genre}
              </button>
            </div>
            <div className="movie-grid">
              {getGenreMovies(genre).map((movie) => (
                <MovieCard key={`${genre}-${movie.id}`} movie={movie} />
              ))}
            </div>
          </section>
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
