import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Search from "./pages/Search";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Watchlist from "./pages/Watchlist";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Navbar is rendered on all pages for consistent navigation */}
        <AuthProvider>
          <WatchlistProvider>
            <Navbar />

            <Routes>
              <Route path="/" element={<Home />} />
              {/* Dynamic route for movie details page, captures movie ID from URL */}
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/search" element={<Search />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </WatchlistProvider>
        </AuthProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
