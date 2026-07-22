'use client';
import { memo, useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { getAppById } from '@/components/apps/registry';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

export default memo(function Taskbar() {
  const {
    windows, theme, focusWindow, closeWindow, minimizeWindow, minimizeAll
  } = useOSStore();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const dk = theme.mode === 'dark';
  const bg      = dk ? 'rgba(10,10,20,0.95)' : 'rgba(236,236,246,0.97)';
  const border  = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const mutedTx = dk ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.38)';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[850] flex items-center gap-1 px-3"
      style={{
        height: 40,
        background: bg,
        backdropFilter: 'blur(24px) saturate(180%)',
        borderTop: `1px solid ${border}`,
      }}
    >
      {/* Show Desktop shortcut */}
      <button
        onClick={minimizeAll}
        title="Show Desktop"
        className="flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
        style={{
          width: 28, height: 28,
          background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          border: `1px solid ${border}`,
          color: mutedTx,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = dk ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        }}
      >
        <Icons.Monitor size={12} />
      </button>

      {/* Divider */}
      <div className="w-px h-5 flex-shrink-0" style={{ background: border }} />

      {/* Window buttons — scrollable */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {windows.length === 0 ? (
          <span className="text-[10px]" style={{ color: mutedTx }}>No open apps</span>
        ) : (
          windows.map(win => {
            const app      = getAppById(win.appId);
            const isMin    = win.state === 'minimized';
            const isFocused = win.isFocused && win.state !== 'minimized';
            const isHover  = hoverId === win.id;

            return (
              <div
                key={win.id}
                className="relative flex items-center gap-1.5 flex-shrink-0 rounded-lg transition-all group/win"
                style={{
                  height: 28,
                  paddingLeft: 8,
                  paddingRight: isHover ? 4 : 8,
                  maxWidth: 160,
                  background: isFocused
                    ? `${theme.accent}22`
                    : isHover
                      ? dk ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'
                      : dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: isFocused
                    ? `1px solid ${theme.accent}50`
                    : `1px solid ${border}`,
                  opacity: isMin ? 0.55 : 1,
                  cursor: 'pointer',
                }}
                onClick={() => focusWindow(win.id)}
                onMouseEnter={() => setHoverId(win.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <DynIcon
                  name={win.icon}
                  size={11}
                  style={{ color: isFocused ? theme.accent : mutedTx, flexShrink: 0 }}
                />
                <span
                  className="text-[10px] font-medium truncate"
                  style={{
                    maxWidth: 90,
                    color: isFocused
                      ? theme.accent
                      : dk ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.68)',
                  }}
                >
                  {win.title}
                </span>
                {isMin && (
                  <span className="text-[8px]" style={{ color: mutedTx }}>▼</span>
                )}

                {/* Focus indicator bar */}
                {isFocused && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{ width: 20, height: 2, background: theme.accent }}
                  />
                )}

                {/* Close button on hover */}
                {isHover && (
                  <button
                    className="flex items-center justify-center rounded flex-shrink-0 transition-all ml-1"
                    style={{ width: 14, height: 14, color: mutedTx }}
                    onClick={e => { e.stopPropagation(); closeWindow(win.id); }}
                    title="Close"
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = mutedTx; }}
                  >
                    <Icons.X size={9} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Right: clock + minimize button */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="text-[10px] font-mono" style={{ color: mutedTx }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});
