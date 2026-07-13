'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Send, Plus, X, ChevronDown } from 'lucide-react';
type Method = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
const METHOD_COLORS:Record<Method,string>={GET:'#4ade80',POST:'#60a5fa',PUT:'#fbbf24',PATCH:'#fb923c',DELETE:'#f87171'};
export default function ApiTester({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState([{key:'Content-Type',value:'application/json'}]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<{status:number;time:number;data:string;headers:Record<string,string>}|null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'headers'|'body'|'response'>('headers');
  const send = async () => {
    if (!url) return;
    setLoading(true);
    const t = Date.now();
    try {
      const h: Record<string,string> = {};
      headers.filter(h=>h.key).forEach(({key,value})=>{ h[key]=value; });
      const opts: RequestInit = { method, headers: h };
      if (['POST','PUT','PATCH'].includes(method) && body) opts.body = body;
      const res = await fetch(url, opts);
      const text = await res.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      const resHeaders: Record<string,string> = {};
      res.headers.forEach((v,k)=>{ resHeaders[k]=v; });
      setResponse({ status: res.status, time: Date.now()-t, data: pretty, headers: resHeaders });
      setTab('response');
    } catch (e:unknown) {
      setResponse({ status: 0, time: Date.now()-t, data: `Error: ${e instanceof Error ? e.message : 'Network error'}`, headers: {} });
      setTab('response');
    } finally { setLoading(false); }
  };
  const addHeader = () => setHeaders(h=>[...h,{key:'',value:''}]);
  const rmHeader = (i:number) => setHeaders(h=>h.filter((_,j)=>j!==i));
  return (
    <div className="flex flex-col h-full text-xs" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center gap-2 p-3 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <select value={method} onChange={e=>setMethod(e.target.value as Method)} className="px-2 py-1.5 rounded-lg font-bold text-xs outline-none" style={{background:'rgba(255,255,255,0.08)',color:METHOD_COLORS[method]}}>
          {(['GET','POST','PUT','PATCH','DELETE'] as Method[]).map(m=><option key={m} style={{color:METHOD_COLORS[m]}}>{m}</option>)}
        </select>
        <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}} placeholder="https://api.example.com/endpoint" className="flex-1 px-3 py-1.5 rounded-lg outline-none font-mono" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}} />
        <button onClick={send} disabled={loading||!url} className="px-4 py-1.5 rounded-lg text-white font-semibold disabled:opacity-40 flex items-center gap-1.5" style={{background:theme.accent}}>
          <Send size={12}/>{loading?'Sending…':'Send'}
        </button>
      </div>
      <div className="flex border-b flex-shrink-0 px-3" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        {(['headers','body','response'] as const).map(t2=>(
          <button key={t2} onClick={()=>setTab(t2)} className="px-3 py-2 text-xs font-medium capitalize border-b-2 transition-all"
            style={{borderColor:tab===t2?theme.accent:'transparent',color:tab===t2?theme.accent:'inherit',opacity:tab===t2?1:0.5}}>
            {t2}{t2==='response'&&response&&<span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px]" style={{background:response.status>=200&&response.status<300?'#4ade8030':'#f8717130',color:response.status>=200&&response.status<300?'#4ade80':'#f87171'}}>{response.status}</span>}
          </button>
        ))}
        {response && <span className="ml-auto self-center text-[10px] opacity-40">{response.time}ms</span>}
      </div>
      <div className="flex-1 overflow-hidden">
        {tab==='headers' && (
          <div className="p-3 space-y-2 overflow-y-auto h-full">
            {headers.map((h,i)=>(
              <div key={i} className="flex gap-2">
                <input value={h.key} onChange={e=>setHeaders(hs=>hs.map((x,j)=>j===i?{...x,key:e.target.value}:x))} placeholder="Key" className="flex-1 px-2 py-1.5 rounded-lg outline-none" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}} />
                <input value={h.value} onChange={e=>setHeaders(hs=>hs.map((x,j)=>j===i?{...x,value:e.target.value}:x))} placeholder="Value" className="flex-1 px-2 py-1.5 rounded-lg outline-none" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}} />
                <button onClick={()=>rmHeader(i)} className="text-red-400"><X size={12}/></button>
              </div>
            ))}
            <button onClick={addHeader} className="flex items-center gap-1.5 text-xs opacity-50 hover:opacity-80"><Plus size={12}/>Add Header</button>
          </div>
        )}
        {tab==='body' && (
          <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder='{"key": "value"}' className="w-full h-full p-3 bg-transparent resize-none outline-none font-mono" style={{caretColor:theme.accent}} />
        )}
        {tab==='response' && response && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <pre className="p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all" style={{color:response.status>=200&&response.status<300?'#4ade80':response.status===0?'#f87171':'#e2e8f0'}}>{response.data}</pre>
            </div>
            {Object.keys(response.headers).length > 0 && (
              <div className="border-t p-3 max-h-32 overflow-y-auto" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                <p className="text-[10px] opacity-40 mb-1">Response Headers</p>
                {Object.entries(response.headers).map(([k,v])=>(
                  <div key={k} className="flex gap-2 text-[10px]"><span className="opacity-40 w-32 flex-shrink-0 truncate">{k}</span><span className="truncate">{v}</span></div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab==='response' && !response && (
          <div className="flex flex-col items-center justify-center h-full opacity-30"><Send size={32}/><p className="text-sm mt-2">Send a request to see the response</p></div>
        )}
      </div>
    </div>
  );
}
