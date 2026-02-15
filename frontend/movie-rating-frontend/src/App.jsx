import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <h1>Movie Rating App</h1>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Dynamic route for movie details page, captures movie ID from URL */}
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
