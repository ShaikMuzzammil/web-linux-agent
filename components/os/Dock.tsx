'use client';
import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { LayoutGrid, Pin, PinOff, X as XIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { getAppById } from '@/components/apps/registry';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

const BASE = 44;
const MAX  = 68;
const RANGE = 2; // neighbours magnified

function getScale(idx: number, hovered: number | null): number {
  if (hovered === null) return 1;
  const dist = Math.abs(idx - hovered);
  if (dist === 0) return MAX / BASE;
  if (dist <= RANGE) return 1 + (1 - dist / RANGE) * ((MAX - BASE) / BASE) * 0.55;
  return 1;
}

export default memo(function Dock() {
  const {
    dockItems, windows, theme,
    openWindow, focusWindow, toggleAppLauncher,
    pinDockItem, unpinDockItem, closeWindow, showContextMenu,
  } = useOSStore();

  const [hovered, setHovered] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<Set<string>>(new Set());
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; appId: string } | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Bounce effect
  useEffect(() => {
    const ids = dockItems.filter(d => d.bounce).map(d => d.appId);
    if (!ids.length) return;
    setBouncing(new Set(ids));
    const t = setTimeout(() => setBouncing(new Set()), 600);
    return () => clearTimeout(t);
  }, [dockItems]);

  // Close context menu on outside click
  useEffect(() => {
    if (!ctxMenu) return;
    const h = (e: MouseEvent) => {
      setCtxMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ctxMenu]);

  const handleClick = useCallback((appId: string) => {
    const open = windows.filter(w => w.appId === appId && w.state !== 'minimized');
    if (open.length) { focusWindow(open[0].id); return; }
    const min = windows.find(w => w.appId === appId && w.state === 'minimized');
    if (min) { focusWindow(min.id); return; }
    openWindow(appId);
  }, [windows, focusWindow, openWindow]);

  const handleCtx = useCallback((e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY - 200, appId });
  }, []);

  const pinned       = dockItems.filter(d => d.isPinned);
  const openUnpinned = dockItems.filter(d => !d.isPinned && d.isOpen);
  const visible      = [...pinned, ...openUnpinned];

  const renderItem = (appId: string, idx: number) => {
    const app        = getAppById(appId);
    if (!app) return null;
    const isOpen     = windows.some(w => w.appId === appId);
    const isFocused  = windows.some(w => w.appId === appId && w.isFocused);
    const isBouncing = bouncing.has(appId);
    const isPinned   = dockItems.find(d => d.appId === appId)?.isPinned;
    const openCount  = windows.filter(w => w.appId === appId && w.state !== 'minimized').length;
    const scale      = getScale(idx, hovered);
    const size       = Math.round(BASE * scale);
    const iconSize   = Math.round(size * 0.48);

    return (
      <div
        key={appId}
        className="relative flex flex-col items-center"
        style={{
          width: MAX + 12,
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 4,
        }}
        onMouseEnter={() => setHovered(idx)}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Tooltip */}
        <div
          className="absolute pointer-events-none z-20 whitespace-nowrap"
          style={{
            bottom: size + 14,
            opacity: hovered === idx ? 1 : 0,
            transform: hovered === idx ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.95)',
            transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <div
            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-white"
            style={{
              background: 'rgba(10,10,20,0.92)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            {app.name}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(10,10,20,0.92)',
              }} />
          </div>
        </div>

        {/* Icon button */}
        <button
          onClick={() => handleClick(appId)}
          onContextMenu={e => handleCtx(e, appId)}
          className="relative flex items-center justify-center rounded-2xl transition-all"
          style={{
            width: size,
            height: size,
            background: isFocused
              ? `linear-gradient(135deg, ${theme.accent}50, ${theme.accent}28)`
              : 'rgba(255,255,255,0.09)',
            border: isFocused
              ? `1.5px solid ${theme.accent}60`
              : '1.5px solid rgba(255,255,255,0.07)',
            boxShadow: isFocused
              ? `0 0 20px ${theme.accent}40, 0 4px 16px rgba(0,0,0,0.5)`
              : hovered === idx
              ? '0 8px 28px rgba(0,0,0,0.55)'
              : '0 2px 8px rgba(0,0,0,0.35)',
            transform: isBouncing ? 'translateY(-16px)' : `translateY(${hovered === idx ? -3 : 0}px)`,
            transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <DynIcon
            name={app.icon}
            size={iconSize}
            style={{ color: isFocused ? theme.accent : 'rgba(255,255,255,0.88)' }}
          />
        </button>

        {/* Running indicators */}
        {isOpen && (
          <div className="absolute flex gap-0.5" style={{ bottom: -2 }}>
            {Array.from({ length: Math.min(openCount || 1, 3) }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full"
                style={{ background: isFocused ? theme.accent : 'rgba(255,255,255,0.45)' }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Context Menu */}
      {ctxMenu && (() => {
        const app = getAppById(ctxMenu.appId);
        const isOpen = windows.some(w => w.appId === ctxMenu.appId);
        const isPinned = dockItems.find(d => d.appId === ctxMenu.appId)?.isPinned;
        return (
          <div
            className="fixed z-[2000] rounded-2xl overflow-hidden py-1"
            style={{
              left: ctxMenu.x,
              top: ctxMenu.y,
              background: 'rgba(12,12,22,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(24px)',
              minWidth: 180,
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            {app && (
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold text-white">{app.name}</p>
                <p className="text-[10px] opacity-30 capitalize">{app.category}</p>
              </div>
            )}
            <div className="py-1">
              <button
                onClick={() => { handleClick(ctxMenu.appId); setCtxMenu(null); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-white/75 hover:bg-white/08 transition-colors text-left">
                <Icons.ExternalLink size={12} className="opacity-50" />
                {isOpen ? 'Focus Window' : 'Open'}
              </button>
              {isPinned
                ? (
                  <button
                    onClick={() => { unpinDockItem(ctxMenu.appId); setCtxMenu(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-white/75 hover:bg-white/08 transition-colors text-left">
                    <PinOff size={12} className="opacity-50" />
                    Remove from Dock
                  </button>
                ) : (
                  <button
                    onClick={() => { pinDockItem(ctxMenu.appId); setCtxMenu(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-white/75 hover:bg-white/08 transition-colors text-left">
                    <Pin size={12} className="opacity-50" />
                    Keep in Dock
                  </button>
                )}
              {isOpen && (
                <>
                  <div className="my-1 mx-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                  <button
                    onClick={() => {
                      const win = windows.find(w => w.appId === ctxMenu.appId);
                      if (win) closeWindow(win.id);
                      setCtxMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left">
                    <XIcon size={12} />
                    Close Window
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Dock */}
      <div
        ref={dockRef}
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[800] flex items-end px-3 py-2 rounded-2xl"
        style={{
          background: 'rgba(10,10,20,0.75)',
          backdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.65)',
          gap: 6,
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* App Launcher */}
        <div
          className="relative flex flex-col items-center"
          style={{ width: MAX + 12, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 }}
          onMouseEnter={() => setHovered(-1)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="absolute pointer-events-none z-20 whitespace-nowrap"
            style={{
              bottom: Math.round(BASE * getScale(-1, hovered)) + 14,
              opacity: hovered === -1 ? 1 : 0,
              transform: hovered === -1 ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.95)',
              transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
            <div className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-white"
              style={{ background: 'rgba(10,10,20,0.92)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
              App Launcher
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(10,10,20,0.92)' }} />
            </div>
          </div>
          <button
            onClick={toggleAppLauncher}
            className="flex items-center justify-center rounded-2xl transition-all"
            style={{
              width: Math.round(BASE * getScale(-1, hovered)),
              height: Math.round(BASE * getScale(-1, hovered)),
              background: hovered === -1
                ? `linear-gradient(135deg, ${theme.accent}50, ${theme.accent}28)`
                : `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}15)`,
              border: `1.5px solid ${theme.accent}40`,
              boxShadow: hovered === -1 ? `0 0 20px ${theme.accent}40, 0 8px 28px rgba(0,0,0,0.55)` : `0 2px 8px rgba(0,0,0,0.35)`,
              transform: `translateY(${hovered === -1 ? -3 : 0}px)`,
              transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
            <LayoutGrid size={Math.round(Math.round(BASE * getScale(-1, hovered)) * 0.42)} style={{ color: theme.accent }} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch mx-1 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.3)' }} />

        {/* App icons */}
        {visible.map((item, idx) => renderItem(item.appId, idx))}
      </div>
    </>
  );
});
