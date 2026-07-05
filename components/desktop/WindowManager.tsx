"use client";
import { useRef, useCallback } from "react";
import Draggable from "react-draggable";
import { useWindowStore } from "@/store/windowStore";
import { AppWindow, AppName } from "@/types";
import Terminal    from "@/components/apps/Terminal";
import VSCode      from "@/components/apps/VSCode";
import FileManager from "@/components/apps/FileManager";
import Browser     from "@/components/apps/Browser";
import AboutMe     from "@/components/apps/AboutMe";
import Contact     from "@/components/apps/Contact";
import Calculator  from "@/components/apps/Calculator";
import Settings    from "@/components/apps/Settings";
import TextEditor  from "@/components/apps/TextEditor";
import GitHub      from "@/components/apps/GitHub";
import Trash       from "@/components/apps/Trash";

const APP_MAP: Record<AppName, React.ComponentType<{ windowId: string }>> = {
  terminal:    Terminal,
  vscode:      VSCode,
  filemanager: FileManager,
  browser:     Browser,
  aboutme:     AboutMe,
  contact:     Contact,
  calculator:  Calculator,
  settings:    Settings,
  texteditor:  TextEditor,
  gedit:       TextEditor,
  github:      GitHub,
  trash:       Trash,
};

export default function WindowManager() {
  const { windows } = useWindowStore();
  return (
    <>
      {windows.filter((w) => !w.isMinimized).map((win) => (
        <AppWindowFrame key={win.id} win={win} />
      ))}
    </>
  );
}

function AppWindowFrame({ win }: { win: AppWindow }) {
  const { closeApp, minimizeApp, maximizeApp, focusApp, updatePosition } = useWindowStore();
  const nodeRef = useRef<HTMLDivElement>(null!);
  const Component = APP_MAP[win.app];
  const onFocus = useCallback(() => focusApp(win.id), [focusApp, win.id]);

  const maximized = win.isMaximized;

  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      handle=".wm-titlebar"
      disabled={maximized}
      position={maximized ? { x: 0, y: 0 } : win.position}
      onStop={(_, d) => updatePosition(win.id, { x: d.x, y: d.y })}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className="absolute flex flex-col rounded-xl overflow-hidden"
        style={{
          width:  maximized ? "100%"  : win.size.width,
          height: maximized ? "100%"  : win.size.height,
          left:   maximized ? 0       : undefined,
          top:    maximized ? 0       : undefined,
          zIndex: win.zIndex,
          background: "rgba(14,14,20,0.97)",
          backdropFilter: "blur(20px)",
          border: win.isFocused
            ? "1px solid rgba(233,84,32,0.35)"
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: win.isFocused
            ? "0 28px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(233,84,32,0.18)"
            : "0 16px 40px rgba(0,0,0,0.6)",
          transition: "box-shadow 0.12s, border-color 0.12s",
        }}
        onMouseDown={onFocus}
      >
        {/* Title bar */}
        <div
          className="wm-titlebar flex items-center gap-2 px-3 py-2.5 flex-shrink-0 cursor-move"
          style={{
            background: win.isFocused
              ? "linear-gradient(180deg,#3d3d3d 0%,#2b2b2b 100%)"
              : "linear-gradient(180deg,#272727 0%,#1e1e1e 100%)",
            borderBottom: "1px solid rgba(0,0,0,0.45)",
          }}
        >
          {/* Traffic lights */}
          <div className="flex gap-1.5 flex-shrink-0">
            <TrafficLight color="#ff5f57" hoverChar="✕" onClick={() => closeApp(win.id)} title="Close" />
            <TrafficLight color="#febc2e" hoverChar="−" onClick={() => minimizeApp(win.id)} title="Minimise" />
            <TrafficLight color="#28c840" hoverChar={maximized ? "⊡" : "⊞"} onClick={() => maximizeApp(win.id)} title={maximized ? "Restore" : "Maximise"} />
          </div>

          {/* Title */}
          <div className="flex-1 text-center text-[13px] text-white/75 font-medium truncate pointer-events-none select-none">
            {win.title}
          </div>

          <div className="w-14 flex-shrink-0" />
        </div>

        {/* App content */}
        <div className="flex-1 overflow-hidden">
          {Component && <Component windowId={win.id} />}
        </div>
      </div>
    </Draggable>
  );
}

function TrafficLight({
  color, hoverChar, onClick, title,
}: {
  color: string; hoverChar: string; onClick: () => void; title: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-opacity"
      style={{ background: color }}
    >
      <span
        className="opacity-0 group-hover:opacity-100 transition-opacity leading-none font-bold"
        style={{ fontSize: 8, color: "rgba(0,0,0,0.6)" }}
      >
        {hoverChar}
      </span>
    </button>
  );
}
