// ============================================================
// Dock — Magnified, context-menu, bounce, open/focused dots
// ============================================================

import { useCallback, memo, useState, useEffect, useRef } from 'react';
import { useOS } from '@/hooks/useOSStore';
import { getAppById } from '@/apps/registry';
import { LayoutGrid, Trash2, Circle } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Circle {...props} />;
};

interface CtxMenu {
  appId: string;
  x: number;
  y: number;
  isOpen: boolean;
  isPinned: boolean;
  windows: { id: string; title: string }[];
}

const Dock = memo(function Dock() {
  const { state, dispatch } = useOS();
  const { dockItems, windows } = state;
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(new Set<string>());
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Bounce animation trigger
  useEffect(() => {
    const tooBounce = dockItems.filter(d => d.bounce).map(d => d.appId);
    if (tooBounce.length === 0) return;
    setBouncing(prev => new Set([...prev, ...tooBounce]));
    tooBounce.forEach(id => dispatch({ type: 'BOUNCE_DOCK_ITEM', appId: id }));
    const t = setTimeout(() => setBouncing(new Set()), 600);
    return () => clearTimeout(t);
  }, [dockItems, dispatch]);

  // Close ctx menu on outside click
  useEffect(() => {
    if (!ctxMenu) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-dock-ctx]')) setCtxMenu(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ctxMenu]);

  const handleAppClick = useCallback((appId: string) => {
    setCtxMenu(null);
    const openWins = windows.filter(w => w.appId === appId);
    if (openWins.length === 0) {
      dispatch({ type: 'OPEN_WINDOW', appId });
      return;
    }
    const anyVisible = openWins.some(w => w.state !== 'minimized');
    if (!anyVisible) {
      // Restore all minimized
      openWins.forEach(w => dispatch({ type: 'FOCUS_WINDOW', windowId: w.id }));
    } else {
      const focused = openWins.find(w => w.isFocused);
      if (focused) {
        dispatch({ type: 'MINIMIZE_WINDOW', windowId: focused.id });
      } else {
        const top = openWins.filter(w => w.state !== 'minimized').reduce((a, b) => a.zIndex > b.zIndex ? a : b);
        dispatch({ type: 'FOCUS_WINDOW', windowId: top.id });
      }
    }
  }, [dispatch, windows]);

  const handleContextMenu = useCallback((e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    const item = dockItems.find(d => d.appId === appId);
    const appWins = windows.filter(w => w.appId === appId).map(w => ({ id: w.id, title: w.title }));
    setCtxMenu({
      appId,
      x: e.clientX,
      y: e.clientY - 10,
      isOpen: item?.isOpen || false,
      isPinned: item?.isPinned || false,
      windows: appWins,
    });
  }, [dockItems, windows]);

  const pinnedItems = dockItems.filter(d => d.isPinned);
  const openUnpinned = dockItems.filter(d => !d.isPinned && d.isOpen);

  const renderDockIcon = (appId: string, isTrash = false, isLauncher = false) => {
    const item = dockItems.find(d => d.appId === appId);
    const app = getAppById(appId);
    const isBouncing = bouncing.has(appId);
    const isHovered = hoveredApp === appId;
    const isOpen = item?.isOpen || false;
    const isFocused = item?.isFocused || false;
    const openWinCount = windows.filter(w => w.appId === appId && w.state !== 'minimized').length;

    const scale = isHovered ? 1.25 : 1;

    return (
      <div
        key={appId}
        className="relative flex flex-col items-center"
        onMouseEnter={() => setHoveredApp(appId)}
        onMouseLeave={() => setHoveredApp(null)}
        onContextMenu={(e) => !isLauncher && !isTrash && handleContextMenu(e, appId)}
        style={{ transition: 'transform 150ms ease', transform: `scale(${scale})`, transformOrigin: 'bottom center', marginLeft: 2, marginRight: 2 }}
      >
        {/* Tooltip */}
        {isHovered && (
          <div
            className="absolute bottom-full mb-3 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap z-[4000] pointer-events-none"
            style={{
              background: 'rgba(30,30,30,0.95)',
              color: '#E0E0E0',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              animation: 'tooltipIn 100ms ease',
            }}
          >
            {isLauncher ? 'App Launcher' : isTrash ? 'Trash' : app?.name || appId}
          </div>
        )}

        {/* Icon button */}
        <button
          onClick={() => isTrash ? dispatch({ type: 'OPEN_WINDOW', appId: 'filemanager' })
                       : isLauncher ? dispatch({ type: 'TOGGLE_APP_LAUNCHER' })
                       : handleAppClick(appId)}
          className="w-11 h-11 rounded-[14px] flex items-center justify-center transition-all"
          style={{
            background: isHovered
              ? 'rgba(255,255,255,0.12)'
              : isFocused
              ? 'rgba(124,77,255,0.15)'
              : 'rgba(255,255,255,0.05)',
            transform: isBouncing ? 'translateY(-8px)' : 'scale(1)',
            transition: isBouncing ? 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)' : 'all 150ms ease',
            boxShadow: isFocused ? '0 0 0 1px rgba(124,77,255,0.3)' : 'none',
          }}
        >
          {isLauncher ? (
            <LayoutGrid size={22} style={{ color: '#E0E0E0' }} />
          ) : isTrash ? (
            <Trash2 size={22} style={{ color: '#E0E0E0', opacity: 0.75 }} />
          ) : (
            <DynamicIcon name={app?.icon || 'Circle'} size={22} style={{ color: '#E0E0E0' }} />
          )}
        </button>

        {/* Open indicator dots */}
        {isOpen && !isLauncher && !isTrash && (
          <div className="flex items-center gap-0.5 mt-0.5" style={{ height: 4 }}>
            {Array.from({ length: Math.min(openWinCount || 1, 3) }).map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: openWinCount > 1 ? 3 : 4,
                  height: openWinCount > 1 ? 3 : 4,
                  background: isFocused ? 'var(--accent-primary)' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}
        {(!isOpen || isLauncher || isTrash) && <div style={{ height: 4 }} />}
      </div>
    );
  };

  return (
    <>
      {/* Context Menu */}
      {ctxMenu && (
        <div
          data-dock-ctx
          className="fixed z-[6000] py-1.5 rounded-xl"
          style={{
            left: ctxMenu.x,
            top: ctxMenu.y,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(30,30,30,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            minWidth: 200,
            animation: 'menuAppear 120ms ease',
          }}
        >
          {/* App name header */}
          <div className="px-3 py-1.5 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-bold text-white/50">{getAppById(ctxMenu.appId)?.name || ctxMenu.appId}</span>
          </div>

          {/* Open windows list */}
          {ctxMenu.windows.map(w => (
            <button
              key={w.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/[0.06] text-left"
              onClick={() => { dispatch({ type: 'FOCUS_WINDOW', windowId: w.id }); setCtxMenu(null); }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
              <span className="text-white/80 truncate" style={{ maxWidth: 160 }}>{w.title}</span>
            </button>
          ))}

          {ctxMenu.windows.length === 0 ? (
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/[0.06] text-left"
              onClick={() => { dispatch({ type: 'OPEN_WINDOW', appId: ctxMenu.appId }); setCtxMenu(null); }}
            >
              <span className="text-white/80">Open</span>
            </button>
          ) : (
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/[0.06] text-left"
              onClick={() => { dispatch({ type: 'OPEN_WINDOW', appId: ctxMenu.appId }); setCtxMenu(null); }}
            >
              <span className="text-white/80">New Window</span>
            </button>
          )}

          <div className="mx-2 my-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/[0.06] text-left"
            onClick={() => {
              dispatch({ type: ctxMenu.isPinned ? 'UNPIN_DOCK_ITEM' : 'PIN_DOCK_ITEM', appId: ctxMenu.appId });
              setCtxMenu(null);
            }}
          >
            <span className="text-white/80">{ctxMenu.isPinned ? 'Unpin from Dock' : 'Pin to Dock'}</span>
          </button>

          {ctxMenu.isOpen && (
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/[0.06] text-left"
              onClick={() => {
                const wins = windows.filter(w => w.appId === ctxMenu.appId);
                wins.forEach(w => dispatch({ type: 'CLOSE_WINDOW', windowId: w.id }));
                setCtxMenu(null);
              }}
            >
              <span style={{ color: '#F44336' }}>Quit</span>
            </button>
          )}
        </div>
      )}

      {/* Dock */}
      <div
        ref={dockRef}
        className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[150] flex items-end px-3 pt-2 pb-1"
        style={{
          background: 'rgba(28,28,28,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.06)',
        }}
      >
        {/* App launcher */}
        {renderDockIcon('launcher', false, true)}

        {/* Divider */}
        <div className="mx-2" style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />

        {/* Pinned apps */}
        {pinnedItems.map(item => renderDockIcon(item.appId))}

        {/* Open unpinned apps */}
        {openUnpinned.length > 0 && (
          <>
            <div className="mx-2" style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
            {openUnpinned.map(item => renderDockIcon(item.appId))}
          </>
        )}

        {/* Trash */}
        <div className="mx-2" style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
        {renderDockIcon('trash', true)}
      </div>

      <style>{`
        @keyframes tooltipIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes menuAppear { from { opacity:0; transform:scale(0.95) translateY(4px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes snapAppear { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </>
  );
});

export default Dock;
