'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Server, Folder, File, Upload, Download, Plus, Wifi, WifiOff } from 'lucide-react';
const REMOTE = [{name:'public_html',type:'folder',size:'—',date:'2024-01-15'},{name:'index.php',type:'file',size:'4.2 KB',date:'2024-01-14'},{name:'wp-config.php',type:'file',size:'3.1 KB',date:'2024-01-10'},{name:'wp-content',type:'folder',size:'—',date:'2024-01-08'},{name:'.htaccess',type:'file',size:'1.2 KB',date:'2024-01-05'}];
const LOCAL = [{name:'dist',type:'folder',size:'—'},{name:'index.html',type:'file',size:'12 KB'},{name:'bundle.js',type:'file',size:'245 KB'},{name:'styles.css',type:'file',size:'18 KB'}];
export default function FtpClient({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [connected, setConnected] = useState(false);
  const [host, setHost] = useState('ftp.example.com');
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const connect = () => {
    setLog(l=>[...l,`Connecting to ${host}...`,`USER ${user}`,`331 Password required`,`PASS ****`,`230 User logged in`,`PWD /public_html`,`257 "/public_html" is current directory`]);
    setConnected(true);
  };
  const disconnect = () => { setLog(l=>[...l,'QUIT','221 Goodbye']); setConnected(false); };
  const FileRow = ({f}:{f:{name:string;type:string;size?:string;date?:string}}) => (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/05 cursor-pointer text-xs transition-colors">
      {f.type==='folder'?<Folder size={12} style={{color:'#60a5fa'}}/>:<File size={12} className="opacity-40"/>}
      <span className="flex-1 truncate">{f.name}</span>
      {f.size&&<span className="opacity-30">{f.size}</span>}
    </div>
  );
  return (
    <div className="flex flex-col h-full text-xs" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <Server size={13} style={{color:theme.accent}}/>
        <input value={host} onChange={e=>setHost(e.target.value)} placeholder="Host" className="px-2 py-1 rounded outline-none w-36" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}}/>
        <input value={user} onChange={e=>setUser(e.target.value)} placeholder="User" className="px-2 py-1 rounded outline-none w-20" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}}/>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Pass" className="px-2 py-1 rounded outline-none w-20" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}}/>
        <button onClick={connected?disconnect:connect} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-white" style={{background:connected?'#f87171':theme.accent}}>
          {connected?<><WifiOff size={11}/>Disconnect</>:<><Wifi size={11}/>Connect</>}
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r" style={{borderColor:'rgba(255,255,255,0.06)'}}>
          <div className="px-3 py-1.5 border-b text-[10px] font-semibold opacity-40 uppercase tracking-wider flex items-center justify-between" style={{borderColor:'rgba(255,255,255,0.06)'}}>
            <span>Local</span><button className="hover:opacity-100"><Upload size={10}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-1">{LOCAL.map(f=><FileRow key={f.name} f={f}/>)}</div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-3 py-1.5 border-b text-[10px] font-semibold opacity-40 uppercase tracking-wider flex items-center justify-between" style={{borderColor:'rgba(255,255,255,0.06)'}}>
            <span>Remote {connected?'(/)':''}</span><button className="hover:opacity-100"><Download size={10}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-1">
            {connected?REMOTE.map(f=><FileRow key={f.name} f={f}/>):<div className="flex flex-col items-center justify-center h-full opacity-30"><WifiOff size={24}/><p className="mt-2">Not connected</p></div>}
          </div>
        </div>
      </div>
      <div className="border-t" style={{borderColor:'rgba(255,255,255,0.06)',maxHeight:80}}>
        <div className="px-2 py-1 overflow-y-auto max-h-20">
          {log.map((l,i)=><p key={i} className="font-mono text-[10px]" style={{color:l.startsWith('2')?'#4ade80':l.startsWith('3')||l.startsWith('C')||l.startsWith('U')||l.startsWith('P')||l.startsWith('Q')?'#60a5fa':'#94a3b8'}}>{l}</p>)}
        </div>
      </div>
    </div>
  );
}
