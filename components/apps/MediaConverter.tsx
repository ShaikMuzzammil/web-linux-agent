'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { RefreshCw, Upload, Download, Check, Loader2 } from 'lucide-react';
const FORMATS = {video:['MP4','WebM','AVI','MOV','MKV'],audio:['MP3','WAV','OGG','FLAC','AAC'],image:['PNG','JPG','WebP','GIF','SVG']};
export default function MediaConverter({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [type, setType] = useState<'video'|'audio'|'image'>('image');
  const [from, setFrom] = useState('JPG');
  const [to, setTo] = useState('PNG');
  const [file, setFile] = useState<File|null>(null);
  const [status, setStatus] = useState<'idle'|'converting'|'done'>('idle');
  const [quality, setQuality] = useState(90);
  const convert = async () => {
    if (!file) return;
    setStatus('converting');
    await new Promise(r=>setTimeout(r,1500));
    setStatus('done');
  };
  const reset = () => { setFile(null); setStatus('idle'); };
  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex gap-1 p-1 rounded-xl" style={{background:'rgba(255,255,255,0.06)'}}>
        {(['video','audio','image'] as const).map(t=>(
          <button key={t} onClick={()=>{setType(t);setFrom(FORMATS[t][0]);setTo(FORMATS[t][1]);}} className="flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={{background:type===t?theme.accent:'transparent',color:type===t?'#fff':'inherit'}}>{t}</button>
        ))}
      </div>
      <label className="flex flex-col items-center gap-3 p-6 rounded-2xl cursor-pointer border-2 border-dashed transition-all" style={{borderColor:file?theme.accent:'rgba(255,255,255,0.15)',background:file?`${theme.accent}08`:'transparent'}}>
        <Upload size={24} style={{color:file?theme.accent:'rgba(255,255,255,0.3)'}}/>
        <div className="text-center">
          <p className="text-sm font-medium">{file?file.name:'Drop file or click to browse'}</p>
          <p className="text-[11px] opacity-40">{file?`${(file.size/1024).toFixed(1)} KB`:`Supports ${FORMATS[type].join(', ')}`}</p>
        </div>
        <input type="file" className="hidden" accept={type==='image'?'image/*':type==='audio'?'audio/*':'video/*'} onChange={e=>{ setFile(e.target.files?.[0]||null); setStatus('idle'); }}/>
      </label>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] opacity-50 mb-1">From</p>
          <select value={from} onChange={e=>setFrom(e.target.value)} className="w-full px-3 py-2 rounded-xl outline-none" style={{background:'rgba(255,255,255,0.07)',color:'inherit'}}>
            {FORMATS[type].map(f=><option key={f}>{f}</option>)}
          </select>
        </div>
        <RefreshCw size={18} className="opacity-30 mt-4 flex-shrink-0"/>
        <div className="flex-1">
          <p className="text-[10px] opacity-50 mb-1">To</p>
          <select value={to} onChange={e=>setTo(e.target.value)} className="w-full px-3 py-2 rounded-xl outline-none" style={{background:'rgba(255,255,255,0.07)',color:'inherit'}}>
            {FORMATS[type].filter(f=>f!==from).map(f=><option key={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] mb-1"><span className="opacity-50">Quality</span><span style={{color:theme.accent}}>{quality}%</span></div>
        <input type="range" min={10} max={100} value={quality} onChange={e=>setQuality(+e.target.value)} className="w-full" style={{accentColor:theme.accent}}/>
      </div>
      {status==='done'?(
        <button onClick={reset} className="py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2" style={{background:'#4ade8030',color:'#4ade80',border:'1px solid #4ade8040'}}>
          <Check size={16}/>Conversion complete! Click to reset
        </button>
      ):(
        <button onClick={convert} disabled={!file||status==='converting'} className="py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2" style={{background:theme.accent}}>
          {status==='converting'?<><Loader2 size={16} className="animate-spin"/>Converting...</>:<><RefreshCw size={16}/>Convert {from} → {to}</>}
        </button>
      )}
    </div>
  );
}
