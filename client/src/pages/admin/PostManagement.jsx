import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import { Search, Trash2, ExternalLink } from "lucide-react";

export default function PostManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const limit = 15;

  // Load items with search query, status option, and pagination
  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await adminApi.items({
        page,
        limit,
        q: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [page, statusFilter]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadItems();
  };

  // CRUD: Delete Item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      setDeletingId(id);
      await adminApi.deleteItem(id);
      toast.success("Listing deleted successfully");
      loadItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* Search & Status Header */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Manage Posts</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {total} total items ({statusFilter === "RESOLVED" ? "Claimed" : statusFilter === "OPEN" ? "Open" : "All"})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl w-full">
            {/* Status Option (All / Open / Claimed) */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-900 cursor-pointer"
            >
              <option value="">All Posts</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Claimed (Resolved)</option>
              <option value="PENDING_CLAIM">Pending Claim</option>
            </select>

            {/* Search Input */}
            <form onSubmit={onSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search title or location..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CRUD Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Loader label="Loading items..." />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500">
            No items found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase font-bold text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-zinc-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400">
                            No Img
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-zinc-900 line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            By {item.user?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === "LOST"
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "PENDING_CLAIM"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        {item.status === "RESOLVED"
                          ? "Claimed"
                          : item.status === "PENDING_CLAIM"
                          ? "Pending Claim"
                          : "Open"}
                      </span>
                    </td>

                    <td className="px-5 py-3 font-medium text-zinc-600">
                      {item.category || "General"}
                    </td>

                    <td className="px-5 py-3 text-zinc-500">
                      {item.location || "Not specified"}
                    </td>

                    <td className="px-5 py-3 text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/items/${item.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                          title="View listing"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete listing"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 bg-zinc-50/50">
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
