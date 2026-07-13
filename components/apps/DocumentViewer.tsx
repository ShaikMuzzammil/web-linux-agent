'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
const SAMPLE_CONTENT = `WebLinuxOS v2.0 — Technical Documentation

1. INTRODUCTION
   WebLinuxOS is a full-featured browser-based Linux desktop environment
   built with Next.js 14, Neon PostgreSQL, and NextAuth.

2. ARCHITECTURE
   • Frontend: Next.js 14 App Router, React 18, TypeScript
   • State: Zustand for OS state, React hooks per-app
   • Auth: NextAuth v4 with email/password + OAuth
   • Database: Neon PostgreSQL via Prisma 5
   • Deployment: Vercel (zero-config)

3. APPS (54 total)
   System: File Manager, Terminal, Text Editor, Calculator,
           Settings, System Monitor, Archive Manager
   
   Productivity: Calendar, Notes, Todo, Clock, Spreadsheet,
                 Reminders, Contacts, Password Manager, Whiteboard
   
   Internet: Browser, Email, Chat (Claude AI), Weather,
             RSS Reader, FTP Client, Network Tools
   
   Media: Music Player, Video Player, Image Viewer, Photo Editor,
          Voice Recorder, Screen Recorder, Media Converter
   
   Games: Minesweeper, Snake, Tetris, Tic-Tac-Toe, 2048,
          Sudoku, Chess, Memory, Pong, Solitaire, Flappy Bird
   
   DevTools: Code Editor, JSON Formatter, Regex Tester,
             Markdown Preview, Git Client, API Tester, Base64, Colors
   
   Creative: Drawing, Color Picker, Image Gallery, ASCII Art

4. CLOUD SYNC
   All user data is persisted per-user in Neon PostgreSQL.
   Sync endpoints: /api/sync/{notes,tasks,contacts,events,
                               reminders,passwords,settings,files}

5. DEPLOYMENT
   See README.md for complete setup instructions.
`;
export default function DocumentViewer({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 3;
  return (
    <div className="flex flex-col h-full" style={{background:theme.mode==='dark'?'#1a1a2e':'#e8e8f0',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{background:theme.mode==='dark'?'rgba(10,10,20,0.9)':'rgba(220,220,235,0.9)',borderColor:'rgba(255,255,255,0.06)'}}>
        <FileText size={13} style={{color:theme.accent}}/><span className="text-xs font-medium flex-1 truncate">WebLinuxOS-Documentation.pdf</span>
        <div className="flex items-center gap-1">
          <button onClick={()=>setZoom(z=>Math.max(50,z-25))} className="p-1 rounded hover:bg-white/10"><ZoomOut size={12}/></button>
          <span className="text-[10px] w-10 text-center opacity-60">{zoom}%</span>
          <button onClick={()=>setZoom(z=>Math.min(200,z+25))} className="p-1 rounded hover:bg-white/10"><ZoomIn size={12}/></button>
        </div>
        <div className="flex items-center gap-1 border-l pl-2" style={{borderColor:'rgba(255,255,255,0.1)'}}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={12}/></button>
          <span className="text-[10px] opacity-60">{page}/{totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronRight size={12}/></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex justify-center p-6">
        <div className="bg-white shadow-2xl rounded" style={{width:`${zoom*6}px`,maxWidth:'100%',padding:'48px',minHeight:500}}>
          <pre className="text-gray-800 text-xs leading-relaxed whitespace-pre-wrap font-sans" style={{fontSize:`${zoom*0.1}px`}}>{SAMPLE_CONTENT}</pre>
          <div className="mt-8 pt-4 border-t border-gray-200 text-[10px] text-gray-400 text-center">Page {page} of {totalPages} — WebLinuxOS Technical Documentation v2.0</div>
        </div>
      </div>
    </div>
  );
}
