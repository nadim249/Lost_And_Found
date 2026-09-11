import { Link } from "react-router-dom";
import ProtectedImage from "../common/ProtectedImage";
import { MapPin, Calendar } from "lucide-react";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Standardized Item Preview Card
export default function ItemCard({ item }) {
  const isResolved = item.status === "RESOLVED";
  const isFound = item.type === "FOUND";

  return (
    <Link
      to={`/items/${item.id}`}
      className="group block overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all duration-150 hover:border-zinc-300 hover:shadow-xs"
    >
      {/* 16:9 Image Container */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100 relative">
        <ProtectedImage
          src={item.images?.[0]}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Discreet Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border leading-none shadow-2xs backdrop-blur-xs ${isFound
              ? "bg-emerald-50/95 text-emerald-800 border-emerald-200/80"
              : "bg-amber-50/95 text-amber-800 border-amber-200/80"
              }`}
          >
            {isFound ? "Found" : "Lost"}
          </span>

          {isResolved && (
            <span className="inline-flex items-center rounded-md bg-zinc-100/95 text-zinc-600 border border-zinc-200/80 px-2 py-0.5 text-[10px] font-medium leading-none">
              Resolved
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 space-y-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="truncate text-zinc-500 text-[11px]">{item.location || "Unspecified"}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-[11px] text-zinc-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
