'use client';
import { memo, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : null;
};

export default memo(function ContextMenu() {
  const {
    contextMenu, theme, hideContextMenu,
    openWindow, pinDockItem, unpinDockItem,
    minimizeAll, cascadeWindows, setAppLauncher,
    closeWindow, windows, removeDesktopIcon,
    setTheme,
  } = useOSStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) hideContextMenu();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') hideContextMenu(); };
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler, true);
      document.removeEventListener('keydown', esc);
    };
  }, [contextMenu.visible, hideContextMenu]);

  if (!contextMenu.visible) return null;

  // Clamp menu to viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const menuW = 220;
  const menuH = (contextMenu.items.filter(i => !i.divider).length * 34) + 16;
  const x = Math.min(contextMenu.x, vw - menuW - 8);
  const y = Math.min(contextMenu.y, vh - menuH - 8);

  const handleAction = (action: string) => {
    hideContextMenu();
    const colonIdx = action.indexOf(':');
    const cmd = colonIdx >= 0 ? action.slice(0, colonIdx) : action;
    const arg = colonIdx >= 0 ? action.slice(colonIdx + 1) : '';

    switch (cmd) {
      case 'open':         openWindow(arg); break;
      case 'pin':          pinDockItem(arg); break;
      case 'unpin':        unpinDockItem(arg); break;
      case 'remove':       removeDesktopIcon(arg); break;
      case 'close': {
        const w = windows.find(w => w.appId === arg || w.id === arg);
        if (w) closeWindow(w.id);
        break;
      }
      case 'launcher':     setAppLauncher(true); break;
      case 'minimize-all': minimizeAll(); break;
      case 'cascade':      cascadeWindows(); break;
      case 'wallpaper':    openWindow('settings'); break;
      case 'theme':        setTheme({ mode: arg as 'dark' | 'light' }); break;
      default: break;
    }
  };

  return (
    <div
      ref={ref}
      className="fixed z-[9999] py-1.5 rounded-xl overflow-hidden select-none"
      style={{
        left: x, top: y, minWidth: menuW,
        background: 'rgba(15,15,28,0.98)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        animation: 'contextMenuIn 0.10s ease-out',
      }}
    >
      <style>{`@keyframes contextMenuIn { from { opacity:0; transform:scale(0.96) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

      {contextMenu.items.map((item) => {
        if (item.divider) return (
          <div key={item.id} className="my-1 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        );
        return (
          <button
            key={item.id}
            disabled={item.disabled}
            onClick={() => handleAction(item.action)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed text-left"
            style={{ color: 'rgba(255,255,255,0.82)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${theme.accent}22`;
              e.currentTarget.style.color      = theme.accent;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color      = 'rgba(255,255,255,0.82)';
            }}
          >
            {item.icon && (
              <span className="flex-shrink-0 w-4 flex items-center justify-center">
                <DynIcon name={item.icon} size={13} />
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] opacity-35 font-mono">{item.shortcut}</span>
            )}
            {item.toggle && (
              <div
                className="w-3 h-3 rounded-full border transition-all flex-shrink-0"
                style={{
                  background: item.toggled ? theme.accent : 'transparent',
                  borderColor: item.toggled ? theme.accent : 'rgba(255,255,255,0.3)',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});
