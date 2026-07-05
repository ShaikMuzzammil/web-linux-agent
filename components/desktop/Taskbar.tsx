"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useDesktopStore } from "@/store/desktopStore";
import { useWindowStore } from "@/store/windowStore";

export default function Taskbar() {
  const [time, setTime] = useState(new Date());
  const [sysOpen, setSysOpen] = useState(false);
  const { volume, brightness, setVolume, setBrightness, setIsLocked } = useDesktopStore();
  const { data: session } = useSession();
  const { openApp, windows } = useWindowStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setSysOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div
      className="flex items-center justify-between h-9 px-3 z-50 flex-shrink-0"
      style={{
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left */}
      <div className="flex items-center gap-1">
        <button
          className="text-white/85 text-[13px] font-medium px-3 h-7 rounded hover:bg-white/10 transition-colors"
        >
          Activities
        </button>
        {/* Open app indicators */}
        <div className="flex items-center gap-0.5 ml-2">
          {windows.map((w) => (
            <div
              key={w.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: w.isFocused ? "#E95420" : "rgba(255,255,255,0.3)" }}
              title={w.title}
            />
          ))}
        </div>
      </div>

      {/* Centre: clock */}
      <button
        onClick={() => setSysOpen(!sysOpen)}
        className="flex flex-col items-center leading-tight h-full justify-center px-2 hover:bg-white/10 rounded transition-colors"
      >
        <span className="text-white text-[13px] font-medium">{fmtTime(time)}</span>
        <span className="text-white/50 text-[10px]">{fmtDate(time)}</span>
      </button>

      {/* Right: sys tray */}
      <div className="flex items-center gap-0.5" ref={menuRef}>
        <TrayIcon title="Network">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M5 12.5C7.5 9.5 9.6 8 12 8s4.5 1.5 7 4.5M8.5 15.5C10 13.5 11 12.5 12 12.5s2 1 3.5 3M12 18.5v.5" />
          </svg>
        </TrayIcon>

        <TrayIcon title={`Volume ${volume}%`} onClick={() => setSysOpen(!sysOpen)}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            {volume > 0 && <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
          </svg>
        </TrayIcon>

        {/* Battery */}
        <TrayIcon title="Battery 87%">
          <div className="flex items-center gap-0.5">
            <svg className="w-5 h-3" viewBox="0 0 22 12" fill="none">
              <rect x=".5" y=".5" width="18" height="11" rx="2" stroke="currentColor" />
              <rect x="2"  y="2"  width="12" height="8"  rx="1" fill="#4ade80" />
              <path d="M19.5 4v4a2 2 0 0 0 0-4z" fill="currentColor" />
            </svg>
            <span className="text-white/50 text-[10px]">87%</span>
          </div>
        </TrayIcon>

        {/* User avatar */}
        <button
          onClick={() => setSysOpen(!sysOpen)}
          className="flex items-center gap-1.5 h-7 px-2 rounded hover:bg-white/10 transition-colors ml-1"
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background: "linear-gradient(135deg,#E95420,#772953)" }}>
            {session?.user?.name?.[0]?.toUpperCase() ?? "G"}
          </div>
          <svg className="w-3 h-3 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* System menu */}
        {sysOpen && (
          <div
            className="absolute top-10 right-2 w-72 rounded-2xl shadow-2xl z-[1000] overflow-hidden animate-slide-down"
            style={{
              background: "rgba(18,18,28,0.97)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User row */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#E95420,#772953)" }}>
                  {session?.user?.name?.[0]?.toUpperCase() ?? "G"}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white text-sm font-medium truncate">{session?.user?.name ?? "Guest"}</div>
                  <div className="text-white/45 text-xs truncate">{session?.user?.email ?? "Not signed in"}</div>
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="p-4 space-y-3 border-b border-white/10">
              <SliderRow icon="☀️" value={brightness} onChange={setBrightness} label={`${brightness}%`} />
              <SliderRow icon="🔊" value={volume}     onChange={setVolume}     label={`${volume}%`}     />
            </div>

            {/* Actions */}
            <div className="p-2 space-y-0.5">
              <MenuItem emoji="⚙️" label="Settings"     onClick={() => { openApp("settings"); setSysOpen(false); }} />
              <MenuItem emoji="🔒" label="Lock Screen"  onClick={() => { setIsLocked(true); setSysOpen(false); }} />
              {session && (
                <MenuItem emoji="🚪" label="Sign Out" onClick={() => signOut()} danger />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrayIcon({ children, title, onClick }: {
  children: React.ReactNode; title: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 h-7 rounded text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center"
    >
      {children}
    </button>
  );
}

function SliderRow({ icon, value, onChange, label }: {
  icon: string; value: number; onChange: (v: number) => void; label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full cursor-pointer accent-orange-500"
      />
      <span className="text-white/45 text-xs w-8 text-right">{label}</span>
    </div>
  );
}

function MenuItem({ emoji, label, onClick, danger }: {
  emoji: string; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors"
      style={{ color: danger ? "#f87171" : "rgba(255,255,255,0.75)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger
          ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span>{emoji}</span> {label}
    </button>
  );
}
