'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Play, Pause } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

const COLS = 20, ROWS = 20, CELL = 20;
type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Pt = [number, number];

function rand(): Pt { return [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]; }

export default function Snake({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [snake, setSnake] = useState<Pt[]>([[10,10],[9,10],[8,10]]);
  const [dir, setDir] = useState<Dir>('RIGHT');
  const [food, setFood] = useState<Pt>([15,10]);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => { try { return parseInt(localStorage.getItem('wlos_snake_best') || '0'); } catch { return 0; }});
  const [dead, setDead] = useState(false);
  const [speed, setSpeed] = useState(150);
  const dirRef = useRef<Dir>('RIGHT');
  const snakeRef = useRef<Pt[]>([[10,10],[9,10],[8,10]]);

  const reset = () => { const s: Pt[] = [[10,10],[9,10],[8,10]]; setSnake(s); snakeRef.current = s; dirRef.current = 'RIGHT'; setDir('RIGHT'); setFood(rand()); setScore(0); setDead(false); setRunning(false); };

  const tick = useCallback(() => {
    const s = snakeRef.current;
    const d = dirRef.current;
    const [hx, hy] = s[0];
    const moves: Record<Dir, Pt> = { RIGHT: [hx+1, hy], LEFT: [hx-1, hy], UP: [hx, hy-1], DOWN: [hx, hy+1] };
    const [nx, ny] = moves[d];
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || s.some(([x,y]) => x===nx && y===ny)) {
      setDead(true); setRunning(false);
      setScore((sc) => { const b = Math.max(best, sc); setBest(b); try { localStorage.setItem('wlos_snake_best', String(b)); } catch {} return sc; });
      return;
    }
    const newSnake: Pt[] = [[nx, ny], ...s];
    setFood((f) => {
      if (f[0] === nx && f[1] === ny) { setScore((sc) => sc + 10); newSnake.push(s[s.length-1]); return rand(); }
      newSnake.pop();
      return f;
    });
    snakeRef.current = newSnake;
    setSnake([...newSnake]);
  }, [best]);

  useEffect(() => { if (!running) return; const iv = setInterval(tick, speed); return () => clearInterval(iv); }, [running, tick, speed]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
      const opp: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      const nd = map[e.key];
      if (nd && nd !== opp[dirRef.current]) { dirRef.current = nd; setDir(nd); }
      if (e.key === ' ') { e.preventDefault(); setRunning((r) => !r); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="flex flex-col items-center h-full gap-3 p-3" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-xs"><span className="opacity-50">Score </span><span className="font-bold">{score}</span></div>
        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)} disabled={dead} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30">{running ? <Pause size={14}/> : <Play size={14}/>}</button>
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/10"><RotateCcw size={14}/></button>
        </div>
        <div className="text-xs"><span className="opacity-50">Best </span><span className="font-bold">{best}</span></div>
      </div>
      <div className="flex gap-1 text-[10px]">
        {[{l:'Slow',s:200},{l:'Med',s:150},{l:'Fast',s:80}].map(({l,s})=>(
          <button key={l} onClick={()=>setSpeed(s)} className="px-2 py-0.5 rounded" style={{background: speed===s ? `${theme.accent}30` : 'transparent', color: speed===s ? theme.accent : 'inherit'}}>{l}</button>
        ))}
      </div>
      <div className="relative" style={{ width: COLS*CELL, height: ROWS*CELL, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
        {snake.map(([x,y],i) => (
          <div key={i} className="absolute rounded-sm transition-all" style={{ left: x*CELL, top: y*CELL, width: CELL-1, height: CELL-1, background: i===0 ? theme.accent : `${theme.accent}${Math.max(40, 255 - i*8).toString(16).padStart(2,'0')}` }} />
        ))}
        <div className="absolute rounded-full" style={{ left: food[0]*CELL+2, top: food[1]*CELL+2, width: CELL-5, height: CELL-5, background: '#f87171' }} />
        {(dead || !running) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg" style={{ background: 'rgba(0,0,0,0.6)' }}>
            {dead ? <p className="text-red-400 font-bold text-lg mb-2">Game Over!</p> : null}
            <button onClick={() => dead ? reset() : setRunning(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: theme.accent }}>
              {dead ? 'Restart' : 'Start'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] opacity-30">Arrow keys / WASD • Space to pause</p>
    </div>
  );
}
