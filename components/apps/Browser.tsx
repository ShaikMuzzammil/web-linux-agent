'use client';
import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Home, Star, StarOff, Plus, X, Globe, Lock, ExternalLink, Bookmark } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

interface Tab { id: string; title: string; url: string; favicon?: string }
interface Bookmark { id: string; title: string; url: string }

const BOOKMARKS_DEFAULT: Bookmark[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com' },
  { id: '2', title: 'GitHub', url: 'https://github.com' },
  { id: '3', title: 'MDN Docs', url: 'https://developer.mozilla.org' },
  { id: '4', title: 'Vercel', url: 'https://vercel.com' },
  { id: '5', title: 'Neon DB', url: 'https://neon.tech' },
];

const HOME_URL = 'about:newtab';

export default function Browser({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'New Tab', url: HOME_URL }]);
  const [activeTab, setActiveTab] = useState('1');
  const [addressInput, setAddressInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(BOOKMARKS_DEFAULT);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const current = tabs.find((t) => t.id === activeTab) || tabs[0];
  const isSecure = current.url.startsWith('https://');
  const isNewTab = current.url === HOME_URL || current.url === '';

  const navigate = useCallback((url: string) => {
    let finalUrl = url.trim();
    if (!finalUrl) return;
    if (finalUrl === HOME_URL) {
      updateTab(activeTab, { url: HOME_URL, title: 'New Tab' });
      setAddressInput('');
      return;
    }
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.includes('.')) {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
    } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setIsLoading(true);
    updateTab(activeTab, { url: finalUrl, title: new URL(finalUrl).hostname });
    setAddressInput(finalUrl);
    setTimeout(() => setIsLoading(false), 1200);
  }, [activeTab]);

  const updateTab = (id: string, patch: Partial<Tab>) =>
    setTabs((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));

  const newTab = () => {
    const id = Math.random().toString(36).slice(2);
    setTabs((prev) => [...prev, { id, title: 'New Tab', url: HOME_URL }]);
    setActiveTab(id);
    setAddressInput('');
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) { newTab(); return; }
    const idx = tabs.findIndex((t) => t.id === id);
    const next = tabs[idx === tabs.length - 1 ? idx - 1 : idx + 1];
    setTabs((prev) => prev.filter((t) => t.id !== id));
    setActiveTab(next.id);
    setAddressInput(next.url === HOME_URL ? '' : next.url);
  };

  const isBookmarked = bookmarks.some((b) => b.url === current.url);
  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== current.url));
    } else if (!isNewTab) {
      setBookmarks((prev) => [...prev, { id: Math.random().toString(36), title: current.title, url: current.url }]);
    }
  };

  const QUICK_LINKS = [
    { name: 'Google', url: 'https://google.com', bg: '#4285F4' },
    { name: 'GitHub', url: 'https://github.com', bg: '#24292e' },
    { name: 'YouTube', url: 'https://youtube.com', bg: '#FF0000' },
    { name: 'MDN', url: 'https://developer.mozilla.org', bg: '#1f7a8c' },
    { name: 'Vercel', url: 'https://vercel.com', bg: '#000000' },
    { name: 'Neon', url: 'https://neon.tech', bg: '#00e699' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb' }}>
      {/* Tabs bar */}
      <div className="flex items-center gap-1 px-2 pt-1 flex-shrink-0 overflow-x-auto" style={{ background: theme.mode === 'dark' ? 'rgba(10,10,20,0.9)' : 'rgba(225,225,235,0.9)' }}>
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => { setActiveTab(tab.id); setAddressInput(tab.url === HOME_URL ? '' : tab.url); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer flex-shrink-0 max-w-[160px] group transition-all"
            style={{ background: tab.id === activeTab ? (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff') : 'transparent', minWidth: 80 }}>
            <Globe size={11} className="flex-shrink-0 opacity-50" />
            <span className="text-xs truncate flex-1">{tab.title}</span>
            <button onClick={(e) => closeTab(tab.id, e)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all flex-shrink-0">
              <X size={11} />
            </button>
          </div>
        ))}
        <button onClick={newTab} className="p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"><Plus size={13} /></button>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: theme.mode === 'dark' ? 'rgba(10,10,20,0.7)' : 'rgba(230,230,240,0.7)' }}>
        <button className="p-1.5 rounded hover:bg-white/10"><ArrowLeft size={14} /></button>
        <button className="p-1.5 rounded hover:bg-white/10"><ArrowRight size={14} /></button>
        <button onClick={() => navigate(current.url)} className="p-1.5 rounded hover:bg-white/10">
          {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </button>
        <button onClick={() => navigate(HOME_URL)} className="p-1.5 rounded hover:bg-white/10"><Home size={14} /></button>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {!isNewTab && (isSecure ? <Lock size={11} className="text-green-400 flex-shrink-0" /> : <Globe size={11} className="opacity-40 flex-shrink-0" />)}
          <input
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(addressInput); }}
            onFocus={(e) => e.target.select()}
            placeholder="Search or enter URL…"
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ caretColor: theme.accent, color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}
          />
        </div>

        <button onClick={toggleBookmark} className="p-1.5 rounded hover:bg-white/10 transition-colors" title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
          {isBookmarked ? <Star size={14} style={{ color: theme.accent, fill: theme.accent }} /> : <Star size={14} className="opacity-40" />}
        </button>
        <button onClick={() => setShowBookmarks((v) => !v)} className="p-1.5 rounded hover:bg-white/10"><Bookmark size={14} /></button>
        {!isNewTab && <a href={current.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/10"><ExternalLink size={14} /></a>}
      </div>

      {/* Bookmarks bar */}
      {showBookmarks && (
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto flex-shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          {bookmarks.map((b) => (
            <button key={b.id} onClick={() => navigate(b.url)} className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] hover:bg-white/08 flex-shrink-0 transition-colors">
              <Globe size={10} className="opacity-40" />{b.title}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isNewTab ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 p-4" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
            <Globe size={40} style={{ color: theme.accent, opacity: 0.5 }} />
            <h2 className="text-xl font-semibold opacity-70">New Tab</h2>

            {/* Quick links */}
            <div className="grid grid-cols-3 gap-3 max-w-xs">
              {QUICK_LINKS.map((l) => (
                <button key={l.url} onClick={() => navigate(l.url)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-lg" style={{ background: l.bg }} />
                  <span className="text-[10px] opacity-60">{l.name}</span>
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="flex gap-2 w-full max-w-sm">
              <input
                placeholder="Search the web or enter URL…"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${theme.accent}30`, caretColor: theme.accent, color: 'inherit' }}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate((e.target as HTMLInputElement).value); }}
              />
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={current.url}
            className="w-full h-full border-none"
            title={current.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => {
              setIsLoading(false);
              try {
                const title = iframeRef.current?.contentDocument?.title;
                if (title) updateTab(activeTab, { title });
              } catch { /* cross-origin */ }
            }}
          />
        )}
      </div>
    </div>
  );
}
