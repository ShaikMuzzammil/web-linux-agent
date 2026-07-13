'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Wifi, Send, RotateCcw } from 'lucide-react';
type Tool = 'ping'|'dns'|'ports'|'trace';
export default function NetworkTools({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tool, setTool] = useState<Tool>('ping');
  const [host, setHost] = useState('google.com');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const run = async () => {
    setRunning(true); setOutput('');
    await new Promise(r => setTimeout(r, 600));
    const lines: string[] = [];
    if (tool === 'ping') {
      lines.push(`PING ${host} (142.250.80.46): 56 bytes of data`);
      for (let i=0;i<4;i++) { await new Promise(r=>setTimeout(r,300)); const ms=(Math.random()*30+5).toFixed(1); lines.push(`64 bytes from ${host}: icmp_seq=${i+1} ttl=115 time=${ms} ms`); setOutput(lines.join('\n')); }
      lines.push(`\n--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`);
    } else if (tool === 'dns') {
      lines.push(`; <<>> DiG <<>> ${host}`, ';; QUESTION SECTION:', `;${host}.\tIN\tA`, '', ';; ANSWER SECTION:', `${host}.\t299\tIN\tA\t142.250.80.46`, `${host}.\t299\tIN\tA\t142.250.80.78`, '', ';; Query time: 14 msec');
    } else if (tool === 'ports') {
      lines.push(`Scanning ${host} for common ports...`);
      const ports = [[22,'ssh'],[80,'http'],[443,'https'],[3306,'mysql'],[5432,'postgres'],[6379,'redis']];
      for (const [p, name] of ports) { await new Promise(r=>setTimeout(r,180)); const open = Math.random()>0.6; lines.push(`${String(p).padStart(5)}/tcp  ${open?'open ':'closed'} ${name}`); setOutput(lines.join('\n')); }
    } else {
      lines.push(`traceroute to ${host} (142.250.80.46), 30 hops max`);
      const hops=['192.168.1.1','10.0.0.1','72.14.232.1','142.250.80.46'];
      for (let i=0;i<hops.length;i++) { await new Promise(r=>setTimeout(r,250)); const ms=(Math.random()*20+i*8).toFixed(1); lines.push(` ${i+1}  ${hops[i]}  ${ms} ms`); setOutput(lines.join('\n')); }
    }
    setOutput(lines.join('\n')); setRunning(false);
  };
  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode==='dark'?'#0d0d1a':'#f5f5fb', color: theme.mode==='dark'?'#e2e8f0':'#1e1e2e' }}>
      <div className="p-3 border-b flex-shrink-0 space-y-2" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <div className="flex gap-1">
          {(['ping','dns','ports','trace'] as Tool[]).map(t => (
            <button key={t} onClick={()=>setTool(t)} className="px-3 py-1 rounded-lg text-xs font-medium capitalize" style={{ background:tool===t?`${theme.accent}25`:'rgba(255,255,255,0.06)', color:tool===t?theme.accent:'inherit' }}>{t}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={host} onChange={e=>setHost(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')run();}} placeholder="hostname or IP" className="flex-1 px-3 py-2 rounded-xl text-sm font-mono outline-none" style={{ background:'rgba(255,255,255,0.07)', caretColor:theme.accent }} />
          <button onClick={run} disabled={running} className="px-4 py-2 rounded-xl text-sm text-white disabled:opacity-50 flex items-center gap-1.5" style={{ background:theme.accent }}><Send size={13}/>{running?'Running…':'Run'}</button>
          <button onClick={()=>setOutput('')} className="p-2 rounded-xl hover:bg-white/10"><RotateCcw size={14}/></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {output ? <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color:'#4ade80' }}>{output}</pre> : <div className="flex flex-col items-center justify-center h-full opacity-30"><Wifi size={32}/><p className="text-sm mt-2">Enter a host and run a tool</p></div>}
      </div>
    </div>
  );
}
