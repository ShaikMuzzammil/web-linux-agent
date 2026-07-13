'use client';
import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Music } from 'lucide-react';
const TRACKS = [
  { id:1, title:'Neon Dreams', artist:'Synthwave Studio', duration:234, color:'#7C4DFF' },
  { id:2, title:'Digital Rain', artist:'Electronic Minds', duration:198, color:'#00BCD4' },
  { id:3, title:'Cyber Pulse', artist:'Binary Beats', duration:267, color:'#E91E63' },
  { id:4, title:'Aurora Wave', artist:'Ambient Space', duration:312, color:'#4CAF50' },
  { id:5, title:'Protocol Zero', artist:'Code Music', duration:189, color:'#FF6D00' },
];
const fmt=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
export default function MusicPlayer({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const track = TRACKS[trackIdx];
  useEffect(()=>{
    if(playing){timerRef.current=setInterval(()=>setProgress(p=>{if(p>=track.duration-1){if(repeat)return 0;setTrackIdx(i=>(i+1)%TRACKS.length);return 0;}return p+1;}),1000);}
    else if(timerRef.current) clearInterval(timerRef.current);
    return()=>{if(timerRef.current) clearInterval(timerRef.current);};
  },[playing,track.duration,repeat]);
  const prev=()=>{setTrackIdx(i=>(i-1+TRACKS.length)%TRACKS.length);setProgress(0);};
  const next=()=>{setTrackIdx(i=>shuffle?Math.floor(Math.random()*TRACKS.length):(i+1)%TRACKS.length);setProgress(0);};
  const bars=16;
  return (
    <div className="flex flex-col h-full" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-5">
        <div className="relative w-40 h-40 rounded-2xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${track.color}40,${track.color}20)`,border:`1px solid ${track.color}30`}}>
          <Music size={48} style={{color:track.color}} />
          {playing && (
            <div className="absolute bottom-3 flex items-end gap-0.5">
              {Array.from({length:bars},(_,i)=>(
                <div key={i} className="w-1 rounded-full" style={{background:track.color,height:`${4+Math.random()*20}px`,animation:`bootPulse ${0.4+Math.random()*0.4}s ease infinite`,animationDelay:`${i*0.05}s`}} />
              ))}
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">{track.title}</p>
          <p className="text-sm opacity-50">{track.artist}</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-[10px] opacity-40 mb-1"><span>{fmt(progress)}</span><span>{fmt(track.duration)}</span></div>
          <div className="h-1.5 rounded-full overflow-hidden cursor-pointer" style={{background:'rgba(255,255,255,0.1)'}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setProgress(Math.round(((e.clientX-r.left)/r.width)*track.duration));}}>
            <div className="h-full rounded-full transition-all" style={{width:`${(progress/track.duration)*100}%`,background:track.color}} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={()=>setShuffle(s=>!s)} style={{color:shuffle?theme.accent:'rgba(255,255,255,0.3)'}}><Shuffle size={16}/></button>
          <button onClick={prev} className="hover:opacity-70"><SkipBack size={22}/></button>
          <button onClick={()=>setPlaying(p=>!p)} className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{background:theme.accent,boxShadow:`0 0 20px ${theme.accent}60`}}>
            {playing?<Pause size={20}/>:<Play size={20} className="ml-0.5"/>}
          </button>
          <button onClick={next} className="hover:opacity-70"><SkipForward size={22}/></button>
          <button onClick={()=>setRepeat(r=>!r)} style={{color:repeat?theme.accent:'rgba(255,255,255,0.3)'}}><Repeat size={16}/></button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-xs">
          <button onClick={()=>setMuted(m=>!m)}>{muted?<VolumeX size={14}/>:<Volume2 size={14}/>}</button>
          <input type="range" min={0} max={100} value={muted?0:volume} onChange={e=>setVolume(+e.target.value)} className="flex-1" style={{accentColor:theme.accent}} />
          <span className="text-[10px] opacity-40 w-6">{muted?0:volume}</span>
        </div>
      </div>
      <div className="border-t flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        {TRACKS.map((t,i)=>(
          <div key={t.id} onClick={()=>{setTrackIdx(i);setProgress(0);setPlaying(true);}} className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-all"
            style={{background:i===trackIdx?`${t.color}15`:'transparent'}}>
            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{background:`${t.color}25`}}>
              {i===trackIdx&&playing?<div className="w-2 h-2 rounded-full" style={{background:t.color,animation:'bootPulse 0.6s ease infinite'}}/>:<Music size={11} style={{color:t.color}}/>}
            </div>
            <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{t.title}</p><p className="text-[10px] opacity-40 truncate">{t.artist}</p></div>
            <span className="text-[10px] opacity-40">{fmt(t.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
