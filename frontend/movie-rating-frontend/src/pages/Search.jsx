import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import ShowCard from "../components/ShowCard";
import SearchBar from "../components/SearchBar";
import { movies } from "../data/mockMovies";
import { shows } from "../data/mockShows";

/**
 * Search / browse page.
 *
 * All filter state (query, genre, type) lives in the URL search params so the
 * results page is bookmarkable and back-navigable without extra state management.
 * The Navbar's SearchBar and the genre pill buttons in Home both deep-link here.
 */
function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredResults, setFilteredResults] = useState([...movies, ...shows]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentGenre, setCurrentGenre] = useState("");
  const [currentType, setCurrentType] = useState("all");

  // Re-run filtering every time the URL params change (including browser back/forward).
  useEffect(() => {
    const queryFromUrl = searchParams.get("q") || "";
    const genreFromUrl = searchParams.get("genre") || "";
    const typeFromUrl = searchParams.get("type") || "all";

    setCurrentQuery(queryFromUrl);
    setCurrentGenre(genreFromUrl);
    setCurrentType(typeFromUrl);

    // Start with the full dataset for the requested type, then narrow by genre/query.
    let results;
    if (typeFromUrl === "movies") results = [...movies];
    else if (typeFromUrl === "shows") results = [...shows];
    else results = [...movies, ...shows];

    if (genreFromUrl.trim() !== "") {
      results = results.filter((item) => {
        const itemGenres = item.genres || (item.genre ? [item.genre] : []);
        return itemGenres.some(
          (g) => g.toLowerCase() === genreFromUrl.toLowerCase(),
        );
      });
    }

    if (queryFromUrl.trim() !== "") {
      const q = queryFromUrl.toLowerCase();
      results = results.filter((item) => item.title.toLowerCase().includes(q));
    }

    setFilteredResults(results);
  }, [searchParams]);

  // Update the `type` param and let the effect above re-filter results.
  const handleTypeChange = (newType) => {
    const next = new URLSearchParams(searchParams);
    if (newType === "all") next.delete("type");
    else next.set("type", newType);
    setSearchParams(next);
  };

  // Called by the SearchBar — updates the `q` param in-place.
  const handleSearch = (q) => {
    const next = new URLSearchParams(searchParams);
    const cleaned = (q || "").trim();
    if (!cleaned) next.delete("q");
    else next.set("q", cleaned);
    setSearchParams(next);
  };

  // Remove the genre filter without clearing other params.
  const clearGenre = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("genre");
    setSearchParams(next);
  };

  // Derive the correct singular/plural label for the result count line.
  const resultsLabel = useMemo(() => {
    if (currentType === "movies")
      return filteredResults.length === 1 ? "movie" : "movies";
    if (currentType === "shows")
      return filteredResults.length === 1 ? "show" : "shows";
    return filteredResults.length === 1 ? "result" : "results";
  }, [currentType, filteredResults.length]);

  // Base and active/inactive class factory for the type filter pills.
  const pillBase =
    "px-4 py-2 rounded-full text-sm font-semibold border transition-all";
  const pill = (type) =>
    `${pillBase} ${
      currentType === type
        ? "bg-blue-600 text-white border-blue-600 shadow-[0_8px_22px_rgba(37,99,235,0.25)]"
        : "bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white hover:bg-white/7"
    }`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Search
            </h1>
            <p className="text-sm text-white/55 mt-1">
              Found{" "}
              <span className="text-white/85 font-semibold">
                {filteredResults.length}
              </span>{" "}
              {resultsLabel}
              {currentGenre ? (
                <>
                  {" "}
                  in{" "}
                  <span className="text-white/85 font-semibold">
                    “{currentGenre}”
                  </span>
                </>
              ) : null}
              {currentQuery ? (
                <>
                  {" "}
                  matching{" "}
                  <span className="text-white/85 font-semibold">
                    “{currentQuery}”
                  </span>
                </>
              ) : null}
              .
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTypeChange("all")}
            className={pill("all")}
          >
            All
          </button>
          <button
            onClick={() => handleTypeChange("movies")}
            className={pill("movies")}
          >
            Movies
          </button>
          <button
            onClick={() => handleTypeChange("shows")}
            className={pill("shows")}
          >
            TV Shows
          </button>

          {currentGenre && (
            <button
              onClick={clearGenre}
              className="ml-0 md:ml-2 px-3 py-2 rounded-full text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/7 text-white/75 hover:text-white transition-colors"
              aria-label="Clear genre filter"
              title="Clear genre filter"
            >
              Genre: “{currentGenre}” ×
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mt-8">
          {(currentQuery || currentGenre) && filteredResults.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="text-lg font-extrabold">No results found</div>
              <div className="text-sm text-white/55 mt-2">
                Try different keywords, clear filters, or browse from Home.
              </div>
              <button
                onClick={() => navigate("/")}
                className="mt-5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold text-sm"
              >
                Go to Home
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredResults.map((item) => {
                const isShow = Object.prototype.hasOwnProperty.call(
                  item,
                  "seasons",
                );
                return isShow ? (
                  <ShowCard key={`show-${item.id}`} show={item} />
                ) : (
                  <MovieCard key={`movie-${item.id}`} movie={item} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
