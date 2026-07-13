'use client';
import { memo, useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { getAppById } from '@/components/apps/registry';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

export default memo(function Dock() {
  const { dockItems, windows, theme, openWindow, focusWindow, toggleAppLauncher, pinDockItem, unpinDockItem, showContextMenu } = useOSStore();
  const [bouncing, setBouncing] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  // Bounce newly opened apps
  useEffect(() => {
    const bounceIds = dockItems.filter((d) => d.bounce).map((d) => d.appId);
    if (bounceIds.length > 0) {
      setBouncing((prev) => new Set([...prev, ...bounceIds]));
      const t = setTimeout(() => setBouncing(new Set()), 420);
      return () => clearTimeout(t);
    }
  }, [dockItems]);

  const handleClick = useCallback((appId: string) => {
    const win = windows.find((w) => w.appId === appId && w.state !== 'minimized');
    if (win) {
      focusWindow(win.id);
    } else {
      const minWin = windows.find((w) => w.appId === appId && w.state === 'minimized');
      if (minWin) {
        focusWindow(minWin.id);
      } else {
        openWindow(appId);
      }
    }
  }, [windows, focusWindow, openWindow]);

  const handleRightClick = useCallback((e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    const item = dockItems.find((d) => d.appId === appId);
    if (!item) return;
    showContextMenu(e.clientX, e.clientY, 'dockIcon', [
      { id: 'open', label: 'Open', icon: 'ExternalLink', action: `open:${appId}` },
      { id: 'div1', label: '', action: '', divider: true },
      item.isPinned
        ? { id: 'unpin', label: 'Remove from Dock', icon: 'PinOff', action: `unpin:${appId}` }
        : { id: 'pin', label: 'Keep in Dock', icon: 'Pin', action: `pin:${appId}` },
    ], { appId });
  }, [dockItems, showContextMenu]);

  const pinned = dockItems.filter((d) => d.isPinned);
  const openUnpinned = dockItems.filter((d) => !d.isPinned && d.isOpen);

  const renderIcon = (appId: string) => {
    const item = dockItems.find((d) => d.appId === appId);
    const app = getAppById(appId);
    if (!app) return null;
    const isOpen = windows.some((w) => w.appId === appId);
    const isFocused = windows.some((w) => w.appId === appId && w.isFocused);
    const isBouncing = bouncing.has(appId);
    const isHov = hovered === appId;

    return (
      <div key={appId} className="relative flex flex-col items-center group">
        {/* Tooltip */}
        <div
          className="absolute bottom-full mb-2 px-2 py-1 rounded-lg text-xs text-white font-medium whitespace-nowrap transition-all pointer-events-none z-10"
          style={{
            background: 'rgba(15,15,25,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: isHov ? 1 : 0,
            transform: isHov ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.95)',
          }}
        >
          {app.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgba(15,15,25,0.9)' }} />
        </div>

        <button
          onClick={() => handleClick(appId)}
          onContextMenu={(e) => handleRightClick(e, appId)}
          onMouseEnter={() => setHovered(appId)}
          onMouseLeave={() => setHovered(null)}
          title={app.name}
          className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{
            background: isFocused
              ? `linear-gradient(135deg, ${theme.accent}40, ${theme.accent}20)`
              : 'rgba(255,255,255,0.08)',
            border: isFocused ? `1px solid ${theme.accent}60` : '1px solid rgba(255,255,255,0.06)',
            transform: isBouncing ? 'translateY(-12px)' : isHov ? 'translateY(-4px) scale(1.1)' : 'translateY(0) scale(1)',
            boxShadow: isFocused ? `0 0 16px ${theme.accent}40` : isHov ? '0 8px 20px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          <DynIcon name={app.icon} size={22} style={{ color: isFocused ? theme.accent : 'rgba(255,255,255,0.85)' }} />
        </button>

        {/* Running indicator */}
        {isOpen && (
          <div
            className="absolute -bottom-1.5 w-1 h-1 rounded-full"
            style={{ background: isFocused ? theme.accent : 'rgba(255,255,255,0.4)' }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[800] flex items-end gap-1 px-3 py-2 rounded-2xl"
      style={{
        background: 'rgba(15,15,25,0.7)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* App grid button */}
      <div className="relative flex flex-col items-center group">
        <div
          className="absolute bottom-full mb-2 px-2 py-1 rounded-lg text-xs text-white font-medium whitespace-nowrap transition-all pointer-events-none z-10"
          style={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', opacity: hovered === '__grid' ? 1 : 0, transform: hovered === '__grid' ? 'translateY(0)' : 'translateY(4px)' }}
        >
          All Apps
        </div>
        <button
          onClick={toggleAppLauncher}
          onMouseEnter={() => setHovered('__grid')}
          onMouseLeave={() => setHovered(null)}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.06)',
            transform: hovered === '__grid' ? 'translateY(-4px) scale(1.1)' : 'translateY(0) scale(1)',
          }}
        >
          <LayoutGrid size={20} className="text-white/70" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 mx-1 rounded-full self-center" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Pinned apps */}
      {pinned.map((d) => renderIcon(d.appId))}

      {/* Open-but-unpinned apps */}
      {openUnpinned.length > 0 && (
        <>
          <div className="w-px h-8 mx-1 rounded-full self-center" style={{ background: 'rgba(255,255,255,0.1)' }} />
          {openUnpinned.map((d) => renderIcon(d.appId))}
        </>
      )}

      {/* Divider + Trash */}
      <div className="w-px h-8 mx-1 rounded-full self-center" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="relative flex flex-col items-center group">
        <div
          className="absolute bottom-full mb-2 px-2 py-1 rounded-lg text-xs text-white font-medium whitespace-nowrap pointer-events-none z-10 transition-all"
          style={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', opacity: hovered === '__trash' ? 1 : 0 }}
        >Trash</div>
        <button
          onClick={() => openWindow('filemanager')}
          onMouseEnter={() => setHovered('__trash')}
          onMouseLeave={() => setHovered(null)}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.06)',
            transform: hovered === '__trash' ? 'translateY(-4px) scale(1.1)' : 'translateY(0) scale(1)',
          }}
        >
          <Trash2 size={20} className="text-white/70" />
        </button>
      </div>
    </div>
  );
});
