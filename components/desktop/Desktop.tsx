"use client";
import { useCallback, useEffect, useRef } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import { useWindowStore } from "@/store/windowStore";
import { AppName } from "@/types";
import Taskbar from "./Taskbar";
import Dock from "./Dock";
import WindowManager from "./WindowManager";
import DesktopContextMenu from "./DesktopContextMenu";

const WALLPAPERS: Record<string, string> = {
  "warty-final-ubuntu": "linear-gradient(135deg, #2C001E 0%, #5C0036 30%, #3a1a4a 70%, #1a1a3a 100%)",
  aurora:               "linear-gradient(135deg, #0d1b2a 0%, #1b4332 50%, #0d1b2a 100%)",
  mountains:            "linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 40%, #4a2c6b 70%, #1a1a1a 100%)",
  "neon-city":          "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 35%, #2e1a4a 65%, #0a1a0a 100%)",
  ocean:                "linear-gradient(180deg, #0c1445 0%, #1a237e 45%, #283593 75%, #1565c0 100%)",
  forest:               "linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)",
};

const DESKTOP_ICONS: { label: string; app: AppName; emoji: string }[] = [
  { label: "About Me",   app: "aboutme",     emoji: "👨‍💻" },
  { label: "Projects",   app: "vscode",       emoji: "💻" },
  { label: "Terminal",   app: "terminal",     emoji: "🖥️" },
  { label: "Files",      app: "filemanager",  emoji: "📁" },
  { label: "Contact",    app: "contact",      emoji: "📧" },
  { label: "GitHub",     app: "github",       emoji: "🐙" },
  { label: "Trash",      app: "trash",        emoji: "🗑️" },
];

export default function Desktop() {
  const { wallpaper, contextMenu, showContextMenu, hideContextMenu } = useDesktopStore();

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, "desktop");
  }, [showContextMenu]);

  const handleClick = useCallback(() => {
    if (contextMenu.visible) hideContextMenu();
  }, [contextMenu.visible, hideContextMenu]);

  const bg = WALLPAPERS[wallpaper] ?? WALLPAPERS["warty-final-ubuntu"];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: bg, userSelect: "none" }}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Subtle grid for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(233,84,32,0.025) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(233,84,32,0.025) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Taskbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Dock stays left */}
        <Dock />

        {/* Desktop canvas (right of dock) */}
        <div className="flex-1 relative overflow-hidden">
          {/* Desktop icons — top-right column */}
          <div className="absolute top-3 right-3 flex flex-col gap-0.5">
            {DESKTOP_ICONS.map((ic) => (
              <DesktopIcon key={ic.app} {...ic} />
            ))}
          </div>

          <WindowManager />

          {contextMenu.visible && (
            <DesktopContextMenu x={contextMenu.x} y={contextMenu.y} />
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopIcon({ label, app, emoji }: { label: string; app: AppName; emoji: string }) {
  const { openApp } = useWindowStore();
  return (
    <button
      onDoubleClick={(e) => { e.stopPropagation(); openApp(app); }}
      onClick={(e) => e.stopPropagation()}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors w-[72px]"
    >
      <span className="text-3xl leading-none drop-shadow-lg">{emoji}</span>
      <span
        className="text-white text-[11px] text-center leading-tight drop-shadow font-medium"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
      >
        {label}
      </span>
    </button>
  );
}
