import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Shared wrapper for all public-facing pages.
 * Renders: Navbar → page content (via Outlet) → Footer.
 *
 * Auth pages (Login, Register, ForgotPassword) and Admin routes
 * use their own layouts and never render this wrapper.
 */
function PublicLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
