'use client';
import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Upload, Download, RotateCw, FlipHorizontal } from 'lucide-react';
export default function PhotoEditor({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement|null>(null);
  const [filters, setFilters] = useState({ brightness:100, contrast:100, saturation:100, blur:0, grayscale:0, sepia:0 });
  const [rotation, setRotation] = useState(0);
  const load = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    const i = new Image(); i.src=URL.createObjectURL(f); i.onload=()=>setImg(i);
  };
  useEffect(()=>{
    const c=canvasRef.current; if(!c||!img) return;
    const ctx=c.getContext('2d')!;
    c.width=img.naturalWidth; c.height=img.naturalHeight;
    ctx.filter=`brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.save(); ctx.translate(c.width/2,c.height/2); ctx.rotate((rotation*Math.PI)/180); ctx.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2); ctx.restore();
  },[img,filters,rotation]);
  const download = () => { const a=document.createElement('a'); a.href=canvasRef.current!.toDataURL('image/png'); a.download='edited.png'; a.click(); };
  const SLIDERS = [['Brightness','brightness',0,200],['Contrast','contrast',0,200],['Saturation','saturation',0,200],['Blur','blur',0,10],['Grayscale','grayscale',0,100],['Sepia','sepia',0,100]];
  return (
    <div className="flex h-full" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="w-52 flex-shrink-0 flex flex-col border-r p-3 gap-3 overflow-y-auto" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <label className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs text-white font-semibold" style={{background:theme.accent}}>
          <Upload size={13}/> Open Image
          <input type="file" accept="image/*" className="hidden" onChange={load}/>
        </label>
        {img && <button onClick={download} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 border" style={{borderColor:'rgba(255,255,255,0.1)'}}><Download size={13}/>Save</button>}
        {SLIDERS.map(([label,key,min,max])=>(
          <div key={String(key)}>
            <div className="flex justify-between text-[10px] mb-1"><span className="opacity-50">{label}</span><span style={{color:theme.accent}}>{filters[key as keyof typeof filters]}{key==='blur'?'px':'%'}</span></div>
            <input type="range" min={Number(min)} max={Number(max)} value={filters[key as keyof typeof filters]}
              onChange={e=>setFilters(f=>({...f,[key]:+e.target.value}))} className="w-full" style={{accentColor:theme.accent}}/>
          </div>
        ))}
        <div className="flex gap-2 pt-2 border-t" style={{borderColor:'rgba(255,255,255,0.06)'}}>
          <button onClick={()=>setRotation(r=>(r+90)%360)} className="flex-1 py-1.5 rounded-lg text-xs hover:bg-white/10 flex items-center justify-center gap-1"><RotateCw size={12}/>Rotate</button>
          <button onClick={()=>setFilters(f=>f)} className="flex-1 py-1.5 rounded-lg text-xs hover:bg-white/10 flex items-center justify-center gap-1"><FlipHorizontal size={12}/>Flip</button>
        </div>
        <button onClick={()=>{setFilters({brightness:100,contrast:100,saturation:100,blur:0,grayscale:0,sepia:0});setRotation(0);}} className="py-1.5 rounded-lg text-xs opacity-40 hover:opacity-70">Reset All</button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {!img ? (
          <label className="flex flex-col items-center gap-3 cursor-pointer opacity-30 hover:opacity-50 transition-opacity">
            <Upload size={40}/><p className="text-sm">Click to open an image</p>
            <input type="file" accept="image/*" className="hidden" onChange={load}/>
          </label>
        ) : <canvas ref={canvasRef} className="max-w-full max-h-full rounded-lg shadow-2xl" style={{objectFit:'contain'}}/>}
      </div>
    </div>
  );
}
