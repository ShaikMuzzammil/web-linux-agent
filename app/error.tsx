"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6 text-white"
      style={{ fontFamily: "'Ubuntu', sans-serif" }}>
      <div className="text-5xl">⚠️</div>
      <div className="text-xl font-medium">Something went wrong</div>
      <div className="text-white/50 text-sm max-w-sm text-center">{error.message}</div>
      <button onClick={reset}
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
        style={{ background: "#E95420" }}>
        Try Again
      </button>
    </div>
  );
}
