'use client';
import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
type Grid = (number|null)[][];
const COLORS: Record<number,string> = {2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
function newGrid(): Grid { const g=Array.from({length:4},()=>Array(4).fill(null)); return addRandom(addRandom(g)); }
function addRandom(g: Grid): Grid { const ng=g.map(r=>[...r]); const empty=ng.flatMap((r,i)=>r.map((v,j)=>v===null?[i,j]:null).filter(Boolean)) as [number,number][]; if(!empty.length) return ng; const [r,c]=empty[Math.floor(Math.random()*empty.length)]; ng[r][c]=Math.random()<0.9?2:4; return ng; }
function slide(row: (number|null)[]): (number|null)[] { const v=row.filter(Boolean) as number[]; for(let i=0;i<v.length-1;i++) if(v[i]===v[i+1]){v[i]*=2;v.splice(i+1,1);} return [...v,...Array(4-v.length).fill(null)]; }
function move(g: Grid, dir: string): {grid:Grid,score:number} { let score=0; let ng=g.map(r=>[...r]); if(dir==='LEFT') ng=ng.map(r=>{ const n=slide(r); n.forEach((v,i)=>{if(v&&v!==r[i])score+=0;}); return n; }); else if(dir==='RIGHT') ng=ng.map(r=>slide([...r].reverse()).reverse()); else if(dir==='UP') { ng=transpose(ng); ng=ng.map(r=>slide(r)); ng=transpose(ng); } else { ng=transpose(ng); ng=ng.map(r=>slide([...r].reverse()).reverse()); ng=transpose(ng); } ng.forEach((r,i)=>r.forEach((v,j)=>{if(v&&v!==(g[i][j]||0)&&v===g[i][j]*2)score+=v;})); return {grid:ng,score}; }
function transpose(g: Grid): Grid { return g[0].map((_,i)=>g.map(r=>r[i])); }
function equal(a: Grid, b: Grid) { return a.every((r,i)=>r.every((v,j)=>v===b[i][j])); }
export default function Game2048({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [grid, setGrid] = useState<Grid>(newGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(()=>{ try { return parseInt(localStorage.getItem('wlos_2048_best')||'0');} catch{return 0;}});
  const [won, setWon] = useState(false);
  const handleMove = useCallback((dir: string) => {
    setGrid(g=>{ const {grid:ng,score:s}=move(g,dir); if(equal(g,ng)) return g; const final=addRandom(ng); setScore(sc=>{const ns=sc+s;const nb=Math.max(best,ns);setBest(nb);try{localStorage.setItem('wlos_2048_best',String(nb));}catch{}return ns;}); if(final.flat().some(v=>v===2048)) setWon(true); return final; });
  }, [best]);
  useEffect(()=>{ const h=(e:KeyboardEvent)=>{ const m:{[k:string]:string}={ArrowLeft:'LEFT',ArrowRight:'RIGHT',ArrowUp:'UP',ArrowDown:'DOWN'}; if(m[e.key]){e.preventDefault();handleMove(m[e.key]);}}; window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h); },[handleMove]);
  const reset = () => { setGrid(newGrid()); setScore(0); setWon(false); };
  return (
    <div className="flex flex-col items-center h-full gap-3 p-4" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center justify-between w-full max-w-xs">
        <div><h2 className="text-xl font-black" style={{color:theme.accent}}>2048</h2></div>
        <div className="flex gap-3 text-center">
          {[['SCORE',score],['BEST',best]].map(([l,v])=>(<div key={String(l)} className="px-3 py-1 rounded-lg" style={{background:'rgba(255,255,255,0.08)'}}><p className="text-[9px] opacity-50">{l}</p><p className="text-sm font-bold">{v}</p></div>))}
        </div>
        <button onClick={reset} className="p-2 rounded-lg hover:bg-white/10"><RotateCcw size={16}/></button>
      </div>
      {won && <div className="px-3 py-1.5 rounded-xl text-sm font-bold" style={{background:'#edc22e30',color:'#edc22e'}}>🎉 You reached 2048!</div>}
      <div className="grid grid-cols-4 gap-2 p-2 rounded-xl" style={{background:'rgba(255,255,255,0.06)'}}>
        {grid.flat().map((v,i)=>(
          <div key={i} className="w-14 h-14 rounded-lg flex items-center justify-center font-black text-sm transition-all" style={{background:v?COLORS[v]||'#3c3a32':'rgba(255,255,255,0.04)',color:v&&v>4?'#f9f6f2':'#776e65'}}>
            {v||''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 mt-2">
        <div/><button onClick={()=>handleMove('UP')} className="p-2 rounded-lg hover:bg-white/10"><ChevronUp size={18}/></button><div/>
        <button onClick={()=>handleMove('LEFT')} className="p-2 rounded-lg hover:bg-white/10"><ChevronLeft size={18}/></button>
        <button onClick={()=>handleMove('DOWN')} className="p-2 rounded-lg hover:bg-white/10"><ChevronDown size={18}/></button>
        <button onClick={()=>handleMove('RIGHT')} className="p-2 rounded-lg hover:bg-white/10"><ChevronRight size={18}/></button>
      </div>
      <p className="text-[10px] opacity-30">Arrow keys or buttons to move</p>
    </div>
  );
}
