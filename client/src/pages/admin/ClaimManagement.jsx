import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";
import { claimsApi } from "../../api/claims.api";
import Loader from "../../components/common/Loader";
import {
  Search,
  Check,
  X,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Clock,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function ClaimManagement() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const limit = 12;

  const loadClaims = async () => {
    try {
      setLoading(true);
      const res = await adminApi.claims({
        page,
        limit,
        q: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setClaims(res.data?.claims ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [page, statusFilter]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadClaims();
  };

  // CRUD: Decide Claim (Approve & Mark Claimed / Reject)
  const handleDecision = async (id, decision) => {
    try {
      setBusyId(id);
      await claimsApi.decide(id, decision);
      toast.success(
        decision === "APPROVED"
          ? "Claim approved & item marked as Claimed!"
          : "Claim rejected",
      );
      loadClaims();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update claim");
    } finally {
      setBusyId(null);
    }
  };

  // CRUD: Delete Claim
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this claim record?")) return;

    try {
      setBusyId(id);
      await adminApi.deleteClaim(id);
      toast.success("Claim record removed");
      loadClaims();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete claim");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="card-pad shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <span>Claims Moderation</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                {total}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review ownership claims, verify proof descriptions, and resolve items.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-lg w-full">
            {/* Status Filter Option */}
            <div className="w-full sm:w-44 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input py-2 text-xs font-medium cursor-pointer"
              >
                <option value="">All Claims</option>
                <option value="APPROVED">✓ Claimed (Approved)</option>
                <option value="PENDING">⏳ Pending Review</option>
                <option value="REJECTED">✕ Rejected</option>
              </select>
            </div>

            {/* Search Input */}
            <form onSubmit={onSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search claimant or proof..."
                  className="input pl-8 py-2 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary py-2 px-3.5 shrink-0">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20">
            <Loader label="Loading claims..." />
          </div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-10 w-10 mx-auto mb-2.5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-800">No claims found</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {statusFilter || search
                ? "Try adjusting your search or filter."
                : "No users have submitted ownership claims yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Claimant</th>
                  <th className="px-5 py-3">Proof & Evidence</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-zinc-50/60 transition-colors">
                    {/* Item */}
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <div className="flex items-center gap-3">
                        {claim.item?.images?.[0] ? (
                          <img
                            src={claim.item.images[0]}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {claim.item ? (
                            <Link
                              to={`/items/${claim.item.id}`}
                              target="_blank"
                              className="font-semibold text-zinc-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1 group truncate max-w-[140px]"
                            >
                              <span className="truncate">{claim.item.title}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-blue-600 shrink-0" />
                            </Link>
                          ) : (
                            <span className="text-zinc-400 italic">Deleted Item</span>
                          )}
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            ID: #{claim.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Claimant */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-zinc-900">
                        {claim.claimant?.name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                        {claim.claimant?.email}
                      </p>
                    </td>

                    {/* Proof */}
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="text-zinc-700 line-clamp-2 text-xs leading-relaxed">
                        {claim.proofDescription || "No description provided"}
                      </p>
                      {claim.proofImages && claim.proofImages.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {claim.proofImages.slice(0, 3).map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setPreviewImage(img)}
                              className="h-7 w-7 rounded-md border border-zinc-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                              title="Click to zoom proof image"
                            >
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                          {claim.proofImages.length > 3 && (
                            <span className="text-[10px] text-zinc-400 font-medium">
                              +{claim.proofImages.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {claim.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                          <Check className="h-3 w-3" />
                          Claimed
                        </span>
                      ) : claim.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">
                      {new Date(claim.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {claim.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleDecision(claim.id, "APPROVED")}
                              disabled={busyId === claim.id}
                              className="btn-success text-xs py-1 px-2.5"
                              title="Approve claim and mark item as Claimed"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Mark Claimed</span>
                            </button>
                            <button
                              onClick={() => handleDecision(claim.id, "REJECTED")}
                              disabled={busyId === claim.id}
                              className="btn-secondary text-xs py-1 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-zinc-200"
                              title="Reject claim"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(claim.id)}
                          disabled={busyId === claim.id}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete claim record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 bg-zinc-50/50">
            <span className="text-xs text-zinc-500">
              Showing page <span className="font-semibold text-zinc-900">{page}</span> of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary py-1 px-3 text-xs"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary py-1 px-3 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Proof Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl p-2 shadow-2xl">
            <img
              src={previewImage}
              alt="Proof Evidence"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-1.5 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
