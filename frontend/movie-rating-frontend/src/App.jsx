import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import { ReviewsProvider } from "./contexts/ReviewContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import ShowDetails from "./pages/ShowDetails";
import Search from "./pages/Search";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Watchlist from "./pages/Watchlist";
import MyReviews from "./pages/MyReviews";
import "./App.css";

/**
 * Root application component.
 *
 * Context nesting order matters:
 *   AuthProvider  → must be outermost because WatchlistProvider and
 *                   ReviewsProvider both consume useAuth internally.
 *   WatchlistProvider → wraps ReviewsProvider so sibling pages can use both.
 *   ReviewsProvider → innermost consumer of auth state.
 *
 * NOTE: PrivateRoute exists in components/ but is not currently wired here.
 * TODO: Wrap /watchlist and /my-reviews with <PrivateRoute> to centralise auth
 *       guards instead of repeating inline redirect logic in each page component.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f5f5f5]">
        <AuthProvider>
          <WatchlistProvider>
            <ReviewsProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/show/:id" element={<ShowDetails />} />
                <Route path="/search" element={<Search />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/my-reviews" element={<MyReviews />} />
              </Routes>
            </ReviewsProvider>
          </WatchlistProvider>
        </AuthProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
