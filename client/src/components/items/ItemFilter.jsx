import { useEffect, useRef } from "react";
import { Search, MapPin, RotateCcw, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Wallets & Purses",
  "Keys",
  "Documents & IDs",
  "Clothing & Wearables",
  "Bags & Luggage",
  "Accessories",
  "Pets",
  "Other",
];

// Sleek horizontal filter bar for the items browse feed
export default function ItemFilter({ values, onChange, onReset }) {
  const searchInputRef = useRef(null);

  const update = (key, val) => onChange({ ...values, [key]: val });

  const hasActiveFilters = Boolean(
    values.q || values.type || values.category || values.location
  );

  // Keyboard shortcut: Press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-xs">
      {/* Inline Search Input with Shortcut Hint */}
      <div className="relative flex-1 min-w-[220px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          <Search className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <input
          ref={searchInputRef}
          type="search"
          className="w-full rounded-md border-0 bg-zinc-50/80 py-1.5 pl-8 pr-9 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-colors"
          placeholder="Search listings..."
          value={values.q}
          onChange={(e) => update("q", e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
          <kbd className="hidden sm:inline-flex h-4 items-center justify-center rounded border border-zinc-200 bg-white px-1 text-[10px] font-mono text-zinc-400 leading-none">
            /
          </kbd>
        </div>
      </div>

      {/* Type Toggle Segmented Control */}
      <div className="flex items-center rounded-md border border-zinc-200 p-0.5 bg-zinc-50/60 shrink-0">
        <button
          type="button"
          onClick={() => update("type", "")}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${!values.type
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900"
            }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => update("type", "LOST")}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${values.type === "LOST"
              ? "bg-white text-amber-700 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900"
            }`}
        >
          Lost
        </button>
        <button
          type="button"
          onClick={() => update("type", "FOUND")}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${values.type === "FOUND"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900"
            }`}
        >
          Found
        </button>
      </div>

      {/* Category Select */}
      <div className="relative shrink-0 sm:w-40">
        <select
          className="w-full appearance-none rounded-md border border-zinc-200 bg-white py-1.5 pl-2.5 pr-7 text-xs text-zinc-800 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath stroke='%2371717a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1rem",
            backgroundRepeat: "no-repeat",
          }}
          value={values.category}
          onChange={(e) => update("category", e.target.value === "All Categories" ? "" : e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat === "All Categories" ? "" : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Location Input */}
      <div className="relative shrink-0 sm:w-36">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <input
          type="text"
          className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-7 pr-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
          placeholder="Location..."
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="btn-ghost flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 shrink-0 px-2 py-1.5"
          title="Clear all filters"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      )}
    </div>
  );
}
