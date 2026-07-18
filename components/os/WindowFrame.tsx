'use client';
import { memo, useRef, useState, useCallback, useEffect } from 'react';
import { X, Minus, Square, ChevronUp } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { Window as OSWindow } from '@/types';

interface Props { window: OSWindow; children: React.ReactNode }
type ResizeDir = 'n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw';
const MIN_W = 340, MIN_H = 220;

export default memo(function WindowFrame({ window: win, children }: Props) {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, moveWindow, resizeWindow, theme } = useOSStore();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{sx:number;sy:number;ox:number;oy:number}|null>(null);
  const resizeState = useRef<{dir:ResizeDir;sx:number;sy:number;ox:number;oy:number;ow:number;oh:number}|null>(null);
  const [snapGhost, setSnapGhost] = useState<null|'left'|'right'|'max'>(null);

  const px = win.position.x, py = win.position.y;
  const pw = win.size.width, ph = win.size.height;
  const isMaximized = win.state === 'maximized';
  const isMinimized = win.state === 'minimized';

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.sx;
    const dy = e.clientY - dragState.current.sy;
    const nx = Math.max(0, dragState.current.ox + dx);
    const ny = Math.max(28, dragState.current.oy + dy);
    if (e.clientX < 8) setSnapGhost('left');
    else if (e.clientX > window.innerWidth - 8) setSnapGhost('right');
    else if (e.clientY < 32) setSnapGhost('max');
    else setSnapGhost(null);
    moveWindow(win.id, { x: nx, y: ny });
  }, [win.id, moveWindow]);

  const handleDragUp = useCallback((e: MouseEvent) => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    setSnapGhost(null);
    dragState.current = null;
    // Snap zones
    if (e.clientX < 8 || e.clientX > window.innerWidth - 8 || e.clientY < 34) {
      maximizeWindow(win.id);
    }
  }, [win.id, maximizeWindow, handleDragMove]);

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isMaximized) return;
    e.preventDefault();
    focusWindow(win.id);
    dragState.current = { sx: e.clientX, sy: e.clientY, ox: px, oy: py };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragUp);
  }, [win.id, px, py, isMaximized, focusWindow, handleDragMove, handleDragUp]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeState.current) return;
    const { dir, sx, sy, ox, oy, ow, oh } = resizeState.current;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    let nx = ox, ny = oy, nw = ow, nh = oh;
    if (dir.includes('e')) nw = Math.max(MIN_W, ow + dx);
    if (dir.includes('s')) nh = Math.max(MIN_H, oh + dy);
    if (dir.includes('w')) { nw = Math.max(MIN_W, ow - dx); nx = ox + ow - nw; }
    if (dir.includes('n')) { nh = Math.max(MIN_H, oh - dy); ny = oy + oh - nh; }
    moveWindow(win.id, { x: nx, y: ny });
    resizeWindow(win.id, { width: nw, height: nh });
  }, [win.id, moveWindow, resizeWindow]);

  const handleResizeUp = useCallback(() => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    resizeState.current = null;
  }, [handleResizeMove]);

  const startResize = useCallback((e: React.MouseEvent, dir: ResizeDir) => {
    if (e.button !== 0 || isMaximized) return;
    e.preventDefault(); e.stopPropagation();
    focusWindow(win.id);
    resizeState.current = { dir, sx: e.clientX, sy: e.clientY, ox: px, oy: py, ow: pw, oh: ph };
    const cursors: Record<ResizeDir, string> = {
      n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize',
      ne:'ne-resize', nw:'nw-resize', se:'se-resize', sw:'sw-resize',
    };
    document.body.style.cursor = cursors[dir];
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  }, [win.id, px, py, pw, ph, isMaximized, focusWindow, handleResizeMove, handleResizeUp]);

  useEffect(() => () => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragUp);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);
  }, [handleDragMove, handleDragUp, handleResizeMove, handleResizeUp]);

  if (isMinimized) return null;

  const dk = theme.mode === 'dark';
  const accent = theme.accent;

  const frameStyle: React.CSSProperties = isMaximized
    ? { position:'fixed', left:0, top:28, right:0, bottom:0, borderRadius:0, zIndex:win.zIndex }
    : { position:'fixed', left:px, top:py, width:pw, height:ph, zIndex:win.zIndex,
        borderRadius:14, minWidth:MIN_W, minHeight:MIN_H };

  const RH = ({ dir, cls }: { dir: ResizeDir; cls: string }) => {
    const curs: Record<ResizeDir,string> = {
      n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize',
      ne:'ne-resize', nw:'nw-resize', se:'se-resize', sw:'sw-resize',
    };
    return (
      <div className={`absolute z-10 ${cls}`}
        style={{ cursor: curs[dir] }}
        onMouseDown={e => startResize(e, dir)} />
    );
  };

  return (
    <>
      {snapGhost && (
        <div className="fixed z-[5000] pointer-events-none"
          style={{
            top: 28, bottom: 0,
            left: snapGhost === 'right' ? '50%' : 0,
            width: snapGhost === 'max' ? '100%' : '50%',
            background: `${accent}14`,
            border: `2px solid ${accent}45`,
            borderRadius: 12, backdropFilter: 'blur(4px)',
          }} />
      )}

      <div ref={frameRef}
        className="flex flex-col overflow-hidden"
        style={{
          ...frameStyle,
          background: dk ? 'rgba(10,10,22,0.97)' : 'rgba(248,248,255,0.97)',
          border: win.isFocused
            ? `1px solid ${accent}42` : `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)'}`,
          boxShadow: win.isFocused
            ? `0 28px 80px rgba(0,0,0,0.7), 0 0 0 1px ${accent}10`
            : `0 12px 40px rgba(0,0,0,0.40)`,
          transition: 'box-shadow 0.15s, border-color 0.15s',
          animation: 'windowIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onMouseDown={() => focusWindow(win.id)}>

        {!isMaximized && (
          <>
            <RH dir="n"  cls="top-0 left-4 right-4 h-2" />
            <RH dir="s"  cls="bottom-0 left-4 right-4 h-2" />
            <RH dir="e"  cls="right-0 top-4 bottom-4 w-2" />
            <RH dir="w"  cls="left-0 top-4 bottom-4 w-2" />
            <RH dir="ne" cls="top-0 right-0 w-4 h-4" />
            <RH dir="nw" cls="top-0 left-0 w-4 h-4" />
            <RH dir="se" cls="bottom-0 right-0 w-4 h-4" />
            <RH dir="sw" cls="bottom-0 left-0 w-4 h-4" />
          </>
        )}

        {/* Title bar */}
        <div
          className="flex items-center px-3 flex-shrink-0"
          style={{
            height: 38,
            background: dk
              ? 'linear-gradient(180deg,rgba(20,20,38,0.99) 0%,rgba(12,12,24,0.99) 100%)'
              : 'linear-gradient(180deg,rgba(248,248,255,0.99) 0%,rgba(235,235,250,0.99) 100%)',
            borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            cursor: isMaximized ? 'default' : 'grab',
          }}
          onMouseDown={onTitleMouseDown}
          onDoubleClick={() => maximizeWindow(win.id)}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 flex-shrink-0 group" onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => closeWindow(win.id)}
              className="w-3 h-3 rounded-full flex items-center justify-center transition-all"
              style={{ background:'#ff5f57', boxShadow:'0 1px 2px rgba(0,0,0,0.3)' }} title="Close">
              <X size={7} className="opacity-0 group-hover:opacity-100 text-red-900" strokeWidth={2.5} />
            </button>
            <button onClick={() => minimizeWindow(win.id)}
              className="w-3 h-3 rounded-full flex items-center justify-center transition-all"
              style={{ background:'#febc2e', boxShadow:'0 1px 2px rgba(0,0,0,0.3)' }} title="Minimize">
              <Minus size={7} className="opacity-0 group-hover:opacity-100 text-yellow-900" strokeWidth={2.5} />
            </button>
            <button onClick={() => maximizeWindow(win.id)}
              className="w-3 h-3 rounded-full flex items-center justify-center transition-all"
              style={{ background:'#28c840', boxShadow:'0 1px 2px rgba(0,0,0,0.3)' }} title={isMaximized ? 'Restore' : 'Maximize'}>
              {isMaximized
                ? <ChevronUp size={7} className="opacity-0 group-hover:opacity-100 text-green-900" strokeWidth={2.5} />
                : <Square size={6} className="opacity-0 group-hover:opacity-100 text-green-900" strokeWidth={2.5} />}
            </button>
          </div>

          {/* Title */}
          <div className="flex-1 text-center pointer-events-none">
            <span className="text-[11px] font-semibold" style={{ opacity: win.isFocused ? 0.85 : 0.4 }}>
              {win.title}
            </span>
          </div>

          <div className="w-[54px] flex-shrink-0" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative" style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  );
});
