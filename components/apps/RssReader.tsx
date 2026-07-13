'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Rss, Plus, X, RefreshCw, ExternalLink } from 'lucide-react';
const FEEDS = [
  {name:'Hacker News',url:'https://news.ycombinator.com',color:'#ff6600',items:[{title:'Show HN: WebLinuxOS – full Linux desktop in the browser',time:'2h',link:'#'},{title:'Ask HN: What is the best cloud database for Next.js?',time:'4h',link:'#'},{title:'Prisma v6 released with major performance improvements',time:'6h',link:'#'},{title:'Vercel launches new edge functions runtime',time:'8h',link:'#'},{title:'Next.js 15 is now stable',time:'10h',link:'#'}]},
  {name:'Dev.to',url:'https://dev.to',color:'#3b49df',items:[{title:'Building a Linux OS in the Browser with Next.js',time:'1h',link:'#'},{title:'10 Tailwind CSS tricks you need to know',time:'3h',link:'#'},{title:'Authentication with NextAuth v5',time:'5h',link:'#'},{title:'Neon DB: The future of serverless Postgres',time:'7h',link:'#'}]},
  {name:'CSS Tricks',url:'https://css-tricks.com',color:'#ff4036',items:[{title:'A Complete Guide to Flexbox',time:'1d',link:'#'},{title:'Dark mode in CSS with color-scheme',time:'2d',link:'#'},{title:'Glass morphism design patterns',time:'3d',link:'#'}]},
];
export default function RssReader({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [feeds, setFeeds] = useState(FEEDS);
  const [selected, setSelected] = useState(0);
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const feed = feeds[selected];
  return (
    <div className="flex h-full text-xs" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="w-48 flex-shrink-0 flex flex-col border-r" style={{borderColor:'rgba(255,255,255,0.06)',background:theme.mode==='dark'?'rgba(10,10,20,0.8)':'rgba(225,230,240,0.8)'}}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-1.5"><Rss size={13} style={{color:theme.accent}}/><span className="font-bold">RSS Reader</span></div>
          <button onClick={()=>setAdding(v=>!v)} className="p-1 rounded hover:bg-white/10"><Plus size={12}/></button>
        </div>
        {adding && (
          <div className="p-2 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
            <input value={newUrl} onChange={e=>setNewUrl(e.target.value)} placeholder="Feed URL or site…" className="w-full px-2 py-1.5 rounded-lg outline-none mb-1" style={{background:'rgba(255,255,255,0.08)',caretColor:theme.accent}} onKeyDown={e=>{if(e.key==='Enter'){setFeeds(f=>[...f,{name:newUrl,url:newUrl,color:theme.accent,items:[{title:'Feed added – no items yet',time:'now',link:'#'}]}]);setNewUrl('');setAdding(false);}}}/>
            <p className="opacity-30 text-[10px]">Press Enter to add</p>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {feeds.map((f,i)=>(
            <button key={i} onClick={()=>setSelected(i)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all"
              style={{background:selected===i?`${f.color}20`:'transparent',border:selected===i?`1px solid ${f.color}30`:'1px solid transparent'}}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:f.color}}/>
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{f.name}</p><p className="opacity-40 truncate text-[10px]">{f.items.length} articles</p></div>
              <button onClick={e=>{e.stopPropagation();setFeeds(fs=>fs.filter((_,j)=>j!==i));if(selected>=i)setSelected(Math.max(0,selected-1));}} className="opacity-0 group-hover:opacity-100 hover:text-red-400"><X size={10}/></button>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{background:feed.color}}/><span className="font-bold">{feed.name}</span><span className="opacity-40">({feed.items.length})</span></div>
          <div className="flex gap-1">
            <a href={feed.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/10"><ExternalLink size={12}/></a>
            <button className="p-1.5 rounded hover:bg-white/10"><RefreshCw size={12}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {feed.items.map((item,i)=>(
            <a key={i} href={item.link} className="block px-4 py-3 border-b transition-colors" style={{borderColor:'rgba(255,255,255,0.04)'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug">{item.title}</p>
                <span className="opacity-40 flex-shrink-0 mt-0.5">{item.time}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 opacity-40" style={{color:feed.color}}><Rss size={10}/><span>{feed.name}</span></div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
