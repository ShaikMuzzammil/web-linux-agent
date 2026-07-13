'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Mail, Inbox, Send, Star, Trash2, Plus, X, Search, Paperclip, ChevronRight } from 'lucide-react';
const INBOX = [
  {id:1,from:'GitHub',subject:'[WebLinuxOS] Pull request merged',preview:'Your pull request has been merged into main...',time:'2h',read:false,starred:false},
  {id:2,from:'Vercel',subject:'Deployment successful',preview:'Your project web-linux-agent-v2 was deployed...',time:'3h',read:false,starred:true},
  {id:3,from:'Neon',subject:'Database usage report',preview:'Your database eu-central-1 has used 45% of...',time:'1d',read:true,starred:false},
  {id:4,from:'Prisma',subject:'Prisma v6 is now available',preview:'We are excited to announce Prisma version 6...',time:'2d',read:true,starred:false},
  {id:5,from:'Anthropic',subject:'Claude API update',preview:'New model claude-haiku-4-5 is now available...',time:'3d',read:true,starred:true},
];
export default function Email({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [emails, setEmails] = useState(INBOX);
  const [selected, setSelected] = useState<typeof INBOX[0]|null>(null);
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState('');
  const [subj, setSubj] = useState('');
  const [body, setBody] = useState('');
  const [folder, setFolder] = useState('inbox');
  const SIDEBAR = [['inbox','Inbox',<Inbox key="i" size={13}/>],['sent','Sent',<Send key="s" size={13}/>],['starred','Starred',<Star key="st" size={13}/>],['trash','Trash',<Trash2 key="t" size={13}/>]];
  const read = (e: typeof INBOX[0]) => { setSelected(e); setEmails(prev=>prev.map(x=>x.id===e.id?{...x,read:true}:x)); };
  const unread = emails.filter(e=>!e.read).length;
  return (
    <div className="flex h-full text-xs" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="w-40 flex-shrink-0 flex flex-col border-r p-2 gap-0.5" style={{borderColor:'rgba(255,255,255,0.06)',background:theme.mode==='dark'?'rgba(10,10,20,0.8)':'rgba(225,230,240,0.8)'}}>
        <button onClick={()=>setCompose(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2 text-white font-semibold text-xs" style={{background:theme.accent}}><Plus size={12}/>Compose</button>
        {SIDEBAR.map(([id,label,icon])=>(
          <button key={String(id)} onClick={()=>setFolder(String(id))} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left"
            style={{background:folder===String(id)?`${theme.accent}20`:'transparent',color:folder===String(id)?theme.accent:'inherit'}}>
            {icon}<span className="flex-1">{label}</span>
            {String(id)==='inbox'&&unread>0&&<span className="px-1.5 py-0.5 rounded-full text-[9px] text-white" style={{background:theme.accent}}>{unread}</span>}
          </button>
        ))}
      </div>
      <div className="w-52 flex-shrink-0 flex flex-col border-r" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <div className="p-2 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
          <div className="relative"><Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40"/><input placeholder="Search…" className="w-full pl-6 pr-2 py-1.5 rounded-lg outline-none" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}}/></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {emails.map(e=>(
            <div key={e.id} onClick={()=>read(e)} className="px-3 py-2.5 border-b cursor-pointer transition-colors" style={{borderColor:'rgba(255,255,255,0.04)',background:selected?.id===e.id?`${theme.accent}15`:e.read?'transparent':'rgba(255,255,255,0.03)'}}>
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-${e.read?'normal':'bold'} truncate`}>{e.from}</span>
                <span className="opacity-40 flex-shrink-0 ml-1">{e.time}</span>
              </div>
              <p className={`truncate ${e.read?'opacity-60':''}`}>{e.subject}</p>
              <p className="truncate opacity-30">{e.preview}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selected ? (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div><h2 className="font-bold text-sm">{selected.subject}</h2><p className="opacity-40 mt-0.5">From: {selected.from}</p></div>
              <span className="opacity-40">{selected.time}</span>
            </div>
            <div className="flex-1 text-sm leading-relaxed opacity-80">{selected.preview} This is a simulated email client in WebLinuxOS. Connect your email provider to see real messages.</div>
          </div>
        ) : <div className="flex-1 flex flex-col items-center justify-center opacity-30"><Mail size={40}/><p className="text-sm mt-2">Select an email to read</p></div>}
      </div>
      {compose && (
        <div className="absolute bottom-4 right-4 w-96 rounded-2xl overflow-hidden z-50 shadow-2xl" style={{background:theme.mode==='dark'?'#1a1a2e':'#fff',border:`1px solid ${theme.accent}30`}}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{borderColor:'rgba(255,255,255,0.06)',background:`${theme.accent}20`}}>
            <span className="font-semibold text-sm">New Message</span>
            <button onClick={()=>setCompose(false)}><X size={14}/></button>
          </div>
          <div className="p-3 space-y-2">
            <input value={to} onChange={e=>setTo(e.target.value)} placeholder="To:" className="w-full px-2 py-1.5 border-b outline-none bg-transparent text-xs" style={{borderColor:'rgba(255,255,255,0.08)'}}/>
            <input value={subj} onChange={e=>setSubj(e.target.value)} placeholder="Subject:" className="w-full px-2 py-1.5 border-b outline-none bg-transparent text-xs" style={{borderColor:'rgba(255,255,255,0.08)'}}/>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} placeholder="Message…" className="w-full px-2 py-1.5 resize-none outline-none bg-transparent text-xs"/>
          </div>
          <div className="px-3 pb-3 flex items-center justify-between">
            <button className="flex items-center gap-1.5 opacity-40 hover:opacity-70"><Paperclip size={13}/>Attach</button>
            <button onClick={()=>{setCompose(false);setTo('');setSubj('');setBody('');}} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white" style={{background:theme.accent}}><Send size={12}/>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
