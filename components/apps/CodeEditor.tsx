'use client';
import { useState, useRef, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Play, Plus, X, Save, Terminal, FileCode } from 'lucide-react';
const LANG_STARTERS:Record<string,string> = {
  javascript: '// JavaScript\nconsole.log("Hello, WebLinuxOS!");\n\nconst greet = (name) => `Hello, ${name}!`;\nconsole.log(greet("World"));',
  typescript: '// TypeScript\ninterface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = { name: "WebLinux", age: 1 };\nconsole.log(user);',
  python: '# Python\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("WebLinuxOS"))',
  html: '<!DOCTYPE html>\n<html>\n<head><title>My Page</title></head>\n<body>\n  <h1>Hello WebLinuxOS!</h1>\n</body>\n</html>',
  css: '/* CSS */\nbody {\n  background: #0d0d1a;\n  color: #e2e8f0;\n  font-family: sans-serif;\n}',
  json: '{\n  "name": "WebLinuxOS",\n  "version": "2.0.0",\n  "features": ["54 apps", "cloud sync", "auth"]\n}',
};
const LANGS = Object.keys(LANG_STARTERS);
interface Tab { id: string; name: string; lang: string; content: string; output: string }
export default function CodeEditor({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tabs, setTabs] = useState<Tab[]>([{ id:'1', name:'main.js', lang:'javascript', content: LANG_STARTERS.javascript, output:'' }]);
  const [activeId, setActiveId] = useState('1');
  const [showOutput, setShowOutput] = useState(false);
  const [lineNums, setLineNums] = useState(true);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const cur = tabs.find(t=>t.id===activeId) || tabs[0];
  const update = (content: string) => setTabs(ts=>ts.map(t=>t.id===activeId?{...t,content}:t));
  const newTab = (lang='javascript') => {
    const id=Math.random().toString(36).slice(2);
    const name=`file.${lang==='typescript'?'ts':lang==='python'?'py':lang==='html'?'html':lang==='css'?'css':lang==='json'?'json':'js'}`;
    setTabs(ts=>[...ts,{id,name,lang,content:LANG_STARTERS[lang]||'',output:''}]);
    setActiveId(id);
  };
  const closeTab = (id:string,e:React.MouseEvent) => {
    e.stopPropagation();
    if(tabs.length===1) return;
    const idx=tabs.findIndex(t=>t.id===id);
    const next=tabs[idx===tabs.length-1?idx-1:idx+1];
    setTabs(ts=>ts.filter(t=>t.id!==id)); setActiveId(next.id);
  };
  const run = useCallback(() => {
    const lines: string[] = [];
    const origLog = console.log;
    console.log = (...args) => { lines.push(args.map(a=>typeof a==='object'?JSON.stringify(a,null,2):String(a)).join(' ')); };
    try {
      if (cur.lang === 'javascript' || cur.lang === 'typescript') {
        // eslint-disable-next-line no-new-func
        new Function(cur.content.replace(/^(import|export).*/gm,''))();
        if (lines.length === 0) lines.push('✓ Executed successfully (no output)');
      } else { lines.push(`[${cur.lang}] Output preview — execution requires a runtime environment.`); }
    } catch(e:unknown) { lines.push(`❌ ${e instanceof Error?e.message:String(e)}`); }
    console.log = origLog;
    setTabs(ts=>ts.map(t=>t.id===activeId?{...t,output:lines.join('\n')}:t));
    setShowOutput(true);
  }, [cur, activeId]);
  const kh = (e:React.KeyboardEvent) => {
    if ((e.ctrlKey||e.metaKey)&&e.key==='Enter') { e.preventDefault(); run(); }
    if (e.key==='Tab') { e.preventDefault(); const ta=taRef.current; if(!ta) return; const s=ta.selectionStart,en=ta.selectionEnd; const nc=cur.content.slice(0,s)+'  '+cur.content.slice(en); update(nc); setTimeout(()=>ta.setSelectionRange(s+2,s+2),0); }
  };
  const lines = cur.content.split('\n').length;
  return (
    <div className="flex flex-col h-full" style={{background:theme.mode==='dark'?'#0d1117':'#f6f8fa',color:theme.mode==='dark'?'#e6edf3':'#24292f',fontFamily:'JetBrains Mono,Fira Code,monospace'}}>
      <div className="flex items-center gap-0 border-b overflow-x-auto flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)',background:theme.mode==='dark'?'rgba(10,10,20,0.8)':'rgba(225,230,235,0.9)'}}>
        {tabs.map(tab=>(
          <div key={tab.id} onClick={()=>setActiveId(tab.id)} className="flex items-center gap-1.5 px-3 py-2 cursor-pointer border-r flex-shrink-0 group"
            style={{background:tab.id===activeId?(theme.mode==='dark'?'#0d1117':'#f6f8fa'):'transparent',borderColor:'rgba(255,255,255,0.06)',borderBottom:tab.id===activeId?`2px solid ${theme.accent}`:'2px solid transparent',minWidth:100,maxWidth:160}}>
            <FileCode size={11} className="flex-shrink-0 opacity-40" />
            <span className="text-xs truncate flex-1">{tab.name}</span>
            <button onClick={e=>closeTab(tab.id,e)} className="opacity-0 group-hover:opacity-100 flex-shrink-0"><X size={10}/></button>
          </div>
        ))}
        <div className="flex items-center gap-1 px-2">
          {LANGS.map(l=>(
            <button key={l} onClick={()=>newTab(l)} className="text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10 opacity-40 hover:opacity-100 capitalize">.{l.slice(0,2)}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 px-2">
          <button onClick={run} title="Run (Ctrl+Enter)" className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-white" style={{background:theme.accent}}><Play size={12}/>Run</button>
          <button onClick={()=>setShowOutput(v=>!v)} className="p-1.5 rounded hover:bg-white/10"><Terminal size={13}/></button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            {lineNums && (
              <div className="flex-shrink-0 py-2 px-2 text-right select-none overflow-hidden" style={{background:theme.mode==='dark'?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.04)',minWidth:44,color:'rgba(128,128,160,0.4)',fontSize:11,lineHeight:'1.65',fontFamily:'inherit'}}>
                {Array.from({length:lines},(_,i)=><div key={i}>{i+1}</div>)}
              </div>
            )}
            <textarea ref={taRef} value={cur.content} onChange={e=>update(e.target.value)} onKeyDown={kh} spellCheck={false} className="flex-1 p-3 bg-transparent outline-none resize-none text-xs leading-relaxed font-mono" style={{caretColor:theme.accent,lineHeight:1.65}} />
          </div>
          {showOutput && (
            <div className="border-t flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)',maxHeight:'35%'}}>
              <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.06)',background:'rgba(0,0,0,0.3)'}}>
                <span className="text-[10px] opacity-50 font-semibold">OUTPUT</span>
                <button onClick={()=>setShowOutput(false)} className="text-white/30 hover:text-white/60"><X size={12}/></button>
              </div>
              <pre className="p-3 text-xs font-mono leading-relaxed overflow-y-auto max-h-40 whitespace-pre-wrap" style={{color:'#4ade80'}}>{cur.output||'No output yet. Press Run to execute.'}</pre>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-1 text-[10px] opacity-40 border-t flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)',background:theme.mode==='dark'?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.05)'}}>
        <span className="capitalize">{cur.lang}</span><span>Ln {lines}</span><span>{cur.content.length} chars</span><span>Ctrl+Enter to run</span>
      </div>
    </div>
  );
}
