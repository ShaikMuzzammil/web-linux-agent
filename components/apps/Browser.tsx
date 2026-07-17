'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, RefreshCw, Home, Star, Plus, X, Globe, Lock,
  ExternalLink, Bookmark, BookmarkCheck, History, Search, AlertTriangle,
  ChevronDown, Loader2, Wifi
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

interface Tab { id: string; title: string; url: string; isLoading?: boolean; hasError?: boolean; favicon?: string }
interface BookmarkItem { id: string; title: string; url: string; folder?: string }
interface HistoryItem { id: string; title: string; url: string; visitedAt: number }

const HOME_URL = 'about:newtab';

const SPEED_DIAL = [
  { name: 'Google', url: 'https://www.google.com', color: '#4285F4', letter: 'G' },
  { name: 'GitHub', url: 'https://github.com', color: '#24292e', letter: 'GH' },
  { name: 'YouTube', url: 'https://youtube.com', color: '#FF0000', letter: 'YT' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', color: '#636466', letter: 'W' },
  { name: 'MDN', url: 'https://developer.mozilla.org', color: '#1f7a8c', letter: 'MDN' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', color: '#F48024', letter: 'SO' },
  { name: 'Vercel', url: 'https://vercel.com', color: '#000', letter: 'V' },
  { name: 'Neon', url: 'https://neon.tech', color: '#00e699', letter: 'N' },
];

const BLOCKED_SITES = ['google.com', 'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'];

function isLikelyBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return BLOCKED_SITES.some(s => host.includes(s));
  } catch { return false; }
}

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com' },
  { id: '2', title: 'GitHub', url: 'https://github.com' },
  { id: '3', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  { id: '4', title: 'Vercel', url: 'https://vercel.com' },
  { id: '5', title: 'Neon DB', url: 'https://neon.tech' },
  { id: '6', title: 'Next.js Docs', url: 'https://nextjs.org/docs' },
];

function loadBookmarks(): BookmarkItem[] {
  try { return JSON.parse(localStorage.getItem('wlos_browser_bookmarks') || '[]'); } catch { return DEFAULT_BOOKMARKS; }
}
function saveBookmarks(b: BookmarkItem[]) { localStorage.setItem('wlos_browser_bookmarks', JSON.stringify(b)); }
function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem('wlos_browser_history') || '[]'); } catch { return []; }
}
function saveHistory(h: HistoryItem[]) { localStorage.setItem('wlos_browser_history', JSON.stringify(h.slice(0, 100))); }

export default function Browser({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'New Tab', url: HOME_URL }]);
  const [activeTab, setActiveTab] = useState('1');
  const [addressInput, setAddressInput] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(loadBookmarks);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sidePanel, setSidePanel] = useState<'bookmarks' | 'history' | null>(null);
  const [newTabSearch, setNewTabSearch] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const current = tabs.find(t => t.id === activeTab) || tabs[0];
  const isNewTab = current.url === HOME_URL || current.url === '';
  const isSecure = current.url.startsWith('https://');
  const proxyUrl = isNewTab ? '' : `/api/proxy?url=${encodeURIComponent(current.url)}`;
  const isBookmarked = bookmarks.some(b => b.url === current.url);

  // Listen for navigation messages from proxied iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'BROWSER_NAVIGATE' && e.data.url) {
        navigate(e.data.url);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [activeTab]);

  const updateTab = (id: string, patch: Partial<Tab>) =>
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  const navigate = useCallback((input: string) => {
    let url = input.trim();
    if (!url || url === HOME_URL) {
      updateTab(activeTab, { url: HOME_URL, title: 'New Tab', hasError: false });
      setAddressInput('');
      return;
    }
    // If it looks like a search query (no dots or spaces), search Google
    if (!url.startsWith('http') && !url.includes('.') || url.includes(' ')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    } else if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    let title = '';
    try { title = new URL(url).hostname; } catch { title = url; }
    updateTab(activeTab, { url, title, isLoading: true, hasError: false });
    setAddressInput(url);

    // Add to history
    const h: HistoryItem = { id: Date.now().toString(), title, url, visitedAt: Date.now() };
    const updated = [h, ...history.filter(x => x.url !== url)];
    setHistory(updated);
    saveHistory(updated);
  }, [activeTab, history]);

  const newTab = (url = HOME_URL) => {
    const id = Math.random().toString(36).slice(2);
    setTabs(prev => [...prev, { id, title: url === HOME_URL ? 'New Tab' : new URL(url).hostname, url }]);
    setActiveTab(id);
    setAddressInput(url === HOME_URL ? '' : url);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) { newTab(); return; }
    const idx = tabs.findIndex(t => t.id === id);
    const next = tabs[idx === tabs.length - 1 ? idx - 1 : idx + 1];
    setTabs(prev => prev.filter(t => t.id !== id));
    setActiveTab(next.id);
    setAddressInput(next.url === HOME_URL ? '' : next.url);
  };

  const toggleBookmark = () => {
    if (isBookmarked) {
      const updated = bookmarks.filter(b => b.url !== current.url);
      setBookmarks(updated); saveBookmarks(updated);
    } else if (!isNewTab) {
      const updated = [...bookmarks, { id: Date.now().toString(), title: current.title, url: current.url }];
      setBookmarks(updated); saveBookmarks(updated);
    }
  };

  const handleIframeLoad = () => {
    updateTab(activeTab, { isLoading: false });
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.title) updateTab(activeTab, { title: doc.title });
    } catch {}
  };

  const handleIframeError = () => {
    updateTab(activeTab, { isLoading: false, hasError: true });
  };

  const openExternal = () => {
    if (!isNewTab) window.open(current.url, '_blank', 'noopener');
  };

  const dk = theme.mode === 'dark';
  const bg = dk ? '#0d0d1a' : '#f0f0f8';
  const tabBg = dk ? 'rgba(10,10,20,0.9)' : 'rgba(220,220,235,0.9)';
  const inputBg = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const panelBg = dk ? 'rgba(15,15,30,0.98)' : 'rgba(250,250,255,0.98)';

  return (
    <div className="flex h-full" style={{ background: bg, color: dk ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Side Panel */}
      {sidePanel && (
        <div className="flex-shrink-0 w-64 flex flex-col border-r overflow-hidden" style={{ background: panelBg, borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">{sidePanel === 'bookmarks' ? '★ Bookmarks' : '⏱ History'}</span>
            <button onClick={() => setSidePanel(null)} className="opacity-40 hover:opacity-80"><X size={13} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidePanel === 'bookmarks' && (
              <>
                {bookmarks.length === 0 && <p className="text-xs opacity-30 p-4">No bookmarks yet</p>}
                {bookmarks.map(b => (
                  <div key={b.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/05 cursor-pointer group" onClick={() => navigate(b.url)}>
                    <Globe size={11} className="opacity-30 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{b.title}</p>
                      <p className="text-[10px] opacity-30 truncate">{b.url}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); const u = bookmarks.filter(x => x.id !== b.id); setBookmarks(u); saveBookmarks(u); }} className="opacity-0 group-hover:opacity-40 hover:!opacity-80 hover:text-red-400">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </>
            )}
            {sidePanel === 'history' && (
              <>
                {history.length === 0 && <p className="text-xs opacity-30 p-4">No history</p>}
                <button onClick={() => { setHistory([]); saveHistory([]); }} className="w-full text-[10px] opacity-30 hover:opacity-60 py-1.5 px-3 text-left">Clear history</button>
                {history.map(h => (
                  <div key={h.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/05 cursor-pointer group" onClick={() => navigate(h.url)}>
                    <Globe size={11} className="opacity-30 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{h.title}</p>
                      <p className="text-[10px] opacity-30 truncate">{new Date(h.visitedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Browser */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex items-center gap-0.5 px-2 pt-1 overflow-x-auto flex-shrink-0" style={{ background: tabBg }}>
          {tabs.map(tab => (
            <div key={tab.id}
              onClick={() => { setActiveTab(tab.id); setAddressInput(tab.url === HOME_URL ? '' : tab.url); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer flex-shrink-0 max-w-[180px] group transition-all"
              style={{
                background: tab.id === activeTab ? (dk ? 'rgba(255,255,255,0.08)' : '#fff') : 'transparent',
                minWidth: 90, borderBottom: tab.id === activeTab ? `2px solid ${theme.accent}` : '2px solid transparent',
              }}
            >
              {tab.isLoading
                ? <Loader2 size={11} className="animate-spin flex-shrink-0 opacity-50" />
                : <Globe size={11} className="flex-shrink-0 opacity-40" />
              }
              <span className="text-xs truncate flex-1">{tab.title}</span>
              <button onClick={e => closeTab(tab.id, e)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 transition-all flex-shrink-0 ml-1">
                <X size={10} />
              </button>
            </div>
          ))}
          <button onClick={() => newTab()} className="p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0 ml-1" title="New Tab">
            <Plus size={13} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: dk ? 'rgba(10,10,20,0.7)' : 'rgba(225,225,240,0.7)' }}>
          {/* Nav buttons */}
          <button onClick={() => navigate(HOME_URL)} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Home"><Home size={13} /></button>
          <button onClick={() => { updateTab(activeTab, { isLoading: true }); iframeRef.current?.contentWindow?.location.reload?.(); setTimeout(() => updateTab(activeTab, { isLoading: false }), 2000); }} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Reload">
            {current.isLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          </button>

          {/* Address bar */}
          <div className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: inputBg, border: `1px solid rgba(255,255,255,0.08)` }}>
            {!isNewTab && (
              <div className="flex-shrink-0">
                {isSecure
                  ? <Lock size={10} className="text-green-400" />
                  : <Globe size={10} className="opacity-30" />
                }
              </div>
            )}
            <input
              ref={addressRef}
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') navigate(addressInput); if (e.key === 'Escape') { setAddressInput(current.url === HOME_URL ? '' : current.url); addressRef.current?.blur(); } }}
              onFocus={e => e.target.select()}
              placeholder="Search or enter URL…"
              className="flex-1 bg-transparent outline-none text-xs"
              style={{ caretColor: theme.accent, color: dk ? '#e2e8f0' : '#1e1e2e' }}
            />
            {addressInput && (
              <button onClick={() => { setAddressInput(''); addressRef.current?.focus(); }} className="opacity-30 hover:opacity-70 flex-shrink-0">
                <X size={10} />
              </button>
            )}
          </div>

          {/* Right toolbar */}
          <button onClick={toggleBookmark} className="p-1.5 rounded hover:bg-white/10 transition-colors" title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
            {isBookmarked
              ? <Star size={13} style={{ color: theme.accent, fill: theme.accent }} />
              : <Star size={13} className="opacity-40" />
            }
          </button>
          <button onClick={() => setSidePanel(sidePanel === 'bookmarks' ? null : 'bookmarks')} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Bookmarks"
            style={{ background: sidePanel === 'bookmarks' ? `${theme.accent}20` : '' }}>
            <Bookmark size={13} style={{ color: sidePanel === 'bookmarks' ? theme.accent : undefined }} />
          </button>
          <button onClick={() => setSidePanel(sidePanel === 'history' ? null : 'history')} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="History"
            style={{ background: sidePanel === 'history' ? `${theme.accent}20` : '' }}>
            <History size={13} style={{ color: sidePanel === 'history' ? theme.accent : undefined }} />
          </button>
          {!isNewTab && (
            <button onClick={openExternal} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Open in new browser tab">
              <ExternalLink size={13} />
            </button>
          )}
        </div>

        {/* Bookmarks bar */}
        {showBookmarks && bookmarks.length > 0 && (
          <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto flex-shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            {bookmarks.slice(0, 8).map(b => (
              <button key={b.id} onClick={() => navigate(b.url)} className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:bg-white/08 flex-shrink-0 transition-colors whitespace-nowrap">
                <Globe size={10} className="opacity-30" />{b.title}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {isNewTab ? (
            // New Tab Page
            <div className="h-full overflow-y-auto flex flex-col items-center py-12 px-6 gap-8"
              style={{ background: `linear-gradient(135deg, ${dk ? '#0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%' : '#f0f0f8 0%, #e8e0f8 50%, #e8f8e8 100%'})` }}>
              {/* Title */}
              <div className="text-center">
                <div className="text-4xl mb-2">🌐</div>
                <h1 className="text-xl font-bold opacity-80">New Tab</h1>
                <p className="text-xs opacity-40 mt-1">WebLinuxOS Browser</p>
              </div>

              {/* Search */}
              <div className="w-full max-w-md relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  value={newTabSearch}
                  onChange={e => setNewTabSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newTabSearch) navigate(newTabSearch); }}
                  placeholder="Search the web…"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    border: `1px solid ${theme.accent}30`,
                    caretColor: theme.accent,
                    color: 'inherit',
                    boxShadow: `0 0 0 0px ${theme.accent}20`,
                  }}
                  onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${theme.accent}20`; }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Speed dial */}
              <div>
                <p className="text-[11px] opacity-30 uppercase tracking-widest text-center mb-3">Quick Access</p>
                <div className="grid grid-cols-4 gap-3">
                  {SPEED_DIAL.map(s => (
                    <button key={s.url} onClick={() => navigate(s.url)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105 active:scale-95 group"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: s.color }}>
                        {s.letter}
                      </div>
                      <span className="text-[10px] opacity-50 group-hover:opacity-80 transition-opacity">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookmarks */}
              {bookmarks.length > 0 && (
                <div className="w-full max-w-md">
                  <p className="text-[11px] opacity-30 uppercase tracking-widest mb-2">Bookmarks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bookmarks.map(b => (
                      <button key={b.id} onClick={() => navigate(b.url)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs hover:bg-white/10 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <Globe size={10} className="opacity-30" />{b.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : current.hasError ? (
            // Error state
            <div className="h-full flex flex-col items-center justify-center gap-5 p-6" style={{ background: bg }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,100,100,0.1)' }}>
                <AlertTriangle size={32} className="text-red-400" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-base mb-1">Can't Load Page</h2>
                <p className="text-xs opacity-50 max-w-xs">{current.url}</p>
                <p className="text-xs opacity-40 mt-2 max-w-sm">This site may block embedding or require direct access.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { updateTab(activeTab, { hasError: false, isLoading: true }); }} className="px-4 py-2 rounded-xl text-xs font-medium text-white" style={{ background: theme.accent }}>
                  Retry
                </button>
                <button onClick={openExternal} className="px-4 py-2 rounded-xl text-xs font-medium border" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  <ExternalLink size={12} className="inline mr-1.5" />Open Externally
                </button>
              </div>
            </div>
          ) : (
            // Iframe content
            <>
              {current.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ background: bg }}>
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={28} className="animate-spin" style={{ color: theme.accent }} />
                    <p className="text-xs opacity-40">{current.title}</p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={proxyUrl}
                className="w-full h-full border-none"
                title={current.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ opacity: current.isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
              />
              {/* Overlay for known-blocked sites */}
              {isLikelyBlocked(current.url) && !current.isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 z-5" style={{ background: bg }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(233,84,32,0.1)' }}>
                    <Wifi size={32} style={{ color: theme.accent }} />
                  </div>
                  <div className="text-center">
                    <h2 className="font-semibold text-base mb-1">{new URL(current.url).hostname}</h2>
                    <p className="text-xs opacity-40 mt-1 max-w-xs">
                      This site restricts embedding in external applications for security reasons.
                    </p>
                  </div>
                  <button onClick={openExternal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: theme.accent }}>
                    <ExternalLink size={14} /> Open in New Tab
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-0.5 flex-shrink-0" style={{ background: dk ? 'rgba(10,10,20,0.6)' : 'rgba(220,220,235,0.6)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-[10px] opacity-30 truncate max-w-xs">{isNewTab ? 'WebLinuxOS Browser' : current.url}</span>
          <span className="text-[10px] opacity-20 flex-shrink-0 ml-2">{isSecure ? '🔒 Secure' : ''}</span>
        </div>
      </div>
    </div>
  );
}
