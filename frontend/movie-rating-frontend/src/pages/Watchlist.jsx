import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import MovieCard from "../components/MovieCard";
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
  const { watchlist, recentlyViewed, userRatings, removeFromWatchlist } =
    useWatchlist();

  const [sortBy, setSortBy] = useState("addedAt");
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
  const [activeSection, setActiveSection] = useState("watchlist");
  const [viewMode, setViewMode] = useState("list"); // "cards" or "list"

  const sortedWatchlist = useMemo(() => {
    const list = [...watchlist];
    const multiplier = sortDirection === "asc" ? 1 : -1;

    list.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "year") {
        comparison = (b.year || 0) - (a.year || 0);
      } else if (sortBy === "rating") {
        comparison = (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === "yourRating") {
        comparison = (userRatings[b.id] || 0) - (userRatings[a.id] || 0);
      } else if (sortBy === "releaseDate") {
        comparison = new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      } else {
        comparison = new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
      }

      return comparison * multiplier;
    });

    return list;
  }, [watchlist, sortBy, sortDirection, userRatings]);

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

                    <button
                      className="sort-direction-btn"
                      onClick={() =>
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                      }
                      title={
                        sortDirection === "asc"
                          ? "Sort in ascending order"
                          : "Sort in descending order"
                      }
                      aria-label="Toggle sort direction"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="currentColor"
                      >
                        {sortDirection === "asc" ? (
                          <g>
                            <polyline points="6 9 12 3 18 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="21" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </g>
                        ) : (
                          <g>
                            <polyline points="6 15 12 21 18 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </g>
                        )}
                      </svg>
                    </button>

                    <div className="view-toggle">
                      <button
                        className={`view-btn ${viewMode === "cards" ? "active" : ""}`}
                        onClick={() => setViewMode("cards")}
                        title="Card view"
                        aria-label="Switch to card view"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <circle cx="5" cy="5" r="1.5"/>
                          <circle cx="12" cy="5" r="1.5"/>
                          <circle cx="19" cy="5" r="1.5"/>
                          <circle cx="5" cy="12" r="1.5"/>
                          <circle cx="12" cy="12" r="1.5"/>
                          <circle cx="19" cy="12" r="1.5"/>
                          <circle cx="5" cy="19" r="1.5"/>
                          <circle cx="12" cy="19" r="1.5"/>
                          <circle cx="19" cy="19" r="1.5"/>
                        </svg>
                      </button>
                      <button
                        className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title="List view"
                        aria-label="Switch to list view"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="watchlist-primary-area">
                    {sortedWatchlist.length === 0 ? (
                      <div className="empty-state">
                        No movies in your watchlist yet.
                      </div>
                    ) : viewMode === "cards" ? (
                      <div className="movie-grid">
                        {sortedWatchlist.map((movie) => (
                          <MovieCard key={movie.id} movie={movie} />
                        ))}
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
                  </div>

                  <section className="recently-viewed-bottom-section">
                    <div className="recently-viewed-bottom-header">
                      <h3>Recently viewed</h3>
                    </div>

                    {recentlyViewed.length === 0 ? (
                      <div className="empty-state">
                        No recently viewed movies yet.
                      </div>
                    ) : (
                      <div className="movie-grid recently-viewed-card-grid">
                        {recentlyViewed.map((movie) => (
                          <MovieCard key={movie.id} movie={movie} />
                        ))}
                      </div>
                    )}
                  </section>
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
                <div className="movie-grid recently-viewed-card-grid">
                  {recentlyViewed.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
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
