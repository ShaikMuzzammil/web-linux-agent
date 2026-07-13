'use client';
import { memo, useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { APP_REGISTRY } from '@/components/apps/registry';
import type { AppCategory } from '@/types';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

const CATEGORIES: AppCategory[] = ['System', 'Productivity', 'Internet', 'Media', 'Games', 'DevTools', 'Creative'];

export default memo(function AppLauncher() {
  const { appLauncherOpen, theme, openWindow, setAppLauncher } = useOSStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<AppCategory | 'All'>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appLauncherOpen) {
      setQuery(''); setActiveCategory('All');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [appLauncherOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAppLauncher(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setAppLauncher]);

  if (!appLauncherOpen) return null;

  const filtered = APP_REGISTRY.filter((a) => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchQ = !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const handleOpen = (appId: string) => {
    openWindow(appId);
    setAppLauncher(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[950]"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setAppLauncher(false)}
      />

      {/* Launcher panel */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[960] app-launcher flex flex-col"
        style={{
          top: 44,
          width: 'min(720px, 96vw)',
          maxHeight: 'calc(100vh - 100px)',
          background: 'rgba(15,15,28,0.95)',
          backdropFilter: 'blur(24px)',
          border: `1px solid ${theme.accent}30`,
          borderRadius: 20,
          boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,77,255,0.1)`,
        }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={16} className="text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
            style={{ caretColor: theme.accent }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={14} />
            </button>
          )}
          <button onClick={() => setAppLauncher(false)} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-3 pt-2 pb-1 flex-wrap">
          {(['All', ...CATEGORIES] as (AppCategory | 'All')[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat ? `${theme.accent}30` : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat ? theme.accent : 'rgba(255,255,255,0.5)',
                border: activeCategory === cat ? `1px solid ${theme.accent}40` : '1px solid transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* App grid */}
        <div className="overflow-y-auto flex-1 p-3" style={{ scrollbarWidth: 'thin' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/30">
              <Search size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No apps found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
              {filtered.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleOpen(app.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}15)`, border: `1px solid ${theme.accent}20` }}
                  >
                    <DynIcon name={app.icon} size={24} style={{ color: theme.accent }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-white/80 leading-tight">{app.name}</p>
                    <p className="text-[9px] text-white/35 mt-0.5">{app.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] text-white/30">{filtered.length} apps</span>
          <span className="text-[10px] text-white/30">Press Esc to close</span>
        </div>
      </div>
    </>
  );
});
