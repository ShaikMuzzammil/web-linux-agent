'use client';
import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Star, Clock } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { APP_REGISTRY } from '@/components/apps/registry';
import type { AppCategory } from '@/types';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

const CATEGORIES: AppCategory[] = ['System','Productivity','Internet','Media','Games','DevTools','Creative'];

const CAT_ICONS: Record<string, string> = {
  All: 'LayoutGrid', System: 'Settings', Productivity: 'Briefcase', Internet: 'Globe',
  Media: 'Music', Games: 'Gamepad2', DevTools: 'Code2', Creative: 'Palette',
};

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem('wlos_recent_apps') || '[]'); } catch { return []; }
}
function pushRecent(id: string) {
  const arr = [id, ...loadRecent().filter(x => x !== id)].slice(0, 8);
  localStorage.setItem('wlos_recent_apps', JSON.stringify(arr));
}

export default memo(function AppLauncher() {
  const { appLauncherOpen, theme, openWindow, setAppLauncher, dockItems, pinDockItem, unpinDockItem } = useOSStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<AppCategory | 'All' | 'Favorites'>('All');
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dk = theme.mode === 'dark';

  useEffect(() => {
    if (appLauncherOpen) {
      setQuery(''); setActiveCategory('All');
      setRecent(loadRecent());
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [appLauncherOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!appLauncherOpen) return;
      if (e.key === 'Escape') { setAppLauncher(false); return; }
      if (e.key === 'Enter') {
        const first = filtered[0];
        if (first) handleOpen(first.id);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [appLauncherOpen, setAppLauncher]);

  if (!appLauncherOpen) return null;

  const pinnedIds = dockItems.filter(d => d.isPinned).map(d => d.appId);

  const filtered = APP_REGISTRY.filter(a => {
    if (activeCategory === 'Favorites') return pinnedIds.includes(a.id);
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchQ   = !query
      || a.name.toLowerCase().includes(query.toLowerCase())
      || a.description.toLowerCase().includes(query.toLowerCase())
      || a.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const recentApps = recent.map(id => APP_REGISTRY.find(a => a.id === id)).filter(Boolean) as typeof APP_REGISTRY;
  const showRecent  = !query && activeCategory === 'All' && recentApps.length > 0;
  const frequentApps = APP_REGISTRY.filter(a => ['file-manager','terminal','browser','text-editor','settings'].includes(a.id));

  const handleOpen = (appId: string) => {
    openWindow(appId);
    pushRecent(appId);
    setAppLauncher(false);
  };

  const bg     = dk ? 'rgba(12,12,22,0.97)' : 'rgba(242,242,250,0.97)';
  const txtDim = dk ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)';
  const border = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[950]"
        style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.55)' }}
        onClick={() => setAppLauncher(false)} />

      {/* Panel */}
      <div className="fixed left-1/2 -translate-x-1/2 z-[960] flex"
        style={{
          top: 38,
          width: 'min(760px, 96vw)',
          maxHeight: 'calc(100vh - 96px)',
          background: bg,
          backdropFilter: 'blur(32px) saturate(200%)',
          border: `1px solid ${theme.accent}25`,
          borderRadius: 20,
          boxShadow: `0 24px 80px rgba(0,0,0,0.70), 0 0 0 1px ${theme.accent}15`,
          animation: 'popupIn 0.18s cubic-bezier(0.34,1.46,0.64,1)',
          overflow: 'hidden',
        }}>

        {/* Sidebar */}
        <div className="w-44 flex-shrink-0 flex flex-col py-3 px-2 border-r" style={{ borderColor: border }}>
          {(['All', 'Favorites', ...CATEGORIES] as (AppCategory | 'All' | 'Favorites')[]).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left mb-0.5"
              style={{
                background: activeCategory === cat ? `${theme.accent}18` : 'transparent',
                color: activeCategory === cat ? theme.accent : (dk ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'),
                border: activeCategory === cat ? `1px solid ${theme.accent}30` : '1px solid transparent',
              }}>
              <DynIcon name={CAT_ICONS[cat] || 'Box'} size={13} />
              {cat}
              <span className="ml-auto text-[9px] opacity-40">
                {cat === 'All' ? APP_REGISTRY.length
                 : cat === 'Favorites' ? pinnedIds.length
                 : APP_REGISTRY.filter(a => a.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b" style={{ borderColor: border }}>
            <Search size={15} style={{ color: txtDim, flexShrink: 0 }} />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search applications…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ caretColor: theme.accent, color: dk ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }} />
            {query && (
              <button onClick={() => setQuery('')} className="transition-opacity hover:opacity-80" style={{ color: txtDim }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'thin' }}>
            {/* Frequently used (only on All with no query) */}
            {!query && activeCategory === 'All' && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: txtDim }}>
                  Frequently Used
                </p>
                <div className="flex gap-2">
                  {frequentApps.map(app => (
                    <button key={app.id} onClick={() => handleOpen(app.id)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                      style={{ minWidth: 64, background: hoveredApp === app.id + '_freq' ? `${theme.accent}12` : 'rgba(255,255,255,0.04)', border: `1px solid ${border}` }}
                      onMouseEnter={() => setHoveredApp(app.id + '_freq')}
                      onMouseLeave={() => setHoveredApp(null)}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${theme.accent}20` }}>
                        <DynIcon name={app.icon} size={18} style={{ color: theme.accent }} />
                      </div>
                      <span className="text-[9px] text-center" style={{ color: dk ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent */}
            {showRecent && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1 flex items-center gap-1" style={{ color: txtDim }}>
                  <Clock size={9} /> Recent
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {recentApps.map(app => (
                    <button key={app.id} onClick={() => handleOpen(app.id)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`, color: dk ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}18`; e.currentTarget.style.color = theme.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = dk ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'; }}>
                      <DynIcon name={app.icon} size={11} />
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All apps label */}
            {(query || activeCategory !== 'All') && (
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: txtDim }}>
                {query ? `Results for "${query}"` : activeCategory} · {filtered.length}
              </p>
            )}
            {!query && activeCategory === 'All' && (
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: txtDim }}>
                All Applications · {APP_REGISTRY.length}
              </p>
            )}

            {/* App grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: txtDim }}>
                <Search size={28} className="opacity-40" />
                <p className="text-sm">No apps found for "{query}"</p>
              </div>
            ) : (
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
                {filtered.map(app => {
                  const isPinned = pinnedIds.includes(app.id);
                  const isHov    = hoveredApp === app.id;
                  return (
                    <div key={app.id} className="relative group/app">
                      <button onClick={() => handleOpen(app.id)}
                        className="w-full flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
                        style={{
                          background: isHov ? `${theme.accent}12` : 'transparent',
                          border: isHov ? `1px solid ${theme.accent}20` : '1px solid transparent',
                          transform: isHov ? 'scale(1.04)' : 'scale(1)',
                        }}
                        onMouseEnter={() => setHoveredApp(app.id)}
                        onMouseLeave={() => setHoveredApp(null)}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: isHov ? `${theme.accent}25` : `${theme.accent}15`,
                            border: `1px solid ${theme.accent}${isHov ? '40' : '15'}`,
                            boxShadow: isHov ? `0 4px 16px ${theme.accent}25` : 'none',
                          }}>
                          <DynIcon name={app.icon} size={22} style={{ color: theme.accent }} />
                        </div>
                        <p className="text-[10px] font-medium text-center leading-tight px-1"
                          style={{ color: isHov ? (dk ? '#fff' : '#000') : (dk ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.72)') }}>
                          {app.name}
                        </p>
                        <p className="text-[8px]" style={{ color: txtDim }}>{app.category}</p>
                      </button>
                      {/* Pin button on hover */}
                      {isHov && (
                        <button
                          onClick={e => { e.stopPropagation(); isPinned ? unpinDockItem(app.id) : pinDockItem(app.id); }}
                          className="absolute top-1 right-1 p-0.5 rounded"
                          style={{ background: `${theme.accent}20`, color: isPinned ? theme.accent : txtDim }}
                          title={isPinned ? 'Unpin from Dock' : 'Pin to Dock'}>
                          <Star size={9} fill={isPinned ? theme.accent : 'none'} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 border-t flex justify-between items-center" style={{ borderColor: border }}>
            <span className="text-[9px]" style={{ color: txtDim }}>{filtered.length} apps · {pinnedIds.length} pinned</span>
            <span className="text-[9px]" style={{ color: txtDim }}>↵ Open  ·  Esc Close</span>
          </div>
        </div>
      </div>
    </>
  );
});
