import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { claimsApi } from "../../api/claims.api";
import Loader from "../../components/common/Loader";
import ProtectedImage from "../../components/common/ProtectedImage";
import { ArrowUpRight, Inbox, Calendar, PackageOpen } from "lucide-react";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    claimsApi
      .mine()
      .then((r) => setClaims(r.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="py-24">
        <Loader label="Loading claims history..." />
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
            Track verification status of items you have claimed.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-zinc-200">
        <nav className="flex gap-4">
          <Link
            to="/claims/mine"
            className="pb-2.5 text-xs font-medium border-b-2 border-zinc-900 text-zinc-900"
          >
            My Claims
            <span className="ml-1.5 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 font-medium">
              {claims.length}
            </span>
          </Link>
          <Link
            to="/claims/incoming"
            className="pb-2.5 text-xs font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Incoming Requests
          </Link>
        </nav>
      </div>

      {/* List Content */}
      <div className="space-y-3">
        {claims.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white py-16 px-4 flex flex-col items-center justify-center text-center shadow-xs">
            <PackageOpen className="h-8 w-8 text-zinc-300 stroke-[1.5] mb-2.5" />
            <h3 className="text-sm font-medium text-zinc-900">No claims submitted</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
              When you submit proof of ownership on a lost or found item, its status will be tracked here.
            </p>
            <Link to="/items" className="btn-primary mt-4 py-1.5 px-3">
              Browse Listings
            </Link>
          </div>
        ) : (
          claims.map((c) => {
            const status = c.status;
            return (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-zinc-200 bg-white shadow-xs transition-colors hover:border-zinc-300"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100 border border-zinc-200">
                  <ProtectedImage
                    src={c.item?.images?.[0]}
                    alt={c.item?.title ?? ""}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/items/${c.itemId}`}
                      className="group inline-flex items-center gap-1 text-xs font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
                    >
                      <span>{c.item?.title ?? "Listing"}</span>
                      <ArrowUpRight className="h-3 w-3 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>

                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>Claimed on {formatDate(c.createdAt)}</span>
                  </p>

                  <p className="text-xs text-zinc-600 leading-relaxed rounded-md bg-zinc-50 border border-zinc-100 p-2.5 mt-1.5 line-clamp-2">
                    <strong className="text-zinc-700 font-medium">Proof provided:</strong>{" "}
                    {c.proofDescription}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100">
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
