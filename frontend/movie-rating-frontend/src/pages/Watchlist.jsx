import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import "./Watchlist.css";

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "year", label: "Year" },
  { value: "rating", label: "Rating" },
  { value: "yourRating", label: "Your Rating" },
  { value: "releaseDate", label: "Release Date" },
  { value: "addedAt", label: "Date Added" },
];

const formatDate = (dateString) => {
  if (!dateString) return "Not available";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

function Watchlist() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    watchlist,
    recentlyViewed,
    userRatings,
    setRatingForMovie,
    removeFromWatchlist,
  } = useWatchlist();

  const [sortBy, setSortBy] = useState("addedAt");
  const [activeSection, setActiveSection] = useState("watchlist");

  const sortedWatchlist = useMemo(() => {
    const list = [...watchlist];

    list.sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "year") {
        return (b.year || 0) - (a.year || 0);
      }

      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }

      if (sortBy === "yourRating") {
        return (userRatings[b.id] || 0) - (userRatings[a.id] || 0);
      }

      if (sortBy === "releaseDate") {
        return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      }

      return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
    });

    return list;
  }, [watchlist, sortBy, userRatings]);

  const ratingsList = useMemo(() => {
    return Object.entries(userRatings)
      .map(([movieId, rating]) => {
        const movie = watchlist.find((item) => item.id === Number(movieId));
        if (!movie) return null;
        return { ...movie, yourRating: rating };
      })
      .filter(Boolean)
      .sort((a, b) => b.yourRating - a.yourRating);
  }, [userRatings, watchlist]);

  const handleLeaveReview = (movie) => {
    // Navigate to movie details page with scroll to review section
    navigate(`/movie/${movie.id}`, { state: { scrollToReview: true } });
  };

  return (
    <div className="watchlist-page">
      <section className="watchlist-intro">
        <h1>Your watchlist</h1>
        <p className="watchlist-note">
          This is your watchlist. Add movies from movie cards or from each movie
          details page, then manage them here.
        </p>
      </section>

      <div className="watchlist-layout">
        <aside className="watchlist-sidebar">
          <button
            className={`sidebar-item ${activeSection === "ratings" ? "active" : ""}`}
            onClick={() => setActiveSection("ratings")}
          >
            Your Ratings
          </button>
          <button
            className={`sidebar-item ${activeSection === "watchlist" ? "active" : ""}`}
            onClick={() => setActiveSection("watchlist")}
          >
            Your Watchlist
          </button>
          <button
            className={`sidebar-item ${activeSection === "recent" ? "active" : ""}`}
            onClick={() => setActiveSection("recent")}
          >
            Recently Viewed
          </button>
        </aside>

        <main className="watchlist-content">
          {activeSection === "watchlist" && (
            <>
              {!isAuthenticated ? (
                <div className="watchlist-auth-cta">
                  <h3>Login or register to use the watchlist</h3>
                  <p>
                    You need an account to save movies, rate them, and manage
                    your personal watchlist.
                  </p>
                  <div className="watchlist-auth-actions">
                    <Link to="/login" className="auth-action-btn">
                      Login
                    </Link>
                    <Link to="/register" className="auth-action-btn secondary">
                      Register
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="watchlist-controls">
                    <label htmlFor="sortBy">Sort by</label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {sortedWatchlist.length === 0 ? (
                    <div className="empty-state">
                      No movies in your watchlist yet.
                    </div>
                  ) : (
                    <div className="watchlist-movie-list">
                      {sortedWatchlist.map((movie) => (
                        <article
                          key={movie.id}
                          className="watchlist-movie-card"
                        >
                          <img src={movie.imageUrl} alt={movie.title} />

                          <div className="movie-card-content">
                            <h3>
                              <Link
                                to={`/movie/${movie.id}`}
                                className="movie-title-link"
                              >
                                {movie.title}
                              </Link>
                            </h3>
                            <p className="movie-description">
                              {movie.description}
                            </p>
                            <div className="movie-meta-row">
                              <span className="movie-meta-item">
                                Main stars:{" "}
                                {(movie.mainStars || []).join(", ") ||
                                  "Unknown"}
                              </span>
                              <span className="movie-meta-item">
                                Creator: {movie.creator || "Unknown"}
                              </span>
                            </div>
                            <div className="movie-meta-row movie-meta-row-faint">
                              <span className="movie-meta-item">
                                Year: {movie.year || "N/A"}
                              </span>
                              <span className="movie-meta-item">
                                Release date: {formatDate(movie.releaseDate)}
                              </span>
                            </div>
                            <p className="movie-meta">
                              Added to watchlist: {formatDate(movie.addedAt)}
                            </p>
                          </div>

                          <div className="movie-card-actions">
                            <button
                              onClick={() => handleLeaveReview(movie)}
                              disabled={!isAuthenticated}
                            >
                              Leave rating/review
                            </button>
                            <button
                              className="secondary"
                              onClick={() => removeFromWatchlist(movie.id)}
                              disabled={!isAuthenticated}
                            >
                              Remove
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeSection === "ratings" && (
            <>
              {ratingsList.length === 0 ? (
                <div className="empty-state">
                  You have not rated any watchlist movies yet.
                </div>
              ) : (
                <div className="simple-list">
                  {ratingsList.map((movie) => (
                    <div key={movie.id} className="simple-list-item">
                      <span>{movie.title}</span>
                      <strong>{movie.yourRating}/10</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "recent" && (
            <>
              {recentlyViewed.length === 0 ? (
                <div className="empty-state">
                  No recently viewed movies yet.
                </div>
              ) : (
                <div className="simple-list">
                  {recentlyViewed.map((movie) => (
                    <div key={movie.id} className="simple-list-item">
                      <Link to={`/movie/${movie.id}`}>{movie.title}</Link>
                      <span>{formatDate(movie.viewedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Watchlist;
