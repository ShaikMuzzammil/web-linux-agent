'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Copy, Check, Shuffle, Plus, Trash2 } from 'lucide-react';
function randomHex() { return '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'); }
const NAMED = [{name:'Catppuccin Mocha',colors:['#cba6f7','#f38ba8','#fab387','#a6e3a1','#89dceb','#89b4fa','#1e1e2e']},{name:'Nord',colors:['#2e3440','#3b4252','#5e81ac','#88c0d0','#a3be8c','#ebcb8b','#bf616a']},{name:'Dracula',colors:['#282a36','#44475a','#bd93f9','#ff79c6','#50fa7b','#f1fa8c','#ff5555']},{name:'Solarized',colors:['#002b36','#073642','#268bd2','#2aa198','#859900','#b58900','#dc322f']}];
export default function ColorPalette({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [palette, setPalette] = useState(['#7C4DFF','#00BCD4','#4CAF50','#FF6D00','#E91E63']);
  const [copied, setCopied] = useState<string|null>(null);
  const copy = (v:string) => { navigator.clipboard.writeText(v); setCopied(v); setTimeout(()=>setCopied(null),2000); };
  const generate = () => setPalette(Array.from({length:5},randomHex));
  const remove = (i:number) => setPalette(p=>p.filter((_,j)=>j!==i));
  const add = () => setPalette(p=>[...p,randomHex()]);
  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto" style={{ background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb', color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e' }}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Color Palette</h2>
        <div className="flex gap-2">
          <button onClick={add} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-white/10"><Plus size={12}/>Add</button>
          <button onClick={generate} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-white" style={{background:theme.accent}}><Shuffle size={12}/>Generate</button>
        </div>
      </div>
      <div className="flex gap-2 h-24 rounded-2xl overflow-hidden">
        {palette.map((c,i)=>(
          <div key={i} className="flex-1 relative group cursor-pointer" style={{background:c}} onClick={()=>copy(c)}>
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{background:'rgba(0,0,0,0.4)'}}>
              {copied===c?<Check size={16} className="text-green-400"/>:<Copy size={14} className="text-white"/>}
              <button onClick={e=>{e.stopPropagation();remove(i);}} className="absolute top-1 right-1 text-white/70 hover:text-red-400"><Trash2 size={11}/></button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {palette.map((c,i)=>(
          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs" style={{background:'rgba(255,255,255,0.06)'}}>
            <div className="w-3 h-3 rounded-full" style={{background:c}}/>
            <span className="font-mono">{c}</span>
            <button onClick={()=>copy(c)}>{copied===c?<Check size={10} className="text-green-400"/>:<Copy size={10} className="opacity-40"/>}</button>
            <input type="color" value={c} onChange={e=>{const p=[...palette];p[i]=e.target.value;setPalette(p);}} className="w-4 h-4 rounded cursor-pointer border-none bg-transparent" style={{appearance:'none'}}/>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <p className="text-[10px] font-semibold opacity-40 uppercase tracking-wider">Popular Palettes</p>
        {NAMED.map(p=>(
          <div key={p.name}>
            <div className="flex items-center justify-between mb-1"><p className="text-xs opacity-60">{p.name}</p><button onClick={()=>setPalette(p.colors)} className="text-[10px]" style={{color:theme.accent}}>Use</button></div>
            <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
              {p.colors.map(c=><div key={c} className="flex-1 cursor-pointer hover:scale-110 transition-transform" style={{background:c}} onClick={()=>copy(c)} title={c}/>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
