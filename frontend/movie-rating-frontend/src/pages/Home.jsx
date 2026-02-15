import MovieCard from "../components/MovieCard";
import { movies } from "../data/mockMovies";
import "./Home.css";

// Main landing page that displays a grid of movie cards
function Home() {
  console.log("Movies:", movies);

  return (
    <div className="home">
      <h2>Rated & Recommended Movies</h2>
      <div className="movie-grid">
        {/*Key prop is required by React to track list items efficiently */}
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default Home;
