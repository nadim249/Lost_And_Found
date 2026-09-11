import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import { Search, Ban, UserCheck } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.users();
      setUsers(res.data ?? []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone ?? "").toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term),
    );
  }, [users, search]);

  // CRUD Action: Toggle User Ban
  const toggleBan = async (user) => {
    const action = user.isBanned ? "unban" : "ban";
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

    try {
      setBusyId(user.id);
      await adminApi.setBan(user.id, !user.isBanned);
      toast.success(`User ${user.isBanned ? "unbanned" : "banned"} successfully`);
      await loadUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update ban status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Manage Users</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {users.length} total registered accounts
            </p>
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users CRUD Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Loader label="Loading users..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500">
            No users found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase font-bold text-zinc-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/50">
                    <td className="px-5 py-3 font-semibold text-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-700">
                          {u.name[0]?.toUpperCase() || "U"}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-zinc-600">{u.email}</td>

                    <td className="px-5 py-3 text-zinc-500">{u.phone || "—"}</td>

                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isBanned
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {u.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-zinc-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3 text-right">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => toggleBan(u)}
                          disabled={busyId === u.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            u.isBanned
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                          }`}
                        >
                          {u.isBanned ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Ban
                            </>
                          )}
                        </button>
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
