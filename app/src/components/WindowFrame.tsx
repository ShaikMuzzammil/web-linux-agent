// ============================================================
// WindowFrame — macOS-style traffic lights, drag/resize, snap
// ============================================================

import { useCallback, useRef, useState, memo, useEffect } from 'react';
import type { Window } from '@/types';
import { useOS } from '@/hooks/useOSStore';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const TOP_PANEL_HEIGHT = 28;
const DOCK_HEIGHT = 56;
const RESIZE_HANDLE = 8;
const MIN_W = 320;
const MIN_H = 200;

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Icons.HelpCircle {...props} />;
};

interface WindowFrameProps {
  window: Window;
  children: React.ReactNode;
}

const WindowFrame = memo(function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { dispatch } = useOS();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ isResizing: boolean; edge: string; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [titleBarHover, setTitleBarHover] = useState(false);
  const [snapIndicator, setSnapIndicator] = useState<'left' | 'right' | 'max' | null>(null);

  const isMaximized = win.state === 'maximized';
  const isMinimized = win.state === 'minimized';
  const isFocused = win.isFocused;

  const focusThis = useCallback(() => {
    if (!win.isFocused && win.state !== 'minimized') {
      dispatch({ type: 'FOCUS_WINDOW', windowId: win.id });
    }
  }, [dispatch, win.id, win.isFocused, win.state]);

  const handleMouseDown = useCallback(() => { focusThis(); }, [focusThis]);

  // ---- Drag ----
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMaximized) return;
      // only drag from the empty title bar area
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) return;
      e.preventDefault();
      dragRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: win.position.x,
        origY: win.position.y,
      };
      setIsDragging(true);
    },
    [isMaximized, win.position.x, win.position.y]
  );

  // ---- Resize ----
  const getEdge = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let edge = '';
    if (y < RESIZE_HANDLE) edge += 'n';
    if (y > rect.height - RESIZE_HANDLE) edge += 's';
    if (x < RESIZE_HANDLE) edge += 'w';
    if (x > rect.width - RESIZE_HANDLE) edge += 'e';
    return edge;
  }, []);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMaximized) return;
      const edge = getEdge(e);
      if (!edge) return;
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        isResizing: true,
        edge,
        startX: e.clientX,
        startY: e.clientY,
        origW: win.size.width,
        origH: win.size.height,
        origX: win.position.x,
        origY: win.position.y,
      };
      setIsResizing(true);
    },
    [isMaximized, getEdge, win.size, win.position]
  );

  const getCursor = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return 'default';
    const edge = getEdge(e);
    const cursors: Record<string, string> = {
      n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
      nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
    };
    return cursors[edge] || 'default';
  }, [isMaximized, getEdge]);

  // ---- Global mouse events for drag/resize ----
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current?.isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        let nx = dragRef.current.origX + dx;
        let ny = dragRef.current.origY + dy;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        ny = Math.max(TOP_PANEL_HEIGHT, Math.min(vh - DOCK_HEIGHT - 40, ny));
        nx = Math.min(Math.max(nx, -(win.size.width - 100)), vw - 100);
        dispatch({ type: 'MOVE_WINDOW', windowId: win.id, position: { x: nx, y: ny } });

        // Snap indicator
        if (e.clientX < 12) setSnapIndicator('left');
        else if (e.clientX > vw - 12) setSnapIndicator('right');
        else if (e.clientY < 4) setSnapIndicator('max');
        else setSnapIndicator(null);
      }
      if (resizeRef.current?.isResizing) {
        const { edge, startX, startY, origW, origH, origX, origY } = resizeRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let nx = origX, ny = origY, nw = origW, nh = origH;
        if (edge.includes('e')) nw = Math.max(MIN_W, origW + dx);
        if (edge.includes('s')) nh = Math.max(MIN_H, origH + dy);
        if (edge.includes('w')) {
          nw = Math.max(MIN_W, origW - dx);
          nx = origX + (origW - nw);
        }
        if (edge.includes('n')) {
          nh = Math.max(MIN_H, origH - dy);
          ny = origY + (origH - nh);
          ny = Math.max(TOP_PANEL_HEIGHT, ny);
        }
        dispatch({ type: 'MOVE_WINDOW', windowId: win.id, position: { x: nx, y: ny } });
        dispatch({ type: 'RESIZE_WINDOW', windowId: win.id, size: { width: nw, height: nh } });
      }
    };
    const onUp = (e: MouseEvent) => {
      if (dragRef.current?.isDragging) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Snap zones on release
        if (e.clientX < 12) {
          dispatch({ type: 'MOVE_WINDOW', windowId: win.id, position: { x: 0, y: TOP_PANEL_HEIGHT } });
          dispatch({ type: 'RESIZE_WINDOW', windowId: win.id, size: { width: Math.floor(vw / 2), height: vh - TOP_PANEL_HEIGHT - DOCK_HEIGHT } });
        } else if (e.clientX > vw - 12) {
          dispatch({ type: 'MOVE_WINDOW', windowId: win.id, position: { x: Math.floor(vw / 2), y: TOP_PANEL_HEIGHT } });
          dispatch({ type: 'RESIZE_WINDOW', windowId: win.id, size: { width: Math.floor(vw / 2), height: vh - TOP_PANEL_HEIGHT - DOCK_HEIGHT } });
        } else if (e.clientY < 4) {
          dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id });
        }
        setSnapIndicator(null);
      }
      dragRef.current = null;
      resizeRef.current = null;
      setIsDragging(false);
      setIsResizing(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dispatch, win.id, win.size.width, win.size.height]);

  const handleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'MINIMIZE_WINDOW', windowId: win.id });
  }, [dispatch, win.id]);

  const handleMaximize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaximized) {
      dispatch({ type: 'RESTORE_WINDOW', windowId: win.id });
    } else {
      dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id });
    }
  }, [dispatch, win.id, isMaximized]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_WINDOW', windowId: win.id });
  }, [dispatch, win.id]);

  const handleDoubleClickTitle = useCallback(() => {
    if (isMaximized) {
      dispatch({ type: 'RESTORE_WINDOW', windowId: win.id });
    } else {
      dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id });
    }
  }, [dispatch, win.id, isMaximized]);

  if (isMinimized) return null;

  return (
    <>
      {/* Snap indicator overlay */}
      {snapIndicator && (
        <div
          className="fixed pointer-events-none z-[9000]"
          style={{
            top: TOP_PANEL_HEIGHT,
            left: snapIndicator === 'right' ? '50%' : 0,
            width: snapIndicator === 'max' ? '100%' : '50%',
            height: `calc(100vh - ${TOP_PANEL_HEIGHT}px - ${DOCK_HEIGHT}px)`,
            background: 'rgba(124,77,255,0.15)',
            border: '2px solid rgba(124,77,255,0.6)',
            borderRadius: 12,
            backdropFilter: 'blur(4px)',
            animation: 'snapAppear 150ms ease',
          }}
        />
      )}

      <div
        ref={frameRef}
        className="absolute flex flex-col select-none window-frame"
        style={{
          left: isMaximized ? 0 : win.position.x,
          top: isMaximized ? TOP_PANEL_HEIGHT : win.position.y,
          width: isMaximized ? '100%' : win.size.width,
          height: isMaximized ? `calc(100vh - ${TOP_PANEL_HEIGHT}px - ${DOCK_HEIGHT}px)` : win.size.height,
          zIndex: win.zIndex,
          borderRadius: isMaximized ? 0 : 12,
          boxShadow: isFocused
            ? '0 0 0 1px rgba(124,77,255,0.25), 0 20px 60px rgba(0,0,0,0.6)'
            : '0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)',
          transition: isDragging || isResizing ? 'none' : 'box-shadow 200ms ease',
          overflow: 'hidden',
          animation: 'windowOpen 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Resize border overlay */}
        {!isMaximized && (
          <div
            className="absolute inset-0 z-[60] pointer-events-auto"
            style={{ cursor: 'default' }}
            onMouseDown={handleResizeMouseDown}
            onMouseMove={(e) => {
              e.currentTarget.style.cursor = getCursor(e);
            }}
          >
            {/* Thin resize handles */}
            <div style={{ position: 'absolute', top: 0, left: RESIZE_HANDLE, right: RESIZE_HANDLE, height: RESIZE_HANDLE, cursor: 'n-resize', zIndex: 61 }} />
            <div style={{ position: 'absolute', bottom: 0, left: RESIZE_HANDLE, right: RESIZE_HANDLE, height: RESIZE_HANDLE, cursor: 's-resize', zIndex: 61 }} />
            <div style={{ position: 'absolute', left: 0, top: RESIZE_HANDLE, bottom: RESIZE_HANDLE, width: RESIZE_HANDLE, cursor: 'w-resize', zIndex: 61 }} />
            <div style={{ position: 'absolute', right: 0, top: RESIZE_HANDLE, bottom: RESIZE_HANDLE, width: RESIZE_HANDLE, cursor: 'e-resize', zIndex: 61 }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'nw-resize', zIndex: 62 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'ne-resize', zIndex: 62 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'sw-resize', zIndex: 62 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: RESIZE_HANDLE * 2, height: RESIZE_HANDLE * 2, cursor: 'se-resize', zIndex: 62 }} />
          </div>
        )}

        {/* Title bar */}
        <div
          className="relative z-[65] flex items-center shrink-0"
          style={{
            height: 38,
            background: isFocused ? '#1E1E1E' : '#161616',
            borderRadius: isMaximized ? 0 : '12px 12px 0 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            cursor: isMaximized ? 'default' : isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={handleDoubleClickTitle}
          onMouseEnter={() => setTitleBarHover(true)}
          onMouseLeave={() => setTitleBarHover(false)}
        >
          {/* LEFT: macOS traffic-light buttons */}
          <div className="flex items-center gap-[6px] pl-3 shrink-0" style={{ zIndex: 70 }}>
            {/* Close — red */}
            <button
              onClick={handleClose}
              className="traffic-btn group"
              style={{ background: '#FF5F57', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.25)' }}
              title="Close"
            >
              {titleBarHover && (
                <span style={{ position: 'absolute', fontSize: 8, fontWeight: 900, color: 'rgba(0,0,0,0.6)', lineHeight: 1 }}>✕</span>
              )}
            </button>
            {/* Minimize — yellow */}
            <button
              onClick={handleMinimize}
              className="traffic-btn group"
              style={{ background: '#FFBD2E', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.25)' }}
              title="Minimize"
            >
              {titleBarHover && (
                <span style={{ position: 'absolute', fontSize: 8, fontWeight: 900, color: 'rgba(0,0,0,0.6)', lineHeight: 1 }}>–</span>
              )}
            </button>
            {/* Maximize — green */}
            <button
              onClick={handleMaximize}
              className="traffic-btn group"
              style={{ background: '#28C840', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.25)' }}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {titleBarHover && (
                <span style={{ position: 'absolute', fontSize: 7, fontWeight: 900, color: 'rgba(0,0,0,0.6)', lineHeight: 1 }}>
                  {isMaximized ? '⊡' : '⤢'}
                </span>
              )}
            </button>
          </div>

          {/* CENTER: icon + title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5">
              <DynamicIcon name={win.icon} size={13} style={{ color: isFocused ? '#B0B0B0' : '#666' }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isFocused ? '#E0E0E0' : '#777',
                  letterSpacing: '-0.01em',
                  maxWidth: 240,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {win.title}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className="relative z-[55] flex-1 overflow-hidden window-content"
          style={{
            background: 'var(--bg-window)',
            borderRadius: isMaximized ? 0 : '0 0 12px 12px',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
});

export default WindowFrame;
