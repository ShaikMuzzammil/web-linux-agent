'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
const W=320,H=480,BIRD_X=60,GRAVITY=0.35,JUMP=-7,PIPE_W=52,GAP=135,PIPE_SPEED=2.5;
export default function FlappyBird({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = useRef({ bird:{y:H/2,vy:0}, pipes:[] as {x:number,gap:number}[], score:0, running:false, dead:false, frame:0 });
  const raf = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(()=>{try{return parseInt(localStorage.getItem('wlos_flappy_best')||'0');}catch{return 0;}});
  const [state, setState] = useState<'idle'|'running'|'dead'>('idle');
  const jump = useCallback(() => {
    if (s.current.dead) { reset(); return; }
    if (!s.current.running) { s.current.running = true; setState('running'); }
    s.current.bird.vy = JUMP;
  }, []);
  const reset = () => { s.current = { bird:{y:H/2,vy:0}, pipes:[], score:0, running:false, dead:false, frame:0 }; setState('idle'); setScore(0); };
  const update = useCallback(() => {
    const g = s.current; if (!g.running || g.dead) return;
    g.frame++;
    g.bird.vy += GRAVITY; g.bird.y += g.bird.vy;
    if (g.bird.y > H-20 || g.bird.y < 0) { g.dead = true; setState('dead'); setBest(b=>{const nb=Math.max(b,g.score);localStorage.setItem('wlos_flappy_best',String(nb));return nb;}); return; }
    if (g.frame % 90 === 0) g.pipes.push({ x: W+PIPE_W, gap: 100 + Math.random()*(H-250) });
    g.pipes = g.pipes.filter(p => p.x > -PIPE_W);
    for (const p of g.pipes) {
      p.x -= PIPE_SPEED;
      if (p.x + PIPE_W < BIRD_X+16 && p.x + PIPE_W > BIRD_X+14) { g.score++; setScore(g.score); }
      if (BIRD_X+14 > p.x && BIRD_X-14 < p.x+PIPE_W && (g.bird.y-14 < p.gap || g.bird.y+14 > p.gap+GAP)) { g.dead=true; setState('dead'); setBest(b=>{const nb=Math.max(b,g.score);localStorage.setItem('wlos_flappy_best',String(nb));return nb;}); }
    }
  }, []);
  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d')!; const g = s.current;
    ctx.fillStyle='#1a2a4a'; ctx.fillRect(0,0,W,H);
    // Ground
    ctx.fillStyle='#2d5a1b'; ctx.fillRect(0,H-20,W,20);
    ctx.fillStyle='#4ade80'; ctx.fillRect(0,H-22,W,4);
    // Pipes
    for (const p of g.pipes) {
      ctx.fillStyle='#4ade80';
      ctx.fillRect(p.x,0,PIPE_W,p.gap);
      ctx.fillRect(p.x,p.gap+GAP,PIPE_W,H-p.gap-GAP);
      ctx.fillStyle='#22c55e';
      ctx.fillRect(p.x-4,p.gap-16,PIPE_W+8,18);
      ctx.fillRect(p.x-4,p.gap+GAP,PIPE_W+8,18);
    }
    // Bird
    ctx.save(); ctx.translate(BIRD_X,g.bird.y); ctx.rotate(Math.min(Math.PI/4, g.bird.vy*0.07));
    ctx.fillStyle=theme.accent; ctx.beginPath(); ctx.ellipse(0,0,16,12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(6,-3,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(8,-2,2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fb923c'; ctx.beginPath(); ctx.moveTo(14,2); ctx.lineTo(22,0); ctx.lineTo(14,6); ctx.fill();
    ctx.restore();
    // Score
    ctx.fillStyle='#fff'; ctx.font='bold 24px monospace'; ctx.textAlign='center'; ctx.fillText(String(g.score),W/2,44);
  }, [theme.accent]);
  useEffect(()=>{
    const loop=()=>{ update(); draw(); raf.current=requestAnimationFrame(loop); };
    raf.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf.current);
  },[update,draw]);
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(e.key===' '||e.key==='ArrowUp'){e.preventDefault();jump();} };
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);
  },[jump]);
  return (
    <div className="flex flex-col items-center h-full gap-2 p-3" style={{ background: '#0d0d1a', color: '#e2e8f0' }}>
      <div className="flex justify-between w-full max-w-xs text-xs"><span className="opacity-40">Score: <b>{score}</b></span><span className="opacity-40">Best: <b>{best}</b></span></div>
      <div className="relative">
        <canvas ref={canvasRef} width={W} height={H} onClick={jump} className="rounded-xl cursor-pointer max-h-80" style={{ border: `1px solid ${theme.accent}30`, maxWidth: '100%' }} />
        {state === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <p className="text-white font-bold text-xl mb-2">Flappy Bird</p>
            <p className="text-white/60 text-sm">Click or Space to start</p>
          </div>
        )}
        {state === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <p className="text-red-400 font-bold text-xl mb-1">Game Over!</p>
            <p className="text-white/60 text-sm mb-3">Score: {score}</p>
            <button onClick={reset} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: theme.accent }}>Try Again</button>
          </div>
        )}
      </div>
      <p className="text-[10px] opacity-30">Click or Space to flap</p>
    </div>
  );
}
