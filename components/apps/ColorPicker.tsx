'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Copy, Check } from 'lucide-react';
function hexToRgb(h:string){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return{r,g,b};}
function hexToHsl(h:string){const{r,g,b}=hexToRgb(h);const R=r/255,G=g/255,B=b/255;const max=Math.max(R,G,B),min=Math.min(R,G,B);let hue=0,sat=0;const lig=(max+min)/2;if(max!==min){const d=max-min;sat=lig>0.5?d/(2-max-min):d/(max+min);if(max===R)hue=(G-B)/d+(G<B?6:0);else if(max===G)hue=(B-R)/d+2;else hue=(R-G)/d+4;hue/=6;}return{h:Math.round(hue*360),s:Math.round(sat*100),l:Math.round(lig*100)};}
const PALETTES = [{name:'Vibrant',colors:['#f87171','#fb923c','#fbbf24','#4ade80','#22d3ee','#818cf8','#f472b6']},{name:'Pastel',colors:['#fca5a5','#fdba74','#fde68a','#86efac','#67e8f9','#c4b5fd','#f9a8d4']},{name:'Dark',colors:['#7f1d1d','#7c2d12','#78350f','#14532d','#164e63','#312e81','#4a044e']},{name:'Neon',colors:['#ff0000','#ff7700','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff']}];
export default function ColorPicker({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [color, setColor] = useState('#7C4DFF');
  const [copied, setCopied] = useState<string|null>(null);
  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);
  const copy = (v:string,k:string) => { navigator.clipboard.writeText(v); setCopied(k); setTimeout(()=>setCopied(null),2000); };
  const formats = [['HEX',color],['RGB',`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],['HSL',`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],['CSS',`color: ${color};`]];
  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex gap-4">
        <div className="w-32 h-32 rounded-2xl flex-shrink-0 shadow-lg" style={{background:color,boxShadow:`0 8px 32px ${color}60`}} />
        <div className="flex-1 flex flex-col gap-2">
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border-none" style={{background:'transparent'}} />
          <input value={color} onChange={e=>{if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))setColor(e.target.value);}} className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}} />
          <div className="grid grid-cols-3 gap-1 text-xs">
            {[['R',rgb.r,'r'],[`G`,rgb.g,'g'],['B',rgb.b,'b']].map(([l,v,k])=>(
              <div key={String(k)} className="text-center p-1.5 rounded-lg" style={{background:'rgba(255,255,255,0.06)'}}>
                <p className="opacity-40 text-[9px]">{l}</p><p className="font-mono font-bold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-semibold opacity-40 uppercase tracking-wider">Formats</p>
        {formats.map(([l,v])=>(
          <div key={l} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{background:'rgba(255,255,255,0.05)'}}>
            <span className="text-[10px] opacity-40 w-10">{l}</span>
            <span className="text-xs font-mono flex-1">{v}</span>
            <button onClick={()=>copy(v,l)} className="text-white/30 hover:text-white/60">{copied===l?<Check size={12} className="text-green-400"/>:<Copy size={12}/>}</button>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <p className="text-[10px] font-semibold opacity-40 uppercase tracking-wider">Palettes</p>
        {PALETTES.map(p=>(
          <div key={p.name}>
            <p className="text-xs opacity-50 mb-1.5">{p.name}</p>
            <div className="flex gap-1.5">
              {p.colors.map(c=>(
                <button key={c} onClick={()=>setColor(c)} className="flex-1 h-8 rounded-lg transition-all hover:scale-110" style={{background:c,border:color===c?'2px solid white':'2px solid transparent'}} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-semibold opacity-40 uppercase tracking-wider mb-2">Shades</p>
        <div className="flex gap-1">
          {[0.2,0.35,0.5,0.65,0.8,1,1.2,1.5,1.8,2.2].map((f,i)=>{
            const {r,g,b}=hexToRgb(color);
            const nr=Math.min(255,Math.round(r*f)),ng=Math.min(255,Math.round(g*f)),nb=Math.min(255,Math.round(b*f));
            const shade=`rgb(${nr},${ng},${nb})`;
            return <div key={i} onClick={()=>setColor(`#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`)} className="flex-1 h-8 rounded cursor-pointer hover:scale-110 transition-all" style={{background:shade}} />;
          })}
        </div>
      </div>
    </div>
  );
}
