'use client';
import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Play, Pause, Volume2, VolumeX, Maximize2, Upload, SkipBack, SkipForward } from 'lucide-react';
export default function VideoPlayer({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [src, setSrc] = useState('');
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const toggle = () => {
    const v = videoRef.current; if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(p => !p);
  };

  const load = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setSrc(URL.createObjectURL(f)); setPlaying(false); setProgress(0);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current; if (!v || !v.duration) return;
    setCurrent(v.currentTime); setProgress((v.currentTime / v.duration) * 100);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current; if (!v) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    v.volume = volume / 100;
  }, [volume]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#000' }}>
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {src ? (
          <video ref={videoRef} src={src} className="max-w-full max-h-full"
            onTimeUpdate={onTimeUpdate} onEnded={() => setPlaying(false)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            muted={muted} />
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer opacity-40 hover:opacity-60 transition-opacity">
            <Upload size={40} className="text-white" />
            <p className="text-white text-sm">Open video file</p>
            <input type="file" accept="video/*" className="hidden" onChange={load} />
          </label>
        )}
      </div>

      <div className="px-4 pb-3 pt-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full mb-3 cursor-pointer relative" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={seek}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: theme.accent }} />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }} className="text-white/60 hover:text-white"><SkipBack size={16} /></button>
          <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: theme.accent }}>
            {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }} className="text-white/60 hover:text-white"><SkipForward size={16} /></button>
          <button onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }} className="text-white/70 hover:text-white">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} className="w-20" style={{ accentColor: theme.accent }} />
          <span className="text-white/40 text-[10px] font-mono">{fmt(current)} / {fmt(duration)}</span>
          <div className="flex-1" />
          <label className="text-white/40 hover:text-white cursor-pointer"><Upload size={14} /><input type="file" accept="video/*" className="hidden" onChange={load} /></label>
          <button className="text-white/40 hover:text-white" onClick={() => videoRef.current?.requestFullscreen()}><Maximize2 size={16} /></button>
        </div>
      </div>
    </div>
  );
}
