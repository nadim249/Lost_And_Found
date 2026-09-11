import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { itemsApi } from "../../api/items.api";
import ItemCard from "../../components/items/ItemCard";
import ItemFilter from "../../components/items/ItemFilter";
import Loader from "../../components/common/Loader";
import { ArrowLeft, ArrowRight, PackageOpen } from "lucide-react";

export default function ItemsList() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });
  const filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      type: params.get("type") ?? "",
      category: params.get("category") ?? "",
      location: params.get("location") ?? "",
    }),
    [params],
  );

  const page = Number(params.get("page") ?? 1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const query = { page };
        if (filters.q) query.q = filters.q;
        if (filters.type) query.type = filters.type;
        if (filters.category) query.category = filters.category;
        if (filters.location) query.location = filters.location;
        const res = await itemsApi.list(query);
        if (!cancelled && res.data) {
          setItems(res.data);
          if (res.meta) setMeta(res.meta);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const onChange = (next) => {
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.type) sp.set("type", next.type);
    if (next.category) sp.set("category", next.category);
    if (next.location) sp.set("location", next.location);
    sp.set("page", "1");
    setParams(sp);
  };

  const onReset = () => setParams(new URLSearchParams());

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Page Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Browse Listings
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Discover and reconnect with lost and found items.
          </p>
        </div>
        <div className="text-xs text-zinc-400">
          {meta.total} {meta.total === 1 ? "item" : "items"} registered
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-5">
        <ItemFilter values={filters} onChange={onChange} onReset={onReset} />
      </div>

      {/* Feed Grid */}
      {loading ? (
        <div className="py-24">
          <Loader label="Loading listings..." />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white py-16 px-4 flex flex-col items-center justify-center text-center shadow-xs">
          <PackageOpen className="h-8 w-8 text-zinc-300 stroke-[1.5] mb-2.5" />
          <h3 className="text-sm font-medium text-zinc-900">No items found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
            There are no matching items. Try refining your keyword or clearing active filters.
          </p>
          <button
            type="button"
            className="btn-secondary mt-3.5 px-3 py-1.5 text-xs"
            onClick={onReset}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <ItemCard key={it.id} item={it} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            className="btn-secondary px-3 py-1.5 text-xs"
            disabled={page <= 1}
            onClick={() => {
              const sp = new URLSearchParams(params);
              sp.set("page", String(Math.max(1, page - 1)));
              setParams(sp);
            }}
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Prev</span>
          </button>

          <span className="text-xs text-zinc-500 font-medium px-2">
            Page {page} of {totalPages}
          </span>

          <button
            className="btn-secondary px-3 py-1.5 text-xs"
            disabled={page >= totalPages}
            onClick={() => {
              const sp = new URLSearchParams(params);
              sp.set("page", String(Math.min(totalPages, page + 1)));
              setParams(sp);
            }}
          >
            <span>Next</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
