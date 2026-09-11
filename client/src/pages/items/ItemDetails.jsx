import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { itemsApi } from "../../api/items.api";
import { reportsApi } from "../../api/reports.api";
import { chatApi } from "../../api/chat.api";
import { useAuth } from "../../context/AuthContext";
import ProtectedImage from "../../components/common/ProtectedImage";
import ClaimModal from "../../components/items/ClaimModal";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import {
  MapPin,
  Tag,
  MessageSquare,
  Flag,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  User,
  X,
} from "lucide-react";

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [claimOpen, setClaimOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await itemsApi.get(id);
        if (!cancelled && res.data) {
          const itemData = res.data;
          setItem(itemData);
          if (itemData.images?.[0]) {
            setActiveImage(itemData.images[0]);
          }
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load listing");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await reportsApi.create({ itemId: item.id, reason: reportReason.trim() });
      toast.success("Report submitted successfully");
      setReportOpen(false);
      setReportReason("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit report");
    }
  };

  const startChat = async () => {
    if (!item?.user) return;
    try {
      const res = await chatApi.start(item.user.id);
      navigate(`/chat${res.data?.id ? `?c=${res.data.id}` : ""}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not open conversation");
    }
  };

  if (loading)
    return (
      <div className="py-24">
        <Loader label="Loading listing details..." />
      </div>
    );

  if (!item)
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-zinc-900">Listing not found</h3>
        <p className="mt-1 text-xs text-zinc-500">
          The item you are looking for does not exist or has been removed.
        </p>
        <Link to="/items" className="btn-secondary mt-4">
          Return to Browse
        </Link>
      </div>
    );

  const isOwner = user?.id === item.user?.id;
  const isFound = item.type === "FOUND";
  const isResolved = item.status === "RESOLVED";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link
        to="/items"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to listings</span>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-2 space-y-3">
          <div className="rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-xs">
            <div
              className="aspect-video w-full bg-zinc-100 relative cursor-zoom-in group overflow-hidden"
              onClick={() => setLightboxOpen(true)}
              title="Click to zoom image"
            >
              <ProtectedImage
                src={activeImage || item.images?.[0]}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Status Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border leading-none shadow-2xs backdrop-blur-xs ${isFound
                    ? "bg-emerald-50/95 text-emerald-800 border-emerald-200/80"
                    : "bg-amber-50/95 text-amber-800 border-amber-200/80"
                    }`}
                >
                  {isFound ? "Found Item" : "Lost Item"}
                </span>

                {isResolved && (
                  <span className="inline-flex items-center rounded-md bg-zinc-100/95 text-zinc-700 border border-zinc-200/80 px-2 py-0.5 text-xs font-medium leading-none">
                    Resolved
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-zinc-100 bg-zinc-50/40">
                {item.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(src)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-zinc-100 transition-all ${activeImage === src
                      ? "border-zinc-900 ring-1 ring-zinc-900"
                      : "border-zinc-200 hover:opacity-80"
                      }`}
                  >
                    <ProtectedImage
                      src={src}
                      alt={`thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Specifications & Actions */}
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-xs space-y-5">
            <div>
              <h1 className="text-base font-semibold text-zinc-900 leading-snug">
                {item.title}
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            <div className="border-t border-zinc-100 pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 text-zinc-500 border border-zinc-200">
                  <Tag className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400">Category</p>
                  <p className="font-medium text-zinc-800">{item.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 text-zinc-500 border border-zinc-200">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400">Location</p>
                  <p className="font-medium text-zinc-800">{item.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 text-zinc-500 border border-zinc-200">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400">Posted on</p>
                  <p className="font-medium text-zinc-800">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Reporter Card */}
            <div className="border-t border-zinc-100 pt-4">
              <p className="text-[11px] text-zinc-400 mb-2">Reported by</p>
              <div className="flex items-center gap-2.5 rounded-md border border-zinc-100 bg-zinc-50/50 p-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-medium shrink-0">
                  {(item.user?.name?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-900 truncate">
                    {item.user?.name ?? "Community Member"}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {item.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {user && (
              <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
                {!isOwner && item.status === "OPEN" && (
                  <button
                    type="button"
                    className="btn-primary w-full py-2"
                    onClick={() => setClaimOpen(true)}
                  >
                    Claim Ownership
                  </button>
                )}
                {!isOwner && (
                  <button
                    type="button"
                    className="btn-secondary w-full py-2"
                    onClick={startChat}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Message Reporter</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-ghost w-full justify-center text-xs text-zinc-400 hover:text-red-600 hover:bg-red-50 py-1.5"
                  onClick={() => setReportOpen(true)}
                >
                  <Flag className="h-3 w-3" />
                  <span>Report this listing</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-3 sm:p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImage || item.images?.[0]}
              alt={item.title}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-zinc-900/90 text-white flex items-center justify-center hover:bg-zinc-800 shadow-md cursor-pointer"
              aria-label="Close image preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimOpen && (
        <ClaimModal
          open={claimOpen}
          item={item}
          onClose={() => setClaimOpen(false)}
        />
      )}

      {/* Report Modal */}
      {reportOpen && (
        <Modal
          open={reportOpen}
          title="Report Inappropriate Listing"
          onClose={() => setReportOpen(false)}
          size="sm"
        >
          <form onSubmit={submitReport} className="space-y-4">
            <div>
              <label className="label">Reason for reporting</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Explain why this listing violates terms or seems fraudulent..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setReportOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-danger">
                Submit Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
