import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import {
  Users as UsersIcon,
  FileText,
  Award,
  Flag,
  CheckCircle,
  Zap,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatServerTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const [a, ac] = await Promise.all([
        adminApi.analytics(),
        adminApi.activity(),
      ]);
      setAnalytics(a.data ?? null);
      setActivity(ac.data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load site analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="py-16">
        <Loader label="Synthesizing system analytics..." />
      </div>
    );

  if (error) {
    return (
      <div className="card-pad border border-rose-200 bg-rose-50/50 text-xs text-rose-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => load()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card-pad text-xs text-slate-500">
        No analytics data available at this time.
      </div>
    );
  }

  const tiles = [
    {
      label: "Registered Users",
      value: analytics.users,
      hint: "Active community profiles",
      to: "/admin/users",
      icon: UsersIcon,
      color: "text-[#1d1d1f] bg-[#f5f5f7] border-[#e8e8ed]",
    },
    {
      label: "Open Items",
      value: analytics.itemsByStatus.OPEN ?? 0,
      hint: "Awaiting claim submissions",
      to: "/admin/posts",
      icon: FileText,
      color: "text-[#1d1d1f] bg-[#f5f5f7] border-[#e8e8ed]",
    },
    {
      label: "Pending Claims",
      value: analytics.pendingClaims,
      hint: "Awaiting ownership decision",
      to: "/admin/claims",
      icon: Award,
      color: "text-[#1d1d1f] bg-[#f5f5f7] border-[#e8e8ed]",
    },
    {
      label: "Open Reports",
      value: analytics.openReports,
      hint: "Needs immediate moderation",
      to: "/admin/reports",
      icon: Flag,
      color: "text-[#1d1d1f] bg-[#f5f5f7] border-[#e8e8ed]",
    },
    {
      label: "Claims Filed Today",
      value: analytics.claimsToday,
      hint: "Activity since midnight",
      icon: Zap,
      color: "text-[#1d1d1f] bg-[#f5f5f7] border-[#e8e8ed]",
    },
    {
      label: "Resolved Items",
      value: analytics.resolvedItems,
      hint: "All-time successfully matched",
      icon: CheckCircle,
      color: "text-[#1d1d1f] bg-[#f5f5f7] border-[#e8e8ed]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#515154]">
          <TrendingUp className="h-4 w-4 text-[#1d1d1f]" />
          <span>
            Real-time moderation metrics. Click any metric to manage that
            section.
          </span>
        </div>
        <button
          type="button"
          className="btn-secondary text-[10px] py-1.5 px-3 flex items-center gap-1 border-[#d2d2d7]"
          disabled={refreshing}
          onClick={() => {
            setRefreshing(true);
            load();
          }}
        >
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          const inner = (
            <div className="card-pad border border-[#e8e8ed] bg-white shadow-none relative group overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.label}
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight text-[#1d1d1f] pt-1">
                    {t.value}
                  </p>
                </div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${t.color}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              {t.hint && (
                <p className="mt-3 text-[10px] font-semibold text-[#515154]">
                  {t.hint}
                </p>
              )}
            </div>
          );
          return t.to ? (
            <Link
              key={t.label}
              to={t.to}
              className="block transition duration-200"
            >
              {inner}
            </Link>
          ) : (
            <div key={t.label}>{inner}</div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reports Widget */}
        <div className="card-pad border border-[#e8e8ed] bg-white shadow-none flex flex-col h-[340px]">
          <header className="flex items-center justify-between border-b border-[#e8e8ed] pb-3 shrink-0">
            <h2 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
              Recent Reports
            </h2>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-[#0066cc] hover:text-[#0044b3]"
            >
              <span>View queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="mt-3 space-y-3 overflow-y-auto flex-1">
            {activity?.recentReports.length ? (
              activity.recentReports.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-3 text-xs border border-[#e8e8ed] bg-[#f5f5f7]/30 p-2.5 rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#1d1d1f] truncate text-xs">
                      {r.item?.title ?? "(Deleted item)"}
                    </p>
                    <p className="truncate text-[10px] text-slate-450 font-semibold mt-0.5">
                      by {r.reporter?.name ?? "Anonymous"} • "{r.reason}"
                    </p>
                  </div>
                  <span
                    className={`badge border text-[8px] px-1.5 py-0.5 shrink-0 ${
                      r.status === "OPEN"
                        ? "bg-[#fff9e6] text-[#b27b00] border-[#ffe0b3]/50"
                        : "badge-neutral"
                    }`}
                  >
                    {r.status.toLowerCase()}
                  </span>
                </li>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Flag className="h-5 w-5 text-slate-300 mb-1" />
                <p className="text-[10px] font-bold">No recent reports</p>
              </div>
            )}
          </ul>
        </div>

        {/* Recent Claims Widget */}
        <div className="card-pad border border-[#e8e8ed] bg-white shadow-none flex flex-col h-[340px]">
          <header className="flex items-center justify-between border-b border-[#e8e8ed] pb-3 shrink-0">
            <h2 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
              Recent Claims
            </h2>
            <Link
              to="/admin/claims"
              className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-[#0066cc] hover:text-[#0044b3]"
            >
              <span>Manage claims</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="mt-3 space-y-3 overflow-y-auto flex-1">
            {activity?.recentClaims.length ? (
              activity.recentClaims.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-3 text-xs border border-[#e8e8ed] bg-[#f5f5f7]/30 p-2.5 rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#1d1d1f] truncate text-xs">
                      {c.item?.title ?? "(Deleted item)"}
                    </p>
                    <p className="truncate text-[10px] text-slate-450 font-semibold mt-0.5">
                      by {c.claimant?.name ?? "Unknown claimant"} •{" "}
                      {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`badge border text-[8px] px-1.5 py-0.5 shrink-0 ${
                      c.status === "APPROVED"
                        ? "bg-[#eafaf1] text-[#1b7a43] border-[#c6f0d7]"
                        : c.status === "REJECTED"
                          ? "bg-[#fff2f4] text-[#d1243b] border-[#ffd1d6]"
                          : "bg-[#fff9e6] text-[#b27b00] border-[#ffe0b3]"
                    }`}
                  >
                    {c.status.toLowerCase()}
                  </span>
                </li>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Award className="h-5 w-5 text-slate-300 mb-1" />
                <p className="text-[10px] font-bold">No recent claims</p>
              </div>
            )}
          </ul>
        </div>

        {/* Security Settings & Banned Users */}
        <div className="card-pad border border-[#e8e8ed] bg-white shadow-none flex flex-col h-[340px]">
          <header className="flex items-center justify-between border-b border-[#e8e8ed] pb-3 shrink-0">
            <h2 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
              Security Snapshot
            </h2>
            <Link
              to="/admin/users?filter=banned"
              className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-[#0066cc] hover:text-[#0044b3]"
            >
              <span>Banned users</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <div className="mt-3 flex-1 overflow-y-auto space-y-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Suspended Accounts
              </p>
              <ul className="space-y-2">
                {activity?.bannedUsers.length ? (
                  activity.bannedUsers.map((u) => (
                    <li
                      key={u.id}
                      className="text-xs bg-[#fff2f4]/30 border border-[#ffd1d6]/50 p-2.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#1d1d1f] truncate text-xs">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {u.email}
                        </p>
                      </div>
                      <span className="badge-bad border text-[8px] px-1.5 py-0.5">
                        Suspended
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-[#515154] italic p-1">
                    No suspended users listed.
                  </li>
                )}
              </ul>
            </div>

            {activity?.serverTime && (
              <div className="border-t border-[#e8e8ed] pt-3 shrink-0 flex items-center gap-2 text-xs text-[#515154] font-semibold bg-[#f5f5f7] p-2.5 rounded-xl">
                <Clock className="h-3.5 w-3.5 text-slate-455" />
                <span className="truncate">
                  Server time: {formatServerTime(activity.serverTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
