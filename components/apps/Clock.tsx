'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Plus, Trash2, Play, Pause, RotateCcw, BellRing, Bell, X } from 'lucide-react';

type Tab = 'world' | 'alarm' | 'stopwatch' | 'timer';

interface WorldClock { id: string; city: string; tz: string }
interface Alarm { id: string; time: string; label: string; enabled: boolean; days: number[] }

const WORLD_CLOCKS: Omit<WorldClock,'id'>[] = [
  { city: 'New York',  tz: 'America/New_York' },
  { city: 'London',   tz: 'Europe/London' },
  { city: 'Tokyo',    tz: 'Asia/Tokyo' },
  { city: 'Dubai',    tz: 'Asia/Dubai' },
  { city: 'Sydney',   tz: 'Australia/Sydney' },
  { city: 'Singapore',tz: 'Asia/Singapore' },
];

const TZ_DB: Record<string, string> = {
  'New York': 'America/New_York','Los Angeles': 'America/Los_Angeles','Chicago': 'America/Chicago',
  'London': 'Europe/London','Paris': 'Europe/Paris','Berlin': 'Europe/Berlin',
  'Moscow': 'Europe/Moscow','Dubai': 'Asia/Dubai','Mumbai': 'Asia/Kolkata',
  'Singapore': 'Asia/Singapore','Tokyo': 'Asia/Tokyo','Seoul': 'Asia/Seoul',
  'Sydney': 'Australia/Sydney','São Paulo': 'America/Sao_Paulo','Lagos': 'Africa/Lagos',
};

function getTime(tz: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
}
function getDate(tz: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
}
function fmtMs(ms: number) {
  const cs = Math.floor((ms / 10) % 100);
  const s  = Math.floor(ms / 1000) % 60;
  const m  = Math.floor(ms / 60000) % 60;
  const h  = Math.floor(ms / 3600000);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}
function fmtSec(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function Clock({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tab, setTab] = useState<Tab>('world');
  const [now, setNow] = useState(new Date());

  // World clocks
  const [clocks, setClocks] = useState<WorldClock[]>(
    WORLD_CLOCKS.map((c, i) => ({ ...c, id: String(i) }))
  );
  const [addCity, setAddCity] = useState('');

  // Alarms
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarm, setNewAlarm] = useState({ time: '08:00', label: '' });
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swMs, setSwMs] = useState(0);
  const [swLaps, setSwLaps] = useState<number[]>([]);
  const swStart = useRef<number | null>(null);

  // Timer
  const [timerSec, setTimerSec] = useState(0);
  const [timerInput, setTimerInput] = useState({ m: '05', s: '00' });
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Stopwatch
  useEffect(() => {
    if (!swRunning) return;
    const start = Date.now() - swMs;
    swStart.current = start;
    const iv = setInterval(() => setSwMs(Date.now() - start), 10);
    return () => clearInterval(iv);
  }, [swRunning]);

  // Timer
  const startTimer = useCallback(() => {
    const total = parseInt(timerInput.m) * 60 + parseInt(timerInput.s);
    if (total <= 0) return;
    setTimerSec(total);
    setTimerRunning(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerSec(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerInput]);

  // Alarm checker
  useEffect(() => {
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    alarms.filter(a => a.enabled && a.time === hhmm && now.getSeconds() === 0).forEach(a => {
      if (Notification.permission === 'granted') {
        new Notification(`⏰ Alarm: ${a.label || a.time}`);
      }
    });
  }, [now, alarms]);

  const dk = theme.mode === 'dark';
  const bg = dk ? '#0d0d1a' : '#f5f5fb';
  const txt = dk ? '#e2e8f0' : '#1e1e2e';
  const card = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const border = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  // Analog clock hands
  const sec = now.getSeconds(), min = now.getMinutes(), hr = now.getHours() % 12;
  const secDeg = sec * 6;
  const minDeg = min * 6 + sec * 0.1;
  const hrDeg  = hr * 30 + min * 0.5;

  return (
    <div className="flex flex-col h-full" style={{ background: bg, color: txt }}>
      {/* Tabs */}
      <div className="flex border-b flex-shrink-0 px-3 pt-2 gap-1" style={{ borderColor: border }}>
        {(['world','alarm','stopwatch','timer'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-t-lg text-xs font-medium capitalize transition-all"
            style={{ background: tab === t ? `${theme.accent}20` : 'transparent', color: tab === t ? theme.accent : txt + '60', borderBottom: tab === t ? `2px solid ${theme.accent}` : '2px solid transparent' }}>
            {t === 'world' ? 'World' : t === 'alarm' ? 'Alarm' : t === 'stopwatch' ? 'Stopwatch' : 'Timer'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">

        {/* ── World Clocks ────────────────────────────────── */}
        {tab === 'world' && (
          <div className="flex flex-col gap-3">
            {/* Big analog clock */}
            <div className="flex justify-center my-2">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="78" fill="none" stroke={`${theme.accent}20`} strokeWidth="2"/>
                <circle cx="80" cy="80" r="68" fill={dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} stroke={`${theme.accent}30`} strokeWidth="1"/>
                {Array.from({length:12}).map((_,i)=>{
                  const a=(i*30-90)*Math.PI/180;
                  const r1=60,r2=i%3===0?52:55;
                  return <line key={i} x1={80+r1*Math.cos(a)} y1={80+r1*Math.sin(a)} x2={80+r2*Math.cos(a)} y2={80+r2*Math.sin(a)} stroke={`${theme.accent}50`} strokeWidth={i%3===0?2:1}/>;
                })}
                {/* Hour */}
                <line x1="80" y1="80" x2={80+38*Math.sin(hrDeg*Math.PI/180)} y2={80-38*Math.cos(hrDeg*Math.PI/180)} stroke={txt} strokeWidth="3" strokeLinecap="round"/>
                {/* Min */}
                <line x1="80" y1="80" x2={80+52*Math.sin(minDeg*Math.PI/180)} y2={80-52*Math.cos(minDeg*Math.PI/180)} stroke={txt} strokeWidth="2" strokeLinecap="round"/>
                {/* Sec */}
                <line x1="80" y1="80" x2={80+58*Math.sin(secDeg*Math.PI/180)} y2={80-58*Math.cos(secDeg*Math.PI/180)} stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="80" cy="80" r="3" fill={theme.accent}/>
              </svg>
            </div>
            <p className="text-center font-mono text-3xl font-bold" style={{ color: theme.accent }}>{now.toLocaleTimeString('en-US',{hour12:false})}</p>
            <p className="text-center text-xs opacity-40">{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>

            <div className="mt-2 flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold opacity-40 uppercase tracking-widest">World Clocks</p>
              {clocks.map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl group" style={{ background: card, border: `1px solid ${border}` }}>
                  <div>
                    <p className="text-xs font-semibold">{c.city}</p>
                    <p className="text-[10px] opacity-40">{getDate(c.tz)}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p className="font-mono text-lg font-bold" style={{ color: theme.accent }}>{getTime(c.tz)}</p>
                    <button onClick={() => setClocks(prev => prev.filter(x => x.id !== c.id))} className="opacity-0 group-hover:opacity-40 hover:!opacity-80 hover:text-red-400 transition-all">
                      <X size={12}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input list="cities" value={addCity} onChange={e => setAddCity(e.target.value)}
                placeholder="Add city (e.g. Paris)…"
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: card, border: `1px solid ${border}`, caretColor: theme.accent, color: txt }}/>
              <datalist id="cities">{Object.keys(TZ_DB).map(c => <option key={c} value={c}/>)}</datalist>
              <button onClick={() => {
                const tz = TZ_DB[addCity];
                if (tz && !clocks.find(c => c.city === addCity)) {
                  setClocks(prev => [...prev, { id: Date.now().toString(), city: addCity, tz }]);
                  setAddCity('');
                }
              }} className="px-3 py-2 rounded-xl text-white text-xs" style={{ background: theme.accent }}>
                <Plus size={14}/>
              </button>
            </div>
          </div>
        )}

        {/* ── Alarms ──────────────────────────────────────── */}
        {tab === 'alarm' && (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl flex flex-col gap-2" style={{ background: card, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-60">New Alarm</p>
              <input type="time" value={newAlarm.time} onChange={e => setNewAlarm(p => ({...p, time: e.target.value}))}
                className="text-2xl font-mono font-bold bg-transparent outline-none" style={{ caretColor: theme.accent, color: theme.accent }}/>
              <input value={newAlarm.label} onChange={e => setNewAlarm(p => ({...p, label: e.target.value}))}
                placeholder="Label (optional)"
                className="px-2 py-1 rounded-lg text-xs bg-transparent outline-none border"
                style={{ borderColor: border, caretColor: theme.accent, color: txt }}/>
              <button onClick={() => {
                setAlarms(prev => [...prev, { id: Date.now().toString(), time: newAlarm.time, label: newAlarm.label, enabled: true, days: [] }]);
                Notification.requestPermission();
              }} className="py-1.5 rounded-xl text-white text-xs font-medium" style={{ background: theme.accent }}>
                Add Alarm
              </button>
            </div>
            {alarms.length === 0 ? (
              <p className="text-xs opacity-30 text-center py-4">No alarms set</p>
            ) : alarms.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: card, border: `1px solid ${border}` }}>
                <div className="flex-1">
                  <p className="font-mono text-xl font-bold" style={{ color: a.enabled ? theme.accent : txt + '40' }}>{a.time}</p>
                  {a.label && <p className="text-xs opacity-50">{a.label}</p>}
                </div>
                <button onClick={() => setAlarms(prev => prev.map(x => x.id === a.id ? {...x, enabled: !x.enabled} : x))}
                  className="w-10 h-6 rounded-full transition-all relative"
                  style={{ background: a.enabled ? theme.accent : 'rgba(255,255,255,0.12)' }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: a.enabled ? '18px' : '2px' }}/>
                </button>
                <button onClick={() => setAlarms(prev => prev.filter(x => x.id !== a.id))} className="opacity-30 hover:opacity-80 hover:text-red-400 transition-colors">
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Stopwatch ───────────────────────────────────── */}
        {tab === 'stopwatch' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-6xl font-mono font-bold tabular-nums mt-4" style={{ color: theme.accent }}>{fmtMs(swMs)}</div>
            <div className="flex gap-3">
              <button onClick={() => { setSwLaps(prev => [...prev, swMs]); }}
                disabled={!swRunning}
                className="px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
                style={{ background: card, border: `1px solid ${border}`, color: txt }}>
                Lap
              </button>
              <button onClick={() => setSwRunning(v => !v)}
                className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: theme.accent, boxShadow: swRunning ? 'none' : `0 0 20px ${theme.accent}50` }}>
                {swRunning ? <><Pause size={14} className="inline mr-1.5"/>Pause</> : <><Play size={14} className="inline mr-1.5"/>Start</>}
              </button>
              <button onClick={() => { setSwRunning(false); setSwMs(0); setSwLaps([]); }}
                className="px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: card, border: `1px solid ${border}`, color: txt }}>
                <RotateCcw size={14}/>
              </button>
            </div>
            {swLaps.length > 0 && (
              <div className="w-full flex flex-col gap-1">
                <p className="text-[10px] font-semibold opacity-40 uppercase tracking-widest">Laps</p>
                {[...swLaps].reverse().map((lap, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: card }}>
                    <span className="text-xs opacity-40">Lap {swLaps.length - i}</span>
                    <span className="font-mono text-sm">{fmtMs(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Timer ───────────────────────────────────────── */}
        {tab === 'timer' && (
          <div className="flex flex-col items-center gap-6">
            {timerRunning || timerSec > 0 ? (
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke={`${theme.accent}15`} strokeWidth="8"/>
                  <circle cx="80" cy="80" r="70" fill="none" stroke={theme.accent} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*70}`}
                    strokeDashoffset={`${2*Math.PI*70*(1 - timerSec / (parseInt(timerInput.m)*60 + parseInt(timerInput.s) || 1))}`}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}/>
                </svg>
                <p className="text-4xl font-mono font-bold" style={{ color: timerSec < 10 ? '#ef4444' : theme.accent }}>{fmtSec(timerSec)}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => setTimerInput(p => ({...p, m: String(Math.min(99,parseInt(p.m)+1)).padStart(2,'0')}))}>▲</button>
                  <input type="number" value={timerInput.m} onChange={e => setTimerInput(p => ({...p, m: e.target.value.padStart(2,'0')}))}
                    className="w-20 text-center text-5xl font-mono font-bold bg-transparent outline-none" style={{ color: theme.accent }}/>
                  <button onClick={() => setTimerInput(p => ({...p, m: String(Math.max(0,parseInt(p.m)-1)).padStart(2,'0')}))}>▼</button>
                  <span className="text-xs opacity-40">min</span>
                </div>
                <span className="text-4xl font-bold opacity-40">:</span>
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => setTimerInput(p => ({...p, s: String(Math.min(59,parseInt(p.s)+1)).padStart(2,'0')}))}>▲</button>
                  <input type="number" value={timerInput.s} onChange={e => setTimerInput(p => ({...p, s: e.target.value.padStart(2,'0')}))}
                    className="w-20 text-center text-5xl font-mono font-bold bg-transparent outline-none" style={{ color: theme.accent }}/>
                  <button onClick={() => setTimerInput(p => ({...p, s: String(Math.max(0,parseInt(p.s)-1)).padStart(2,'0')}))}>▼</button>
                  <span className="text-xs opacity-40">sec</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              {timerRunning ? (
                <button onClick={() => { clearInterval(timerRef.current!); setTimerRunning(false); }}
                  className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#ef4444' }}>
                  <Pause size={14} className="inline mr-1.5"/>Pause
                </button>
              ) : (
                <button onClick={timerSec > 0 ? () => { setTimerRunning(true); timerRef.current = setInterval(() => setTimerSec(p => { if(p<=1){clearInterval(timerRef.current!);setTimerRunning(false);return 0;} return p-1;}),1000); } : startTimer}
                  className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: theme.accent }}>
                  <Play size={14} className="inline mr-1.5"/>{timerSec > 0 ? 'Resume' : 'Start'}
                </button>
              )}
              <button onClick={() => { clearInterval(timerRef.current!); setTimerRunning(false); setTimerSec(0); }}
                className="px-4 py-2.5 rounded-xl text-sm" style={{ background: card, border: `1px solid ${border}`, color: txt }}>
                <RotateCcw size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
