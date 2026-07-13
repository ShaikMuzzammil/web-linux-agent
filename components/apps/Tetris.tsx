'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { RotateCcw, Play, Pause } from 'lucide-react';
const W=10,H=20;
const PIECES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,0],[0,1,1]],
];
const COLORS = ['','#22d3ee','#f59e0b','#a78bfa','#f87171','#fb923c','#4ade80','#f472b6'];
type Grid = number[][];
function emptyGrid(): Grid { return Array.from({length:H},()=>Array(W).fill(0)); }
function rotate(m: number[][]): number[][] { return m[0].map((_,i)=>m.map(r=>r[i]).reverse()); }
function valid(g: Grid, piece: number[][], r: number, c: number) {
  return piece.every((row,dr)=>row.every((v,dc)=>!v||((r+dr>=0)&&(r+dr<H)&&(c+dc>=0)&&(c+dc<W)&&!g[r+dr][c+dc])));
}
export default function Tetris({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [piece, setPiece] = useState<number[][]>(PIECES[0]);
  const [pieceIdx, setPieceIdx] = useState(1);
  const [pos, setPos] = useState({r:0,c:3});
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(()=>{try{return parseInt(localStorage.getItem('wlos_tetris_best')||'0');}catch{return 0;}});
  const nextIdx = useRef(Math.floor(Math.random()*7)+1);
  const spawnPiece = useCallback((g: Grid) => {
    const idx = nextIdx.current; nextIdx.current = Math.floor(Math.random()*7)+1;
    const p = PIECES[idx-1]; const c = Math.floor((W-p[0].length)/2);
    if (!valid(g, p, 0, c)) { setOver(true); setRunning(false); return; }
    setPiece(p); setPieceIdx(idx); setPos({r:0,c});
  }, []);
  const lockPiece = useCallback((g: Grid, p: number[][], r: number, c: number) => {
    const ng = g.map(row=>[...row]);
    p.forEach((row,dr)=>row.forEach((v,dc)=>{ if(v) ng[r+dr][c+dc]=pieceIdx; }));
    let cleared=0;
    const filtered = ng.filter(row=>row.some(v=>!v));
    cleared = H - filtered.length;
    const newGrid = [...Array(cleared).fill(Array(W).fill(0)), ...filtered];
    setGrid(newGrid); setLines(l=>l+cleared); setScore(s=>{const ns=s+cleared*100*(cleared>1?cleared:1);const nb=Math.max(best,ns);setBest(nb);try{localStorage.setItem('wlos_tetris_best',String(nb));}catch{}return ns;});
    spawnPiece(newGrid);
  }, [pieceIdx, best, spawnPiece]);
  const drop = useCallback(() => {
    setPos(p=>{
      const nr=p.r+1;
      if (valid(grid,piece,nr,p.c)) return {r:nr,c:p.c};
      lockPiece(grid,piece,p.r,p.c); return p;
    });
  }, [grid, piece, lockPiece]);
  useEffect(()=>{ if(!running) return; const iv=setInterval(drop, Math.max(100,600-lines*10)); return()=>clearInterval(iv); },[running,drop,lines]);
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(!running) return;
      if(e.key==='ArrowLeft') setPos(p=>valid(grid,piece,p.r,p.c-1)?{r:p.r,c:p.c-1}:p);
      if(e.key==='ArrowRight') setPos(p=>valid(grid,piece,p.r,p.c+1)?{r:p.r,c:p.c+1}:p);
      if(e.key==='ArrowDown') drop();
      if(e.key==='ArrowUp'){ const rot=rotate(piece); if(valid(grid,rot,pos.r,pos.c)) setPiece(rot); }
      if(e.key===' '){ e.preventDefault(); let nr=pos.r; while(valid(grid,piece,nr+1,pos.c)) nr++; lockPiece(grid,piece,nr,pos.c); }
    };
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);
  },[running,grid,piece,pos,drop,lockPiece]);
  const reset = () => { const g=emptyGrid(); setGrid(g); setScore(0); setLines(0); setOver(false); setRunning(false); setPieceIdx(1); nextIdx.current=Math.floor(Math.random()*7)+1; setPiece(PIECES[0]); setPos({r:0,c:3}); };
  const displayGrid = grid.map(r=>[...r]);
  if (!over) piece.forEach((row,dr)=>row.forEach((v,dc)=>{ if(v&&pos.r+dr>=0&&pos.r+dr<H) displayGrid[pos.r+dr][pos.c+dc]=pieceIdx; }));
  const ghostRow = (()=>{ let gr=pos.r; while(valid(grid,piece,gr+1,pos.c)) gr++; return gr; })();
  const displayGrid2 = displayGrid.map(r=>[...r]);
  if (!over) piece.forEach((row,dr)=>row.forEach((v,dc)=>{ if(v&&ghostRow+dr>=0&&ghostRow+dr<H&&!displayGrid2[ghostRow+dr][pos.c+dc]) displayGrid2[ghostRow+dr][pos.c+dc]=-pieceIdx; }));
  return (
    <div className="flex flex-col items-center h-full gap-2 p-3" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-xs text-center"><p className="opacity-40">Score</p><p className="font-bold">{score}</p></div>
        <div className="flex gap-2">
          <button onClick={()=>setRunning(r=>!r)} disabled={over} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30" style={{color:theme.accent}}>{running?<Pause size={16}/>:<Play size={16}/>}</button>
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/10"><RotateCcw size={16}/></button>
        </div>
        <div className="text-xs text-center"><p className="opacity-40">Best</p><p className="font-bold">{best}</p></div>
      </div>
      <div className="relative flex gap-3">
        <div style={{display:'grid',gridTemplateColumns:`repeat(${W},18px)`,gap:1,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:4}}>
          {displayGrid2.flat().map((v,i)=>(
            <div key={i} style={{width:18,height:18,borderRadius:2,background:v===0?'rgba(255,255,255,0.02)':v<0?COLORS[-v]+'40':COLORS[v],border:v===0?'1px solid rgba(255,255,255,0.03)':'none',opacity:1}} />
          ))}
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="p-2 rounded-lg" style={{background:'rgba(255,255,255,0.04)'}}><p className="opacity-40 mb-1">Next</p>
            <div style={{display:'grid',gridTemplateColumns:`repeat(4,14px)`,gap:1}}>
              {Array.from({length:16},(_, i)=>{const r=Math.floor(i/4),c=i%4; const p=PIECES[nextIdx.current-1]; const v=p[r]?.[c]||0; return <div key={i} style={{width:14,height:14,borderRadius:2,background:v?COLORS[nextIdx.current]:'rgba(255,255,255,0.03)'}} />;}).flat()}
            </div>
          </div>
          <div className="p-2 rounded-lg" style={{background:'rgba(255,255,255,0.04)'}}><p className="opacity-40">Lines</p><p className="font-bold">{lines}</p></div>
          <div className="p-2 rounded-lg" style={{background:'rgba(255,255,255,0.04)'}}><p className="opacity-40">Level</p><p className="font-bold">{Math.floor(lines/10)+1}</p></div>
        </div>
        {(over || !running) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg" style={{background:'rgba(0,0,0,0.7)'}}>
            {over && <p className="text-red-400 font-bold mb-2">Game Over!</p>}
            <button onClick={()=>{ if(over) reset(); else setRunning(true); }} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:theme.accent}}>{over?'Restart':'Start'}</button>
          </div>
        )}
      </div>
      <p className="text-[10px] opacity-30">← → move · ↑ rotate · ↓ drop · Space hard drop</p>
    </div>
  );
}
