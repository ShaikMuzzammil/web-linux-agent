'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Package, FolderOpen, File, Plus, Trash2, Download, ChevronRight, Archive } from 'lucide-react';
interface AFile { name:string; size:string; modified:string; type:'file'|'folder' }
const MOCK:AFile[]=[
  {name:'src/',size:'—',modified:'2024-01-15',type:'folder'},
  {name:'src/components/',size:'—',modified:'2024-01-15',type:'folder'},
  {name:'src/index.tsx',size:'2.4 KB',modified:'2024-01-15',type:'file'},
  {name:'src/App.tsx',size:'4.1 KB',modified:'2024-01-14',type:'file'},
  {name:'package.json',size:'1.2 KB',modified:'2024-01-13',type:'file'},
  {name:'README.md',size:'3.8 KB',modified:'2024-01-12',type:'file'},
  {name:'tsconfig.json',size:'0.8 KB',modified:'2024-01-10',type:'file'},
];
export default function ArchiveManager({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [files] = useState<AFile[]>(MOCK);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [archiveName, setArchiveName] = useState('archive.zip');
  const toggle = (n:string) => setSelected(s=>{const ns=new Set(s); ns.has(n)?ns.delete(n):ns.add(n); return ns;});
  return (
    <div className="flex flex-col h-full text-xs" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <Archive size={14} style={{color:theme.accent}}/><span className="font-bold">Archive Manager</span>
        <div className="ml-auto flex gap-1.5">
          <input value={archiveName} onChange={e=>setArchiveName(e.target.value)} className="px-2 py-1 rounded-lg outline-none font-mono" style={{background:'rgba(255,255,255,0.07)',width:130,caretColor:theme.accent}}/>
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10"><Plus size={11}/>Add Files</button>
          <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-white" style={{background:theme.accent}}><Download size={11}/>Create ZIP</button>
        </div>
      </div>
      <div className="px-3 py-1.5 border-b flex items-center gap-2 text-[10px] opacity-40" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <ChevronRight size={10}/><span>archive.zip</span>
        <span className="ml-auto">{files.length} items · {selected.size > 0 ? `${selected.size} selected` : 'Total: ~12 KB'}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <th className="text-left px-3 py-2 font-medium opacity-40 w-6"><input type="checkbox" onChange={e=>setSelected(e.target.checked?new Set(files.map(f=>f.name)):new Set())} style={{accentColor:theme.accent}}/></th>
            <th className="text-left px-2 py-2 font-medium opacity-40">Name</th>
            <th className="text-left px-2 py-2 font-medium opacity-40">Size</th>
            <th className="text-left px-2 py-2 font-medium opacity-40">Modified</th>
          </tr></thead>
          <tbody>
            {files.map(f=>(
              <tr key={f.name} onClick={()=>toggle(f.name)} className="cursor-pointer transition-colors border-b" style={{borderColor:'rgba(255,255,255,0.03)',background:selected.has(f.name)?`${theme.accent}12`:'transparent'}}
                onMouseEnter={e=>{if(!selected.has(f.name))e.currentTarget.style.background='rgba(255,255,255,0.04)';}} onMouseLeave={e=>{if(!selected.has(f.name))e.currentTarget.style.background='transparent';}}>
                <td className="px-3 py-1.5"><input type="checkbox" checked={selected.has(f.name)} onChange={()=>toggle(f.name)} style={{accentColor:theme.accent}}/></td>
                <td className="px-2 py-1.5"><div className="flex items-center gap-2">{f.type==='folder'?<FolderOpen size={13} style={{color:'#60a5fa'}}/>:<File size={13} className="opacity-40"/>}<span>{f.name}</span></div></td>
                <td className="px-2 py-1.5 opacity-40">{f.size}</td>
                <td className="px-2 py-1.5 opacity-40">{f.modified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t text-[10px] opacity-40" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        Drag files here to add to archive · Supports ZIP, TAR, GZIP
      </div>
    </div>
  );
}
