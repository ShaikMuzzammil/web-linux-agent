export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-16 h-16"
          style={{ animation: "bootPulse 1.4s ease-in-out infinite" }}>
          <circle cx="50" cy="12" r="10" fill="#E95420" />
          <circle cx="14" cy="72" r="10" fill="#E95420" />
          <circle cx="86" cy="72" r="10" fill="#E95420" />
          <path d="M50 22 A28 28 0 0 1 74 62" stroke="#E95420" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M74 62 A28 28 0 0 1 26 62" stroke="#E95420" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M26 62 A28 28 0 0 1 50 22" stroke="#E95420" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
        <div className="flex gap-2">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-orange-500"
              style={{ animation: `loadingDot 1.2s ease-in-out ${i*0.16}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
