'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Paintbrush, Eraser, Type, Trash2, RotateCcw, ZoomIn, ZoomOut, Minus } from 'lucide-react';
type Tool = 'pen'|'eraser'|'text'|'line';
export default function Whiteboard({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#7C4DFF');
  const [size, setSize] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const snap = useRef<ImageData|null>(null);
  const startPt = useRef<{x:number;y:number}|null>(null);
  const COLORS = ['#ffffff','#f87171','#fbbf24','#4ade80','#22d3ee','#818cf8','#7C4DFF','#000000'];
  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;
  const getPos = (e: React.MouseEvent|React.TouchEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,c.width,c.height);
  }, []);
  const save = () => { const ctx=getCtx(); const c=canvasRef.current; if(!ctx||!c) return; setHistory(h=>[...h.slice(-15),ctx.getImageData(0,0,c.width,c.height)]); };
  const undo = () => { if(!history.length) return; const ctx=getCtx(); if(!ctx) return; ctx.putImageData(history[history.length-1],0,0); setHistory(h=>h.slice(0,-1)); };
  const clear = () => { const ctx=getCtx(); const c=canvasRef.current; if(!ctx||!c) return; save(); ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height); };
  const down = (e: React.MouseEvent) => {
    const ctx=getCtx(); const c=canvasRef.current; if(!ctx||!c) return;
    save(); const pos=getPos(e); startPt.current=pos;
    snap.current=ctx.getImageData(0,0,c.width,c.height);
    ctx.strokeStyle=tool==='eraser'?'#ffffff':color; ctx.lineWidth=tool==='eraser'?size*4:size;
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(pos.x,pos.y); setDrawing(true);
  };
  const moveCanvas = (e: React.MouseEvent) => {
    if(!drawing) return; const ctx=getCtx(); const c=canvasRef.current; if(!ctx||!c) return;
    const pos=getPos(e);
    if(tool==='pen'||tool==='eraser'){ctx.lineTo(pos.x,pos.y);ctx.stroke();}
    else if(snap.current&&startPt.current){
      ctx.putImageData(snap.current,0,0);
      ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=size;
      if(tool==='line'){ctx.moveTo(startPt.current.x,startPt.current.y);ctx.lineTo(pos.x,pos.y);}
      ctx.stroke();
    }
  };
  const up = (e: React.MouseEvent) => {
    if(tool==='text'){
      const pos=getPos(e); const text=window.prompt('Enter text:','');
      if(text){const ctx=getCtx();if(ctx){ctx.font=`${size*6}px sans-serif`;ctx.fillStyle=color;ctx.fillText(text,pos.x,pos.y);}}
    }
    setDrawing(false); startPt.current=null;
  };
  return (
    <div className="flex h-full">
      <div className="w-12 flex-shrink-0 flex flex-col items-center gap-1.5 py-2 border-r" style={{borderColor:'rgba(0,0,0,0.1)'}}>
        {[['pen',<Paintbrush key="p" size={14}/>],['eraser',<Eraser key="e" size={14}/>],['line',<Minus key="l" size={14}/>],['text',<Type key="t" size={14}/>]].map(([t,icon])=>(
          <button key={String(t)} onClick={()=>setTool(t as Tool)} title={String(t)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{background:tool===t?`${theme.accent}30`:'transparent',color:tool===t?theme.accent:'rgba(0,0,0,0.4)'}}>
            {icon}
          </button>
        ))}
        <div className="h-px w-8 my-1 bg-black/10" />
        <button onClick={undo} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/05 text-black/40"><RotateCcw size={14}/></button>
        <button onClick={clear} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/05 text-black/40"><Trash2 size={14}/></button>
        <div className="h-px w-8 my-1 bg-black/10" />
        <div className="flex flex-col items-center gap-1">
          <input type="range" min={1} max={20} value={size} onChange={e=>setSize(+e.target.value)} className="w-8" style={{writingMode:'vertical-lr',direction:'rtl',height:56}} />
          <span className="text-[9px] text-black/30">{size}</span>
        </div>
        <div className="h-px w-8 my-1 bg-black/10" />
        <div className="flex flex-col gap-1.5 items-center">
          {COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)} className="w-6 h-6 rounded-full transition-all" style={{background:c,transform:color===c?'scale(1.2)':'scale(1)',border:color===c?'2px solid #7C4DFF':c==='#ffffff'?'1px solid rgba(0,0,0,0.2)':'none'}} />
          ))}
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-none bg-transparent" />
        </div>
      </div>
      <canvas ref={canvasRef} className="flex-1 cursor-crosshair" style={{display:'block',width:'100%',height:'100%'}}
        onMouseDown={down} onMouseMove={moveCanvas} onMouseUp={up} onMouseLeave={()=>setDrawing(false)} />
    </div>
  );
}
