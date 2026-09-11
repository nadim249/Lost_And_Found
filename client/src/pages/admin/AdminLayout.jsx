import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Flag,
  Award,
  ArrowLeft,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", to: "/admin", icon: LayoutDashboard },
  { key: "posts", label: "Posts", to: "/admin/posts", icon: FileText },
  { key: "users", label: "Users", to: "/admin/users", icon: Users },
  { key: "reports", label: "Reports", to: "/admin/reports", icon: Flag },
  { key: "claims", label: "Claims", to: "/admin/claims", icon: Award },
];

function deriveActiveTab(pathname) {
  if (pathname.startsWith("/admin/posts")) return "posts";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/reports")) return "reports";
  if (pathname.startsWith("/admin/claims")) return "claims";
  return "overview";
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const active = useMemo(
    () => deriveActiveTab(location.pathname),
    [location.pathname],
  );

  // Sync ?tab= deep-link from the URL when no path-based route matched.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (!tab) return;
    const match = TABS.find((t) => t.key === tab);
    if (match && match.to !== location.pathname)
      navigate(match.to, { replace: true });
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Site Moderation
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage listings, users, claims, and reports across the system.
          </p>
        </div>
        <Link
          to="/items"
          className="btn-secondary self-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Admin</span>
        </Link>
      </div>

      <nav
        className="sticky top-[56px] z-10 -mx-4 sm:-mx-6 border-b border-[#e8e8ed] bg-[#f5f5f7]/85 px-4 sm:px-6 py-2 backdrop-blur-md backdrop-blur-header"
        aria-label="Admin sections"
      >
        <ul className="flex gap-1 overflow-x-auto py-0.5">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            const Icon = tab.icon;
            return (
              <li key={tab.key} className="shrink-0">
                <Link
                  to={tab.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-[#1d1d1f] bg-white border border-[#e8e8ed] shadow-[0_1px_2px_rgba(0,0,0,0.015)]"
                      : "text-[#515154] hover:text-[#1d1d1f] hover:bg-white/40"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
