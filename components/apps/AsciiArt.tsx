'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Copy, Check, RefreshCw } from 'lucide-react';
const FONTS: Record<string,Record<string,string[]>> = {
  block:{
    A:['██████','██  ██','██████','██  ██','██  ██'],
    B:['█████ ','██  ██','█████ ','██  ██','█████ '],
    default:['      '],
  },
};
function textToAscii(text: string): string {
  const chars = text.toUpperCase().split('');
  const rows = 5;
  const lines = Array.from({length:rows},(_,r)=>chars.map(c=>{
    const f=FONTS.block[c]||['██'];
    return (f[r]||'  ').replace(/./g,ch=>ch==='█'?'█':' ');
  }).join('  ')).join('\n');
  return lines;
}
const BANNERS = ['WebLinux','Hello World','TypeScript','Next.js','React'];
export default function AsciiArt({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [text, setText] = useState('WEBLINUX');
  const [style, setStyle] = useState<'block'|'simple'|'shadow'>('block');
  const [copied, setCopied] = useState(false);
  const output = style==='block'?textToAscii(text):style==='simple'?text.split('').join('  ')+'\n'+'-'.repeat(text.length*3):text.split('').map(c=>`${c} `).join('') + '\n' + text.split('').map(()=>'\\').join(' ');
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value.toUpperCase().slice(0,12))} placeholder="Enter text (max 12 chars)" className="flex-1 px-3 py-2 rounded-xl text-sm font-mono outline-none" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}}/>
        <button onClick={copy} className="px-3 py-2 rounded-xl hover:bg-white/10">{copied?<Check size={14} className="text-green-400"/>:<Copy size={14}/>}</button>
      </div>
      <div className="flex gap-1.5">
        {(['block','simple','shadow'] as const).map(s=><button key={s} onClick={()=>setStyle(s)} className="px-3 py-1 rounded-lg text-xs capitalize" style={{background:style===s?`${theme.accent}30`:'rgba(255,255,255,0.06)',color:style===s?theme.accent:'inherit'}}>{s}</button>)}
      </div>
      <div className="flex-1 overflow-auto p-4 rounded-xl" style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.06)'}}>
        <pre className="text-xs font-mono leading-tight whitespace-pre" style={{color:theme.accent}}>{output}</pre>
      </div>
      <div>
        <p className="text-[10px] opacity-40 mb-1.5">Quick banners:</p>
        <div className="flex gap-1.5 flex-wrap">
          {BANNERS.map(b=><button key={b} onClick={()=>setText(b.toUpperCase())} className="px-2 py-1 rounded-lg text-[10px] hover:bg-white/10 font-mono opacity-60 hover:opacity-100">{b}</button>)}
        </div>
      </div>
    </div>
  );
}
