import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { chatApi } from "../../api/chat.api";
import {
  Bell,
  Plus,
  MessageSquare,
  ShieldAlert,
  LogOut,
} from "lucide-react";

// Main application navigation header component
export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const unread = notifs.filter((n) => !n.isRead).length;

  const loadNotifs = async () => {
    try {
      const res = await chatApi.notifications();
      if (res.data) setNotifs(res.data);
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifs();
    const id = setInterval(loadNotifs, 60_000);
    return () => clearInterval(id);
  }, [user]);

  // Close notifications on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isActive
      ? "text-zinc-900 bg-zinc-100"
      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
    }`;

  const isActivityActive =
    location.pathname.startsWith("/claims") ||
    location.pathname.startsWith("/activity");

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Left Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white transition-opacity group-hover:opacity-90">
              <span className="text-[10px] font-semibold tracking-wider">LF</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              lost &amp; found
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/items" className={navLinkClass}>
              Browse
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/claims/mine"
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isActivityActive
                      ? "text-zinc-900 bg-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                >
                  Activity
                </NavLink>
                <NavLink to="/chat" className={navLinkClass}>
                  Messages
                </NavLink>
                {user.role === "ADMIN" && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Primary Action Button */}
          <Link
            to="/post"
            className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Report Item</span>
          </Link>

          {loading ? (
            <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-100" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={async () => {
                    const willOpen = !notifOpen;
                    setNotifOpen(willOpen);
                    if (willOpen && unread > 0) {
                      await chatApi.markAllRead().catch(() => undefined);
                    }
                    await loadNotifs();
                  }}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors ${notifOpen ? "bg-zinc-100 text-zinc-900" : ""
                    }`}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute right-2 top-2 flex h-1.5 w-1.5">
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600"></span>
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-1.5 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-all z-50">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-3.5 py-2 bg-zinc-50/70">
                      <p className="text-xs font-medium text-zinc-700">Notifications</p>
                      {notifs.length > 0 && (
                        <span className="rounded-md bg-white border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
                          {notifs.length}
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-8 text-center text-xs text-zinc-400">
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-zinc-100">
                          {notifs.slice(0, 10).map((n) => (
                            <li
                              key={n.id}
                              className={`px-3.5 py-2 hover:bg-zinc-50 transition-colors ${!n.isRead ? "bg-zinc-50/60" : ""
                                }`}
                            >
                              <p className="text-xs font-medium text-zinc-900">{n.title}</p>
                              <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-2">
                                {n.message}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Profile Link */}
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`
                }
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                  {(user.name?.[0] ?? "?").toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
              </NavLink>

              {/* Direct Logout Button */}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="btn-ghost p-1.5 text-zinc-400 hover:text-zinc-800"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login" className="btn-ghost px-2.5 py-1.5">
                Log in
              </Link>
              <Link to="/register" className="btn-secondary px-2.5 py-1.5">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
