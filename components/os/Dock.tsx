'use client';
import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { getAppById } from '@/components/apps/registry';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

const MAGNIFY_RANGE = 3;  // how many neighbors get magnified
const BASE_SIZE    = 44;
const MAX_SIZE     = 64;

export default memo(function Dock() {
  const { dockItems, windows, theme, openWindow, focusWindow, toggleAppLauncher, pinDockItem, unpinDockItem, showContextMenu } = useOSStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<Set<string>>(new Set());
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = dockItems.filter(d => d.bounce).map(d => d.appId);
    if (ids.length) {
      setBouncing(new Set(ids));
      const t = setTimeout(() => setBouncing(new Set()), 450);
      return () => clearTimeout(t);
    }
  }, [dockItems]);

  const handleClick = useCallback((appId: string) => {
    const win = windows.find(w => w.appId === appId && w.state !== 'minimized');
    if (win) { focusWindow(win.id); return; }
    const minWin = windows.find(w => w.appId === appId && w.state === 'minimized');
    if (minWin) { focusWindow(minWin.id); return; }
    openWindow(appId);
  }, [windows, focusWindow, openWindow]);

  const handleRightClick = useCallback((e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    const item = dockItems.find(d => d.appId === appId);
    if (!item) return;
    const isOpen = windows.some(w => w.appId === appId);
    showContextMenu(e.clientX, e.clientY, 'dockIcon', [
      { id: 'open', label: 'Open', icon: 'ExternalLink', action: `open:${appId}` },
      { id: 'd1', label: '', action: '', divider: true },
      item.isPinned
        ? { id: 'unpin', label: 'Remove from Dock', icon: 'PinOff', action: `unpin:${appId}` }
        : { id: 'pin', label: 'Keep in Dock', icon: 'Pin', action: `pin:${appId}` },
      ...(isOpen ? [{ id: 'close', label: 'Close Window', icon: 'X', action: `close:${appId}` }] : []),
    ], { appId });
  }, [dockItems, windows, showContextMenu]);

  const pinned      = dockItems.filter(d => d.isPinned);
  const openUnpinned = dockItems.filter(d => !d.isPinned && d.isOpen);
  const visibleItems = [...pinned, ...openUnpinned];

  // Magnification scale for each item
  const getScale = (idx: number): number => {
    if (hoveredIdx === null) return 1;
    const dist = Math.abs(idx - hoveredIdx);
    if (dist === 0) return MAX_SIZE / BASE_SIZE;
    if (dist <= MAGNIFY_RANGE) return 1 + (1 - dist / MAGNIFY_RANGE) * ((MAX_SIZE - BASE_SIZE) / BASE_SIZE) * 0.6;
    return 1;
  };

  const renderIcon = (appId: string, idx: number) => {
    const app = getAppById(appId);
    if (!app) return null;
    const isOpen    = windows.some(w => w.appId === appId);
    const isFocused = windows.some(w => w.appId === appId && w.isFocused);
    const isBouncing = bouncing.has(appId);
    const scale = getScale(idx);
    const size  = Math.round(BASE_SIZE * scale);

    return (
      <div key={appId} className="relative flex flex-col items-center group"
        onMouseEnter={() => setHoveredIdx(idx)}
        onMouseLeave={() => setHoveredIdx(null)}>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 px-2.5 py-1 rounded-lg text-xs text-white font-medium whitespace-nowrap pointer-events-none z-20 transition-all"
          style={{
            background: 'rgba(12,12,22,0.92)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            opacity: hoveredIdx === idx ? 1 : 0,
            transform: hoveredIdx === idx ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.9)',
          }}>
          {app.name}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(12,12,22,0.92)' }} />
        </div>

        <button
          onClick={() => handleClick(appId)}
          onContextMenu={e => handleRightClick(e, appId)}
          title={app.name}
          className="relative flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer"
          style={{
            width: size, height: size,
            background: isFocused
              ? `linear-gradient(135deg, ${theme.accent}45, ${theme.accent}25)`
              : 'rgba(255,255,255,0.08)',
            border: isFocused
              ? `1px solid ${theme.accent}55`
              : '1px solid rgba(255,255,255,0.06)',
            boxShadow: isFocused
              ? `0 0 18px ${theme.accent}35, 0 4px 12px rgba(0,0,0,0.4)`
              : hoveredIdx === idx
                ? '0 8px 24px rgba(0,0,0,0.5)'
                : '0 2px 6px rgba(0,0,0,0.3)',
            transform: isBouncing
              ? 'translateY(-14px)'
              : 'translateY(0)',
          }}>
          <DynIcon name={app.icon}
            size={Math.round(size * 0.5)}
            style={{ color: isFocused ? theme.accent : 'rgba(255,255,255,0.85)' }} />
        </button>

        {/* Running dot */}
        {isOpen && (
          <div className="absolute -bottom-1.5 flex gap-0.5">
            {windows.filter(w => w.appId === appId && w.state !== 'minimized').slice(0, 3).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full"
                style={{ background: isFocused ? theme.accent : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={dockRef}
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[800] flex items-end gap-1.5 px-3 py-2 rounded-2xl"
      style={{
        background: 'rgba(12,12,22,0.72)',
        backdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 -2px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.6)',
      }}
      onMouseLeave={() => setHoveredIdx(null)}>

      {/* App launcher button */}
      <div className="relative flex flex-col items-center group"
        onMouseEnter={() => setHoveredIdx(-1)}
        onMouseLeave={() => setHoveredIdx(null)}>
        <div className="absolute bottom-full mb-2 px-2.5 py-1 rounded-lg text-xs text-white font-medium whitespace-nowrap pointer-events-none z-20 transition-all"
          style={{ background: 'rgba(12,12,22,0.92)', border: '1px solid rgba(255,255,255,0.1)', opacity: hoveredIdx === -1 ? 1 : 0, transform: hoveredIdx === -1 ? 'translateY(0)' : 'translateY(6px)' }}>
          Applications
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(12,12,22,0.92)' }} />
        </div>
        <button onClick={toggleAppLauncher}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}15)`,
            border: `1px solid ${theme.accent}40`,
            boxShadow: hoveredIdx === -1 ? `0 0 20px ${theme.accent}30, 0 8px 24px rgba(0,0,0,0.5)` : '0 2px 6px rgba(0,0,0,0.3)',
            transform: hoveredIdx === -1 ? `scale(${MAX_SIZE / BASE_SIZE})` : 'scale(1)',
          }}>
          <LayoutGrid size={20} style={{ color: theme.accent }} />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch my-1.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Pinned apps */}
      {pinned.map((item, i) => renderIcon(item.appId, i))}

      {/* Divider for open unpinned */}
      {openUnpinned.length > 0 && (
        <div className="w-px self-stretch my-1.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
      )}

      {/* Open unpinned apps */}
      {openUnpinned.map((item, i) => renderIcon(item.appId, pinned.length + i))}
    </div>
  );
});
