// Global application footer component
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-zinc-900 text-white flex items-center justify-center font-medium text-[9px]">
            LF
          </div>
          <p className="text-zinc-600">
            &copy; {new Date().getFullYear()} lost &amp; found. All rights reserved.
          </p>
        </div>
        <p className="text-zinc-400">
          Reuniting community members with lost items.
        </p>
      </div>
    </footer>
  );
}
