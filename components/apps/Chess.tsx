'use client';
import { useState, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { RotateCcw } from 'lucide-react';
const INIT = ['r','n','b','q','k','b','n','r','p','p','p','p','p','p','p','p',...Array(32).fill(null),'P','P','P','P','P','P','P','P','R','N','B','Q','K','B','N','R'];
const PIECE_UNICODE: Record<string,string> = {K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
export default function Chess({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [board, setBoard] = useState<(string|null)[]>(INIT);
  const [selected, setSelected] = useState<number|null>(null);
  const [turn, setTurn] = useState<'w'|'b'>('w');
  const [captured, setCaptured] = useState<{w:string[],b:string[]}>({w:[],b:[]});
  const isWhite = (p:string|null) => p && p === p.toUpperCase();
  const click = useCallback((i:number) => {
    const p = board[i];
    if (selected === null) {
      if (!p) return;
      if (turn==='w' && isWhite(p)) setSelected(i);
      if (turn==='b' && !isWhite(p)) setSelected(i);
      return;
    }
    if (i === selected) { setSelected(null); return; }
    const sp = board[selected];
    if (!sp) { setSelected(null); return; }
    const sameSide = p && (isWhite(sp) === isWhite(p));
    if (sameSide) { setSelected(i); return; }
    const nb = [...board]; 
    if (p) setCaptured(c=>isWhite(p)?{...c,b:[...c.b,p]}:{...c,w:[...c.w,p]});
    nb[i] = sp; nb[selected] = null;
    setBoard(nb); setSelected(null); setTurn(t=>t==='w'?'b':'w');
  }, [board, selected, turn]);
  const reset = () => { setBoard(INIT); setSelected(null); setTurn('w'); setCaptured({w:[],b:[]}); };
  return (
    <div className="flex flex-col items-center h-full gap-2 p-3" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-xs"><span className="opacity-40">{turn==='w'?'White':'Black'}'s turn</span></div>
        <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/10"><RotateCcw size={14}/></button>
      </div>
      <div className="text-xs opacity-40 text-center">{captured.b.join(' ')||'—'}</div>
      <div className="rounded-xl overflow-hidden" style={{border:`2px solid ${theme.accent}40`}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,40px)',gridTemplateRows:'repeat(8,40px)'}}>
          {board.map((p,i)=>{
            const row=Math.floor(i/8),col=i%8;
            const light=(row+col)%2===0;
            const isSel=selected===i;
            const bg=isSel?theme.accent:light?(theme.mode==='dark'?'#3d2b1f':'#f0d9b5'):(theme.mode==='dark'?'#1a0f07':'#b58863');
            return (
              <div key={i} onClick={()=>click(i)} className="flex items-center justify-center cursor-pointer transition-colors"
                style={{background:bg,fontSize:26,lineHeight:1,userSelect:'none',color:p&&isWhite(p)?'#fff':'#000',textShadow:p&&isWhite(p)?'0 1px 2px rgba(0,0,0,0.8)':'0 1px 2px rgba(255,255,255,0.3)'}}>
                {p?PIECE_UNICODE[p]:''}
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-xs opacity-40 text-center">{captured.w.join(' ')||'—'}</div>
      <p className="text-[10px] opacity-30">Click piece to select, click destination to move</p>
    </div>
  );
}
