import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import ShowCard from "../components/ShowCard";
import { movies } from "../data/mockMovies";
import { shows } from "../data/mockShows";
import { useAdmin } from "../contexts/AdminContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ── Hero spotlight mock data ────────────────────────────────────────────────
const fallbackHeroSpotlight = [
  {
    id: 1,
    title: "Dune: Part Two",
    rating: 8.8,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    bg: "from-amber-950 via-stone-950 to-zinc-950",
    accent: "#d97706",
  },
  {
    id: 2,
    title: "Oppenheimer",
    rating: 8.9,
    genres: ["Drama", "History", "Thriller"],
    description:
      "The story of J. Robert Oppenheimer and his pivotal role in the development of the first nuclear weapon during WWII.",
    bg: "from-orange-950 via-neutral-950 to-zinc-950",
    accent: "#ea580c",
  },
];

const heroPalettes = [
  { bg: "from-amber-950 via-stone-950 to-zinc-950", accent: "#d97706" },
  { bg: "from-orange-950 via-neutral-950 to-zinc-950", accent: "#ea580c" },
  { bg: "from-emerald-950 via-slate-950 to-zinc-950", accent: "#10b981" },
];

const placeholderPoster = (title) =>
  `https://placehold.co/400x600?text=${encodeURIComponent(title || "Title").replace(/%20/g, "+")}`;

const coerceGenres = (input) => {
  if (Array.isArray(input)) return input;
  if (typeof input === "string" && input.trim()) return [input];
  return [];
};

const pickImage = (item, title) => {
  if (item.imageUrl) return item.imageUrl;
  if (item.posterUrl) return item.posterUrl;
  if (item.poster_path)
    return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  if (item.backdrop_path)
    return `https://image.tmdb.org/t/p/w780${item.backdrop_path}`;
  return placeholderPoster(title);
};

const coerceCardItem = (item, idx) => {
  const title = item.title ?? item.name ?? `Untitled ${idx + 1}`;
  return {
    ...item, // ← add this
    id: item.id ?? item.movieId ?? item.showId ?? `${title}-${idx}`,
    type: item.type ?? (item.seasons ? "show" : "movie"),
    title,
    rating:
      typeof item.rating === "number"
        ? item.rating
        : Number(item.averageRating ?? item.vote_average ?? 0),
    genres: coerceGenres(item.genres ?? item.genre),
    imageUrl: pickImage(item, title),
    description: item.description ?? item.overview ?? "",
  };
};

const coerceHeroEntry = (item, idx) => {
  const base = coerceCardItem(item, idx);
  const palette = heroPalettes[idx % heroPalettes.length];
  return {
    ...base,
    bg: item.bg ?? palette.bg,
    accent: item.accent ?? palette.accent,
    image: item.image ?? item.backdropUrl ?? base.imageUrl,
  };
};

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.results && Array.isArray(payload.results))
    return payload.results;
  return [];
};

const buildApiUrl = (path) => {
  if (!API_BASE_URL) return null;
  try {
    return new URL(path, API_BASE_URL).toString();
  } catch {
    return null;
  }
};

// ── Inline SVG icons — avoids external icon library dependency ───────────────
function StarIcon() {
  return (
    <svg className="w-4 h-4 fill-yellow-400 flex-shrink-0" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="w-5 h-5"
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

function ChevronRightIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

/**
 * Horizontally scrollable carousel with arrow buttons and fade-edge overlays.
 * `renderItem` is a render-prop so callers can inject any card type (MovieCard,
 * ShowCard, etc.) without coupling the carousel logic to a specific data shape.
 */
function CarouselSection({ title, items, renderItem, onViewAll }) {
  const scrollRef = useRef(null);

  // Scroll by a fixed pixel amount in the requested direction.
  // 320 px ≈ the width of two card columns and feels natural on most viewports.
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 320, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View All →
          </button>
        )}
      </div>

      {/* Scrollable row with arrows */}
      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 backdrop-blur-sm text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-700 shadow-xl border border-white/10"
        >
          <ChevronLeftIcon />
        </button>

        {/* Cards row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-6 pb-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => renderItem(item))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 backdrop-blur-sm text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-700 shadow-xl border border-white/10"
        >
          <ChevronRightIcon />
        </button>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-3 w-10 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-3 w-10 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

const ALL_CONTENT = [
  ...movies.map((item, idx) => coerceCardItem(item, idx)),
  ...shows.map((item, idx) => coerceCardItem(item, idx)),
];

/**
 * Resolves a section's filterBy string into a list of content items.
 * Supports: "rating", "year", "genre:<Name>"
 */
const resolveItems = (filterBy) => {
  if (filterBy.startsWith("genre:")) {
    const genre = filterBy.split(":")[1].toLowerCase();
    return ALL_CONTENT.filter((item) =>
      item.genres.some((g) => g.toLowerCase() === genre),
    ).slice(0, 12);
  }

  switch (filterBy) {
    case "rating":
      return [...ALL_CONTENT].sort((a, b) => b.rating - a.rating).slice(0, 12);
    case "year":
      return [...ALL_CONTENT]
        .sort((a, b) => (b.year || 0) - (a.year || 0))
        .slice(0, 12);
    default:
      return ALL_CONTENT.slice(0, 12);
  }
};

// ── Main Home component ───────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const { categories, sections } = useAdmin();
  const [heroEntries, setHeroEntries] = useState(fallbackHeroSpotlight);
  const [heroIndex, setHeroIndex] = useState(0);
  // Used to trigger a fade-out/fade-in transition when the spotlight changes.
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Tracks the active genre pill — selecting one navigates to the search page.
  const [activeGenre, setActiveGenre] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState(() =>
    movies.slice(0, 12),
  );
  const [topRatedMovies, setTopRatedMovies] = useState(() =>
    [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12),
  );
  const [popularShows, setPopularShows] = useState(() => shows.slice(0, 12));

  const heroSlides = heroEntries.length ? heroEntries : fallbackHeroSpotlight;
  const totalHeroes = heroSlides.length || fallbackHeroSpotlight.length;
  const currentHero = heroSlides[heroIndex % totalHeroes];

  // Hydrate carousels and hero spotlight from API when configured; fall back to mocks.
  useEffect(() => {
    if (!API_BASE_URL) return undefined;

    const controller = new AbortController();

    const fetchJson = async (path) => {
      const url = buildApiUrl(path);
      if (!url) throw new Error("Missing API base URL");
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    };

    const requests = [
      {
        path: "/api/home/spotlight",
        apply: (payload) => {
          const items = extractList(payload).map(coerceHeroEntry);
          if (items.length) {
            setHeroEntries(items);
            setHeroIndex(0);
          }
        },
      },
      {
        path: "/api/movies/trending",
        apply: (payload) => {
          const items = extractList(payload).map(coerceCardItem).slice(0, 12);
          if (items.length) setTrendingMovies(items);
        },
      },
      {
        path: "/api/movies/top-rated",
        apply: (payload) => {
          const items = extractList(payload).map(coerceCardItem).slice(0, 12);
          if (items.length) setTopRatedMovies(items);
        },
      },
      {
        path: "/api/shows/popular",
        apply: (payload) => {
          const items = extractList(payload).map(coerceCardItem).slice(0, 12);
          if (items.length) setPopularShows(items);
        },
      },
    ];

    const load = async () => {
      await Promise.allSettled(
        requests.map(async ({ path, apply }) => {
          const json = await fetchJson(path);
          apply(json);
        }),
      );
    };

    load().catch(() => {});

    return () => controller.abort();
  }, []);

  // ── Hero auto-rotation ─────────────────────────────────────────────────────
  // Advances the spotlight every 5.5 s with a 350 ms crossfade.
  // The interval is cleared on unmount to prevent state updates on an
  // unmounted component.
  useEffect(() => {
    if (!totalHeroes) return undefined;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % totalHeroes);
        setIsTransitioning(false);
      }, 350);
    }, 5500);
    return () => clearInterval(interval);
  }, [totalHeroes]);

  /**
   * Jump to a specific spotlight entry.
   * No-ops when the requested index is already active to avoid a flickering
   * transition with no visible change.
   */
  const changeHero = (newIndex) => {
    if (!totalHeroes || newIndex === heroIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setHeroIndex(newIndex % totalHeroes);
      setIsTransitioning(false);
    }, 350);
  };

  // Navigate to the search page pre-filtered by the chosen genre.
  const handleGenreClick = (genre) => {
    navigate(`/search?genre=${encodeURIComponent(genre)}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── 1. Hero Carousel ─────────────────────────────────────────────── */}
      <section
        className={`relative w-full h-[78vh] min-h-[520px] overflow-hidden bg-gradient-to-br ${currentHero.bg}`}
      >
        {/* Background image for the spotlight — rendered beneath the gradient overlays */}
        {currentHero.image && (
          <img
            src={currentHero.image}
            alt={currentHero.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/20 to-transparent" />

        {/* Hero content */}
        <div
          className={`absolute bottom-0 left-0 p-10 md:p-16 max-w-2xl transition-all duration-350 ease-in-out ${
            isTransitioning
              ? "opacity-0 translate-y-5"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Genre pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentHero.genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 tracking-wide"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-3 text-white leading-tight drop-shadow-2xl tracking-tight">
            {currentHero.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-4">
            <StarIcon />
            <span className="text-yellow-400 font-bold text-lg">
              {currentHero.rating}
            </span>
            <span className="text-white/40 text-sm">/10 · IMDb</span>
          </div>

          {/* Description */}
          <p className="text-white/65 text-base md:text-lg mb-7 leading-relaxed line-clamp-2 max-w-xl">
            {currentHero.description}
          </p>

          {/* CTA */}
          <button
            onClick={() =>
              navigate(`/search?q=${encodeURIComponent(currentHero.title)}`)
            }
            className="px-7 py-3 rounded-xl font-bold text-white text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl"
            style={{ backgroundColor: currentHero.accent }}
          >
            Watch Details
          </button>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-8 right-10 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => changeHero(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === heroIndex
                  ? "w-7 h-2 bg-white"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Side arrows */}
        <button
          onClick={() =>
            changeHero((heroIndex - 1 + totalHeroes) % totalHeroes)
          }
          aria-label="Previous spotlight"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-3 hover:bg-black/55 transition-all border border-white/10"
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={() => changeHero((heroIndex + 1) % totalHeroes)}
          aria-label="Next spotlight"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-3 hover:bg-black/55 transition-all border border-white/10"
        >
          <ChevronRightIcon />
        </button>
      </section>

      {/* ── 2. Sticky Genre Filter Pills ─────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div
          className="flex gap-2 overflow-x-auto px-6 py-3 max-w-screen-2xl mx-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            onClick={() => setActiveGenre(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border flex-shrink-0 ${
              !activeGenre
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-transparent text-white/55 border-white/15 hover:border-white/35 hover:text-white/80"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveGenre(category.name);
                handleGenreClick(category.name);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border flex-shrink-0 ${
                activeGenre === category.name
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-white/55 border-white/15 hover:border-white/35 hover:text-white/80"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {sections
        .filter((section) => section.visible)
        .map((section) => (
          <CarouselSection
            key={section.id}
            title={section.title}
            items={resolveItems(section.filterBy)}
            onViewAll={() => navigate("/search")}
            renderItem={(item) => (
              <div
                key={item.id}
                className="flex-shrink-0 snap-start w-44 md:w-48"
              >
                {item.type === "show" ? (
                  <ShowCard show={item} />
                ) : (
                  <MovieCard movie={item} />
                )}
              </div>
            )}
          />
        ))}
    </div>
  );
}

export default Home;
