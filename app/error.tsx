"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6 text-white"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* Ubuntu-style warning icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
        style={{ background: "rgba(233,84,32,0.15)", border: "2px solid rgba(233,84,32,0.5)" }}
      >
        ⚠️
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-xl font-semibold">Something went wrong</div>
        <div className="text-white/40 text-xs font-mono max-w-sm text-center px-4">
          {error?.message ?? "An unexpected error occurred"}
        </div>
      </div>
      <button
        onClick={() => reset()}
        className="px-8 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "#E95420" }}
      >
        Try Again
      </button>
    </div>
  );
}
