'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { ZoomIn, ZoomOut, RotateCw, Download, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
const SAMPLE_IMAGES = [
  { url:'https://picsum.photos/seed/linux/800/500', name:'landscape.jpg' },
  { url:'https://picsum.photos/seed/tech/800/500', name:'technology.jpg' },
  { url:'https://picsum.photos/seed/city/800/500', name:'city.jpg' },
  { url:'https://picsum.photos/seed/nature/800/500', name:'nature.jpg' },
];
export default function ImageViewer({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [url, setUrl] = useState('');
  const img = url ? { url, name: 'custom.jpg' } : SAMPLE_IMAGES[idx];
  return (
    <div className="flex flex-col h-full" style={{ background:'#0a0a14', color:'#e2e8f0' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-medium opacity-60 flex-1 truncate">{img.name}</span>
        <button onClick={()=>setZoom(z=>Math.max(25,z-25))} className="p-1.5 rounded hover:bg-white/10"><ZoomOut size={13}/></button>
        <span className="text-[10px] opacity-40 w-10 text-center">{zoom}%</span>
        <button onClick={()=>setZoom(z=>Math.min(300,z+25))} className="p-1.5 rounded hover:bg-white/10"><ZoomIn size={13}/></button>
        <button onClick={()=>setRotation(r=>(r+90)%360)} className="p-1.5 rounded hover:bg-white/10"><RotateCw size={13}/></button>
        <button onClick={()=>setZoom(100)} className="px-2 py-1 rounded text-[10px] hover:bg-white/10">Fit</button>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
        <img src={img.url} alt={img.name} className="max-w-none rounded-lg shadow-2xl transition-all" style={{ width:`${zoom}%`, maxWidth:'100%', transform:`rotate(${rotation}deg)` }} onError={e=>(e.currentTarget.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%231a1a2e" width="400" height="300"/><text x="200" y="160" text-anchor="middle" fill="%234ade80" font-size="16">Image not found</text></svg>')} />
        {!url && (
          <>
            <button onClick={()=>setIdx(i=>(i-1+SAMPLE_IMAGES.length)%SAMPLE_IMAGES.length)} className="absolute left-2 p-2 rounded-full hover:bg-white/20" style={{top:'50%',transform:'translateY(-50%)'}}><ChevronLeft size={20}/></button>
            <button onClick={()=>setIdx(i=>(i+1)%SAMPLE_IMAGES.length)} className="absolute right-2 p-2 rounded-full hover:bg-white/20" style={{top:'50%',transform:'translateY(-50%)'}}><ChevronRight size={20}/></button>
          </>
        )}
      </div>
      <div className="px-3 py-2 border-t flex gap-2 flex-shrink-0" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Or paste image URL…" className="flex-1 px-2 py-1 rounded-lg text-xs outline-none" style={{ background:'rgba(255,255,255,0.07)', caretColor:theme.accent }} />
        <div className="flex gap-1">{SAMPLE_IMAGES.map((_,i)=><button key={i} onClick={()=>{setUrl('');setIdx(i);}} className="w-2 h-2 rounded-full" style={{background:i===idx&&!url?theme.accent:'rgba(255,255,255,0.2)'}}/>)}</div>
      </div>
    </div>
  );
}
