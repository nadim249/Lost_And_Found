import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { claimsApi } from "../../api/claims.api";
import Loader from "../../components/common/Loader";
import ProtectedImage from "../../components/common/ProtectedImage";
import {
  Check,
  X,
  CheckCircle2,
  ArrowUpRight,
  User,
  Mail,
  Calendar,
  PackageOpen,
} from "lucide-react";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClaimRequests() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await claimsApi.forMyItems();
      setClaims(r.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, status) => {
    try {
      await claimsApi.decide(id, status);
      toast.success(`Claim ${status.toLowerCase()} successfully`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update decision");
    }
  };

  const markResolved = async (itemId) => {
    try {
      await claimsApi.resolveItem(itemId);
      toast.success("Item marked as resolved");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark resolved");
    }
  };

  if (loading)
    return (
      <div className="py-24">
        <Loader label="Loading claim requests..." />
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Claims &amp; Activity
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Review and decide claims submitted on items you reported.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-zinc-200">
        <nav className="flex gap-4">
          <Link
            to="/claims/mine"
            className="pb-2.5 text-xs font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            My Claims
          </Link>
          <Link
            to="/claims/incoming"
            className="pb-2.5 text-xs font-medium border-b-2 border-zinc-900 text-zinc-900"
          >
            Incoming Requests
            <span className="ml-1.5 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 font-medium">
              {claims.length}
            </span>
          </Link>
        </nav>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {claims.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white py-16 px-4 flex flex-col items-center justify-center text-center shadow-xs">
            <PackageOpen className="h-8 w-8 text-zinc-300 stroke-[1.5] mb-2.5" />
            <h3 className="text-sm font-medium text-zinc-900">No incoming requests</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
              When other community members submit proof of ownership for items you've posted, they will appear here.
            </p>
          </div>
        ) : (
          claims.map((c) => {
            const status = c.status;
            return (
              <div
                key={c.id}
                className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-zinc-200 bg-white shadow-xs transition-colors hover:border-zinc-300"
              >
                {/* Thumbnail */}
                <Link
                  to={`/items/${c.itemId}`}
                  className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100 border border-zinc-200 relative group"
                >
                  <ProtectedImage
                    src={c.item?.images?.[0]}
                    alt={c.item?.title ?? ""}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-zinc-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <Link
                      to={`/items/${c.itemId}`}
                      className="text-xs font-medium text-zinc-900 hover:text-zinc-600 transition-colors inline-block truncate"
                    >
                      {c.item?.title ?? "Item"}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1 text-zinc-600">
                        <User className="h-3 w-3 text-zinc-400" />
                        <span>{c.claimant?.name}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Mail className="h-3 w-3 text-zinc-400" />
                        <span>{c.claimant?.email}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(c.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed rounded-md bg-zinc-50 border border-zinc-100 p-2.5 whitespace-pre-wrap">
                    <strong className="text-zinc-700 font-medium block text-[11px] mb-0.5">
                      Proof Description
                    </strong>
                    {c.proofDescription}
                  </p>

                  {c.proofImages && c.proofImages.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-zinc-400">
                        Proof Attachments
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.proofImages.map((src, i) => (
                          <a
                            key={i}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-zinc-100 border border-zinc-200 hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={src}
                              alt={`proof attachment ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="shrink-0 flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-2.5 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border leading-none ${status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                        : status === "PENDING"
                          ? "bg-amber-50 text-amber-800 border-amber-200/80"
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      }`}
                  >
                    {status.toLowerCase()}
                  </span>

                  {status === "PENDING" && (
                    <div className="flex gap-1.5">
                      <button
                        className="btn-success text-xs py-1 px-2.5 rounded-md flex items-center gap-1"
                        onClick={() => decide(c.id, "APPROVED")}
                      >
                        <Check className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        className="btn-secondary text-xs py-1 px-2.5 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1"
                        onClick={() => decide(c.id, "REJECTED")}
                      >
                        <X className="h-3 w-3" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {status === "APPROVED" &&
                    c.item?.status === "PENDING_CLAIM" && (
                      <button
                        className="btn-primary text-xs py-1 px-2.5 rounded-md flex items-center gap-1"
                        onClick={() => markResolved(c.itemId)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
