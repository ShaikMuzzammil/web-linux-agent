'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { X, ZoomIn, Download, Grid3x3, Rows } from 'lucide-react';
const GALLERY = Array.from({length:12},(_,i)=>({id:i,url:`https://picsum.photos/seed/${i+10}/400/300`,title:`Photo ${i+1}`}));
export default function ImageGallery({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [lightbox, setLightbox] = useState<typeof GALLERY[0]|null>(null);
  return (
    <div className="flex flex-col h-full" style={{background:theme.mode==='dark'?'#0a0a14':'#f0f0f5',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <span className="text-xs font-semibold opacity-60">{GALLERY.length} photos</span>
        <div className="flex gap-1">
          <button onClick={()=>setView('grid')} className="p-1.5 rounded" style={{background:view==='grid'?`${theme.accent}30`:'transparent'}}><Grid3x3 size={14}/></button>
          <button onClick={()=>setView('list')} className="p-1.5 rounded" style={{background:view==='list'?`${theme.accent}30`:'transparent'}}><Rows size={14}/></button>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto p-3 ${view==='grid'?'grid gap-2':'flex flex-col gap-2'}`} style={view==='grid'?{gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))'}:{}}>
        {GALLERY.map(img=>(
          <div key={img.id} onClick={()=>setLightbox(img)} className="relative group cursor-pointer rounded-xl overflow-hidden" style={view==='list'?{display:'flex',alignItems:'center',gap:12,padding:8,background:'rgba(255,255,255,0.04)'}:{}}>
            <img src={img.url} alt={img.title} className={view==='grid'?'w-full aspect-square object-cover':'w-16 h-12 rounded-lg object-cover flex-shrink-0'} loading="lazy"/>
            {view==='list'&&<span className="text-xs">{img.title}</span>}
            {view==='grid'&&<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{background:'rgba(0,0,0,0.5)'}}><ZoomIn size={20} className="text-white"/></div>}
          </div>
        ))}
      </div>
      {lightbox && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.92)'}} onClick={()=>setLightbox(null)}>
          <button className="absolute top-3 right-3 text-white/60 hover:text-white"><X size={22}/></button>
          <img src={lightbox.url} alt={lightbox.title} className="max-w-[90%] max-h-[85%] rounded-xl shadow-2xl" onClick={e=>e.stopPropagation()}/>
          <a href={lightbox.url} download className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white" style={{background:theme.accent}} onClick={e=>e.stopPropagation()}><Download size={14}/>Save</a>
        </div>
      )}
    </div>
  );
}
