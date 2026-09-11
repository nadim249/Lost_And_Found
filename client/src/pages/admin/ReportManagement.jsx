import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import {
  Search,
  Check,
  X,
  ExternalLink,
  Flag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
} from "lucide-react";

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.reports();
      setReports(res.data ?? []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter reports by search keyword AND status option
  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports.filter((r) => {
      // Status Filter
      if (statusFilter && r.status !== statusFilter) return false;

      // Keyword Search
      if (!term) return true;
      return (
        (r.reason ?? "").toLowerCase().includes(term) ||
        (r.reporter?.name ?? "").toLowerCase().includes(term) ||
        (r.reporter?.email ?? "").toLowerCase().includes(term) ||
        (r.item?.title ?? "").toLowerCase().includes(term)
      );
    });
  }, [reports, search, statusFilter]);

  // CRUD Decision: RESOLVED or DISMISSED
  const decide = async (id, status) => {
    try {
      setBusyId(id);
      await adminApi.decideReport(id, status);
      toast.success(
        status === "RESOLVED"
          ? "Report resolved successfully!"
          : "Report dismissed",
      );
      loadReports();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update report");
    } finally {
      setBusyId(null);
    }
  };

  const openCount = reports.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="card-pad shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <span>Reports Moderation</span>
              {openCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {openCount} Open
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review flagged items, handle spam or violations, and resolve community reports.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-lg w-full">
            {/* Status Filter Option */}
            <div className="w-full sm:w-44 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input py-2 text-xs font-medium cursor-pointer"
              >
                <option value="">All Reports</option>
                <option value="OPEN">🚨 Open Queue ({openCount})</option>
                <option value="RESOLVED">✓ Resolved</option>
                <option value="DISMISSED">✕ Dismissed</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search reason, item, or reporter..."
                className="input pl-8 py-2 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20">
            <Loader label="Loading reports..." />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-10 w-10 mx-auto mb-2.5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <Flag className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-800">No reports found</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {statusFilter || search
                ? "Try adjusting your search query or status filter."
                : "No items have been reported by users."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Reported Item</th>
                  <th className="px-5 py-3">Reporter</th>
                  <th className="px-5 py-3">Reason / Details</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-50/60 transition-colors">
                    {/* Reported Item */}
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <div className="flex items-center gap-3">
                        {report.item?.images?.[0] ? (
                          <img
                            src={report.item.images[0]}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {report.item ? (
                            <Link
                              to={`/items/${report.item.id}`}
                              target="_blank"
                              className="font-semibold text-zinc-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1 group truncate max-w-[140px]"
                            >
                              <span className="truncate">{report.item.title}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-blue-600 shrink-0" />
                            </Link>
                          ) : (
                            <span className="text-zinc-400 italic">Item deleted</span>
                          )}
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            ID: #{report.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-zinc-900">
                        {report.reporter?.name || "Anonymous"}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                        {report.reporter?.email || "No email"}
                      </p>
                    </td>

                    {/* Reason */}
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-zinc-700 text-xs leading-relaxed line-clamp-2">
                          {report.reason}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {report.status === "RESOLVED" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved
                        </span>
                      ) : report.status === "DISMISSED" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" />
                          Dismissed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" />
                          Open
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {report.status === "OPEN" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => decide(report.id, "RESOLVED")}
                            disabled={busyId === report.id}
                            className="btn-success text-xs py-1 px-2.5"
                            title="Resolve this report"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Resolve Report</span>
                          </button>
                          <button
                            onClick={() => decide(report.id, "DISMISSED")}
                            disabled={busyId === report.id}
                            className="btn-secondary text-xs py-1 px-2 text-zinc-600 hover:text-zinc-900"
                            title="Dismiss report"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Dismiss</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-zinc-400">
                          {report.status === "RESOLVED" ? "✓ Handled" : "✕ Dismissed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
