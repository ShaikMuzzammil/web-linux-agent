"use client";
import { useDesktopStore } from "@/store/desktopStore";
import { useWindowStore } from "@/store/windowStore";

interface MenuItem {
  label: string;
  emoji: string;
  action: () => void;
}

export default function DesktopContextMenu({ x, y }: { x: number; y: number }) {
  const { hideContextMenu } = useDesktopStore();
  const { openApp } = useWindowStore();

  const run = (fn: () => void) => { fn(); hideContextMenu(); };

  const groups: (MenuItem | null)[][] = [
    [
      { label: "Open Terminal Here", emoji: "🖥️", action: () => openApp("terminal") },
      { label: "Open in Files",      emoji: "📁", action: () => openApp("filemanager") },
    ],
    [
      { label: "Change Background…", emoji: "🖼️", action: () => openApp("settings") },
      { label: "Display Settings",   emoji: "⬛", action: () => openApp("settings") },
      { label: "Settings",           emoji: "⚙️", action: () => openApp("settings") },
    ],
    [
      {
        label: "Enter Full Screen",
        emoji: "⛶",
        action: () => document.documentElement.requestFullscreen?.().catch(() => {}),
      },
    ],
  ];

  const W = 228;
  const totalItems = groups.flat().filter(Boolean).length + groups.length - 1;
  const H = totalItems * 36 + 8;
  const ax = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1200) - W - 8);
  const ay = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 800) - H - 8);

  return (
    <div
      className="fixed z-[999] rounded-xl overflow-hidden shadow-2xl animate-slide-down"
      style={{
        left: ax, top: ay, width: W,
        background: "rgba(18,18,28,0.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1.5">
        {groups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="h-px bg-white/10 mx-3 my-1" />}
            {group.map((item) =>
              item ? (
                <button
                  key={item.label}
                  onClick={() => run(item.action)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/75 hover:text-white hover:bg-white/10 transition-colors text-left"
                >
                  <span className="w-4 text-center">{item.emoji}</span>
                  {item.label}
                </button>
              ) : null
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
