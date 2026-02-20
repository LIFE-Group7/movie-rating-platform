import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { movies } from "../data/mockMovies";
import "./TopFavoritesBanner.css";

function TopFavoritesBanner() {
  const navigate = useNavigate();

  const favoriteMovies = useMemo(
    () => [...movies].sort((first, second) => second.rating - first.rating).slice(0, 8),
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const goToNextMovie = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % favoriteMovies.length);
  };

  const goToPreviousMovie = () => {
    setActiveIndex(
      (currentIndex) => (currentIndex - 1 + favoriteMovies.length) % favoriteMovies.length
    );
  };

  useEffect(() => {
    if (favoriteMovies.length <= 1) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      goToNextMovie();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [favoriteMovies.length]);

  if (!favoriteMovies.length) {
    return null;
  }

  return (
    <section className="top-favorites-banner" aria-label="Top 8 favorite movies of the month">
      <button
        type="button"
        className="top-favorites-arrow top-favorites-arrow-left"
        onClick={goToPreviousMovie}
        aria-label="Previous movie"
      >
        ❮
      </button>

      <div
        className="top-favorites-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {favoriteMovies.map((movie) => (
          <article
            key={movie.id}
            className="top-favorites-slide"
            style={{ backgroundImage: `url(${movie.imageUrl})` }}
            onClick={() => navigate(`/movie/${movie.id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(`/movie/${movie.id}`);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open movie details for ${movie.title}`}
          >
            <div className="top-favorites-overlay" />
            <div className="top-favorites-content">
              <p className="top-favorites-kicker">Top Favorites This Month</p>
              <h3>{movie.title}</h3>
              <p className="top-favorites-description">{movie.description}</p>
              <p className="top-favorites-meta">
                Genres: {(movie.genres || []).join(", ")} • Length: {movie.durationMinutes} min
              </p>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="top-favorites-arrow top-favorites-arrow-right"
        onClick={goToNextMovie}
        aria-label="Next movie"
      >
        ❯
      </button>
    </section>
  );
}

export default TopFavoritesBanner;