export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6 text-white"
      style={{ fontFamily: "'Ubuntu', sans-serif" }}>
      <div className="text-7xl font-thin">404</div>
      <div className="text-xl text-white/60">Page not found</div>
      <a href="/" className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
        style={{ background: "#E95420" }}>
        ← Back to Desktop
      </a>
    </div>
  );
}
