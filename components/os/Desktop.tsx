'use client';
import React, { memo, useRef, useState, useCallback, useEffect } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { DesktopIcon } from '@/types';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

/* ── Single desktop icon ─────────────────────────────────────── */
const DesktopIconItem = memo(function DesktopIconItem({ icon }: { icon: DesktopIcon }) {
  const { theme, openWindow, updateDesktopIconPos, selectDesktopIcon, showContextMenu } = useOSStore();
  const drag      = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const clickTime = useRef(0);
  const clickRef  = useRef(0); // click count

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    selectDesktopIcon(icon.id);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: icon.position.x, oy: icon.position.y, moved: false };

    const move = (me: MouseEvent) => {
      if (!drag.current) return;
      const dx = me.clientX - drag.current.sx, dy = me.clientY - drag.current.sy;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        drag.current.moved = true;
        const nx = Math.max(0, Math.min(drag.current.ox + dx, window.innerWidth  - 80));
        const ny = Math.max(28, Math.min(drag.current.oy + dy, window.innerHeight - 100));
        updateDesktopIconPos(icon.id, { x: nx, y: ny });
      }
    };

    const up = (ue: MouseEvent) => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup',   up);
      if (!drag.current?.moved) {
        const now = Date.now();
        if (now - clickTime.current < 380) {
          // Double click — open app
          if (icon.appId) openWindow(icon.appId);
          clickRef.current = 0;
        } else {
          clickRef.current = 1;
          clickTime.current = now;
        }
      }
      drag.current = null;
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup',   up);
  }, [icon, openWindow, updateDesktopIconPos, selectDesktopIcon]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, 'file', [
      { id: 'open',   label: 'Open',               icon: 'ExternalLink', action: `open:${icon.appId}` },
      { id: 'd1',     label: '',                   action: '',           divider: true },
      { id: 'rename', label: 'Rename',              icon: 'Pencil',       action: `rename:${icon.id}`, disabled: true },
      { id: 'remove', label: 'Remove from Desktop', icon: 'Trash2',       action: `remove:${icon.id}` },
    ]);
  }, [icon, showContextMenu]);

  return (
    <div
      data-desktop-icon="true"
      className="absolute flex flex-col items-center gap-1 group"
      style={{ left: icon.position.x, top: icon.position.y, width: 76, userSelect: 'none', cursor: 'default' }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Icon box */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-150"
        style={{
          background: icon.isSelected ? `${theme.accent}28` : 'rgba(255,255,255,0.07)',
          border:     icon.isSelected ? `1.5px solid ${theme.accent}55` : '1.5px solid rgba(255,255,255,0.10)',
          boxShadow:  icon.isSelected ? `0 0 16px ${theme.accent}30` : '0 2px 8px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          transform: 'scale(1)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.06)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
      >
        <DynIcon
          name={icon.icon}
          size={28}
          style={{ color: icon.isSelected ? theme.accent : 'rgba(255,255,255,0.88)' }}
        />
      </div>

      {/* Label */}
      <div
        className="px-1.5 py-0.5 rounded text-center"
        style={{
          background:    icon.isSelected ? `${theme.accent}45` : 'rgba(0,0,0,0.60)',
          backdropFilter: 'blur(6px)',
          maxWidth: 76,
        }}
      >
        <p
          className="text-[11px] font-medium text-white leading-tight text-center"
          style={{
            textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {icon.name}
        </p>
      </div>
    </div>
  );
});

/* ── Desktop canvas ─────────────────────────────────────────── */
export default memo(function Desktop() {
  const { theme, desktopIcons, selectDesktopIcon, showContextMenu, hideContextMenu, toggleAppLauncher } = useOSStore();
  const selOrigin = useRef<{ sx: number; sy: number } | null>(null);
  const [selRect, setSelRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest('[data-desktop-icon]')) return;
    showContextMenu(e.clientX, e.clientY, 'desktop', [
      { id: 'launcher',     label: 'Open App Launcher', icon: 'LayoutGrid',  action: 'launcher' },
      { id: 'd1',           label: '',                  action: '',           divider: true },
      { id: 'cascade',      label: 'Cascade Windows',   icon: 'Layers',       action: 'cascade' },
      { id: 'minimize-all', label: 'Minimize All',      icon: 'Minimize2',    action: 'minimize-all' },
      { id: 'd2',           label: '',                  action: '',           divider: true },
      { id: 'wallpaper',    label: 'Change Wallpaper',  icon: 'Image',        action: 'wallpaper' },
    ]);
  }, [showContextMenu]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-desktop-icon]')) return;
    selectDesktopIcon(null);
    hideContextMenu();
    selOrigin.current = { sx: e.clientX, sy: e.clientY };

    const move = (me: MouseEvent) => {
      if (!selOrigin.current) return;
      const { sx, sy } = selOrigin.current;
      const x = Math.min(sx, me.clientX), y = Math.min(sy, me.clientY);
      const w = Math.abs(me.clientX - sx), h = Math.abs(me.clientY - sy);
      if (w > 6 || h > 6) setSelRect({ x, y, w, h });
    };
    const up = () => {
      selOrigin.current = null;
      setSelRect(null);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup',   up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup',   up);
  }, [selectDesktopIcon, hideContextMenu]);

  // Double-click desktop to open launcher
  const handleDblClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-desktop-icon]')) return;
    toggleAppLauncher();
  }, [toggleAppLauncher]);

  // Wallpaper style
  const wallStyle: React.CSSProperties = theme.wallpaper
    ? { backgroundImage: `url(${theme.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : { background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 40%, #0d1a2e 100%)' };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ top: 28, bottom: 40, ...wallStyle }}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDblClick}
    >
      {/* Slight vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)' }}
      />

      {/* Desktop icons */}
      {desktopIcons.map(icon => (
        <DesktopIconItem key={icon.id} icon={icon} />
      ))}

      {/* Selection rectangle */}
      {selRect && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: selRect.x, top: selRect.y, width: selRect.w, height: selRect.h,
            background: `${theme.accent}12`,
            border: `1px solid ${theme.accent}50`,
            borderRadius: 4,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
});
