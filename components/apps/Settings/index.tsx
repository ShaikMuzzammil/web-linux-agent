"use client";
import { useState } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import { useSession, signOut } from "next-auth/react";

type SettingsSection = "appearance" | "account" | "display" | "sound" | "network" | "about";

const SECTIONS: { id: SettingsSection; label: string; icon: string }[] = [
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "display", label: "Display", icon: "🖥️" },
  { id: "sound", label: "Sound", icon: "🔊" },
  { id: "network", label: "Network", icon: "📶" },
  { id: "account", label: "Users & Account", icon: "👤" },
  { id: "about", label: "About", icon: "ℹ️" },
];

const WALLPAPERS = [
  { id: "warty-final-ubuntu", label: "Ubuntu Classic", gradient: "linear-gradient(135deg, #2C001E, #5C0036, #3a1a4a, #1a1a3a)" },
  { id: "aurora", label: "Aurora", gradient: "linear-gradient(135deg, #0d1b2a, #1b4332, #0d1b2a)" },
  { id: "mountains", label: "Mountains", gradient: "linear-gradient(180deg, #1a1a3e, #2d1b4e, #4a2c6b, #1a1a1a)" },
  { id: "neon-city", label: "Neon City", gradient: "linear-gradient(180deg, #0a0a1a, #1a0a2e, #2e1a4a, #0a1a0a)" },
  { id: "ocean", label: "Ocean", gradient: "linear-gradient(180deg, #0c1445, #1a237e, #283593, #1565c0)" },
  { id: "forest", label: "Forest", gradient: "linear-gradient(135deg, #1b4332, #2d6a4f, #40916c, #1b4332)" },
];

const ACCENT_COLORS = [
  { name: "Ubuntu Orange", value: "#E95420" },
  { name: "Purple", value: "#772953" },
  { name: "Blue", value: "#3d8af7" },
  { name: "Green", value: "#4CAF50" },
  { name: "Teal", value: "#009688" },
  { name: "Pink", value: "#E91E63" },
  { name: "Amber", value: "#FFC107" },
  { name: "Cyan", value: "#00BCD4" },
];

export default function Settings({ windowId }: { windowId: string }) {
  const [active, setActive] = useState<SettingsSection>("appearance");
  const {
    wallpaper, setWallpaper,
    accentColor, setAccentColor,
    fontSize, setFontSize,
    dockSize, setDockSize,
    volume, setVolume,
    brightness, setBrightness,
    terminalTheme, setTerminalTheme,
  } = useDesktopStore();
  const { data: session } = useSession();

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#1a1a2e", color: "#e6edf3" }}>
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0 border-r border-white/10 overflow-y-auto"
        style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="p-4">
          <div className="text-sm font-semibold text-white mb-1">Settings</div>
          <div className="text-xs text-white/40">System configuration</div>
        </div>
        <div className="px-2 pb-4 space-y-0.5">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: active === s.id ? "rgba(233,84,32,0.15)" : "transparent",
                color: active === s.id ? "#E95420" : "rgba(255,255,255,0.65)",
                borderLeft: active === s.id ? "2px solid #E95420" : "2px solid transparent",
              }}>
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {active === "appearance" && (
          <div className="space-y-8 max-w-xl">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>

              {/* Wallpaper */}
              <div className="mb-6">
                <h3 className="text-sm text-white/50 uppercase tracking-widest mb-3">Wallpaper</h3>
                <div className="grid grid-cols-3 gap-3">
                  {WALLPAPERS.map((w) => (
                    <div key={w.id} onClick={() => setWallpaper(w.id)}
                      className="cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                      style={{
                        height: 64,
                        background: w.gradient,
                        border: wallpaper === w.id ? `2px solid ${accentColor}` : "2px solid rgba(255,255,255,0.1)",
                        boxShadow: wallpaper === w.id ? `0 0 12px ${accentColor}50` : "none",
                      }}>
                      <div className="h-full flex items-end p-1.5">
                        <span className="text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">{w.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div className="mb-6">
                <h3 className="text-sm text-white/50 uppercase tracking-widest mb-3">Accent Color</h3>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button key={c.value} onClick={() => setAccentColor(c.value)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      title={c.name}
                      style={{
                        background: c.value,
                        boxShadow: accentColor === c.value ? `0 0 0 3px rgba(255,255,255,0.3), 0 0 0 5px ${c.value}` : "none",
                        transform: accentColor === c.value ? "scale(1.15)" : "scale(1)",
                      }} />
                  ))}
                </div>
              </div>

              {/* Dock size */}
              <div className="mb-6">
                <h3 className="text-sm text-white/50 uppercase tracking-widest mb-3">Dock Icon Size</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40">Small</span>
                  <input type="range" min="32" max="64" step="4" value={dockSize} onChange={(e) => setDockSize(Number(e.target.value))}
                    className="flex-1 h-1.5 rounded-full cursor-pointer accent-orange-500" />
                  <span className="text-xs text-white/40">Large</span>
                  <span className="w-8 text-white/60 text-sm">{dockSize}px</span>
                </div>
              </div>

              {/* Font size */}
              <div>
                <h3 className="text-sm text-white/50 uppercase tracking-widest mb-3">Interface Font Size</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40">A</span>
                  <input type="range" min="11" max="18" step="1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-1.5 rounded-full cursor-pointer accent-orange-500" />
                  <span className="text-lg text-white/40">A</span>
                  <span className="w-8 text-white/60 text-sm">{fontSize}px</span>
                </div>
              </div>
            </div>

            {/* Terminal theme */}
            <div>
              <h3 className="text-sm text-white/50 uppercase tracking-widest mb-3">Terminal Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {["ubuntu", "dark", "matrix", "dracula", "solarized", "nord"].map((t) => (
                  <button key={t} onClick={() => setTerminalTheme(t)}
                    className="py-2 px-3 rounded-lg text-sm capitalize transition-all"
                    style={{
                      background: terminalTheme === t ? "rgba(233,84,32,0.2)" : "rgba(255,255,255,0.06)",
                      border: terminalTheme === t ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
                      color: terminalTheme === t ? accentColor : "rgba(255,255,255,0.6)",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === "display" && (
          <div className="space-y-6 max-w-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Display</h2>
            <div>
              <h3 className="text-sm text-white/50 uppercase tracking-widest mb-3">Brightness</h3>
              <div className="flex items-center gap-4">
                <span className="text-xl">🌑</span>
                <input type="range" min="10" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full cursor-pointer accent-orange-500" />
                <span className="text-xl">☀️</span>
                <span className="w-12 text-white/60 text-sm">{brightness}%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-white font-medium mb-2">Resolution</div>
              <div className="text-white/50 text-sm">1920 × 1080 (Full HD)</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-white font-medium mb-2">Refresh Rate</div>
              <div className="text-white/50 text-sm">60 Hz</div>
            </div>
          </div>
        )}

        {active === "sound" && (
          <div className="space-y-6 max-w-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Sound</h2>
            <div>
              <h3 className="text-sm text-white/50 uppercase tracking-widest mb-3">Output Volume</h3>
              <div className="flex items-center gap-4">
                <span className="text-xl">🔈</span>
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full cursor-pointer accent-orange-500" />
                <span className="text-xl">🔊</span>
                <span className="w-12 text-white/60 text-sm">{volume}%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-white font-medium mb-1">Output Device</div>
              <div className="text-white/50 text-sm">Built-in Speakers</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-white font-medium mb-1">Input Device</div>
              <div className="text-white/50 text-sm">Built-in Microphone</div>
            </div>
          </div>
        )}

        {active === "network" && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Network</h2>
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">📶</span>
                <div>
                  <div className="text-white font-medium text-sm">Wi-Fi Connected</div>
                  <div className="text-white/50 text-xs">Portfolio Network · Secured</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Connection Details</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-white/50">IP Address</span><span className="text-white/80">192.168.1.42</span></div>
                <div className="flex justify-between"><span className="text-white/50">DNS</span><span className="text-white/80">8.8.8.8</span></div>
                <div className="flex justify-between"><span className="text-white/50">Gateway</span><span className="text-white/80">192.168.1.1</span></div>
              </div>
            </div>
          </div>
        )}

        {active === "account" && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Users & Account</h2>
            {session ? (
              <>
                <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #E95420, #772953)" }}>
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">{session.user?.name}</div>
                      <div className="text-white/50 text-sm">{session.user?.email}</div>
                      <div className="text-green-400 text-xs mt-1">● Signed in</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => signOut()}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                  style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <div className="p-5 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-4xl mb-3">👤</div>
                <div className="text-white font-medium mb-1">Guest Mode</div>
                <div className="text-white/50 text-sm mb-4">Sign in to save your preferences and access all features.</div>
              </div>
            )}
          </div>
        )}

        {active === "about" && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-white mb-4">About This System</h2>
            <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🐧</div>
                <div>
                  <div className="text-white font-bold text-lg">Web Linux Agent</div>
                  <div className="text-white/50 text-sm">Version 2.0.0</div>
                </div>
              </div>
              {[
                ["OS", "Ubuntu 22.04.3 LTS (Simulated)"],
                ["Built by", "Shaik Muzzammil"],
                ["Framework", "Next.js 14 (App Router)"],
                ["Database", "Neon PostgreSQL via Prisma"],
                ["Auth", "NextAuth.js v5"],
                ["Email", "Resend API"],
                ["Hosting", "Vercel"],
                ["GitHub", "github.com/ShaikMuzzammil"],
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between py-2 border-b border-white/5 text-sm last:border-0">
                  <span className="text-white/50">{key}</span>
                  <span className="text-white/80">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
