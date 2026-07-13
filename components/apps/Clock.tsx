'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
type Tab = 'clock' | 'stopwatch' | 'timer' | 'world';
const ZONES = [['New York', 'America/New_York'], ['London', 'Europe/London'], ['Paris', 'Europe/Paris'], ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney'], ['Dubai', 'Asia/Dubai'], ['Singapore', 'Asia/Singapore'], ['Los Angeles', 'America/Los_Angeles']];
export default function Clock({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tab, setTab] = useState<Tab>('clock');
  const [now, setNow] = useState(new Date());
  const [sw, setSw] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerInput, setTimerInput] = useState({ h: '0', m: '5', s: '0' });
  const [timerRunning, setTimerRunning] = useState(false);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { const iv = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => {
    if (swRunning) { swRef.current = setInterval(() => setSw(s => s + 10), 10); }
    else if (swRef.current) clearInterval(swRef.current);
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);
  useEffect(() => {
    if (timerRunning && timerSecs > 0) { timerRef.current = setInterval(() => setTimerSecs(s => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; }), 1000); }
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timerSecs]);

  const startTimer = () => { const secs = parseInt(timerInput.h)*3600 + parseInt(timerInput.m)*60 + parseInt(timerInput.s); if (secs > 0) { setTimerSecs(secs); setTimerRunning(true); } };
  const fmt = (ms: number) => { const t = Math.floor(ms/10); return `${String(Math.floor(t/6000)).padStart(2,'0')}:${String(Math.floor(t/100)%60).padStart(2,'0')}.${String(t%100).padStart(2,'0')}`; };
  const fmtT = (s: number) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // Analog clock
  const h = now.getHours()%12, m = now.getMinutes(), s = now.getSeconds();
  const hDeg = h*30 + m*0.5, mDeg = m*6, sDeg = s*6;

  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="flex border-b px-3 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {(['clock','stopwatch','timer','world'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-xs font-medium capitalize border-b-2 transition-all"
            style={{ borderColor: tab === t ? theme.accent : 'transparent', color: tab === t ? theme.accent : 'inherit', opacity: tab === t ? 1 : 0.5 }}>{t}</button>
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {tab === 'clock' && (
          <div className="flex flex-col items-center gap-4">
            <svg width="160" height="160" viewBox="-80 -80 160 160">
              <circle r="76" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              {[...Array(12)].map((_,i) => { const a=(i*30-90)*Math.PI/180; return <circle key={i} cx={Math.cos(a)*66} cy={Math.sin(a)*66} r={i%3===0?3:1.5} fill={i%3===0?theme.accent:'rgba(255,255,255,0.3)'} />; })}
              {[[hDeg,'rgba(255,255,255,0.9)',48,4],[mDeg,'rgba(255,255,255,0.7)',64,2.5],[sDeg,theme.accent,70,1.5]].map(([deg,color,len,w],i) => {
                const a=(Number(deg)-90)*Math.PI/180; return <line key={i} x1={0} y1={0} x2={Math.cos(a)*Number(len)} y2={Math.sin(a)*Number(len)} stroke={String(color)} strokeWidth={Number(w)} strokeLinecap="round" />;
              })}
              <circle r="4" fill={theme.accent} />
            </svg>
            <p className="text-3xl font-light font-mono">{now.toLocaleTimeString()}</p>
            <p className="text-sm opacity-40">{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        )}
        {tab === 'stopwatch' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <p className="text-4xl font-mono font-light">{fmt(sw)}</p>
            <div className="flex gap-3">
              <button onClick={() => setSwRunning(r => !r)} className="px-6 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: theme.accent }}>{swRunning ? <Pause size={16}/> : <Play size={16}/>}</button>
              <button onClick={() => { setSw(0); setSwRunning(false); setLaps([]); }} className="px-4 py-2 rounded-xl text-sm hover:bg-white/10"><RotateCcw size={16}/></button>
              {swRunning && <button onClick={() => setLaps(l => [...l, sw])} className="px-4 py-2 rounded-xl text-sm hover:bg-white/10"><Flag size={16}/></button>}
            </div>
            {laps.length > 0 && <div className="w-full max-h-32 overflow-y-auto space-y-1">{laps.map((l,i) => <div key={i} className="flex justify-between text-xs px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}><span>Lap {i+1}</span><span className="font-mono">{fmt(l)}</span></div>)}</div>}
          </div>
        )}
        {tab === 'timer' && (
          <div className="flex flex-col items-center gap-4">
            {timerSecs > 0 ? (
              <>
                <div className="relative w-32 h-32">
                  <svg className="absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke={theme.accent} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*44}`} strokeDashoffset={`${2*Math.PI*44*(1-timerSecs/(parseInt(timerInput.h)*3600+parseInt(timerInput.m)*60+parseInt(timerInput.s)))}`} transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"><p className="text-xl font-mono">{fmtT(timerSecs)}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTimerRunning(r => !r)} className="px-6 py-2 rounded-xl text-sm text-white" style={{ background: theme.accent }}>{timerRunning ? <Pause size={16}/> : <Play size={16}/>}</button>
                  <button onClick={() => { setTimerSecs(0); setTimerRunning(false); }} className="px-4 py-2 rounded-xl hover:bg-white/10"><RotateCcw size={16}/></button>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2 items-center text-2xl font-mono">
                  {[['h',timerInput.h,'m',timerInput.m,'s',timerInput.s]].flat().reduce((a:React.ReactNode[],v,i) => {
                    if(i%2===0) a.push(<input key={i} value={v} onChange={e => setTimerInput(t => ({...t,[i===0?'h':i===2?'m':'s']:e.target.value}))} className="w-12 text-center bg-transparent outline-none" style={{ caretColor: theme.accent }} />);
                    else if(i<5) a.push(<span key={`sep${i}`} className="opacity-40">:</span>);
                    return a;
                  },[])}
                </div>
                <button onClick={startTimer} className="px-6 py-2 rounded-xl text-sm text-white" style={{ background: theme.accent }}>Start Timer</button>
              </>
            )}
          </div>
        )}
        {tab === 'world' && (
          <div className="w-full space-y-2 max-w-sm">
            {ZONES.map(([city, tz]) => {
              const t = new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
              const d = new Date().toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <div key={city} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div><p className="text-sm font-medium">{city}</p><p className="text-[10px] opacity-40">{d}</p></div>
                  <p className="text-xl font-mono font-light" style={{ color: theme.accent }}>{t}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
