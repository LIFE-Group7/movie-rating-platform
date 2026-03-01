import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import { ReviewsProvider } from "./contexts/ReviewContext";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AdminProvider>
          <WatchlistProvider>
            <ReviewsProvider>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/show/:id" element={<ShowDetails />} />
                  <Route path="/search" element={<Search />} />
                  <Route
                    path="/watchlist"
                    element={
                      <PrivateRoute>
                        <Watchlist />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/my-reviews"
                    element={
                      <PrivateRoute>
                        <MyReviews />
                      </PrivateRoute>
                    }
                  />
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                <Route
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </ReviewsProvider>
          </WatchlistProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
