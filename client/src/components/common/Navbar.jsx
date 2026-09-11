import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { chatApi } from "../../api/chat.api";
import { Bell, Plus, LogOut, Menu, X } from "lucide-react";

// Main application navigation header component
export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);
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

  // Close popovers on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest("#mobile-menu-btn")
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setNotifOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      isActive
        ? "text-zinc-900 bg-zinc-100"
        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
    }`;

  const isActivityActive =
    location.pathname.startsWith("/claims") ||
    location.pathname.startsWith("/activity");

  const links = [
    { to: "/items", label: "Browse" },
    ...(user
      ? [
          { to: "/claims/mine", label: "Activity", active: isActivityActive },
          { to: "/chat", label: "Messages" },
          ...(user.role === "ADMIN" ? [{ to: "/admin", label: "Admin" }] : []),
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-3 sm:px-6">
        {/* Brand & Left Nav */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white transition-opacity group-hover:opacity-90">
              <span className="text-[10px] font-semibold tracking-wider">LF</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              lost &amp; found
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  navLinkClass({ isActive: l.active ?? isActive })
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            to="/post"
            className="btn-primary inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Report Item</span>
            <span className="xs:hidden sm:hidden">Report</span>
          </Link>

          {loading ? (
            <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-100" />
          ) : user ? (
            <div className="flex items-center gap-1 sm:gap-2">
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
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors ${
                    notifOpen ? "bg-zinc-100 text-zinc-900" : ""
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
                  <div className="absolute right-0 mt-1.5 w-[calc(100vw-2rem)] max-w-xs sm:w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg transition-all z-50">
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
                              className={`px-3.5 py-2 hover:bg-zinc-50 transition-colors ${
                                !n.isRead ? "bg-zinc-50/60" : ""
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

              {/* Direct Profile Link (Desktop) */}
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hidden sm:flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`
                }
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                  {(user.name?.[0] ?? "?").toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </NavLink>

              {/* Direct Logout Button (Desktop) */}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="hidden sm:inline-flex btn-ghost p-1.5 text-zinc-400 hover:text-zinc-800"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link to="/login" className="btn-ghost px-2.5 py-1.5">
                Log in
              </Link>
              <Link to="/register" className="btn-secondary px-2.5 py-1.5">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            id="mobile-menu-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Concise Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="border-b border-zinc-200 bg-white px-4 py-3 sm:hidden shadow-lg space-y-2.5 animate-in slide-in-from-top-2 duration-150"
        >
          <nav className="flex flex-col gap-0.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    (l.active ?? isActive)
                      ? "text-zinc-900 bg-zinc-100 font-semibold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
              <NavLink
                to="/profile"
                className="flex items-center gap-2 text-xs font-medium text-zinc-900"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white font-medium">
                  {(user.name?.[0] ?? "?").toUpperCase()}
                </div>
                <span>{user.name}</span>
              </NavLink>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-zinc-100 flex gap-2">
              <Link
                to="/login"
                className="btn-secondary flex-1 py-1.5 text-center text-xs"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn-primary flex-1 py-1.5 text-center text-xs"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
