"use client";
import { useState } from "react";
import { useWindowStore } from "@/store/windowStore";
import { AppName } from "@/types";

interface DockItem { app: AppName; label: string; emoji: string }

const DOCK: DockItem[] = [
  { app: "filemanager", label: "Files",        emoji: "📁" },
  { app: "browser",     label: "Firefox",       emoji: "🦊" },
  { app: "terminal",    label: "Terminal",       emoji: "🖥️" },
  { app: "vscode",      label: "VS Code",        emoji: "💙" },
  { app: "texteditor",  label: "Text Editor",    emoji: "📝" },
  { app: "calculator",  label: "Calculator",     emoji: "🧮" },
  { app: "aboutme",     label: "About Me",       emoji: "👨‍💻" },
  { app: "contact",     label: "Contact",        emoji: "📧" },
  { app: "github",      label: "GitHub",         emoji: "🐙" },
  { app: "settings",    label: "Settings",       emoji: "⚙️" },
  { app: "trash",       label: "Trash",          emoji: "🗑️" },
];

const ALL_APPS: DockItem[] = [
  ...DOCK,
  { app: "vscode",     label: "Projects",  emoji: "💻" },
];

export default function Dock() {
  const { windows, openApp } = useWindowStore();
  const [hovered, setHovered] = useState<AppName | null>(null);
  const [showLauncher, setShowLauncher] = useState(false);

  const isOpen = (app: AppName) => windows.some((w) => w.app === app);

  return (
    <>
      {/* App Launcher overlay */}
      {showLauncher && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)" }}
          onClick={() => setShowLauncher(false)}
        >
          <div
            className="rounded-2xl p-8 w-[580px]"
            style={{
              background: "rgba(18,18,28,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-lg font-semibold text-center mb-5">Applications</p>
            <input
              autoFocus
              placeholder="🔍  Search applications…"
              className="w-full px-4 py-2.5 rounded-xl mb-6 text-sm text-white outline-none placeholder-white/30"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            />
            <div className="grid grid-cols-5 gap-3">
              {DOCK.map((item) => (
                <button
                  key={item.app}
                  onClick={() => { openApp(item.app); setShowLauncher(false); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <span className="text-white/70 text-xs text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dock sidebar */}
      <div
        className="flex flex-col items-center py-3 gap-1 flex-shrink-0"
        style={{
          width: 60,
          background: "rgba(0,0,0,0.62)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          zIndex: 40,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ubuntu logo */}
        <button
          onClick={() => setShowLauncher(true)}
          title="Show Applications"
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform hover:scale-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #E95420, #772953)" }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <circle cx="12" cy="4" r="2.4" />
            <circle cx="4.2" cy="19" r="2.4" />
            <circle cx="19.8" cy="19" r="2.4" />
            <path d="M12 6.3A5.7 5.7 0 0 1 17 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M17 16a5.7 5.7 0 0 1-10 0"  stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M7  16A5.7 5.7 0 0 1 12 6.3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </button>

        <div className="w-8 h-px bg-white/15 mb-1" />

        {DOCK.map((item) => (
          <DockButton
            key={item.app}
            item={item}
            open={isOpen(item.app)}
            hovered={hovered === item.app}
            onHover={() => setHovered(item.app)}
            onLeave={() => setHovered(null)}
            onClick={() => openApp(item.app)}
          />
        ))}
      </div>
    </>
  );
}

function DockButton({
  item, open, hovered, onHover, onLeave, onClick,
}: {
  item: DockItem;
  open: boolean;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <div className="relative" onMouseEnter={onHover} onMouseLeave={onLeave}>
      {/* Tooltip */}
      <div
        className="absolute left-14 top-1/2 pointer-events-none z-50 transition-all duration-150"
        style={{
          transform: `translateY(-50%) translateX(${hovered ? 0 : -6}px)`,
          opacity: hovered ? 1 : 0,
        }}
      >
        <div
          className="text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap font-medium"
          style={{ background: "rgba(0,0,0,0.85)", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
        >
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black/85" />
        </div>
      </div>

      {/* Icon */}
      <button
        onClick={onClick}
        title={item.label}
        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-all duration-150 active:scale-90"
        style={{
          background: hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
          transform: hovered ? "scale(1.18)" : "scale(1)",
          boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {item.emoji}
      </button>

      {/* Open indicator */}
      {open && (
        <div
          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full"
          style={{ background: "#E95420" }}
        />
      )}
    </div>
  );
}
