import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { movies } from "../data/mockMovies";
import "./Search.css";

// Search results page that filters movies by title or genre
function Search() {
  const [searchParams] = useSearchParams();
  const [filteredMovies, setFilteredMovies] = useState(movies);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentGenre, setCurrentGenre] = useState("");

  // Filters movies by title or genre when URL query parameters change
  useEffect(() => {
    const queryFromUrl = searchParams.get("q") || "";
    const genreFromUrl = searchParams.get("genre") || "";
    setCurrentQuery(queryFromUrl);
    setCurrentGenre(genreFromUrl);

    let results = movies;

    // Filter by title if query parameter exists
    if (queryFromUrl.trim() !== "") {
      const query = queryFromUrl.toLowerCase();
      results = results.filter((movie) =>
        movie.title.toLowerCase().includes(query),
      );
    }

    setFilteredMovies(results);
  }, [searchParams]);

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>Search Results</h2>
      </div>

      <div className="search-results">
        {(currentQuery || currentGenre) && (
          <p className="results-info">
            Found {filteredMovies.length}{" "}
            {filteredMovies.length === 1 ? "movie" : "movies"}
            {currentGenre && ` in "${currentGenre}"`}
            {currentQuery && ` matching "${currentQuery}"`}
          </p>
        )}

        {(currentQuery || currentGenre) && filteredMovies.length === 0 ? (
          <div className="no-results">
            <p>No movies found</p>
            <p className="suggestion">
              {currentGenre
                ? `Try a different genre or search for a specific movie`
                : `Try searching for different keywords or use the genre filters on the home page`}
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
