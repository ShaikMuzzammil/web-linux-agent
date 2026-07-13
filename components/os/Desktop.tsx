'use client';
import { memo, useRef, useState, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { DesktopIcon } from '@/types';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

interface IconProps { icon: DesktopIcon }

const DesktopIconItem = memo(function DesktopIconItem({ icon }: IconProps) {
  const { theme, openWindow, updateDesktopIconPos, selectDesktopIcon, showContextMenu, hideContextMenu } = useOSStore();
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const lastClick = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectDesktopIcon(icon.id);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: icon.position.x, oy: icon.position.y, moved: false };

    const move = (me: MouseEvent) => {
      if (!drag.current) return;
      const dx = me.clientX - drag.current.sx, dy = me.clientY - drag.current.sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        drag.current.moved = true;
        const nx = Math.max(0, drag.current.ox + dx);
        const ny = Math.max(28, drag.current.oy + dy);
        updateDesktopIconPos(icon.id, { x: nx, y: ny });
      }
    };

    const up = () => {
      if (drag.current && !drag.current.moved) {
        const now = Date.now();
        if (now - lastClick.current < 400 && icon.appId) {
          openWindow(icon.appId);
        }
        lastClick.current = now;
      }
      drag.current = null;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }, [icon, openWindow, updateDesktopIconPos, selectDesktopIcon]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, 'file', [
      { id: 'open', label: 'Open', icon: 'ExternalLink', action: `open:${icon.appId}` },
      { id: 'd1', label: '', action: '', divider: true },
      { id: 'rename', label: 'Rename', icon: 'Pencil', action: `rename:${icon.id}`, disabled: true },
      { id: 'delete', label: 'Remove from Desktop', icon: 'Trash2', action: `remove:${icon.id}` },
    ]);
  }, [icon, showContextMenu]);

  return (
    <div
      className="absolute flex flex-col items-center gap-1 cursor-pointer group"
      style={{ left: icon.position.x, top: icon.position.y, width: 72, userSelect: 'none' }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: icon.isSelected ? `${theme.accent}30` : 'rgba(255,255,255,0.06)',
          border: icon.isSelected ? `1px solid ${theme.accent}50` : '1px solid rgba(255,255,255,0.08)',
          boxShadow: icon.isSelected ? `0 0 12px ${theme.accent}30` : 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        <DynIcon name={icon.icon} size={28} style={{ color: icon.isSelected ? theme.accent : 'rgba(255,255,255,0.85)' }} />
      </div>

      {/* Label */}
      <div
        className="px-1.5 py-0.5 rounded text-center"
        style={{
          background: icon.isSelected ? `${theme.accent}40` : 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <p className="text-[11px] font-medium text-white leading-tight text-center" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', lineClamp: 2, WebkitLineClamp: 2 }}>
          {icon.name}
        </p>
      </div>
    </div>
  );
});

export default memo(function Desktop() {
  const { theme, desktopIcons, windows, selectDesktopIcon, showContextMenu, hideContextMenu } = useOSStore();
  const selectionRef = useRef<{ sx: number; sy: number } | null>(null);
  const [selRect, setSelRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest('[data-desktop-icon]')) return;
    showContextMenu(e.clientX, e.clientY, 'desktop', [
      { id: 'launcher', label: 'Open App Launcher', icon: 'LayoutGrid', action: 'launcher' },
      { id: 'd1', label: '', action: '', divider: true },
      { id: 'cascade', label: 'Cascade Windows', icon: 'Layers', action: 'cascade' },
      { id: 'minimize-all', label: 'Minimize All', icon: 'Minimize2', action: 'minimize-all' },
      { id: 'd2', label: '', action: '', divider: true },
      { id: 'wallpaper', label: 'Change Wallpaper', icon: 'Image', action: 'wallpaper' },
    ]);
  }, [showContextMenu]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-desktop-icon]')) return;
    selectDesktopIcon(null);
    hideContextMenu();
    selectionRef.current = { sx: e.clientX, sy: e.clientY };

    const move = (me: MouseEvent) => {
      if (!selectionRef.current) return;
      const { sx, sy } = selectionRef.current;
      const x = Math.min(sx, me.clientX), y = Math.min(sy, me.clientY);
      const w = Math.abs(me.clientX - sx), h = Math.abs(me.clientY - sy);
      if (w > 4 || h > 4) setSelRect({ x, y, w, h });
    };

    const up = () => {
      selectionRef.current = null;
      setSelRect(null);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }, [selectDesktopIcon, hideContextMenu]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ top: 28, bottom: 0 }}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
    >
      {/* Desktop icons */}
      {desktopIcons.map((icon) => (
        <div key={icon.id} data-desktop-icon="true">
          <DesktopIconItem icon={icon} />
        </div>
      ))}

      {/* Selection rectangle */}
      {selRect && (
        <div
          className="fixed pointer-events-none z-[1]"
          style={{
            left: selRect.x, top: selRect.y, width: selRect.w, height: selRect.h,
            background: `${theme.accent}15`,
            border: `1px solid ${theme.accent}40`,
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
});
