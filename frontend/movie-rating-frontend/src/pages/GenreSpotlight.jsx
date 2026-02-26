import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import ShowCard from "../components/ShowCard";
import { fetchMovies, fetchShows } from "../api/contentApi";

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "year", label: "Newest First" },
  { value: "title", label: "A → Z" },
];

const GENRE_META = {
  action:           { gradient: "from-red-950 via-orange-950 to-zinc-950",   accent: "#ef4444" },
  drama:            { gradient: "from-blue-950 via-indigo-950 to-zinc-950",  accent: "#6366f1" },
  thriller:         { gradient: "from-zinc-900 via-neutral-950 to-zinc-950", accent: "#a1a1aa" },
  "science fiction":{ gradient: "from-cyan-950 via-slate-950 to-zinc-950",   accent: "#06b6d4" },
  comedy:           { gradient: "from-yellow-950 via-amber-950 to-zinc-950", accent: "#eab308" },
  horror:           { gradient: "from-red-950 via-zinc-950 to-black",        accent: "#dc2626" },
  romance:          { gradient: "from-pink-950 via-rose-950 to-zinc-950",    accent: "#f43f5e" },
  animation:        { gradient: "from-purple-950 via-violet-950 to-zinc-950",accent: "#a855f7" },
};

const coerceGenres = (input) => {
  if (Array.isArray(input)) return input;
  if (typeof input === "string" && input.trim()) return [input];
  return [];
};

const coerceItem = (item, idx) => {
  const title = item.title ?? item.name ?? `Untitled ${idx + 1}`;
  return {
    ...item,
    id: item.id ?? item.movieId ?? item.showId ?? `${title}-${idx}`,
    type: item.type ?? (item.seasons ? "show" : "movie"),
    title,
    rating:
      typeof item.rating === "number"
        ? item.rating
        : Number(item.averageRating ?? item.vote_average ?? 0),
    genres: coerceGenres(item.genres ?? item.genre),
    year: item.year ?? item.releaseYear ?? null,
  };
};

function BackIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

export default function GenreSpotlight() {
  const { genre } = useParams();
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating");

  const displayGenre = decodeURIComponent(genre || "");
  const meta =
    GENRE_META[displayGenre.toLowerCase()] ??
    GENRE_META["action"];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [movies, shows] = await Promise.all([fetchMovies(), fetchShows()]);
        if (mounted) {
          setAllItems([...movies, ...shows].map(coerceItem));
        }
      } catch (err) {
        console.error("GenreSpotlight load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = allItems.filter((item) =>
    item.genres.some((g) => g.toLowerCase() === displayGenre.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "year") return (b.year || 0) - (a.year || 0);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero banner */}
      <div
        className={`w-full py-16 px-6 md:px-12 bg-gradient-to-br ${meta.gradient}`}
      >
        <div className="max-w-screen-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <BackIcon />
            Back
          </button>
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
            style={{ color: meta.accent }}
          >
            {displayGenre}
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            {loading ? "Loading…" : `${sorted.length} title${sorted.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">
            Sort
          </span>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  sortBy === opt.value
                    ? "bg-white/15 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-white/50 hover:text-white hover:border-white/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-white/40 font-semibold">
              Loading…
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-white/40">No titles found for "{displayGenre}".</p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 text-sm font-semibold hover:bg-white/15 transition-colors"
            >
              Go Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sorted.map((item) =>
              item.type === "show" ? (
                <ShowCard key={item.id} show={item} />
              ) : (
                <MovieCard key={item.id} movie={item} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
