import { useState } from "react";
import { Package } from "lucide-react";

// Image container component with clean fallback placeholder
export default function ProtectedImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-100 text-zinc-400 ${className}`}
        aria-label={alt || "Item thumbnail placeholder"}
      >
        <Package className="h-6 w-6 stroke-[1.5] opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
