'use client';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { OSWindow } from '@/types';
import { useOSStore } from '@/hooks/useOSStore';

const TOP_PANEL_H = 28;
const RESIZE_HANDLE = 7;

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

interface Props { window: OSWindow; children: React.ReactNode }

export default memo(function WindowFrame({ window: win, children }: Props) {
  const { theme, focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, moveWindow, resizeWindow } = useOSStore();
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resize = useRef<{ sx: number; sy: number; ow: number; oh: number; ox: number; oy: number; edge: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isMax = win.state === 'maximized';
  const isMin = win.state === 'minimized';

  const handleFocus = useCallback(() => { if (!win.isFocused) focusWindow(win.id); }, [win.id, win.isFocused, focusWindow]);

  const getEdge = (e: React.MouseEvent<HTMLDivElement>): string => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    let edge = '';
    if (y < RESIZE_HANDLE) edge += 'n';
    if (y > r.height - RESIZE_HANDLE) edge += 's';
    if (x < RESIZE_HANDLE) edge += 'w';
    if (x > r.width - RESIZE_HANDLE) edge += 'e';
    return edge;
  };

  const getCursor = (e: React.MouseEvent<HTMLDivElement>): string => {
    if (isMax) return 'default';
    const m: Record<string, string> = { n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize', nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize' };
    return m[getEdge(e)] || 'default';
  };

  // Global mouse handlers
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (drag.current) {
        const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
        const vw = window.innerWidth;
        let nx = drag.current.ox + dx, ny = drag.current.oy + dy;
        ny = Math.max(TOP_PANEL_H, ny);
        nx = Math.min(Math.max(nx, -(win.size.width - 100)), vw - 100);
        moveWindow(win.id, { x: nx, y: ny });
      } else if (resize.current) {
        const r = resize.current;
        const dx = e.clientX - r.sx, dy = e.clientY - r.sy;
        let nw = r.ow, nh = r.oh, nx = r.ox, ny = r.oy;
        if (r.edge.includes('e')) nw = Math.max(320, r.ow + dx);
        if (r.edge.includes('s')) nh = Math.max(200, r.oh + dy);
        if (r.edge.includes('w')) { nw = Math.max(320, r.ow - dx); nx = r.ox + (r.ow - nw); }
        if (r.edge.includes('n')) { nh = Math.max(200, r.oh - dy); ny = Math.max(TOP_PANEL_H, r.oy + (r.oh - nh)); }
        moveWindow(win.id, { x: nx, y: ny });
        resizeWindow(win.id, { width: nw, height: nh });
      }
    };
    const up = () => { drag.current = null; resize.current = null; setIsDragging(false); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
  }, [win.id, win.size, moveWindow, resizeWindow]);

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

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMax) return;
    const edge = getEdge(e);
    if (!edge) return;
    e.preventDefault();
    e.stopPropagation();
    resize.current = { sx: e.clientX, sy: e.clientY, ow: win.size.width, oh: win.size.height, ox: win.position.x, oy: win.position.y, edge };
  };

  if (isMin) return null;

  const style: React.CSSProperties = isMax
    ? { position: 'fixed', left: 0, top: TOP_PANEL_H, right: 0, bottom: 0, zIndex: win.zIndex }
    : {
        position: 'fixed',
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      };

  return (
    <div
      ref={frameRef}
      className={`window-frame ${win.isFocused ? 'focused' : ''} flex flex-col overflow-hidden rounded-xl`}
      style={{
        ...style,
        background: theme.mode === 'dark' ? 'rgba(20,20,32,0.97)' : 'rgba(248,248,250,0.97)',
        border: win.isFocused ? `1px solid ${theme.accent}40` : '1px solid rgba(255,255,255,0.06)',
        cursor: isDragging ? 'grabbing' : 'default',
        animation: 'windowOpen 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseDown={handleFocus}
    >
      {/* Resize overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ cursor: 'default' }}
        onMouseDown={handleResizeMouseDown}
        onMouseMove={(e) => { if (frameRef.current) frameRef.current.style.cursor = getCursor(e); }}
        onMouseLeave={() => { if (frameRef.current) frameRef.current.style.cursor = 'default'; }}
      />

      {/* Title bar */}
      <div
        className="flex items-center px-3 gap-2 flex-shrink-0 z-10 relative"
        style={{
          height: 36,
          background: win.isFocused
            ? theme.mode === 'dark' ? 'rgba(30,30,45,0.95)' : 'rgba(230,230,240,0.95)'
            : theme.mode === 'dark' ? 'rgba(22,22,35,0.9)' : 'rgba(220,220,230,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          cursor: isMax ? 'default' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleTitleDblClick}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5 flex-shrink-0 group/tl">
          <button
            className="traffic-btn relative flex items-center justify-center"
            style={{ background: '#FF5F57', width: 13, height: 13 }}
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            title="Close">
            <span style={{ fontSize: 9, lineHeight: 1, color: "rgba(0,0,0,0.65)", fontWeight: 900 }}>✕</span>
          </button>
          <button
            className="traffic-btn relative flex items-center justify-center"
            style={{ background: '#FFBD2E', width: 13, height: 13 }}
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            title="Minimize">
            <span style={{ fontSize: 11, lineHeight: 1, color: "rgba(0,0,0,0.65)", fontWeight: 900 }}>−</span>
          </button>
          <button
            className="traffic-btn relative flex items-center justify-center"
            style={{ background: '#28C840', width: 13, height: 13 }}
            onClick={(e) => { e.stopPropagation(); isMax ? restoreWindow(win.id) : maximizeWindow(win.id); }}
            title={isMax ? 'Restore' : 'Maximize'}>
            <span style={{ fontSize: 9, lineHeight: 1, color: "rgba(0,0,0,0.65)", fontWeight: 900 }}>{isMax ? '⊡' : '⊞'}</span>
          </button>
        </div>

        {/* Window title */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
          <DynIcon name={win.icon} size={13} style={{ color: theme.accent, flexShrink: 0 }} />
          <span
            className="text-xs font-medium truncate"
            style={{ color: theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }}
          >
            {win.title}
          </span>
        </div>

        {/* Right area: window controls */}
        <div className="w-14 flex-shrink-0 flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); minimizeWindow(win.id); }} className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors" title="Minimize">
            <Icons.Minus size={10} />
          </button>
          <button onClick={e => { e.stopPropagation(); isMax ? restoreWindow(win.id) : maximizeWindow(win.id); }} className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors" title={isMax ? 'Restore' : 'Maximize'}>
            {isMax ? <Icons.Minimize2 size={10} /> : <Icons.Maximize2 size={10} />}
          </button>
        </div>
      </div>

      {/* App content */}
      <div className="flex-1 overflow-hidden app-content relative z-0">
        {children}
      </div>
    </div>
  );
});
