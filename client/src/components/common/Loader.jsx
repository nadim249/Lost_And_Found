const wrap = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "2.5rem 1rem",
};

// Reusable animated page spinner loading indicator
export default function Loader({ label = "loading…" }) {
  return (
    <div style={wrap} role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-ink-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700" />
        <span className="text-sm lowercase">{label}</span>
      </div>
    </div>
  );
}
