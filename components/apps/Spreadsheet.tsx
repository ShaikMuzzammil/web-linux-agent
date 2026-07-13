'use client';
import { useState, useCallback, useRef } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
const COLS=10,ROWS=20;
const COL_LABELS = Array.from({length:COLS},(_,i)=>String.fromCharCode(65+i));
type CellAddr = `${string}${number}`;
type Cells = Record<CellAddr, {raw:string;computed:string}>;
function evalCell(raw:string, cells:Cells, addr:string): string {
  if (!raw.startsWith('=')) return raw;
  try {
    let expr = raw.slice(1);
    expr = expr.replace(/([A-Z])(\d+)/g,(_,c,r)=>{
      const ref=`${c}${r}` as CellAddr;
      return cells[ref]?.computed||'0';
    });
    expr = expr.replace(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/gi,(_,c1,r1,c2,r2)=>{
      let sum=0;
      for(let c=c1.charCodeAt(0);c<=c2.charCodeAt(0);c++) for(let r=parseInt(r1);r<=parseInt(r2);r++) sum+=parseFloat(cells[`${String.fromCharCode(c)}${r}` as CellAddr]?.computed||'0')||0;
      return String(sum);
    });
    expr = expr.replace(/AVG\(([A-Z])(\d+):([A-Z])(\d+)\)/gi,(_,c1,r1,c2,r2)=>{
      let sum=0,count=0;
      for(let c=c1.charCodeAt(0);c<=c2.charCodeAt(0);c++) for(let r=parseInt(r1);r<=parseInt(r2);r++){sum+=parseFloat(cells[`${String.fromCharCode(c)}${r}` as CellAddr]?.computed||'0')||0;count++;}
      return String(count?sum/count:0);
    });
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict";return (${expr})`)();
    return String(result);
  } catch { return '#ERR'; }
}
export default function Spreadsheet({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [cells, setCells] = useState<Cells>({});
  const [selected, setSelected] = useState<CellAddr|null>(null);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const commit = useCallback((addr:CellAddr, raw:string) => {
    setCells(prev=>{
      const next={...prev};
      if(raw==='') { delete next[addr]; return next; }
      next[addr]={raw,computed:evalCell(raw,next,addr)};
      return next;
    });
  },[]);
  const startEdit = (addr:CellAddr) => { setSelected(addr); setEditing(true); setEditVal(cells[addr]?.raw||''); setTimeout(()=>inputRef.current?.focus(),10); };
  const stopEdit = () => { if(selected&&editing){ commit(selected,editVal); } setEditing(false); };
  const handleKey = (e:React.KeyboardEvent) => {
    if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();stopEdit();}
    if(e.key==='Escape'){setEditing(false);setEditVal('');}
  };
  return (
    <div className="flex flex-col h-full" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <span className="text-xs font-mono opacity-60 w-16">{selected||'—'}</span>
        <div className="flex-1 flex items-center gap-2 px-2 py-1 rounded-lg" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)'}}>
          <span className="text-xs opacity-40">=</span>
          <span className="text-xs font-mono flex-1">{selected?cells[selected]?.raw||'':''}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="border-collapse text-xs" style={{fontFamily:'monospace'}}>
          <thead><tr>
            <th className="w-8 text-center sticky left-0 z-10" style={{background:theme.mode==='dark'?'#1a1a2e':'#e8e8f0',border:'1px solid rgba(255,255,255,0.06)'}} />
            {COL_LABELS.map(c=>(
              <th key={c} className="text-center font-semibold opacity-50 px-2 py-1" style={{minWidth:80,background:theme.mode==='dark'?'#1a1a2e':'#e8e8f0',border:'1px solid rgba(255,255,255,0.06)'}}>{c}</th>
            ))}
          </tr></thead>
          <tbody>
            {Array.from({length:ROWS},(_,r)=>(
              <tr key={r+1}>
                <td className="text-center opacity-40 font-semibold sticky left-0 px-1" style={{background:theme.mode==='dark'?'#1a1a2e':'#e8e8f0',border:'1px solid rgba(255,255,255,0.06)'}}>{r+1}</td>
                {COL_LABELS.map(c=>{
                  const addr=`${c}${r+1}` as CellAddr;
                  const isSel=selected===addr;
                  return (
                    <td key={addr} onClick={()=>setSelected(addr)} onDoubleClick={()=>startEdit(addr)}
                      className="relative px-1.5 py-0.5 cursor-cell" style={{border:`1px solid ${isSel?theme.accent:'rgba(255,255,255,0.04)'}`,minWidth:80,height:24,background:isSel?`${theme.accent}12`:'transparent',outline:isSel?`1px solid ${theme.accent}`:undefined}}>
                      {editing&&isSel?(
                        <input ref={inputRef} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={stopEdit} onKeyDown={handleKey}
                          className="absolute inset-0 px-1.5 outline-none bg-transparent w-full" style={{caretColor:theme.accent,color:'inherit',zIndex:10}} />
                      ):<span>{cells[addr]?.computed||''}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-1 text-[10px] opacity-30 border-t flex gap-4" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <span>= for formulas</span><span>SUM(A1:A10)</span><span>AVG(B1:B5)</span><span>Double-click to edit</span>
      </div>
    </div>
  );
}
