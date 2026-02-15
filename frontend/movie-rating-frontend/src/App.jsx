import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Search from "./pages/Search";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <h1>Movie Rating App</h1>
        </header>
        {/* Navbar is rendered on all pages for consistent navigation */}
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          {/* Dynamic route for movie details page, captures movie ID from URL */}
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
