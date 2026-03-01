import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
