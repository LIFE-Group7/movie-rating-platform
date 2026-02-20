import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import ShowCard from "../components/ShowCard";
import { movies } from "../data/mockMovies";
import { shows } from "../data/mockShows";
import "./Search.css";

// Search results page that filters movies and shows by title, genre, or content type
function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredResults, setFilteredResults] = useState([...movies, ...shows]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentGenre, setCurrentGenre] = useState("");
  const [currentType, setCurrentType] = useState("all");

  // Filters content by title, genre, or type when URL query parameters change
  useEffect(() => {
    const queryFromUrl = searchParams.get("q") || "";
    const genreFromUrl = searchParams.get("genre") || "";
    const typeFromUrl = searchParams.get("type") || "all";
    setCurrentQuery(queryFromUrl);
    setCurrentGenre(genreFromUrl);
    setCurrentType(typeFromUrl);

    // Pick the correct data pool based on type filter
    let results;
    if (typeFromUrl === "movies") {
      results = [...movies];
    } else if (typeFromUrl === "shows") {
      results = [...shows];
    } else {
      results = [...movies, ...shows];
    }

    // Filter by genre if genre parameter exists
    if (genreFromUrl.trim() !== "") {
      results = results.filter((item) => {
        const itemGenres = item.genres || (item.genre ? [item.genre] : []);
        return itemGenres.some(
          (g) => g.toLowerCase() === genreFromUrl.toLowerCase(),
        );
      });
    }

    // Filter by title if query parameter exists
    if (queryFromUrl.trim() !== "") {
      const query = queryFromUrl.toLowerCase();
      results = results.filter((item) =>
        item.title.toLowerCase().includes(query),
      );
    }

    setFilteredResults(results);
  }, [searchParams]);

  // Update the type filter and preserve other search params
  const handleTypeChange = (newType) => {
    const newParams = new URLSearchParams(searchParams);
    if (newType === "all") {
      newParams.delete("type");
    } else {
      newParams.set("type", newType);
    }
    setSearchParams(newParams);
  };

  // Get the label for results info text
  const getResultsLabel = () => {
    if (currentType === "movies") return filteredResults.length === 1 ? "movie" : "movies";
    if (currentType === "shows") return filteredResults.length === 1 ? "show" : "shows";
    return filteredResults.length === 1 ? "result" : "results";
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>Search Results</h2>
      </div>

      <div className="search-type-filters">
        <button
          type="button"
          className={`filter-btn${currentType === "all" ? " active" : ""}`}
          onClick={() => handleTypeChange("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`filter-btn${currentType === "movies" ? " active" : ""}`}
          onClick={() => handleTypeChange("movies")}
        >
          Movies
        </button>
        <button
          type="button"
          className={`filter-btn${currentType === "shows" ? " active" : ""}`}
          onClick={() => handleTypeChange("shows")}
        >
          Shows
        </button>
      </div>

      <div className="search-results">
        {(currentQuery || currentGenre) && (
          <p className="results-info">
            Found {filteredResults.length} {getResultsLabel()}
            {currentGenre && ` in "${currentGenre}"`}
            {currentQuery && ` matching "${currentQuery}"`}
          </p>
        )}

        {(currentQuery || currentGenre) && filteredResults.length === 0 ? (
          <div className="no-results">
            <p>No {currentType === "all" ? "results" : currentType} found</p>
            <p className="suggestion">
              {currentGenre
                ? `Try a different genre or search for a specific title`
                : `Try searching for different keywords or use the genre filters on the home page`}
            </p>
          </div>
        ) : (
          <div className="movie-grid">
            {filteredResults.map((item) =>
              item.type === "show" ? (
                <ShowCard key={`show-${item.id}`} show={item} />
              ) : (
                <MovieCard key={`movie-${item.id}`} movie={item} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
