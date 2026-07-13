'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
const W=600,H=380,PAD_H=70,PAD_W=10,BALL=8,SPEED=4;
export default function Pong({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ ball:{x:W/2,y:H/2,vx:SPEED,vy:SPEED*0.7}, p1:{y:H/2-PAD_H/2}, p2:{y:H/2-PAD_H/2}, score:{p1:0,p2:0}, running:false, keys:new Set<string>() });
  const [score, setScore] = useState({p1:0,p2:0});
  const [running, setRunning] = useState(false);
  const raf = useRef<number>(0);
  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const s = state.current;
    ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0,0,W,H);
    ctx.setLineDash([8,8]); ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=theme.accent;
    ctx.fillRect(20,s.p1.y,PAD_W,PAD_H);
    ctx.fillRect(W-20-PAD_W,s.p2.y,PAD_W,PAD_H);
    ctx.beginPath(); ctx.arc(s.ball.x,s.ball.y,BALL,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='bold 28px monospace'; ctx.textAlign='center';
    ctx.fillText(String(s.score.p1),W/4,36); ctx.fillText(String(s.score.p2),W*3/4,36);
  }, [theme.accent]);
  const update = useCallback(() => {
    const s = state.current; if (!s.running) return;
    const spd = 4.5;
    if (s.keys.has('w')) s.p1.y = Math.max(0, s.p1.y - spd);
    if (s.keys.has('s')) s.p1.y = Math.min(H-PAD_H, s.p1.y + spd);
    // AI for p2
    const mid = s.p2.y + PAD_H/2;
    if (s.ball.y > mid+10) s.p2.y = Math.min(H-PAD_H, s.p2.y+3.5);
    else if (s.ball.y < mid-10) s.p2.y = Math.max(0, s.p2.y-3.5);
    s.ball.x += s.ball.vx; s.ball.y += s.ball.vy;
    if (s.ball.y <= BALL || s.ball.y >= H-BALL) s.ball.vy *= -1;
    if (s.ball.x <= 20+PAD_W+BALL && s.ball.y >= s.p1.y && s.ball.y <= s.p1.y+PAD_H) { s.ball.vx=Math.abs(s.ball.vx)*1.03; s.ball.vy+=(s.ball.y-s.p1.y-PAD_H/2)*0.07; }
    if (s.ball.x >= W-20-PAD_W-BALL && s.ball.y >= s.p2.y && s.ball.y <= s.p2.y+PAD_H) { s.ball.vx=-Math.abs(s.ball.vx)*1.03; s.ball.vy+=(s.ball.y-s.p2.y-PAD_H/2)*0.07; }
    if (s.ball.x < 0) { s.score.p2++; setScore({...s.score}); s.ball={x:W/2,y:H/2,vx:SPEED,vy:SPEED*0.7}; }
    if (s.ball.x > W) { s.score.p1++; setScore({...s.score}); s.ball={x:W/2,y:H/2,vx:-SPEED,vy:SPEED*0.7}; }
    s.ball.vy = Math.max(-8, Math.min(8, s.ball.vy));
  }, []);
  useEffect(() => {
    const loop = () => { update(); draw(); raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [update, draw]);
  useEffect(() => {
    const down = (e:KeyboardEvent) => { state.current.keys.add(e.key.toLowerCase()); if(e.key===' '){e.preventDefault();} };
    const up = (e:KeyboardEvent) => state.current.keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  const toggleRun = () => { state.current.running = !state.current.running; setRunning(r => !r); };
  const reset = () => { state.current = { ball:{x:W/2,y:H/2,vx:SPEED,vy:SPEED*0.7}, p1:{y:H/2-PAD_H/2}, p2:{y:H/2-PAD_H/2}, score:{p1:0,p2:0}, running:false, keys:new Set() }; setScore({p1:0,p2:0}); setRunning(false); };
  return (
    <div className="flex flex-col items-center h-full gap-2 p-3" style={{ background: '#0d0d1a', color: '#e2e8f0' }}>
      <div className="flex gap-3 text-xs opacity-50"><span>W/S to move</span><span>•</span><span>AI opponent on right</span></div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl max-w-full" style={{ border: `1px solid ${theme.accent}30` }} />
      <div className="flex gap-3">
        <button onClick={toggleRun} className="px-6 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: theme.accent }}>{running ? '⏸ Pause' : '▶ Play'}</button>
        <button onClick={reset} className="px-4 py-2 rounded-xl text-sm hover:bg-white/10">Reset</button>
      </div>
    </div>
  );
}
