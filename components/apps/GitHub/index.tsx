"use client";
import { useState } from "react";

const REPOS = [
  { name: "web-linux-agent", desc: "Interactive Ubuntu 22.04 desktop simulation as a portfolio website", lang: "TypeScript", stars: 24, forks: 3, updated: "Today", langColor: "#3178c6", topics: ["nextjs", "typescript", "ubuntu", "portfolio"] },
  { name: "cortexcart", desc: "Multi-portal e-commerce platform with AI recommendations", lang: "TypeScript", stars: 18, forks: 2, updated: "2 days ago", langColor: "#3178c6", topics: ["nextjs", "ecommerce", "postgresql", "prisma"] },
  { name: "smart-query-optimizer", desc: "AI-powered SQL workspace with Monaco editor", lang: "TypeScript", stars: 15, forks: 1, updated: "5 days ago", langColor: "#3178c6", topics: ["nextjs", "sql", "ai", "monaco"] },
  { name: "omnipoll", desc: "Real-time polling platform with WebSockets", lang: "TypeScript", stars: 12, forks: 2, updated: "2 weeks ago", langColor: "#3178c6", topics: ["react", "websockets", "realtime"] },
  { name: "agrowave", desc: "Agriculture analytics dashboard — 95+ Lighthouse score", lang: "JavaScript", stars: 9, forks: 1, updated: "3 weeks ago", langColor: "#f1e05a", topics: ["nextjs", "dashboard", "agriculture"] },
];

const CONTRIBUTION_GRID = Array.from({ length: 52 * 7 }, (_, i) => {
  const level = Math.random();
  if (level < 0.6) return 0;
  if (level < 0.75) return 1;
  if (level < 0.87) return 2;
  if (level < 0.95) return 3;
  return 4;
});

const CONTRIB_COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

export default function GitHub({ windowId }: { windowId: string }) {
  const [activeTab, setActiveTab] = useState<"overview" | "repos" | "activity">("overview");

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#0d1117", color: "#e6edf3" }}>
      {/* Profile header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 flex-shrink-0"
        style={{ background: "#161b22" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #E95420, #772953)" }}>SM</div>
        <div className="flex-1">
          <div className="text-white font-semibold text-lg leading-tight">ShaikMuzzammil</div>
          <div className="text-white/50 text-sm">Shaik Muzzammil</div>
          <div className="text-white/40 text-xs mt-1">🎓 CSE @ Amrita Vishwa Vidyapeetham · 📍 Chennai, India</div>
        </div>
        <a href="https://github.com/ShaikMuzzammil" target="_blank" rel="noreferrer"
          className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          🐙 View on GitHub
        </a>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 px-6 py-3 border-b border-white/10 text-sm flex-shrink-0"
        style={{ background: "#161b22" }}>
        {[["📦", "5 repos"], ["⭐", "78 stars"], ["👥", "12 followers"], ["🏢", "3 contributions"]].map(([icon, label]) => (
          <span key={label} className="text-white/60 flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
            {icon} {label}
          </span>
        ))}
        <div className="ml-auto flex gap-1">
          {["overview", "repos", "activity"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)}
              className="px-3 py-1.5 text-xs rounded-lg capitalize transition-all"
              style={{
                background: activeTab === tab ? "#E95420" : "rgba(255,255,255,0.06)",
                color: activeTab === tab ? "white" : "rgba(255,255,255,0.5)",
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Contribution graph */}
            <div>
              <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Contribution Activity (Last Year)</div>
              <div className="p-4 rounded-xl" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-white/40 text-xs mb-3">78 contributions in the last year</div>
                <div className="overflow-x-auto">
                  <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(52, 1fr)`, width: "max-content" }}>
                    {Array.from({ length: 52 }).map((_, week) => (
                      <div key={week} className="flex flex-col gap-0.5">
                        {Array.from({ length: 7 }).map((_, day) => {
                          const level = CONTRIBUTION_GRID[week * 7 + day];
                          return (
                            <div key={day} className="rounded-sm"
                              style={{ width: 10, height: 10, background: CONTRIB_COLORS[level] }}
                              title={`${level > 0 ? level : 0} contributions`} />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-2 text-xs text-white/30">
                  Less
                  {CONTRIB_COLORS.map((c, i) => (
                    <div key={i} className="rounded-sm" style={{ width: 10, height: 10, background: c }} />
                  ))}
                  More
                </div>
              </div>
            </div>

            {/* Pinned repos */}
            <div>
              <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Pinned Repositories</div>
              <div className="grid grid-cols-2 gap-3">
                {REPOS.slice(0, 4).map((repo) => (
                  <a key={repo.name} href={`https://github.com/ShaikMuzzammil/${repo.name}`} target="_blank" rel="noreferrer"
                    className="block p-4 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📦</span>
                      <span className="text-blue-400 font-medium text-sm hover:underline">{repo.name}</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mb-3">{repo.desc}</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: repo.langColor }} />
                        {repo.lang}
                      </span>
                      <span>⭐ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "repos" && (
          <div className="space-y-3">
            {REPOS.map((repo) => (
              <div key={repo.name} className="p-4 rounded-xl transition-all hover:border-white/20"
                style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a href={`https://github.com/ShaikMuzzammil/${repo.name}`} target="_blank" rel="noreferrer"
                      className="text-blue-400 font-medium hover:underline">{repo.name}</a>
                    <p className="text-white/50 text-xs mt-1">{repo.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {repo.topics.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "rgba(56,139,253,0.15)", color: "#58a6ff" }}>{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: repo.langColor }} />
                        {repo.lang}
                      </span>
                      <span>⭐ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                      <span>Updated {repo.updated}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            {[
              { icon: "🔧", action: "Committed to", target: "web-linux-agent", time: "2 hours ago", detail: "feat: complete desktop simulation with all apps" },
              { icon: "⭐", action: "Starred", target: "vercel/next.js", time: "1 day ago", detail: null },
              { icon: "🔧", action: "Committed to", target: "cortexcart", time: "2 days ago", detail: "fix: resolve product image deduplication" },
              { icon: "🍴", action: "Forked", target: "prisma/prisma", time: "1 week ago", detail: null },
              { icon: "🔧", action: "Committed to", target: "omnipoll", time: "2 weeks ago", detail: "feat: add bidirectional WebSocket support" },
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl text-sm"
                style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-xl flex-shrink-0">{ev.icon}</span>
                <div className="flex-1">
                  <div className="text-white/70">
                    {ev.action} <span className="text-blue-400">{ev.target}</span>
                  </div>
                  {ev.detail && <div className="text-white/40 text-xs mt-1 font-mono">{ev.detail}</div>}
                  <div className="text-white/30 text-xs mt-1">{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
