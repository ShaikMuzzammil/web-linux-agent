'use client';
import { useState, useRef } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Video, Square, Download, Play, Pause } from 'lucide-react';
export default function ScreenRecorder({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const mediaRef = useRef<MediaRecorder|null>(null);
  const chunks = useRef<Blob[]>([]);
  const start = async () => {
    try {
      const stream = await (navigator.mediaDevices as unknown as {getDisplayMedia:(o:object)=>Promise<MediaStream>}).getDisplayMedia({video:true,audio:true});
      const mr = new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'});
      chunks.current = [];
      mr.ondataavailable = e => chunks.current.push(e.data);
      mr.onstop = () => { const blob=new Blob(chunks.current,{type:'video/webm'}); setVideoUrl(URL.createObjectURL(blob)); stream.getTracks().forEach(t=>t.stop()); };
      mr.start(1000); mediaRef.current=mr; setRecording(true); setVideoUrl(null);
      timerRef.current = setInterval(()=>setTime(t=>t+1),1000);
    } catch(e) { console.error(e); }
  };
  const stop = () => { mediaRef.current?.stop(); if(timerRef.current) clearInterval(timerRef.current); setRecording(false); };
  const fmt = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-6" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{background:recording?`${theme.accent}20`:'rgba(255,255,255,0.06)',border:`2px solid ${recording?theme.accent:'rgba(255,255,255,0.1)'}`,boxShadow:recording?`0 0 30px ${theme.accent}40`:'none'}}>
        <Video size={32} style={{color:recording?theme.accent:'rgba(255,255,255,0.5)'}}/>
      </div>
      {recording && <p className="text-3xl font-mono font-light text-red-400">{fmt(time)}</p>}
      <div className="flex gap-3">
        {!recording ? (
          <button onClick={start} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold" style={{background:theme.accent}}><Video size={16}/>Start Recording</button>
        ) : (
          <button onClick={stop} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold" style={{background:'#f87171'}}><Square size={16}/>Stop</button>
        )}
      </div>
      {videoUrl && (
        <div className="w-full max-w-sm">
          <video src={videoUrl} controls className="w-full rounded-xl"/>
          <a href={videoUrl} download="screen-recording.webm" className="flex items-center justify-center gap-2 mt-2 py-2 rounded-xl text-sm font-semibold text-white" style={{background:theme.accent}}>
            <Download size={14}/>Download Recording
          </a>
        </div>
      )}
      <p className="text-xs opacity-40 text-center">Requires screen share permission<br/>Click to choose what to record</p>
    </div>
  );
}
