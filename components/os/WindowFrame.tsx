'use client';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { OSWindow } from '@/types';
import { useOSStore } from '@/hooks/useOSStore';

const TOP_PANEL_H   = 28;
const TASKBAR_H     = 40;
const HANDLE        = 8;
const CORNER        = 16;
const MIN_W         = 280;
const MIN_H         = 180;

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

interface Props { window: OSWindow; children: React.ReactNode }

export default memo(function WindowFrame({ window: win, children }: Props) {
  const { theme, focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, moveWindow, resizeWindow } = useOSStore();
  const frameRef  = useRef<HTMLDivElement>(null);
  const drag      = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resRef    = useRef<{ sx: number; sy: number; ow: number; oh: number; ox: number; oy: number; edge: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isMax = win.state === 'maximized';
  const isMin = win.state === 'minimized';
  const dk    = theme.mode === 'dark';

  const handleFocus = useCallback(() => { if (!win.isFocused) focusWindow(win.id); }, [win.id, win.isFocused, focusWindow]);

  // ── Global mouse move / up ──────────────────────────────────
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (drag.current) {
        const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
        const vw = globalThis.innerWidth  ?? 1280;
        const vh = globalThis.innerHeight ?? 800;
        let nx = drag.current.ox + dx, ny = drag.current.oy + dy;
        ny = Math.max(TOP_PANEL_H, Math.min(vh - TASKBAR_H - 36, ny));
        nx = Math.min(Math.max(nx, -(win.size.width - 100)), vw - 100);
        moveWindow(win.id, { x: nx, y: ny });
      } else if (resRef.current) {
        const r  = resRef.current;
        const dx = e.clientX - r.sx, dy = e.clientY - r.sy;
        let nw = r.ow, nh = r.oh, nx = r.ox, ny = r.oy;
        if (r.edge.includes('e'))  nw = Math.max(MIN_W, r.ow + dx);
        if (r.edge.includes('s'))  nh = Math.max(MIN_H, r.oh + dy);
        if (r.edge.includes('w')) { nw = Math.max(MIN_W, r.ow - dx); nx = r.ox + (r.ow - nw); }
        if (r.edge.includes('n')) { nh = Math.max(MIN_H, r.oh - dy); ny = Math.max(TOP_PANEL_H, r.oy + (r.oh - nh)); }
        moveWindow(win.id,   { x: nx, y: ny });
        resizeWindow(win.id, { width: nw, height: nh });
      }
    };
    const up = () => { drag.current = null; resRef.current = null; setIsDragging(false); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup',  up);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
  }, [win.id, win.size, moveWindow, resizeWindow]);

  const startResize = (e: React.MouseEvent, edge: string) => {
    if (isMax) return;
    e.preventDefault(); e.stopPropagation();
    resRef.current = { sx: e.clientX, sy: e.clientY, ow: win.size.width, oh: win.size.height, ox: win.position.x, oy: win.position.y, edge };
    focusWindow(win.id);
  };

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMax) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    drag.current = { sx: e.clientX, sy: e.clientY, ox: win.position.x, oy: win.position.y };
    setIsDragging(true);
    focusWindow(win.id);
  };

  const handleTitleDblClick = () => {
    if (isMax) restoreWindow(win.id); else maximizeWindow(win.id);
  };

  if (isMin) return null;

  const style: React.CSSProperties = isMax
    ? { position: 'fixed', left: 0, top: TOP_PANEL_H, right: 0, bottom: TASKBAR_H, zIndex: win.zIndex }
    : { position: 'fixed', left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height, zIndex: win.zIndex };

  const winBg   = dk ? 'rgba(18,18,30,0.97)' : 'rgba(248,248,252,0.97)';
  const titleBg = win.isFocused
    ? dk ? 'rgba(28,28,44,0.97)' : 'rgba(230,230,242,0.97)'
    : dk ? 'rgba(20,20,34,0.93)' : 'rgba(240,240,248,0.93)';
  const titleBorder = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const titleText   = dk ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.72)';

  // Handle colour for resize borders
  const rColor = `${theme.accent}25`;

  return (
    <div
      ref={frameRef}
      className="window-frame flex flex-col overflow-hidden rounded-xl"
      style={{
        ...style,
        background: winBg,
        border: win.isFocused
          ? `1px solid ${theme.accent}35`
          : `1px solid ${dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: win.isFocused
          ? dk ? `0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px ${theme.accent}20` : `0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px ${theme.accent}20`
          : dk ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.10)',
        cursor: isDragging ? 'grabbing' : 'default',
        animation: 'windowOpen 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseDown={handleFocus}
    >
      {/* ── EDGE RESIZE HANDLES (8 zones — never block app content) ── */}
      {!isMax && (
        <>
          {/* Edges */}
          <div className="absolute top-0 left-4 right-4 z-30" style={{ height: HANDLE, cursor: 'n-resize' }} onMouseDown={e => startResize(e, 'n')} />
          <div className="absolute bottom-0 left-4 right-4 z-30" style={{ height: HANDLE, cursor: 's-resize' }} onMouseDown={e => startResize(e, 's')} />
          <div className="absolute left-0 top-4 bottom-4 z-30" style={{ width: HANDLE, cursor: 'w-resize' }} onMouseDown={e => startResize(e, 'w')} />
          <div className="absolute right-0 top-4 bottom-4 z-30" style={{ width: HANDLE, cursor: 'e-resize' }} onMouseDown={e => startResize(e, 'e')} />
          {/* Corners */}
          <div className="absolute top-0 left-0 z-30" style={{ width: CORNER, height: CORNER, cursor: 'nw-resize' }} onMouseDown={e => startResize(e, 'nw')} />
          <div className="absolute top-0 right-0 z-30" style={{ width: CORNER, height: CORNER, cursor: 'ne-resize' }} onMouseDown={e => startResize(e, 'ne')} />
          <div className="absolute bottom-0 left-0 z-30" style={{ width: CORNER, height: CORNER, cursor: 'sw-resize' }} onMouseDown={e => startResize(e, 'sw')} />
          <div className="absolute bottom-0 right-0 z-30" style={{ width: CORNER, height: CORNER, cursor: 'se-resize', borderRight: `2px solid ${rColor}`, borderBottom: `2px solid ${rColor}`, borderRadius: '0 0 8px 0' }} onMouseDown={e => startResize(e, 'se')} />
        </>
      )}

      {/* ── TITLE BAR ── */}
      <div
        className="flex items-center px-3 gap-2 flex-shrink-0 z-10 relative select-none"
        style={{
          height: 36,
          background: titleBg,
          borderBottom: `1px solid ${titleBorder}`,
          cursor: isMax ? 'default' : isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleTitleDblClick}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5 flex-shrink-0 group/tl">
          <button
            className="flex items-center justify-center rounded-full transition-all"
            style={{ background: '#FF5F57', width: 13, height: 13 }}
            onClick={e => { e.stopPropagation(); closeWindow(win.id); }}
            title="Close"
          >
            <Icons.X size={7} className="opacity-0 group-hover/tl:opacity-80" strokeWidth={2.5} />
          </button>
          <button
            className="flex items-center justify-center rounded-full transition-all"
            style={{ background: '#FFBD2E', width: 13, height: 13 }}
            onClick={e => { e.stopPropagation(); minimizeWindow(win.id); }}
            title="Minimize"
          >
            <Icons.Minus size={7} className="opacity-0 group-hover/tl:opacity-80" strokeWidth={2.5} />
          </button>
          <button
            className="flex items-center justify-center rounded-full transition-all"
            style={{ background: '#28C840', width: 13, height: 13 }}
            onClick={e => { e.stopPropagation(); isMax ? restoreWindow(win.id) : maximizeWindow(win.id); }}
            title={isMax ? 'Restore' : 'Maximize'}
          >
            {isMax
              ? <Icons.Minimize2 size={7} className="opacity-0 group-hover/tl:opacity-80" strokeWidth={2.5} />
              : <Icons.Maximize2 size={7} className="opacity-0 group-hover/tl:opacity-80" strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* Centered title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-center">
          <DynIcon name={win.icon} size={12} style={{ color: theme.accent, flexShrink: 0 }} />
          <span className="text-xs font-medium truncate" style={{ color: titleText }}>{win.title}</span>
        </div>

        {/* Right controls */}
        <div
          className="w-14 flex-shrink-0 flex items-center justify-end gap-0.5"
          style={{ opacity: 0, transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
        >
          <button
            onClick={e => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="p-0.5 rounded transition-colors"
            style={{ color: titleText }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(128,128,128,0.2)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
            title="Minimize"
          >
            <Icons.Minus size={10} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); isMax ? restoreWindow(win.id) : maximizeWindow(win.id); }}
            className="p-0.5 rounded transition-colors"
            style={{ color: titleText }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(128,128,128,0.2)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
            title={isMax ? 'Restore' : 'Maximize'}
          >
            {isMax ? <Icons.Minimize2 size={10} /> : <Icons.Maximize2 size={10} />}
          </button>
        </div>
      </div>

      {/* ── APP CONTENT — FULLY CLICKABLE (no z-index overlay above this) ── */}
      <div className="flex-1 overflow-hidden relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
});
