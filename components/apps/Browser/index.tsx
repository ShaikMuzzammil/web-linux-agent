'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, RefreshCw, Home, Star, StarOff, Plus, X,
  Globe, Lock, ExternalLink, Bookmark, History, Search, Loader2,
  ChevronDown, Shield, AlertTriangle, Wifi, RotateCcw, Copy,
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

interface Tab { id: string; title: string; url: string; isLoading?: boolean; hasError?: boolean; favicon?: string }
interface BookmarkItem { id: string; title: string; url: string }
interface HistoryItem { id: string; title: string; url: string; visitedAt: number }

const HOME_URL = 'about:newtab';

// Sites known to block iframes — show an "Open in new tab" overlay instead
const IFRAME_BLOCKED = [
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com',
  'instagram.com', 'linkedin.com', 'reddit.com', 'amazon.com', 'netflix.com',
  'twitch.tv', 'tiktok.com', 'whatsapp.com', 'dropbox.com', 'notion.so',
];

// Sites that do embed okay
const EMBEDDABLE = [
  'github.com', 'vercel.com', 'neon.tech', 'developer.mozilla.org',
  'stackoverflow.com', 'en.wikipedia.org', 'openai.com',
  'nextjs.org', 'react.dev', 'tailwindcss.com', 'npmjs.com',
  'cloudflare.com', 'codepen.io', 'codesandbox.io',
];

function isBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return IFRAME_BLOCKED.some(s => host === s || host.endsWith('.' + s));
  } catch { return false; }
}

function getFavicon(url: string): string {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch { return ''; }
}

const SPEED_DIAL = [
  { name: 'GitHub', url: 'https://github.com', color: '#24292e', letter: '⌥' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', color: '#1f7a8c', letter: 'M' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', color: '#F48024', letter: 'SO' },
  { name: 'Vercel', url: 'https://vercel.com', color: '#111', letter: '▲' },
  { name: 'React Docs', url: 'https://react.dev', color: '#61DAFB', letter: 'R' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com', color: '#06B6D4', letter: 'T' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', color: '#636466', letter: 'W' },
  { name: 'Neon DB', url: 'https://neon.tech', color: '#00e699', letter: 'N' },
];

function ls<T>(key: string, def: T): T {
  if (typeof window === 'undefined') return def;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function lsSet(key: string, val: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function Browser({ windowId }: { windowId?: string }) {
  const { theme } = useOSStore();
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'New Tab', url: HOME_URL }]);
  const [activeTab, setActiveTab] = useState('1');
  const [addrInput, setAddrInput] = useState('');
  const [addrFocused, setAddrFocused] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => ls('wlos_bm', []));
  const [history, setHistory] = useState<HistoryItem[]>(() => ls('wlos_hist', []));
  const [sidePanel, setSidePanel] = useState<'bookmarks' | 'history' | null>(null);
  const [newTabSearch, setNewTabSearch] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);

  const cur = tabs.find(t => t.id === activeTab) || tabs[0];
  const isNewTab = !cur.url || cur.url === HOME_URL;
  const blocked = !isNewTab && isBlocked(cur.url);
  const isSecure = cur.url.startsWith('https://');

  const updateTab = (id: string, patch: Partial<Tab>) =>
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  const addHistory = useCallback((url: string, title: string) => {
    const item: HistoryItem = { id: Date.now().toString(), title, url, visitedAt: Date.now() };
    const h = [item, ...history.filter(x => x.url !== url)].slice(0, 200);
    setHistory(h); lsSet('wlos_hist', h);
  }, [history]);

  const navigate = useCallback((input: string) => {
    let url = input.trim();
    if (!url || url === HOME_URL) {
      updateTab(activeTab, { url: HOME_URL, title: 'New Tab', hasError: false, isLoading: false });
      setAddrInput(''); return;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // keep as-is
    } else if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    let title = url;
    try { title = new URL(url).hostname; } catch {}
    updateTab(activeTab, { url, title, isLoading: true, hasError: false, favicon: getFavicon(url) });
    setAddrInput(url);
    addHistory(url, title);
  }, [activeTab, addHistory]);

  const newTab = (url = HOME_URL) => {
    const id = Date.now().toString();
    let title = 'New Tab';
    try { if (url !== HOME_URL) title = new URL(url).hostname; } catch {}
    setTabs(prev => [...prev, { id, title, url, favicon: url !== HOME_URL ? getFavicon(url) : undefined }]);
    setActiveTab(id);
    setAddrInput(url === HOME_URL ? '' : url);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) { newTab(); return; }
    const idx = tabs.findIndex(t => t.id === id);
    const next = tabs[idx === tabs.length - 1 ? idx - 1 : idx + 1];
    setTabs(prev => prev.filter(t => t.id !== id));
    setActiveTab(next.id);
    setAddrInput(next.url === HOME_URL ? '' : next.url);
  };

  const isBookmarked = bookmarks.some(b => b.url === cur.url);
  const toggleBookmark = () => {
    if (isNewTab) return;
    const upd = isBookmarked
      ? bookmarks.filter(b => b.url !== cur.url)
      : [...bookmarks, { id: Date.now().toString(), title: cur.title, url: cur.url }];
    setBookmarks(upd); lsSet('wlos_bm', upd);
  };

  const reload = () => {
    if (isNewTab) return;
    updateTab(activeTab, { isLoading: true, hasError: false });
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 50);
    }
  };

  const handleAddrKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { navigate(addrInput); addrRef.current?.blur(); }
    if (e.key === 'Escape') { setAddrInput(cur.url === HOME_URL ? '' : cur.url); addrRef.current?.blur(); }
  };

  const dk = theme.mode === 'dark';
  const bg       = dk ? '#0d0d1a' : '#f0f0f8';
  const tabBarBg = dk ? 'rgba(8,8,18,0.95)' : 'rgba(215,215,230,0.95)';
  const toolBg   = dk ? 'rgba(12,12,22,0.98)' : 'rgba(228,228,240,0.98)';
  const panelBg  = dk ? 'rgba(10,10,22,0.99)' : 'rgba(250,250,255,0.99)';
  const borderC  = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text     = dk ? '#e2e8f0' : '#1e1e2e';
  const accent   = theme.accent;

  return (
    <div className="flex flex-col h-full" style={{ background: bg, color: text }}>

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="flex items-end px-2 pt-1.5 flex-shrink-0 overflow-x-auto gap-0.5"
        style={{ background: tabBarBg, borderBottom: `1px solid ${borderC}` }}>
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => { setActiveTab(tab.id); setAddrInput(tab.url === HOME_URL ? '' : tab.url); }}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-[11px] min-w-[120px] max-w-[200px] flex-shrink-0 transition-all relative"
            style={{
              background: tab.id === activeTab
                ? (dk ? 'rgba(20,20,35,0.98)' : 'rgba(248,248,252,0.98)')
                : 'transparent',
              color: tab.id === activeTab ? text : 'rgba(150,150,180,0.7)',
              borderBottom: tab.id === activeTab ? `2px solid ${accent}` : '2px solid transparent',
            }}>
            {tab.isLoading
              ? <Loader2 size={11} className="animate-spin flex-shrink-0" style={{ color: accent }} />
              : tab.favicon
              ? <img src={tab.favicon} className="w-3.5 h-3.5 rounded flex-shrink-0" alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              : <Globe size={11} className="flex-shrink-0 opacity-40" />}
            <span className="flex-1 truncate text-left">{tab.title}</span>
            <div
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all flex-shrink-0"
              onClick={e => closeTab(tab.id, e)}>
              <X size={9} />
            </div>
          </button>
        ))}
        <button onClick={() => newTab()}
          className="p-1.5 mb-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-0.5">
          <Plus size={13} className="opacity-50" />
        </button>
      </div>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0"
        style={{ background: toolBg, borderBottom: `1px solid ${borderC}` }}>

        {/* Nav buttons */}
        <div className="flex items-center gap-0.5">
          <button onClick={() => window.history.back()}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-40 hover:opacity-80"
            title="Back">
            <ArrowLeft size={13} />
          </button>
          <button onClick={() => window.history.forward()}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-40 hover:opacity-80"
            title="Forward">
            <ArrowRight size={13} />
          </button>
          <button onClick={reload}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-40 hover:opacity-80"
            title="Reload">
            {cur.isLoading
              ? <X size={13} />
              : <RefreshCw size={13} />}
          </button>
          <button onClick={() => navigate(HOME_URL)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-40 hover:opacity-80"
            title="Home">
            <Home size={13} />
          </button>
        </div>

        {/* Address bar */}
        <div className="flex-1 flex items-center gap-2 px-3 rounded-xl transition-all"
          style={{
            background: addrFocused
              ? dk ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'
              : dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: addrFocused ? `1px solid ${accent}60` : `1px solid ${borderC}`,
            boxShadow: addrFocused ? `0 0 0 3px ${accent}15` : 'none',
          }}>
          {!isNewTab && (
            isSecure
              ? <Lock size={10} className="flex-shrink-0" style={{ color: '#4ade80', opacity: 0.8 }} />
              : <Shield size={10} className="flex-shrink-0 opacity-30" />
          )}
          {isNewTab && <Search size={10} className="flex-shrink-0 opacity-30" />}
          <input
            ref={addrRef}
            value={addrFocused ? addrInput : (isNewTab ? '' : cur.url)}
            onChange={e => setAddrInput(e.target.value)}
            onFocus={() => { setAddrFocused(true); setAddrInput(cur.url === HOME_URL ? '' : cur.url); addrRef.current?.select(); }}
            onBlur={() => setAddrFocused(false)}
            onKeyDown={handleAddrKeyDown}
            placeholder={isNewTab ? 'Search or enter URL…' : cur.url}
            className="flex-1 text-[11px] outline-none bg-transparent py-1.5"
            style={{ caretColor: accent }}
          />
          {!isNewTab && !addrFocused && (
            <button onClick={() => { navigator.clipboard?.writeText(cur.url); }}
              className="opacity-0 hover:opacity-50 transition-opacity" title="Copy URL">
              <Copy size={10} />
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <button onClick={toggleBookmark}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
            {isBookmarked
              ? <Star size={13} style={{ color: '#facc15', fill: '#facc15' }} />
              : <Star size={13} className="opacity-40" />}
          </button>
          <button onClick={() => setSidePanel(p => p === 'bookmarks' ? null : 'bookmarks')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Bookmarks"
            style={{ background: sidePanel === 'bookmarks' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <Bookmark size={13} className="opacity-50" />
          </button>
          <button onClick={() => setSidePanel(p => p === 'history' ? null : 'history')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="History"
            style={{ background: sidePanel === 'history' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <History size={13} className="opacity-50" />
          </button>
          {!isNewTab && (
            <button onClick={() => window.open(cur.url, '_blank', 'noopener')}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Open in new window">
              <ExternalLink size={13} className="opacity-50" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Side Panel */}
        {sidePanel && (
          <div className="w-60 flex-shrink-0 flex flex-col border-r overflow-hidden"
            style={{ background: panelBg, borderColor: borderC }}>
            <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
              style={{ borderColor: borderC }}>
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">
                {sidePanel === 'bookmarks' ? '★ Bookmarks' : '⏱ History'}
              </span>
              <button onClick={() => setSidePanel(null)} className="opacity-30 hover:opacity-70"><X size={12} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidePanel === 'bookmarks' && (
                <>
                  {bookmarks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Bookmark size={24} className="opacity-15" />
                      <p className="text-[11px] opacity-30">No bookmarks yet</p>
                    </div>
                  )}
                  {bookmarks.map(b => (
                    <div key={b.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/05 cursor-pointer group transition-colors"
                      onClick={() => navigate(b.url)}>
                      <img src={getFavicon(b.url)} className="w-3.5 h-3.5 rounded flex-shrink-0" alt=""
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] truncate">{b.title}</p>
                        <p className="text-[9px] opacity-30 truncate">{b.url}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); const u = bookmarks.filter(x => x.id !== b.id); setBookmarks(u); lsSet('wlos_bm', u); }}
                        className="opacity-0 group-hover:opacity-30 hover:!opacity-70 hover:text-red-400 transition-all">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </>
              )}
              {sidePanel === 'history' && (
                <>
                  {history.length > 0 && (
                    <button
                      onClick={() => { setHistory([]); lsSet('wlos_hist', []); }}
                      className="w-full text-[10px] opacity-30 hover:opacity-60 py-1.5 px-3 text-left border-b transition-opacity"
                      style={{ borderColor: borderC }}>
                      Clear all history
                    </button>
                  )}
                  {history.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <History size={24} className="opacity-15" />
                      <p className="text-[11px] opacity-30">No history</p>
                    </div>
                  )}
                  {history.map(h => (
                    <div key={h.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/05 cursor-pointer group transition-colors"
                      onClick={() => navigate(h.url)}>
                      <img src={getFavicon(h.url)} className="w-3.5 h-3.5 rounded flex-shrink-0" alt=""
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] truncate">{h.title}</p>
                        <p className="text-[9px] opacity-25">{new Date(h.visitedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Viewport */}
        <div className="flex-1 relative overflow-hidden">
          {isNewTab ? (
            /* ── New Tab Page ── */
            <div className="h-full overflow-y-auto flex flex-col items-center"
              style={{ background: `linear-gradient(160deg, ${dk ? '#0d0d1a' : '#f0f0f8'} 0%, ${dk ? '#13071f' : '#e8e8f4'} 100%)` }}>
              <div className="w-full max-w-2xl px-6 pt-16 pb-10">
                {/* Search */}
                <div className="text-center mb-10">
                  <h1 className="text-2xl font-bold mb-1 opacity-80">WebLinuxOS Browser</h1>
                  <p className="text-xs opacity-30 mb-6">Cloud Desktop — Search & Explore</p>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    <input
                      value={newTabSearch}
                      onChange={e => setNewTabSearch(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newTabSearch) navigate(newTabSearch); }}
                      placeholder="Search or enter a URL…"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                      style={{
                        background: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        border: `1px solid ${borderC}`,
                        caretColor: accent,
                      }}
                    />
                  </div>
                </div>

                {/* Speed dial */}
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-30 mb-3">Quick Access</p>
                <div className="grid grid-cols-4 gap-3 mb-8">
                  {SPEED_DIAL.map(s => (
                    <button key={s.url}
                      onClick={() => navigate(s.url)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group"
                      style={{
                        background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${borderC}`,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-transform group-hover:scale-110"
                        style={{ background: s.color }}>
                        {s.letter}
                      </div>
                      <span className="text-[11px] opacity-60 leading-tight text-center">{s.name}</span>
                    </button>
                  ))}
                </div>

                {/* Bookmarks */}
                {bookmarks.length > 0 && (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-widest opacity-30 mb-3">Bookmarks</p>
                    <div className="space-y-1">
                      {bookmarks.slice(0, 6).map(b => (
                        <button key={b.id}
                          onClick={() => navigate(b.url)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
                          style={{ background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}>
                          <img src={getFavicon(b.url)} className="w-4 h-4 rounded" alt=""
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <span className="text-xs truncate">{b.title}</span>
                          <span className="text-[10px] opacity-30 truncate ml-auto">{b.url}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : blocked ? (
            /* ── Blocked site overlay ── */
            <div className="h-full flex flex-col items-center justify-center gap-5 px-8"
              style={{ background: bg }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,165,0,0.12)', border: '1px solid rgba(255,165,0,0.25)' }}>
                <Shield size={28} style={{ color: '#fb923c' }} />
              </div>
              <div className="text-center">
                <h3 className="text-base font-semibold mb-2">Content Security Restriction</h3>
                <p className="text-xs opacity-50 max-w-xs leading-relaxed">
                  <strong>{(() => { try { return new URL(cur.url).hostname; } catch { return 'This site'; } })()}</strong> uses{' '}
                  <code className="text-xs opacity-70">X-Frame-Options</code> to block embedding in iframes.
                  This is a browser security feature, not a bug.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => window.open(cur.url, '_blank', 'noopener,noreferrer')}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: accent }}>
                  <ExternalLink size={13} /> Open in New Tab
                </button>
                <button
                  onClick={() => navigate(HOME_URL)}
                  className="w-full py-2 rounded-xl text-xs opacity-40 hover:opacity-70 transition-opacity">
                  ← Go Home
                </button>
              </div>
            </div>
          ) : (
            /* ── iframe ── */
            <>
              {cur.isLoading && (
                <div className="absolute top-0 left-0 right-0 z-10 h-0.5 overflow-hidden">
                  <div className="h-full animate-pulse"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, animation: 'browserLoad 1.5s ease infinite' }} />
                </div>
              )}
              {cur.hasError ? (
                <div className="h-full flex flex-col items-center justify-center gap-5"
                  style={{ background: bg }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold mb-1">Page Failed to Load</h3>
                    <p className="text-xs opacity-40">{cur.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={reload}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-white"
                      style={{ background: accent }}>
                      <RotateCcw size={11} /> Try Again
                    </button>
                    <button onClick={() => navigate(HOME_URL)}
                      className="px-4 py-2 rounded-xl text-xs opacity-40 hover:opacity-70">
                      Home
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={`/api/proxy?url=${encodeURIComponent(cur.url)}`}
                  className="w-full h-full border-0"
                  title={cur.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
                  onLoad={() => {
                    updateTab(activeTab, { isLoading: false });
                    try {
                      const doc = iframeRef.current?.contentDocument;
                      if (doc?.title) updateTab(activeTab, { title: doc.title });
                    } catch {}
                  }}
                  onError={() => updateTab(activeTab, { isLoading: false, hasError: true })}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
