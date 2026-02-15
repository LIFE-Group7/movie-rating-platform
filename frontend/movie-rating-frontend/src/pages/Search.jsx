import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { movies } from "../data/mockMovies";
import "./Search.css";

// Search results page
// Displays filtered movies based on URL query parameter
function Search() {
  const [searchParams] = useSearchParams();
  const [filteredMovies, setFilteredMovies] = useState(movies);
  const [currentQuery, setCurrentQuery] = useState("");

  // Filter movies whenever URL query changes
  useEffect(() => {
    const queryFromUrl = searchParams.get("q") || "";
    setCurrentQuery(queryFromUrl);

    if (queryFromUrl.trim() === "") {
      setFilteredMovies(movies);
    } else {
      const query = queryFromUrl.toLowerCase();
      const results = movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query) ||
          movie.genre.toLowerCase().includes(query),
      );
      setFilteredMovies(results);
    }
  }, [searchParams]);

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>Search Results</h2>
      </div>

      <div className="search-results">
        {currentQuery && (
          <p className="results-info">
            Found {filteredMovies.length}{" "}
            {filteredMovies.length === 1 ? "movie" : "movies"}
            {filteredMovies.length > 0 && ` for "${currentQuery}"`}
          </p>
        )}

        {currentQuery && filteredMovies.length === 0 ? (
          <div className="no-results">
            <p>No movies found matching "{currentQuery}"</p>
            <p className="suggestion">
              Try searching for different keywords in the navbar above
            </p>
          </div>
        ) : (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
