import { useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";

// Root App Layout component
export default function App() {
  const location = useLocation();
  const hideChrome =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 text-zinc-900">
      {!hideChrome && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}

