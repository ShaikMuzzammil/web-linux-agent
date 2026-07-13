'use client';
import { useState, useRef, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react';
interface Recording { id:string; name:string; duration:number; url?:string; date:string }
export default function VoiceRecorder({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [recordings, setRecordings] = useState<Recording[]>([{id:'1',name:'Recording 1',duration:45,date:'Today'},]);
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState<string|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const mediaRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current,{type:'audio/webm'});
        const url = URL.createObjectURL(blob);
        setRecordings(prev=>[{id:Date.now().toString(),name:`Recording ${prev.length+1}`,duration:time,url,date:'Just now'},...prev]);
        setTime(0); stream.getTracks().forEach(t=>t.stop());
      };
      mr.start(); mediaRef.current = mr; setRecording(true);
      timerRef.current = setInterval(()=>setTime(t=>t+1),1000);
    } catch { alert('Microphone access required'); }
  };
  const stop = () => { mediaRef.current?.stop(); if(timerRef.current) clearInterval(timerRef.current); setRecording(false); };
  const fmt = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const bars = 20;
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{background:recording?`${theme.accent}20`:'rgba(255,255,255,0.06)',border:`2px solid ${recording?theme.accent:'rgba(255,255,255,0.1)'}`,boxShadow:recording?`0 0 30px ${theme.accent}40`:'none'}}>
          <Mic size={32} style={{color:recording?theme.accent:'rgba(255,255,255,0.5)'}}/>
          {recording && <div className="absolute inset-0 rounded-full animate-ping" style={{background:theme.accent,opacity:0.15}}/>}
        </div>
        {recording && (
          <>
            <p className="text-3xl font-mono font-light" style={{color:theme.accent}}>{fmt(time)}</p>
            <div className="flex items-end gap-0.5 h-8">
              {Array.from({length:bars},(_,i)=><div key={i} className="w-1 rounded-full" style={{background:theme.accent,height:`${4+Math.random()*24}px`,animation:`bootPulse ${0.3+Math.random()*0.4}s ease infinite`,animationDelay:`${i*0.05}s`}}/>)}
            </div>
          </>
        )}
        <div className="flex gap-3">
          {!recording ? (
            <button onClick={start} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold" style={{background:theme.accent,boxShadow:`0 0 20px ${theme.accent}40`}}>
              <Mic size={18}/>Start Recording
            </button>
          ) : (
            <button onClick={stop} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold" style={{background:'#f87171'}}>
              <Square size={18}/>Stop
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        <p className="text-[10px] font-semibold opacity-40 uppercase tracking-wider">Recordings ({recordings.length})</p>
        {recordings.map(r=>(
          <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
            <button onClick={()=>setPlaying(p=>p===r.id?null:r.id)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background:`${theme.accent}20`}}>
              {playing===r.id?<Pause size={14} style={{color:theme.accent}}/>:<Play size={14} style={{color:theme.accent}} className="ml-0.5"/>}
            </button>
            <div className="flex-1"><p className="text-xs font-medium">{r.name}</p><p className="text-[10px] opacity-40">{fmt(r.duration)} · {r.date}</p></div>
            {r.url&&<a href={r.url} download={r.name+'.webm'} className="p-1.5 rounded hover:bg-white/10 opacity-40 hover:opacity-100"><Download size={12}/></a>}
            <button onClick={()=>setRecordings(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded hover:bg-white/10 opacity-40 hover:text-red-400"><Trash2 size={12}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
