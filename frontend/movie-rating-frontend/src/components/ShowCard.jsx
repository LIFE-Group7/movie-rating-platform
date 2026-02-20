import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useAuth } from "../contexts/AuthContext";
import "./ShowCard.css";

// Presentational component that displays show information in a card format
// Receives a show object as a prop and renders its details with all genres
function ShowCard({ show }) {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { isAuthenticated } = useAuth();

  // Get all genres for the show with backward compatibility
  const showGenres = show.genres || (show.genre ? [show.genre] : []);
  const showInWatchlist = isInWatchlist(show.id);

  const handleCardClick = () => {
    navigate(`/show/${show.id}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  const handleToggleWatchlist = (event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (showInWatchlist) {
      removeFromWatchlist(show.id);
      return;
    }

    addToWatchlist(show);
  };

  return (
    <div
      className="show-card"
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open details for ${show.title}`}
    >
      <div className="show-card-image-wrapper">
        <img src={show.imageUrl} alt={show.title} />
        <span className="show-badge">Series</span>
      </div>
      <div className="show-info">
        <h3>{show.title}</h3>
        <p className="rating">⭐ {show.rating}/10</p>
        <div className="show-meta">
          <span className="show-seasons">
            {show.seasons} {show.seasons === 1 ? "Season" : "Seasons"}
          </span>
          <span
            className={`show-status ${show.status === "Ongoing" ? "status-ongoing" : "status-ended"}`}
          >
            <span className="status-dot" aria-hidden="true"></span>
            {show.status}
          </span>
        </div>
      </div>

      <div className="show-card-bottom-row">
        {showGenres.length > 0 && (
          <div className="genres-list">
            {showGenres.map((genre) => (
              <span key={genre} className="genre-badge">
                {genre}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          className={`watchlist-add-btn${showInWatchlist ? " is-remove" : ""}`}
          onClick={handleToggleWatchlist}
          title={
            showInWatchlist ? "Remove from watchlist" : "Add to watchlist"
          }
          aria-label={
            showInWatchlist
              ? `Remove ${show.title} from watchlist`
              : `Add ${show.title} to watchlist`
          }
        >
          <span className="watchlist-btn-icon" aria-hidden="true">
            {showInWatchlist ? "−" : "+"}
          </span>
          <span className="watchlist-btn-text">
            {showInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ShowCard;
