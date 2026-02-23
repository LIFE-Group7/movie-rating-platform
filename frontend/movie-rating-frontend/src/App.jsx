import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import { ReviewsProvider } from "./contexts/ReviewContext";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import ShowDetails from "./pages/ShowDetails";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import MyReviews from "./pages/MyReviews";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

/**
 * Root application component.
 *
 * Layout architecture:
 *   PublicLayout  → Navbar + Outlet + Footer   (all browsing pages)
 *   AuthLayout    → Outlet only                (Login, Register, ForgotPassword)
 *   AdminRoute    → role guard, no Footer      (/admin)
 *
 * Context nesting order:
 *   AuthProvider     → outermost; all other contexts consume useAuth internally.
 *   AdminProvider    → depends on auth; provides category/section state globally.
 *   WatchlistProvider → wraps ReviewsProvider so sibling pages can access both.
 *   ReviewsProvider  → innermost consumer of auth state.
 */
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AdminProvider>
          <WatchlistProvider>
            <ReviewsProvider>
              <Routes>
                {/* ── Public pages: Navbar + Footer ── */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/show/:id" element={<ShowDetails />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/my-reviews" element={<MyReviews />} />
                </Route>

                {/* ── Auth pages: no Navbar, no Footer ── */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* ── Admin: role-guarded, no Footer ── */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />
              </Routes>
            </ReviewsProvider>
          </WatchlistProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
