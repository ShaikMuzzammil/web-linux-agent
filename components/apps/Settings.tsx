'use client';
import { useState, useCallback } from 'react';
import { Palette, Monitor, Bell, User, Zap, Layout, Shield, Info, Sun, Moon, Check, LogOut, ChevronRight } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { signOut } from 'next-auth/react';
import { APP_REGISTRY } from '@/components/apps/registry';

const ACCENT_COLORS = [
  { name: 'Purple', value: '#7C4DFF' }, { name: 'Blue', value: '#2196F3' },
  { name: 'Cyan', value: '#00BCD4' }, { name: 'Green', value: '#4CAF50' },
  { name: 'Orange', value: '#FF6D00' }, { name: 'Pink', value: '#E91E63' },
  { name: 'Red', value: '#F44336' }, { name: 'Yellow', value: '#FFC107' },
];

const WALLPAPERS = [
  { name: 'Default', path: '/wallpapers/default.svg', preview: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a2e 100%)' },
  { name: 'Aurora', path: '/wallpapers/aurora.jpg', preview: 'linear-gradient(135deg, #001a33 0%, #004d00 50%, #330033 100%)' },
  { name: 'Sunset', path: '/wallpapers/sunset.jpg', preview: 'linear-gradient(135deg, #1a0a00 0%, #4d1a00 50%, #660033 100%)' },
  { name: 'Ocean', path: '/wallpapers/ocean.jpg', preview: 'linear-gradient(135deg, #001a4d 0%, #003366 50%, #001a33 100%)' },
  { name: 'Forest', path: '/wallpapers/forest.jpg', preview: 'linear-gradient(135deg, #001a00 0%, #003300 50%, #001400 100%)' },
  { name: 'Space', path: '/wallpapers/space.jpg', preview: 'linear-gradient(135deg, #000000 0%, #0d001a 50%, #000d1a 100%)' },
];

type Section = 'appearance' | 'wallpaper' | 'dock' | 'notifications' | 'account' | 'about';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
  { id: 'wallpaper', label: 'Wallpaper', icon: <Monitor size={15} /> },
  { id: 'dock', label: 'Dock & Apps', icon: <Layout size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
  { id: 'account', label: 'Account', icon: <User size={15} /> },
  { id: 'about', label: 'About', icon: <Info size={15} /> },
];

export default function Settings({ windowId }: { windowId: string }) {
  const { theme, setTheme, toggleTheme, auth, dockItems, pinDockItem, unpinDockItem, logout } = useOSStore();
  const [section, setSection] = useState<Section>('appearance');

  const handleSignOut = useCallback(async () => {
    if (!auth.isGuest) await signOut({ redirect: false });
    logout();
  }, [auth.isGuest, logout]);

  const bg = theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb';
  const text = theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e';
  const cardBg = theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const border = theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="flex h-full text-sm" style={{ background: bg, color: text }}>
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0 flex flex-col border-r p-2" style={{ borderColor: border, background: theme.mode === 'dark' ? 'rgba(10,10,20,0.8)' : 'rgba(230,230,240,0.8)' }}>
        <p className="text-xs font-bold px-2 py-2 opacity-50 uppercase tracking-wider">System Settings</p>
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all"
            style={{
              background: section === s.id ? `${theme.accent}25` : 'transparent',
              color: section === s.id ? theme.accent : 'inherit',
            }}
          >
            {s.icon}{s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* ── Appearance ── */}
        {section === 'appearance' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold">Appearance</h2>

            {/* Theme mode */}
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold mb-3 opacity-70">Theme Mode</p>
              <div className="flex gap-3">
                {[{ mode: 'dark', icon: <Moon size={18} />, label: 'Dark' }, { mode: 'light', icon: <Sun size={18} />, label: 'Light' }].map((m) => (
                  <button key={m.mode} onClick={() => setTheme({ mode: m.mode as 'dark' | 'light' })}
                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                    style={{ background: theme.mode === m.mode ? `${theme.accent}20` : 'transparent', borderColor: theme.mode === m.mode ? theme.accent : border, color: theme.mode === m.mode ? theme.accent : 'inherit' }}>
                    {m.icon}<span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold mb-3 opacity-70">Accent Color</p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button key={c.value} onClick={() => setTheme({ accent: c.value })}
                    className="relative w-8 h-8 rounded-full transition-all"
                    style={{ background: c.value, border: theme.accent === c.value ? '2px solid white' : '2px solid transparent', transform: theme.accent === c.value ? 'scale(1.15)' : 'scale(1)' }}
                    title={c.name}
                  >
                    {theme.accent === c.value && <Check size={14} className="absolute inset-0 m-auto text-white" />}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs opacity-50">Custom:</span>
                <input type="color" value={theme.accent} onChange={(e) => setTheme({ accent: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-none" style={{ background: 'transparent' }} />
                <span className="text-xs font-mono opacity-50">{theme.accent}</span>
              </div>
            </div>

            {/* Font size */}
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold mb-3 opacity-70">Font Size</p>
              <div className="flex gap-2">
                {['Small', 'Medium', 'Large'].map((s) => (
                  <button key={s} className="flex-1 py-1.5 rounded-lg text-xs border transition-all"
                    style={{ background: s === 'Medium' ? `${theme.accent}20` : 'transparent', borderColor: s === 'Medium' ? theme.accent : border }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Wallpaper ── */}
        {section === 'wallpaper' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold">Wallpaper</h2>
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPERS.map((w) => (
                <button key={w.path} onClick={() => setTheme({ wallpaper: w.path })}
                  className="relative flex flex-col items-center gap-2 group">
                  <div className="w-full aspect-video rounded-xl overflow-hidden transition-all"
                    style={{ background: w.preview, border: theme.wallpaper === w.path ? `2px solid ${theme.accent}` : '2px solid transparent' }}>
                    {theme.wallpaper === w.path && <div className="absolute inset-0 flex items-center justify-center"><Check size={20} className="text-white drop-shadow-lg" /></div>}
                  </div>
                  <span className="text-xs opacity-60">{w.name}</span>
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold mb-2 opacity-70">Custom URL</p>
              <div className="flex gap-2">
                <input placeholder="https://example.com/wallpaper.jpg" className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`, caretColor: theme.accent }} onKeyDown={(e) => { if (e.key === 'Enter') setTheme({ wallpaper: (e.target as HTMLInputElement).value }); }} />
                <button className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ background: theme.accent }}>Set</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Dock ── */}
        {section === 'dock' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold">Dock & Apps</h2>
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold mb-3 opacity-70">Pinned Apps</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {APP_REGISTRY.map((app) => {
                  const isPinned = dockItems.find((d) => d.appId === app.id)?.isPinned;
                  return (
                    <div key={app.id} className="flex items-center gap-3 p-2 rounded-lg"
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <span className="text-xs flex-1">{app.name}</span>
                      <span className="text-[10px] opacity-40">{app.category}</span>
                      <button onClick={() => isPinned ? unpinDockItem(app.id) : pinDockItem(app.id)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium transition-all"
                        style={{ background: isPinned ? `${theme.accent}30` : 'rgba(255,255,255,0.06)', color: isPinned ? theme.accent : 'inherit' }}>
                        {isPinned ? 'Pinned' : 'Pin'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Account ── */}
        {section === 'account' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold">Account</h2>
            <div className="p-5 rounded-xl flex items-center gap-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)` }}>
                {auth.userImage ? <img src={auth.userImage} alt="" className="w-full h-full rounded-full" /> : auth.userName[0]?.toUpperCase() || 'G'}
              </div>
              <div>
                <p className="font-semibold">{auth.isGuest ? 'Guest User' : auth.userName}</p>
                <p className="text-xs opacity-50">{auth.userEmail || 'No email — cloud sync disabled'}</p>
                <p className="text-xs mt-1" style={{ color: auth.isAuthenticated && !auth.isGuest ? '#4ade80' : '#f59e0b' }}>
                  {auth.isAuthenticated && !auth.isGuest ? '✓ Synced to cloud' : '⚠ Local storage only'}
                </p>
              </div>
            </div>

            {auth.isGuest && (
              <div className="p-4 rounded-xl border" style={{ background: `${theme.accent}10`, borderColor: `${theme.accent}30` }}>
                <p className="text-sm font-semibold" style={{ color: theme.accent }}>Sign in for cloud sync</p>
                <p className="text-xs opacity-60 mt-1">Create an account to sync all your files, notes, tasks, and settings across all devices.</p>
              </div>
            )}

            <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors text-sm">
              <LogOut size={14} />Sign Out
            </button>
          </div>
        )}

        {/* ── About ── */}
        {section === 'about' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold">About WebLinuxOS</h2>
            <div className="p-5 rounded-xl space-y-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
              {[['Version', 'WebLinuxOS 2.0.0'], ['Build', 'Next.js 14 + Neon DB'], ['Apps', '54 built-in apps'], ['Auth', 'NextAuth v4 (Email, GitHub, Google)'], ['Storage', 'Neon PostgreSQL + Local fallback'], ['Theme', 'Catppuccin-inspired dark/light'], ['Developer', 'WebLinuxOS Team']].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="opacity-50">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
