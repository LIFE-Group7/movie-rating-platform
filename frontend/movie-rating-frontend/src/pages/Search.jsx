import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import ShowCard from "../components/ShowCard";
import SearchBar from "../components/SearchBar";
import { fetchMovies, fetchShows } from "../api/contentApi";

function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const normalizeTypeParam = (type) => {
    if (type === "movie" || type === "movies") return "movies";
    if (type === "show" || type === "shows") return "shows";
    return "all";
  };

  const [allMovies, setAllMovies] = useState([]);
  const [allShows, setAllShows] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentGenre, setCurrentGenre] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentType, setCurrentType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [moviesData, showsData] = await Promise.all([
          fetchMovies(),
          fetchShows(),
        ]);
        if (isMounted) {
          setAllMovies(moviesData);
          setAllShows(showsData);
        }
      } catch (err) {
        console.error("Search load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // URL params are the single source of truth for filter state.
    const queryFromUrl = searchParams.get("q") || "";
    const genreFromUrl = searchParams.get("genre") || "";
    const categoryFromUrl = searchParams.get("category") || "";
    const typeFromUrl = normalizeTypeParam(searchParams.get("type"));

    setCurrentQuery(queryFromUrl);
    setCurrentGenre(genreFromUrl);
    setCurrentCategory(categoryFromUrl);
    setCurrentType(typeFromUrl);

    let results;
    if (typeFromUrl === "movies") results = [...allMovies];
    else if (typeFromUrl === "shows") results = [...allShows];
    else results = [...allMovies, ...allShows];

    if (categoryFromUrl.trim() !== "") {
      if (categoryFromUrl.startsWith("genre:")) {
        const genre = categoryFromUrl.split(":")[1].toLowerCase();
        results = results.filter((item) => {
          const itemGenres = item.genres || (item.genre ? [item.genre] : []);
          return itemGenres.some((g) => g.toLowerCase() === genre);
        });
      } else if (categoryFromUrl === "rating") {
        results = results.sort((a, b) => b.rating - a.rating);
      } else if (categoryFromUrl === "year") {
        results = results.sort((a, b) => (b.year || 0) - (a.year || 0));
      }
    }

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
  }, [searchParams, allMovies, allShows]);

  const handleTypeChange = (newType) => {
    const next = new URLSearchParams(searchParams);
    if (newType === "all") next.delete("type");
    else next.set("type", newType);
    setSearchParams(next);
  };

  const clearGenre = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("genre");
    setSearchParams(next);
  };

  const clearCategory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    setSearchParams(next);
  };

  const getCategoryDisplayName = (category) => {
    if (category.startsWith("genre:")) {
      const genre = category.split(":")[1];
      return `Genre: ${genre}`;
    } else if (category === "rating") {
      return "Top Rated";
    } else if (category === "year") {
      return "Recent Releases";
    }
    return category;
  };

  const resultsLabel = useMemo(() => {
    if (currentType === "movies")
      return filteredResults.length === 1 ? "movie" : "movies";
    if (currentType === "shows")
      return filteredResults.length === 1 ? "show" : "shows";
    return filteredResults.length === 1 ? "result" : "results";
  }, [currentType, filteredResults.length]);

  const pillBase =
    "px-4 py-2 rounded-full text-sm font-semibold border transition-all";
  const pill = (type) =>
    `${pillBase} ${
      currentType === type
        ? "bg-blue-600 text-white border-blue-600 shadow-[0_8px_22px_rgba(37,99,235,0.25)]"
        : "bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white hover:bg-white/7"
    }`;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-lg font-semibold text-white/50">
          Loading results...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
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
                    "{currentGenre}"
                  </span>
                </>
              ) : null}
              {currentQuery ? (
                <>
                  {" "}
                  matching{" "}
                  <span className="text-white/85 font-semibold">
                    "{currentQuery}"
                  </span>
                </>
              ) : null}
              .
            </p>
          </div>
        </div>

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

          {currentCategory && (
            <button
              onClick={clearCategory}
              className="ml-0 md:ml-2 px-3 py-2 rounded-full text-sm font-semibold border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 transition-colors"
              aria-label="Clear category filter"
              title="Clear category filter"
            >
              {getCategoryDisplayName(currentCategory)} ×
            </button>
          )}

          {currentGenre && (
            <button
              onClick={clearGenre}
              className="ml-0 md:ml-2 px-3 py-2 rounded-full text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/7 text-white/75 hover:text-white transition-colors"
              aria-label="Clear genre filter"
              title="Clear genre filter"
            >
              Genre: "{currentGenre}" ×
            </button>
          )}
        </div>

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
                const isShow = item.type === "show";
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
