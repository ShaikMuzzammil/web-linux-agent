'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Paintbrush, Eraser, Square, Circle, Minus, RotateCcw, Trash2, Download } from 'lucide-react';
type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'line';
export default function Drawing({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#7C4DFF');
  const [size, setSize] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const start = useRef<{x:number;y:number}|null>(null);
  const snapshot = useRef<ImageData|null>(null);
  const COLORS = ['#ffffff','#f87171','#fb923c','#fbbf24','#4ade80','#22d3ee','#818cf8','#7C4DFF','#ec4899','#000000'];
  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;
  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, c.width, c.height);
  }, []);
  const saveHistory = useCallback(() => {
    const ctx = getCtx(); const c = canvasRef.current;
    if (!ctx || !c) return;
    setHistory(h => [...h.slice(-20), ctx.getImageData(0, 0, c.width, c.height)]);
  }, []);
  const undo = () => {
    if (history.length === 0) return;
    const ctx = getCtx(); if (!ctx) return;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  };
  const clear = () => {
    const ctx = getCtx(); const c = canvasRef.current; if (!ctx || !c) return;
    saveHistory();
    ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, c.width, c.height);
  };
  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement('a'); a.href = c.toDataURL(); a.download = 'drawing.png'; a.click();
  };
  const onDown = (e: React.MouseEvent) => {
    const ctx = getCtx(); const c = canvasRef.current; if (!ctx || !c) return;
    saveHistory();
    const pos = getPos(e); start.current = pos;
    snapshot.current = ctx.getImageData(0, 0, c.width, c.height);
    setDrawing(true);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#0d0d1a' : color;
    ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const ctx = getCtx(); const c = canvasRef.current; if (!ctx || !c) return;
    const pos = getPos(e);
    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
    } else if (snapshot.current && start.current) {
      ctx.putImageData(snapshot.current, 0, 0);
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = size;
      if (tool === 'rect') ctx.strokeRect(start.current.x, start.current.y, pos.x - start.current.x, pos.y - start.current.y);
      else if (tool === 'circle') {
        const rx = Math.abs(pos.x - start.current.x) / 2, ry = Math.abs(pos.y - start.current.y) / 2;
        const cx = start.current.x + (pos.x - start.current.x) / 2, cy = start.current.y + (pos.y - start.current.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      } else if (tool === 'line') { ctx.moveTo(start.current.x, start.current.y); ctx.lineTo(pos.x, pos.y); }
      ctx.stroke();
    }
  };
  const onUp = () => { setDrawing(false); start.current = null; };
  const TOOLS = [['pen','Pen',<Paintbrush key="p" size={14}/>],['eraser','Eraser',<Eraser key="e" size={14}/>],['rect','Rectangle',<Square key="r" size={14}/>],['circle','Circle',<Circle key="c" size={14}/>],['line','Line',<Minus key="l" size={14}/>]];
  return (
    <div className="flex h-full" style={{ background: '#0d0d1a' }}>
      <div className="w-12 flex-shrink-0 flex flex-col items-center gap-1.5 py-2 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {TOOLS.map(([t,label,icon]) => (
          <button key={String(t)} onClick={() => setTool(t as Tool)} title={String(label)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: tool === t ? `${theme.accent}30` : 'transparent', color: tool === t ? theme.accent : 'rgba(255,255,255,0.5)' }}>{icon}</button>
        ))}
        <div className="h-px w-8 my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <button onClick={undo} title="Undo" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 text-white/50"><RotateCcw size={14}/></button>
        <button onClick={clear} title="Clear" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 text-white/50"><Trash2 size={14}/></button>
        <button onClick={download} title="Download" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 text-white/50"><Download size={14}/></button>
        <div className="h-px w-8 my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex flex-col items-center gap-1">
          <input type="range" min={1} max={24} value={size} onChange={e => setSize(+e.target.value)} className="w-8" style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 60 }} />
          <span className="text-[9px] text-white/30">{size}px</span>
        </div>
        <div className="h-px w-8 my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex flex-col items-center gap-1.5">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-full transition-all" style={{ background: c, transform: color === c ? 'scale(1.2)' : 'scale(1)', border: color === c ? '2px solid white' : '1px solid rgba(255,255,255,0.2)' }} />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-none" title="Custom color" />
        </div>
      </div>
      <canvas ref={canvasRef} className="flex-1 cursor-crosshair" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
