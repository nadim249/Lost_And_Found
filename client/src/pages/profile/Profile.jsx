import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { profileApi } from "../../api/profile.api";
import { itemsApi } from "../../api/items.api";
import { claimsApi } from "../../api/claims.api";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/common/Modal";
import ProtectedImage from "../../components/common/ProtectedImage";
import Loader from "../../components/common/Loader";
import {
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  PackageOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  MoreHorizontal,
  Plus,
} from "lucide-react";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("listings");

  // Settings Form States
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingSettings, setSavingSettings] = useState(false);

  // Listings States
  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Edit Listing Modal States
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState("LOST");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  // Load User's Listings on mount
  useEffect(() => {
    loadMyItems();
  }, []);

  // Close overflow menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initial = (user.name?.[0] ?? user.email[0] ?? "?").toUpperCase();

  // Load User's Listings
  const loadMyItems = async () => {
    try {
      setLoadingItems(true);
      const r = await itemsApi.list({ mine: true });
      setMyItems(r.data ?? []);
    } catch {
      toast.error("Failed to load your listings");
    } finally {
      setLoadingItems(false);
    }
  };

  // Update Settings Form
  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const updated = await profileApi.update({ name, phone });
      setUser(updated);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setSavingSettings(false);
    }
  };

  // Delete Listing
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await itemsApi.remove(confirmDeleteId);
      toast.success("Listing removed successfully");
      setConfirmDeleteId(null);
      await loadMyItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete listing");
    }
  };

  // Mark Listing Resolved
  const handleResolve = async (itemId) => {
    try {
      await claimsApi.resolveItem(itemId);
      toast.success("Listing marked as resolved");
      await loadMyItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resolve listing");
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditCategory(item.category);
    setEditLocation(item.location);
    setEditType(item.type);
    setActiveMenuId(null);
  };

  // Submit Listing Edit
  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setSavingEdit(true);
      const fd = new FormData();
      fd.append("title", editTitle);
      fd.append("description", editDesc);
      fd.append("category", editCategory);
      fd.append("location", editLocation);
      fd.append("type", editType);
      await itemsApi.update(editingItem.id, fd);
      toast.success("Listing updated successfully");
      setEditingItem(null);
      await loadMyItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update listing");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Account &amp; Listings
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your personal profile and registered lost &amp; found items.
          </p>
        </div>

        <Link
          to="/post"
          className="btn-primary inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Listing</span>
        </Link>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="mb-6 border-b border-zinc-200">
        <nav className="flex gap-4">
          <button
            type="button"
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              tab === "listings"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
            onClick={() => setTab("listings")}
          >
            My Listings
            <span className="ml-1.5 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 font-medium">
              {myItems.length}
            </span>
          </button>

          <button
            type="button"
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              tab === "settings"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
            onClick={() => setTab("settings")}
          >
            Profile Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {tab === "listings" ? (
        <div>
          {loadingItems ? (
            <div className="py-24">
              <Loader label="Loading your listings..." />
            </div>
          ) : myItems.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white py-16 px-4 flex flex-col items-center justify-center text-center shadow-xs">
              <PackageOpen className="h-8 w-8 text-zinc-300 stroke-[1.5] mb-2.5" />
              <h3 className="text-sm font-medium text-zinc-900">No listings posted yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                You haven't reported any lost or found items under this account.
              </p>
              <Link to="/post" className="btn-primary mt-4 py-1.5 px-3">
                Report an Item
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs">
              {/* Desktop Table View */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-500 font-medium">
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {myItems.map((it) => {
                      const isResolved = it.status === "RESOLVED";
                      const isFound = it.type === "FOUND";

                      return (
                        <tr
                          key={it.id}
                          className="hover:bg-zinc-50/50 transition-colors"
                        >
                          {/* Item Column: Thumbnail & Title */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                                <ProtectedImage
                                  src={it.images?.[0]}
                                  alt={it.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/items/${it.id}`}
                                  className="font-medium text-xs text-zinc-900 hover:text-zinc-600 block truncate max-w-[200px] sm:max-w-xs"
                                >
                                  {it.title}
                                </Link>
                                <span className="text-[11px] text-zinc-400 block truncate">
                                  {it.location || "No location"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
                            {it.category || "—"}
                          </td>

                          {/* Type Column */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border leading-none ${
                                isFound
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                                  : "bg-amber-50 text-amber-800 border-amber-200/80"
                              }`}
                            >
                              {isFound ? "Found" : "Lost"}
                            </span>
                          </td>

                          {/* Status Column */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border leading-none ${
                                isResolved
                                  ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                                  : it.status === "PENDING_CLAIM"
                                  ? "bg-amber-50 text-amber-700 border-amber-200/60"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              }`}
                            >
                              {it.status.replace("_", " ").toLowerCase()}
                            </span>
                          </td>

                          {/* Date Column */}
                          <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                            {formatDate(it.createdAt)}
                          </td>

                          {/* Actions Column: Mark Resolved & Overflow Menu */}
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {!isResolved && (
                                <button
                                  type="button"
                                  onClick={() => handleResolve(it.id)}
                                  className="btn-outline px-2 py-1 text-[11px]"
                                  title="Mark item as returned/resolved"
                                >
                                  Mark Resolved
                                </button>
                              )}

                              {/* Overflow Action Menu */}
                              <div
                                className="relative"
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveMenuId(
                                      activeMenuId === it.id ? null : it.id
                                    )
                                  }
                                  className={`flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors ${
                                    activeMenuId === it.id
                                      ? "bg-zinc-100 text-zinc-800"
                                      : ""
                                  }`}
                                  aria-label="Actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>

                                {activeMenuId === it.id && (
                                  <div className="absolute right-0 mt-1 w-32 overflow-hidden rounded-md border border-zinc-200 bg-white p-1 shadow-sm z-30 text-left">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(it)}
                                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="h-3 w-3 text-zinc-400" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmDeleteId(it.id);
                                        setActiveMenuId(null);
                                      }}
                                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Settings Tab */
        <div className="max-w-xl">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-xs space-y-6">
            <div className="flex items-center gap-3.5 pb-5 border-b border-zinc-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-semibold text-sm text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-zinc-900 leading-tight">
                  {user.name}
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Verified Account {user.role === "ADMIN" ? "· Administrator" : ""}
                  </span>
                </p>
              </div>
            </div>

            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <input
                    className="input pl-8"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <input
                    className="input pl-8 cursor-not-allowed bg-zinc-50 text-zinc-500"
                    value={user.email}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <input
                    className="input pl-8"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-zinc-100">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingSettings}
                >
                  {savingSettings ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete listing"
        size="sm"
      >
        <p className="text-xs text-zinc-600 leading-relaxed">
          Are you sure you want to permanently remove this listing? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirmDeleteId(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
          >
            Delete Listing
          </button>
        </div>
      </Modal>

      {/* Edit Listing Modal */}
      {editingItem && (
        <Modal
          open={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title="Edit Listing Details"
          size="md"
        >
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <input
                  className="input"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Listing Type</label>
                <select
                  className="input"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="LOST">Lost</option>
                  <option value="FOUND">Found</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Location</label>
              <input
                className="input"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g. Terminal 2, Central Library"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={savingEdit}
              >
                {savingEdit ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
