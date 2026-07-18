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
  const { contextMenu, theme, hideContextMenu, openWindow, pinDockItem, unpinDockItem, addDesktopIcon, minimizeAll, cascadeWindows, setAppLauncher, closeWindow, windows } = useOSStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) hideContextMenu();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') hideContextMenu(); };
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler, true); document.removeEventListener('keydown', esc); };
  }, [contextMenu.visible, hideContextMenu]);

  if (!contextMenu.visible) return null;

  // Clamp to viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const menuW = 200, menuH = contextMenu.items.filter((i) => !i.divider).length * 30 + 12;
  const x = Math.min(contextMenu.x, vw - menuW - 8);
  const y = Math.min(contextMenu.y, vh - menuH - 8);

  const handleAction = (action: string) => {
    hideContextMenu();
    const [cmd, arg] = action.split(':');
    switch (cmd) {
      case 'open': openWindow(arg); break;
      case 'pin': pinDockItem(arg); break;
      case 'unpin': unpinDockItem(arg); break;
      case 'close': {
        const w = windows.find(w => w.appId === arg);
        if (w) closeWindow(w.id);
        break;
      }
      case 'launcher': setAppLauncher(true); break;
      case 'minimize-all': minimizeAll(); break;
      case 'cascade': cascadeWindows(); break;
      case 'wallpaper': openWindow('settings'); break;
      default: break;
    }
  };

  return (
    <div
      ref={ref}
      className="fixed z-[999] py-1.5 rounded-xl overflow-hidden select-none"
      style={{
        left: x, top: y, minWidth: 200,
        background: 'rgba(18,18,30,0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        animation: 'fade-in 0.12s ease-out',
      }}
    >
      {contextMenu.items.map((item) => {
        if (item.divider) return <div key={item.id} className="my-1 h-px mx-2" style={{ background: 'rgba(255,255,255,0.06)' }} />;
        return (
          <button
            key={item.id}
            disabled={item.disabled}
            onClick={() => handleAction(item.action)}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
            style={{ color: 'rgba(255,255,255,0.80)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.accent}20`; e.currentTarget.style.color = theme.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
          >
            {item.icon && <DynIcon name={item.icon} size={13} />}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && <span className="text-[10px] opacity-40">{item.shortcut}</span>}
            {item.toggle && (
              <div className={`w-3 h-3 rounded-full border transition-all ${item.toggled ? 'border-transparent' : 'border-white/30'}`}
                style={{ background: item.toggled ? theme.accent : 'transparent' }} />
            )}
          </button>
        );
      })}
    </div>
  );
});
