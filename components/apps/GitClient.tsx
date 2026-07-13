'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { GitBranch, GitCommit, Plus, RefreshCw, Upload, Download, Check } from 'lucide-react';
const MOCK_LOG = [
  {hash:'a3f2d1c',msg:'feat: add cloud sync for all apps',author:'Muzzammil',date:'2h ago',branch:'main'},
  {hash:'b8e9f2a',msg:'fix: resolve Prisma v5 connection pooling',author:'Muzzammil',date:'5h ago',branch:'main'},
  {hash:'c1d4e5b',msg:'feat: implement 54-app window manager',author:'Muzzammil',date:'1d ago',branch:'main'},
  {hash:'d7f3a2c',msg:'chore: setup NextAuth with Neon PostgreSQL',author:'Muzzammil',date:'2d ago',branch:'main'},
  {hash:'e9b1c3d',msg:'init: WebLinuxOS v2.0 project scaffold',author:'Muzzammil',date:'3d ago',branch:'main'},
];
const BRANCHES = ['main','feature/more-apps','fix/auth-flow','develop'];
export default function GitClient({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tab, setTab] = useState<'log'|'branches'|'changes'>('log');
  const [branch, setBranch] = useState('main');
  const [msg, setMsg] = useState('');
  const [committed, setCommitted] = useState(false);
  const commit = () => { if(!msg.trim()) return; setCommitted(true); setTimeout(()=>setCommitted(false),2000); setMsg(''); };
  const CHANGED = ['components/apps/Notes.tsx','hooks/useOSStore.ts','app/api/sync/notes/route.ts'];
  return (
    <div className="flex flex-col h-full text-xs" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <GitBranch size={13} style={{color:theme.accent}}/><span className="font-semibold">{branch}</span>
        <span className="flex-1"/>
        <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10"><Download size={12}/>Pull</button>
        <button className="flex items-center gap-1 px-2 py-1 rounded text-white" style={{background:theme.accent}}><Upload size={12}/>Push</button>
        <button className="p-1 rounded hover:bg-white/10"><RefreshCw size={12}/></button>
      </div>
      <div className="flex border-b px-3 flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        {(['log','branches','changes'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className="px-3 py-2 font-medium capitalize border-b-2 transition-all"
            style={{borderColor:tab===t?theme.accent:'transparent',color:tab===t?theme.accent:'inherit',opacity:tab===t?1:0.5}}>{t}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab==='log' && MOCK_LOG.map((c,i)=>(
          <div key={i} className="flex items-start gap-3 px-3 py-2.5 border-b transition-colors" style={{borderColor:'rgba(255,255,255,0.04)'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <GitCommit size={14} className="mt-0.5 flex-shrink-0" style={{color:theme.accent}}/>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.msg}</p>
              <div className="flex gap-2 mt-0.5 opacity-40"><span className="font-mono">{c.hash}</span><span>{c.author}</span><span>{c.date}</span></div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px]" style={{background:`${theme.accent}20`,color:theme.accent}}>{c.branch}</span>
          </div>
        ))}
        {tab==='branches' && (
          <div className="p-3 space-y-1">
            {BRANCHES.map(b=>(
              <div key={b} onClick={()=>setBranch(b)} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
                style={{background:branch===b?`${theme.accent}20`:'transparent',border:branch===b?`1px solid ${theme.accent}30`:'1px solid transparent'}}>
                <GitBranch size={13} style={{color:branch===b?theme.accent:'inherit'}}/><span>{b}</span>
                {branch===b&&<span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{background:`${theme.accent}30`,color:theme.accent}}>current</span>}
              </div>
            ))}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs opacity-40 hover:opacity-70 hover:bg-white/05"><Plus size={12}/>New Branch</button>
          </div>
        )}
        {tab==='changes' && (
          <div className="p-3 space-y-3">
            <div>
              <p className="opacity-40 mb-1.5 uppercase tracking-wider" style={{fontSize:10}}>Modified ({CHANGED.length})</p>
              {CHANGED.map(f=>(
                <div key={f} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div className="w-2 h-2 rounded-full" style={{background:'#fbbf24',flexShrink:0}}/>
                  <span className="font-mono truncate">{f}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Commit message…" rows={2} className="w-full px-3 py-2 rounded-xl resize-none outline-none text-xs mb-2" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}}/>
              <button onClick={commit} disabled={!msg.trim()} className="w-full py-2 rounded-xl font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2" style={{background:theme.accent}}>
                {committed?<><Check size={14}/>Committed!</>:<><GitCommit size={14}/>Commit Changes</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
