'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, RefreshCw, Home, Star, Plus, X, Globe, Lock,
  ExternalLink, Bookmark, BookmarkCheck, History, Search, AlertTriangle,
  Loader2, Wifi, Download, ChevronDown,
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

interface Tab {
  id: string; title: string; url: string;
  isLoading?: boolean; hasError?: boolean;
  backStack: string[]; forwardStack: string[];
}
interface BookmarkItem { id: string; title: string; url: string }
interface HistoryItem  { id: string; title: string; url: string; visitedAt: number }

const HOME_URL = 'about:newtab';

const SPEED_DIAL = [
  { name: 'Google',         url: 'https://www.google.com',              color: '#4285F4', letter: 'G'   },
  { name: 'GitHub',         url: 'https://github.com',                  color: '#24292e', letter: 'GH'  },
  { name: 'YouTube',        url: 'https://youtube.com',                 color: '#FF0000', letter: 'YT'  },
  { name: 'Wikipedia',      url: 'https://en.wikipedia.org',            color: '#636466', letter: 'W'   },
  { name: 'MDN',            url: 'https://developer.mozilla.org',       color: '#1f7a8c', letter: 'MDN' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com',           color: '#F48024', letter: 'SO'  },
  { name: 'Vercel',         url: 'https://vercel.com',                  color: '#000',    letter: 'V'   },
  { name: 'Neon',           url: 'https://neon.tech',                   color: '#00e699', letter: 'N'   },
];

const BLOCKED_PATTERNS = ['google.com','facebook.com','twitter.com','instagram.com','linkedin.com','youtube.com','reddit.com'];

function isLikelyBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return BLOCKED_PATTERNS.some(p => host.includes(p));
  } catch { return false; }
}

function parseUrl(input: string): string {
  const t = input.trim();
  if (!t || t === HOME_URL) return HOME_URL;
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  // looks like a domain?
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(t) && !t.includes(' ')) return 'https://' + t;
  return `https://www.google.com/search?q=${encodeURIComponent(t)}`;
}

function loadJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}
function saveJSON(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id:'1', title:'GitHub',         url:'https://github.com' },
  { id:'2', title:'MDN Web Docs',   url:'https://developer.mozilla.org' },
  { id:'3', title:'Vercel',         url:'https://vercel.com' },
  { id:'4', title:'Neon DB',        url:'https://neon.tech' },
  { id:'5', title:'Next.js Docs',   url:'https://nextjs.org/docs' },
  { id:'6', title:'Tailwind CSS',   url:'https://tailwindcss.com' },
];

function makeTab(url = HOME_URL, title = 'New Tab'): Tab {
  return { id: Math.random().toString(36).slice(2), title, url, backStack: [], forwardStack: [] };
}

export default function Browser({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tabs, setTabs]           = useState<Tab[]>([makeTab()]);
  const [activeId, setActiveId]   = useState(tabs[0].id);
  const [addrInput, setAddrInput] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = loadJSON<BookmarkItem[]>('wlos_bookmarks', []);
    return saved.length ? saved : DEFAULT_BOOKMARKS;
  });
  const [history,   setHistory]   = useState<HistoryItem[]>(() => loadJSON('wlos_history', []));
  const [sidePanel, setSidePanel] = useState<'bookmarks' | 'history' | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const addrRef    = useRef<HTMLInputElement>(null);

  const current  = tabs.find(t => t.id === activeId) ?? tabs[0];
  const isHome   = current.url === HOME_URL;
  const isSecure = current.url.startsWith('https://');
  const proxyUrl = isHome ? '' : `/api/proxy?url=${encodeURIComponent(current.url)}`;
  const isBookmarked = bookmarks.some(b => b.url === current.url);
  const canBack    = current.backStack.length > 0;
  const canForward = current.forwardStack.length > 0;

  const patchTab = useCallback((id: string, patch: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  // Navigate current tab to url, managing back/forward stacks
  const navigate = useCallback((input: string, pushBack = true) => {
    const url = parseUrl(input);
    setTabs(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      const newBack = (pushBack && t.url && t.url !== HOME_URL && t.url !== url)
        ? [...t.backStack, t.url]
        : t.backStack;
      return {
        ...t,
        url,
        title: url === HOME_URL ? 'New Tab' : (() => { try { return new URL(url).hostname; } catch { return url; } })(),
        isLoading: url !== HOME_URL,
        hasError: false,
        backStack: newBack,
        forwardStack: [],
      };
    }));
    setAddrInput(url === HOME_URL ? '' : url);

    if (url !== HOME_URL) {
      const entry: HistoryItem = {
        id: Date.now().toString(),
        title: (() => { try { return new URL(url).hostname; } catch { return url; } })(),
        url, visitedAt: Date.now(),
      };
      setHistory(prev => {
        const next = [entry, ...prev.filter(h => h.url !== url)].slice(0, 150);
        saveJSON('wlos_history', next);
        return next;
      });
    }
  }, [activeId]);

  const goBack = useCallback(() => {
    const tab = tabs.find(t => t.id === activeId);
    if (!tab || !tab.backStack.length) return;
    const prev = tab.backStack[tab.backStack.length - 1];
    setTabs(ts => ts.map(t => t.id === activeId
      ? { ...t, url: prev, title: (() => { try { return new URL(prev).hostname; } catch { return prev; } })(), isLoading: prev !== HOME_URL, hasError: false, backStack: t.backStack.slice(0, -1), forwardStack: [t.url, ...t.forwardStack] }
      : t
    ));
    setAddrInput(prev === HOME_URL ? '' : prev);
  }, [activeId, tabs]);

  const goForward = useCallback(() => {
    const tab = tabs.find(t => t.id === activeId);
    if (!tab || !tab.forwardStack.length) return;
    const next = tab.forwardStack[0];
    setTabs(ts => ts.map(t => t.id === activeId
      ? { ...t, url: next, title: (() => { try { return new URL(next).hostname; } catch { return next; } })(), isLoading: next !== HOME_URL, hasError: false, backStack: [...t.backStack, t.url], forwardStack: t.forwardStack.slice(1) }
      : t
    ));
    setAddrInput(next === HOME_URL ? '' : next);
  }, [activeId, tabs]);

  const reload = useCallback(() => {
    patchTab(activeId, { isLoading: true, hasError: false });
    if (iframeRef.current) {
      try { iframeRef.current.src = proxyUrl; } catch {}
    }
    setTimeout(() => patchTab(activeId, { isLoading: false }), 3000);
  }, [activeId, proxyUrl, patchTab]);

  const newTab = (url = HOME_URL) => {
    const tab = makeTab(url, url === HOME_URL ? 'New Tab' : (() => { try { return new URL(url).hostname; } catch { return url; } })());
    setTabs(prev => [...prev, tab]);
    setActiveId(tab.id);
    setAddrInput(url === HOME_URL ? '' : url);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) { const t = makeTab(); setTabs([t]); setActiveId(t.id); setAddrInput(''); return; }
    const idx  = tabs.findIndex(t => t.id === id);
    const next = tabs[idx === tabs.length - 1 ? idx - 1 : idx + 1];
    setTabs(prev => prev.filter(t => t.id !== id));
    if (id === activeId) { setActiveId(next.id); setAddrInput(next.url === HOME_URL ? '' : next.url); }
  };

  const switchTab = (id: string) => {
    setActiveId(id);
    const tab = tabs.find(t => t.id === id);
    setAddrInput(tab?.url === HOME_URL ? '' : (tab?.url ?? ''));
  };

  const toggleBookmark = () => {
    if (isHome) return;
    if (isBookmarked) {
      const next = bookmarks.filter(b => b.url !== current.url);
      setBookmarks(next); saveJSON('wlos_bookmarks', next);
    } else {
      const next = [...bookmarks, { id: Date.now().toString(), title: current.title, url: current.url }];
      setBookmarks(next); saveJSON('wlos_bookmarks', next);
    }
  };

  const removeBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next); saveJSON('wlos_bookmarks', next);
  };

  // Listen for navigation from proxy iframe
  useEffect(() => {
    const h = (e: MessageEvent) => {
      if (e.data?.type === 'BROWSER_NAVIGATE' && e.data.url) navigate(e.data.url);
    };
    window.addEventListener('message', h);
    return () => window.removeEventListener('message', h);
  }, [navigate]);

  const dk  = theme.mode === 'dark';
  const bg  = dk ? '#0d0d1a' : '#f2f2fa';
  const tbg = dk ? 'rgba(10,10,22,0.95)' : 'rgba(220,220,238,0.95)';
  const ibg = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const pbg = dk ? 'rgba(12,12,26,0.99)' : 'rgba(250,250,255,0.99)';

  return (
    <div className="flex h-full" style={{ background: bg, color: dk ? '#e2e8f0' : '#1e1e2e' }}>
      {/* ── Side Panel ── */}
      {sidePanel && (
        <div className="flex-shrink-0 w-64 flex flex-col border-r overflow-hidden" style={{ background: pbg, borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
              {sidePanel === 'bookmarks' ? '★ Bookmarks' : '⏱ History'}
            </span>
            <button onClick={() => setSidePanel(null)} className="opacity-40 hover:opacity-80 transition-opacity"><X size={13} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidePanel === 'bookmarks' ? (
              <>
                {bookmarks.length === 0 && <p className="text-xs opacity-30 p-4 text-center">No bookmarks yet</p>}
                {bookmarks.map(b => (
                  <div key={b.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer group transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onClick={() => navigate(b.url)}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = `${theme.accent}12`}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  >
                    <Globe size={11} className="opacity-30 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate font-medium">{b.title}</p>
                      <p className="text-[10px] opacity-30 truncate">{b.url}</p>
                    </div>
                    <button onClick={e => removeBookmark(b.id, e)} className="opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400 transition-all flex-shrink-0">
                      <X size={10}/>
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <>
                {history.length > 0 && (
                  <button onClick={() => { setHistory([]); saveJSON('wlos_history', []); }}
                    className="w-full text-[10px] py-1.5 px-3 text-left transition-colors hover:text-red-400"
                    style={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    Clear all history
                  </button>
                )}
                {history.length === 0 && <p className="text-xs opacity-30 p-4 text-center">No history</p>}
                {history.map(h => (
                  <div key={h.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onClick={() => navigate(h.url)}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = `${theme.accent}12`}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  >
                    <Globe size={11} className="opacity-30 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate font-medium">{h.title}</p>
                      <p className="text-[10px] opacity-30">{(() => { try { return new Date(h.visitedAt).toLocaleString(); } catch { return ''; } })()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Main Browser ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex items-center gap-0.5 px-1.5 pt-1 overflow-x-auto flex-shrink-0 no-scrollbar" style={{ background: tbg, minHeight: 34 }}>
          {tabs.map(tab => (
            <div key={tab.id}
              onClick={() => switchTab(tab.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-t-lg cursor-pointer flex-shrink-0 max-w-[180px] group transition-all"
              style={{
                minWidth: 80, maxWidth: 180,
                background: tab.id === activeId ? (dk ? 'rgba(255,255,255,0.09)' : '#fff') : 'transparent',
                borderBottom: tab.id === activeId ? `2px solid ${theme.accent}` : '2px solid transparent',
                opacity: tab.id === activeId ? 1 : 0.65,
              }}
            >
              {tab.isLoading ? <Loader2 size={10} className="animate-spin flex-shrink-0 opacity-50"/> : <Globe size={10} className="flex-shrink-0 opacity-40"/>}
              <span className="text-[11px] truncate flex-1">{tab.title}</span>
              <button onClick={e => closeTab(tab.id, e)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 transition-all flex-shrink-0">
                <X size={9}/>
              </button>
            </div>
          ))}
          <button onClick={() => newTab()} className="p-1 rounded hover:bg-white/10 flex-shrink-0 ml-0.5 transition-colors" title="New Tab">
            <Plus size={12}/>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: dk ? 'rgba(10,10,22,0.80)' : 'rgba(225,225,240,0.80)' }}>

          {/* Back / Forward / Reload */}
          <button onClick={goBack} disabled={!canBack}
            className="p-1.5 rounded transition-colors disabled:opacity-25"
            title="Back"
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          ><ArrowLeft size={13}/></button>
          <button onClick={goForward} disabled={!canForward}
            className="p-1.5 rounded transition-colors disabled:opacity-25"
            title="Forward"
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          ><ArrowRight size={13}/></button>
          <button onClick={reload} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Reload">
            {current.isLoading ? <Loader2 size={13} className="animate-spin"/> : <RefreshCw size={13}/>}
          </button>
          <button onClick={() => navigate(HOME_URL)} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Home">
            <Home size={13}/>
          </button>

          {/* Address bar */}
          <div className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-lg mx-1"
            style={{ background: ibg, border: `1px solid rgba(255,255,255,0.09)` }}>
            <div className="flex-shrink-0">
              {isHome ? <Globe size={10} className="opacity-30"/> : isSecure ? <Lock size={10} className="text-green-400"/> : <Globe size={10} className="opacity-30"/>}
            </div>
            <input
              ref={addrRef}
              value={addrInput}
              onChange={e => setAddrInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { navigate(addrInput); addrRef.current?.blur(); }
                if (e.key === 'Escape') { setAddrInput(current.url === HOME_URL ? '' : current.url); addrRef.current?.blur(); }
              }}
              onFocus={e => { e.target.select(); }}
              placeholder="Search or enter URL…"
              className="flex-1 bg-transparent outline-none text-xs font-mono"
              style={{ caretColor: theme.accent, color: dk ? '#e2e8f0' : '#1e1e2e', minWidth: 0 }}
            />
            {addrInput && (
              <button onClick={() => { setAddrInput(''); addrRef.current?.focus(); }} className="opacity-30 hover:opacity-70 flex-shrink-0 transition-opacity"><X size={10}/></button>
            )}
            <button onClick={() => { navigate(addrInput || current.url); }} className="flex-shrink-0 opacity-50 hover:opacity-90 transition-opacity" title="Go">
              <Search size={10}/>
            </button>
          </div>

          {/* Right: bookmark, panels, external */}
          <button onClick={toggleBookmark} className="p-1.5 rounded hover:bg-white/10 transition-colors" title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
            {isBookmarked
              ? <Star size={13} style={{ color: theme.accent, fill: theme.accent }}/>
              : <Star size={13} className="opacity-50"/>
            }
          </button>
          <button onClick={() => setSidePanel(sidePanel === 'bookmarks' ? null : 'bookmarks')}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ background: sidePanel === 'bookmarks' ? `${theme.accent}20` : '' }}
            title="Bookmarks">
            <Bookmark size={13} style={{ color: sidePanel === 'bookmarks' ? theme.accent : undefined }}/>
          </button>
          <button onClick={() => setSidePanel(sidePanel === 'history' ? null : 'history')}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ background: sidePanel === 'history' ? `${theme.accent}20` : '' }}
            title="History">
            <History size={13} style={{ color: sidePanel === 'history' ? theme.accent : undefined }}/>
          </button>
          {!isHome && (
            <button onClick={() => window.open(current.url, '_blank', 'noopener')} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Open in new tab">
              <ExternalLink size={13}/>
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 relative overflow-hidden">
          {isHome ? (
            // ── New Tab Page ──
            <div className="h-full overflow-y-auto flex flex-col items-center py-10 px-6 gap-7"
              style={{ background: dk ? 'linear-gradient(135deg,#0d0d1a,#1a0d2e 50%,#0d1a0d)' : 'linear-gradient(135deg,#f0f0f8,#e8e0f8 50%,#e8f8e8)' }}>
              <div className="text-center">
                <div className="text-4xl mb-2">🌐</div>
                <h1 className="text-lg font-bold opacity-80">WebLinuxOS Browser</h1>
                <p className="text-xs opacity-40 mt-1">Fast, lightweight, always available</p>
              </div>

              {/* Search bar */}
              <div className="w-full max-w-lg relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-35"/>
                <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && searchVal) navigate(searchVal); }}
                  placeholder="Search the web or enter URL…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    border: `1px solid ${theme.accent}35`,
                    caretColor: theme.accent, color: 'inherit',
                    boxShadow: `0 0 0 0px ${theme.accent}20`,
                    transition: 'box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${theme.accent}20`; }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Speed dial */}
              <div>
                <p className="text-[10px] opacity-30 uppercase tracking-widest text-center mb-3">Quick Access</p>
                <div className="grid grid-cols-4 gap-3">
                  {SPEED_DIAL.map(s => (
                    <button key={s.url} onClick={() => navigate(s.url)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-md"
                        style={{ background: s.color }}>
                        {s.letter}
                      </div>
                      <span className="text-[10px] opacity-50">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookmarks */}
              {bookmarks.length > 0 && (
                <div className="w-full max-w-lg">
                  <p className="text-[10px] opacity-30 uppercase tracking-widest mb-2">Bookmarks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bookmarks.map(b => (
                      <button key={b.id} onClick={() => navigate(b.url)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = `${theme.accent}18`}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'}
                      >
                        <Globe size={10} className="opacity-30"/>{b.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : current.hasError ? (
            // ── Error page ──
            <div className="h-full flex flex-col items-center justify-center gap-5 p-6" style={{ background: bg }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <AlertTriangle size={32} className="text-red-400"/>
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-base mb-1">Page Can't Be Loaded</h2>
                <p className="text-xs opacity-50 max-w-xs font-mono">{current.url}</p>
                <p className="text-xs opacity-35 mt-2 max-w-sm">This site may block external embedding or require direct browser access.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={reload} className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: theme.accent }}>
                  Retry
                </button>
                <button onClick={() => window.open(current.url, '_blank', 'noopener')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-opacity hover:opacity-70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  <ExternalLink size={11}/> Open Externally
                </button>
              </div>
            </div>
          ) : (
            // ── Iframe ──
            <>
              {current.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ background: bg }}>
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={28} className="animate-spin" style={{ color: theme.accent }}/>
                    <p className="text-xs opacity-40">{current.title}</p>
                  </div>
                </div>
              )}
              {isLikelyBlocked(current.url) && !current.isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-5 p-6" style={{ background: bg }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${theme.accent}18` }}>
                    <Wifi size={32} style={{ color: theme.accent }}/>
                  </div>
                  <div className="text-center">
                    <h2 className="font-semibold text-base mb-1">
                      {(() => { try { return new URL(current.url).hostname; } catch { return current.url; } })()}
                    </h2>
                    <p className="text-xs opacity-40 mt-1 max-w-xs">This site restricts embedding in external applications for security reasons.</p>
                  </div>
                  <button onClick={() => window.open(current.url, '_blank', 'noopener')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: theme.accent }}>
                    <ExternalLink size={14}/> Open in Browser Tab
                  </button>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={proxyUrl}
                  className="w-full h-full border-none"
                  title={current.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  onLoad={() => {
                    patchTab(activeId, { isLoading: false });
                    try { const doc = iframeRef.current?.contentDocument; if (doc?.title) patchTab(activeId, { title: doc.title }); } catch {}
                  }}
                  onError={() => patchTab(activeId, { isLoading: false, hasError: true })}
                  style={{ opacity: current.isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
                />
              )}
            </>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-0.5 flex-shrink-0"
          style={{ background: dk ? 'rgba(8,8,18,0.7)' : 'rgba(210,210,230,0.7)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-[10px] opacity-30 truncate max-w-xs font-mono">{isHome ? 'WebLinuxOS Browser — Ready' : current.url}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canBack    && <span className="text-[9px] opacity-20">← {current.backStack.length}</span>}
            {isSecure   && <span className="text-[10px] text-green-400 opacity-60 flex-shrink-0">🔒 Secure</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
