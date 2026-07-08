"use client";
import { useState } from "react";

const BOOKMARKS = [
  { label: "GitHub",    url: "https://github.com/ShaikMuzzammil", icon: "🐙" },
  { label: "LinkedIn",  url: "https://linkedin.com/in/shaik-muzzammil", icon: "💼" },
  { label: "Portfolio", url: "about:portfolio", icon: "👨‍💻" },
  { label: "Google",    url: "https://google.com", icon: "🌐" },
];

const SAFE_SITES = [
  "github.com", "linkedin.com", "google.com", "stackoverflow.com",
  "nextjs.org", "prisma.io", "vercel.com", "neon.tech",
  "resend.com", "tailwindcss.com", "typescriptlang.org",
];

function PortfolioPage() {
  return (
    <div style={{ background: "linear-gradient(135deg,#0d1117 0%,#161b22 100%)", color: "#e6edf3", minHeight: "100%", fontFamily: "Ubuntu,sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#E95420,#772953)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, margin: "0 auto 20px", color: "white" }}>SM</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 8px", color: "white" }}>Shaik Muzzammil</h1>
          <p style={{ fontSize: 18, color: "#E95420", margin: "0 0 8px", fontWeight: 500 }}>Full Stack Developer · CSE Student</p>
          <p style={{ fontSize: 14, color: "rgba(230,237,243,0.5)", margin: 0 }}>📍 Chennai, India · Amrita Vishwa Vidyapeetham (2024–2028)</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            {["🐙 GitHub", "💼 LinkedIn", "📧 Email", "📱 +91 9100128504"].map((link) => (
              <span key={link} style={{ padding: "6px 16px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "rgba(230,237,243,0.7)", cursor: "pointer" }}>{link}</span>
            ))}
          </div>
        </div>
        {/* About */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: "white", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>About Me</h2>
          <p style={{ color: "rgba(230,237,243,0.7)", lineHeight: 1.7, fontSize: 15 }}>
            Third-year Computer Science undergraduate with experience building scalable full-stack web applications, REST APIs, and database-driven systems. Passionate about Software Engineering, backend development, and designing clean, maintainable software that solves real-world problems. Currently exploring AI/ML and System Design.
          </p>
        </section>
        {/* Skills */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: "white", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Technical Skills</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
            {["Next.js","React.js","TypeScript","Node.js","PostgreSQL","Prisma","Python","Java","Git","Docker","Linux","Tailwind CSS"].map((s) => (
              <div key={s} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(233,84,32,0.1)", border: "1px solid rgba(233,84,32,0.2)", color: "#E95420", fontSize: 13, textAlign: "center", fontWeight: 500 }}>{s}</div>
            ))}
          </div>
        </section>
        {/* Projects */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: "white", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Projects</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { name: "CortexCart",            desc: "Multi-portal e-commerce platform with Customer, Admin & Host apps.", tech: ["Next.js","TypeScript","PostgreSQL"], emoji: "🛒" },
              { name: "Smart Query Optimizer", desc: "AI-powered SQL workspace with natural language query conversion.",  tech: ["Next.js","Monaco","AI","PostgreSQL"], emoji: "🔍" },
              { name: "OmniPoll",              desc: "Real-time polling with WebSockets, live leaderboards & sync.",        tech: ["React","WebSockets","TypeScript"],    emoji: "📊" },
              { name: "AgroWave",              desc: "Agriculture analytics dashboard — 95+ Lighthouse score.",            tech: ["Next.js","Tailwind CSS","Charts"],    emoji: "🌾" },
            ].map((p) => (
              <div key={p.name} style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{p.emoji}</div>
                <h3 style={{ fontWeight: 600, color: "white", marginBottom: 6, fontSize: 16 }}>{p.name}</h3>
                <p style={{ color: "rgba(230,237,243,0.6)", fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.tech.map((t) => (
                    <span key={t} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(233,84,32,0.15)", color: "#E95420", fontSize: 11, fontWeight: 500 }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        <div style={{ textAlign: "center", padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(230,237,243,0.3)", fontSize: 13 }}>
          © 2025 Shaik Muzzammil · Built with Next.js &amp; ❤️
        </div>
      </div>
    </div>
  );
}

export default function Browser({ windowId }: { windowId: string }) {
  const [url,      setUrl     ] = useState<string>("about:portfolio");
  const [inputUrl, setInputUrl] = useState<string>("about:portfolio");
  const [loading,  setLoading ] = useState(false);
  const [history,  setHistory ] = useState<string[]>(["about:portfolio"]);
  const [histIdx,  setHistIdx ] = useState(0);

  // ── Null-safe helpers ────────────────────────────────────────────────────
  const safeUrl  = typeof url === "string" ? url : "about:portfolio";
  const canGo    = (dir: 1 | -1) => dir === -1 ? histIdx > 0 : histIdx < history.length - 1;
  const isSafe   = (u: string) => typeof u === "string" && (u.startsWith("about:") || SAFE_SITES.some((s) => u.includes(s)));
  const getDomain = (u: string) => {
    if (typeof u !== "string") return "";
    try { return new URL(u).hostname; } catch { return u; }
  };

  const navigate = (to: string) => {
    if (typeof to !== "string" || !to.trim()) return;
    let normalized = to.trim();
    if (!normalized.startsWith("http") && !normalized.startsWith("about:")) {
      normalized = normalized.includes(".")
        ? `https://${normalized}`
        : `https://www.google.com/search?q=${encodeURIComponent(normalized)}`;
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
    const newHist = [...history.slice(0, histIdx + 1), normalized];
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setUrl(normalized);
    setInputUrl(normalized);
  };

  // Guard against out-of-bounds — prevents url being set to undefined
  const go = (dir: 1 | -1) => {
    const idx = histIdx + dir;
    if (idx < 0 || idx >= history.length) return;
    const target = history[idx];
    if (typeof target !== "string") return;
    setHistIdx(idx);
    setUrl(target);
    setInputUrl(target);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#1a1a2e" }}>
      {/* Tab bar */}
      <div className="flex items-end px-2 pt-1 gap-1" style={{ background: "#25253a" }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs text-white/80 max-w-[200px]"
          style={{ background: "#1e1e2e", borderTop: "1px solid rgba(233,84,32,0.4)" }}>
          <span>🦊</span>
          <span className="truncate">
            {safeUrl.startsWith("about:") ? "Portfolio — Shaik Muzzammil" : getDomain(safeUrl)}
          </span>
          <span className="text-white/40 ml-1 hover:text-white cursor-pointer">×</span>
        </div>
        <button className="p-1.5 rounded-t-lg text-white/40 hover:text-white hover:bg-white/10 mb-0.5 text-lg leading-none">+</button>
      </div>

      {/* Nav bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10" style={{ background: "#1e1e2e" }}>
        <button onClick={() => go(-1)} disabled={!canGo(-1)} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/70">◀</button>
        <button onClick={() => go(1)}  disabled={!canGo(1)}  className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/70">▶</button>
        <button onClick={() => navigate(safeUrl)} className="p-1.5 rounded hover:bg-white/10 text-white/70">
          {loading ? <span className="inline-block animate-spin">↺</span> : "↺"}
        </button>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <span className="text-green-400 flex-shrink-0 text-xs">🔒</span>
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate(inputUrl)}
            onFocus={(e) => e.target.select()}
            className="flex-1 bg-transparent outline-none text-white/80 text-sm"
            placeholder="Search or enter URL"
          />
        </div>

        <div className="flex gap-1">
          {BOOKMARKS.map((bm) => (
            <button key={bm.url} onClick={() => navigate(bm.url)} title={bm.label}
              className="p-1.5 rounded hover:bg-white/10 transition-colors text-sm">
              {bm.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden" style={{ background: "rgba(233,84,32,0.2)" }}>
            <div className="h-full bg-orange-500 animate-pulse" style={{ width: "60%" }} />
          </div>
        )}

        {safeUrl === "about:portfolio" ? (
          <div className="h-full overflow-y-auto"><PortfolioPage /></div>
        ) : safeUrl === "about:blank" ? (
          <div className="h-full flex items-center justify-center" style={{ background: "#0d1117" }}>
            <div className="text-center text-white/30"><div className="text-6xl mb-4">🦊</div><div>New Tab</div></div>
          </div>
        ) : isSafe(safeUrl) ? (
          <iframe src={safeUrl} className="w-full h-full border-0" title="browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        ) : (
          <div className="h-full flex flex-col items-center justify-center" style={{ background: "#0d1117" }}>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-semibold mb-2">Connection not allowed</h2>
            <p className="text-white/50 text-sm mb-6 text-center max-w-sm">
              This browser is sandboxed for security. Try bookmarked sites or the portfolio.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BOOKMARKS.map((bm) => (
                <button key={bm.url} onClick={() => navigate(bm.url)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span>{bm.icon}</span> {bm.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
