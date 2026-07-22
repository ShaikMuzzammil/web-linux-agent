'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Palette, Monitor, Bell, User, Zap, Layout, Info, Sun, Moon,
  Check, LogOut, Globe, ExternalLink, Shield, Volume2, VolumeX,
  Trash2, BellOff, ChevronRight, Cpu, Database, Lock, RefreshCw,
  Download, Minus, Plus, ToggleLeft, ToggleRight, Smile
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { signOut } from 'next-auth/react';
import { APP_REGISTRY } from '@/components/apps/registry';

const ACCENT_COLORS = [
  { name: 'Ubuntu Orange', value: '#E95420' }, { name: 'Purple',  value: '#7C4DFF' },
  { name: 'Blue',          value: '#2196F3' }, { name: 'Cyan',    value: '#00BCD4' },
  { name: 'Green',         value: '#4CAF50' }, { name: 'Pink',    value: '#E91E63' },
  { name: 'Red',           value: '#F44336' }, { name: 'Yellow',  value: '#FFC107' },
];

const WALLPAPERS = [
  { name: 'Ubuntu Dark', path: '/wallpapers/ubuntu-dark.svg',  preview: 'linear-gradient(135deg,#1a0a05 0%,#080506 100%)' },
  { name: 'Default',     path: '/wallpapers/default.svg',      preview: 'linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 50%,#0d1a2e 100%)' },
  { name: 'Aurora',      path: '/wallpapers/aurora.svg',       preview: 'linear-gradient(135deg,#0a0a1a 0%,#0a3320 50%,#1a0a2e 100%)' },
  { name: 'Nebula',      path: '/wallpapers/nebula.svg',       preview: 'linear-gradient(135deg,#0d0520 0%,#000d30 50%,#100520 100%)' },
  { name: 'Cyberpunk',   path: '/wallpapers/cyberpunk.svg',    preview: 'linear-gradient(135deg,#0a0008 0%,#1a0520 50%,#2a0510 100%)' },
  { name: 'Mountain',    path: '/wallpapers/mountain.svg',     preview: 'linear-gradient(135deg,#0a0818 0%,#1a0e2e 50%,#2d1520 100%)' },
  { name: 'Ocean',       path: '/wallpapers/ocean.svg',        preview: 'linear-gradient(135deg,#020d18 0%,#041520 50%,#021018 100%)' },
];

type Section = 'appearance' | 'wallpaper' | 'dock' | 'notifications' | 'account' | 'about' | 'pioneer';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance',    label: 'Appearance',    icon: <Palette size={14} /> },
  { id: 'wallpaper',     label: 'Wallpaper',     icon: <Monitor size={14} /> },
  { id: 'dock',          label: 'Dock & Apps',   icon: <Layout size={14} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
  { id: 'account',       label: 'Account',       icon: <User size={14} /> },
  { id: 'about',         label: 'About',         icon: <Info size={14} /> },
  { id: 'pioneer',       label: 'Pioneered By',  icon: <Zap size={14} /> },
];

// ── Pioneer animated name ────────────────────────────────────────
const FULL_NAME = 'SHAIK MUZZAMMIL';

function PioneerName({ accent }: { accent: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, lineHeight: 1 }}>
      {FULL_NAME.split('').map((char, i) => (
        <span
          key={i}
          style={{
            fontSize: char === ' ' ? 8 : 30,
            fontWeight: 900,
            letterSpacing: 1,
            color: i < 5 ? accent : 'inherit',
            width: char === ' ' ? 14 : 'auto',
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
            transition: `opacity 0.35s ease ${i * 40}ms, transform 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────
function Toggle({ on, onToggle, accent }: { on: boolean; onToggle: () => void; accent: string }) {
  return (
    <button
      onClick={onToggle}
      className="relative rounded-full transition-all duration-200 flex-shrink-0"
      style={{ width: 38, height: 22, background: on ? accent : 'rgba(128,128,128,0.25)' }}
    >
      <div
        className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: on ? 18 : 2 }}
      />
    </button>
  );
}

// ── Row helper ────────────────────────────────────────────────────
function Row({ label, sub, right, border }: { label: string; sub?: string; right: React.ReactNode; border?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <div>
        <p className="text-xs font-medium">{label}</p>
        {sub && <p className="text-[10px] mt-0.5 opacity-45">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export default function Settings() {
  const {
    theme, setTheme, auth, logout, dockItems,
    pinDockItem, unpinDockItem, notifications, clearNotifications,
    doNotDisturb, setDoNotDisturb, notificationsEnabled, setNotificationsEnabled,
    openWindow,
  } = useOSStore();

  const dk = theme.mode === 'dark';
  const bg      = dk ? '#0d0d1a'             : '#f4f4fa';
  const text    = dk ? '#e2e8f0'             : '#1e1e2e';
  const cardBg  = dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const sidebarBg = dk ? 'rgba(10,10,20,0.80)'  : 'rgba(220,220,235,0.80)';
  const border  = dk ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)';
  const accent  = theme.accent;

  const [section, setSection]         = useState<Section>('appearance');
  const [fontSize, setFontSize]       = useState<'small'|'medium'|'large'>('medium');
  const [customUrl, setCustomUrl]     = useState('');
  const [dockSearch, setDockSearch]   = useState('');
  const [notifSound, setNotifSound]   = useState(true);
  const [notifBadges, setNotifBadges] = useState(true);
  const [notifPreview, setNotifPreview] = useState(true);
  const [copyTip, setCopyTip]         = useState('');

  const applyFontSize = useCallback((size: 'small'|'medium'|'large') => {
    const map = { small: '12px', medium: '13px', large: '15px' };
    document.documentElement.style.setProperty('--wlos-font-size', map[size]);
    setFontSize(size);
  }, []);

  const saveWallpaper = useCallback((path: string) => {
    setTheme({ wallpaper: path });
    try { localStorage.setItem('wlos_wallpaper', path); } catch {}
  }, [setTheme]);

  const handleSignOut = useCallback(async () => {
    if (!auth.isGuest) await signOut({ redirect: false });
    logout();
  }, [auth.isGuest, logout]);

  const copyEmail = () => {
    navigator.clipboard.writeText('muzzammil160806@gmail.com').catch(() => {});
    setCopyTip('Copied!');
    setTimeout(() => setCopyTip(''), 1800);
  };

  // filtered apps for dock section
  const filteredApps = APP_REGISTRY.filter(a =>
    a.name.toLowerCase().includes(dockSearch.toLowerCase()) ||
    a.category.toLowerCase().includes(dockSearch.toLowerCase())
  );

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-xl ${className}`} style={{ background: cardBg, border: `1px solid ${border}` }}>
      {children}
    </div>
  );

  const Divider = () => <div className="my-0.5" style={{ borderTop: `1px solid ${border}` }} />;

  return (
    <div className="flex h-full text-sm" style={{ background: bg, color: text }}>
      {/* ── Sidebar ── */}
      <div className="w-44 flex-shrink-0 flex flex-col border-r p-2" style={{ borderColor: border, background: sidebarBg }}>
        <p className="text-[10px] font-bold px-2 py-2 opacity-40 uppercase tracking-widest">System Settings</p>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[11px] font-medium transition-all"
            style={{
              background: section === s.id ? `${accent}20` : 'transparent',
              color:      section === s.id ? accent          : 'inherit',
            }}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
        {/* Shield footer */}
        <div className="mt-auto pt-3 px-2 pb-1">
          <div className="flex items-center gap-1.5 text-[9px] opacity-25">
            <Shield size={10} />
            <span>Secure session</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ═══════════════ APPEARANCE ═══════════════ */}
        {section === 'appearance' && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold">Appearance</h2>

            {/* Theme mode */}
            <Card className="p-4">
              <p className="text-[11px] font-semibold mb-3 opacity-55 uppercase tracking-wider">Theme Mode</p>
              <div className="flex gap-3">
                {[{ mode: 'dark', icon: <Moon size={18} />, label: 'Dark' }, { mode: 'light', icon: <Sun size={18} />, label: 'Light' }].map(m => (
                  <button
                    key={m.mode}
                    onClick={() => setTheme({ mode: m.mode as 'dark' | 'light' })}
                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                    style={{
                      background:   theme.mode === m.mode ? `${accent}18` : 'transparent',
                      borderColor:  theme.mode === m.mode ? accent : border,
                      color:        theme.mode === m.mode ? accent : 'inherit',
                    }}
                  >
                    {m.icon}
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Accent */}
            <Card className="p-4">
              <p className="text-[11px] font-semibold mb-3 opacity-55 uppercase tracking-wider">Accent Color</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setTheme({ accent: c.value })}
                    className="relative w-8 h-8 rounded-full transition-all"
                    style={{
                      background: c.value,
                      border:     accent === c.value ? '3px solid white' : '3px solid transparent',
                      boxShadow:  accent === c.value ? `0 0 0 2px ${c.value}` : 'none',
                      transform:  accent === c.value ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={c.name}
                  >
                    {accent === c.value && <Check size={13} className="absolute inset-0 m-auto text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] opacity-45">Custom:</span>
                <input
                  type="color"
                  value={accent}
                  onChange={e => setTheme({ accent: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                />
                <span className="text-[11px] font-mono opacity-45">{accent}</span>
              </div>
            </Card>

            {/* Font size */}
            <Card className="p-4">
              <p className="text-[11px] font-semibold mb-3 opacity-55 uppercase tracking-wider">Font Size</p>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => applyFontSize(s)}
                    className="flex-1 py-1.5 rounded-lg text-[11px] border transition-all capitalize"
                    style={{
                      background:  fontSize === s ? `${accent}20` : 'transparent',
                      borderColor: fontSize === s ? accent : border,
                      color:       fontSize === s ? accent : 'inherit',
                    }}
                  >
                    {s === 'small' ? 'Small' : s === 'medium' ? 'Medium' : 'Large'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-2 opacity-35">Affects text size across all windows</p>
            </Card>

            {/* Misc */}
            <Card>
              <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                <div className="p-3 px-4">
                  <Row
                    label="Window animations"
                    sub="Smooth open/close effects"
                    right={<Toggle on={theme.animations !== false} onToggle={() => setTheme({ animations: theme.animations === false })} accent={accent} />}
                  />
                </div>
                <div className="p-3 px-4">
                  <Row
                    label="Transparency"
                    sub="Blur & glass effects"
                    right={
                      <input
                        type="range" min={20} max={100} defaultValue={90}
                        className="w-24 h-1 cursor-pointer"
                        style={{ accentColor: accent }}
                      />
                    }
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════ WALLPAPER ═══════════════ */}
        {section === 'wallpaper' && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold">Wallpaper</h2>
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPERS.map(w => (
                <button
                  key={w.path}
                  onClick={() => saveWallpaper(w.path)}
                  className="relative flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-full rounded-xl overflow-hidden transition-all group-hover:scale-[1.02]"
                    style={{
                      aspectRatio: '16/9',
                      background: w.preview,
                      border: theme.wallpaper === w.path ? `2px solid ${accent}` : `2px solid ${border}`,
                      boxShadow: theme.wallpaper === w.path ? `0 0 0 2px ${accent}40` : 'none',
                    }}
                  >
                    {theme.wallpaper === w.path && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <Check size={13} style={{ color: accent }} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] opacity-55">{w.name}</span>
                </button>
              ))}
            </div>

            <Card className="p-4">
              <p className="text-[11px] font-semibold mb-2 opacity-55 uppercase tracking-wider">Custom URL</p>
              <div className="flex gap-2">
                <input
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/wallpaper.jpg"
                  className="flex-1 px-3 py-1.5 rounded-lg text-[11px] outline-none"
                  style={{
                    background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    border: `1px solid ${border}`,
                    color: text,
                    caretColor: accent,
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && customUrl) saveWallpaper(customUrl); }}
                />
                <button
                  onClick={() => { if (customUrl) saveWallpaper(customUrl); }}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ background: accent }}
                >
                  Set
                </button>
              </div>
              {customUrl && (
                <p className="text-[10px] mt-1.5 opacity-35">Press Set or Enter to apply</p>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════ DOCK ═══════════════ */}
        {section === 'dock' && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold">Dock & Apps</h2>

            <Card className="p-3">
              <p className="text-[11px] font-semibold mb-2 opacity-55 uppercase tracking-wider px-1">Pinned Apps ({dockItems.filter(d => d.isPinned).length})</p>
              <input
                value={dockSearch}
                onChange={e => setDockSearch(e.target.value)}
                placeholder="Search apps…"
                className="w-full px-3 py-1.5 rounded-lg text-[11px] outline-none mb-2"
                style={{ background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: `1px solid ${border}`, color: text }}
              />
              <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
                {filteredApps.map(app => {
                  const isPinned = dockItems.find(d => d.appId === app.id)?.isPinned ?? false;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px]" style={{ background: `${accent}18` }}>
                        <span style={{ color: accent }}>◆</span>
                      </div>
                      <span className="text-[11px] flex-1">{app.name}</span>
                      <span className="text-[9px] opacity-30 hidden sm:block">{app.category}</span>
                      <button
                        onClick={() => isPinned ? unpinDockItem(app.id) : pinDockItem(app.id)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium transition-all"
                        style={{
                          background: isPinned ? `${accent}25` : dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          color: isPinned ? accent : 'inherit',
                        }}
                      >
                        {isPinned ? '✓ Pinned' : '+ Pin'}
                      </button>
                    </div>
                  );
                })}
                {filteredApps.length === 0 && (
                  <p className="text-center text-[11px] opacity-30 py-4">No apps found</p>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <Row
                  label="Dock magnification"
                  sub="Scale icons on hover"
                  right={<Toggle on accent={accent} onToggle={() => {}} />}
                />
              </div>
              <div style={{ borderTop: `1px solid ${border}` }} className="p-4">
                <Row
                  label="Auto-hide Dock"
                  sub="Hide when windows overlap"
                  right={<Toggle on={false} accent={accent} onToggle={() => {}} />}
                />
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════ NOTIFICATIONS ═══════════════ */}
        {section === 'notifications' && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold">Notifications</h2>

            {/* Master toggle + DND */}
            <Card>
              <div className="p-4">
                <Row
                  label="Notifications"
                  sub="Show system notifications"
                  right={
                    <Toggle
                      on={notificationsEnabled}
                      onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
                      accent={accent}
                    />
                  }
                />
              </div>
              <div style={{ borderTop: `1px solid ${border}` }} className="p-4">
                <Row
                  label="Do Not Disturb"
                  sub="Silence all notifications"
                  right={
                    <Toggle
                      on={doNotDisturb}
                      onToggle={() => setDoNotDisturb(!doNotDisturb)}
                      accent={accent}
                    />
                  }
                />
              </div>
            </Card>

            {doNotDisturb && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-[11px]"
                style={{ background: `${accent}12`, border: `1px solid ${accent}30`, color: accent }}
              >
                <BellOff size={13} />
                Do Not Disturb is active — all notifications are silenced
              </div>
            )}

            {/* Notification preferences */}
            {notificationsEnabled && (
              <Card>
                <p className="text-[11px] font-semibold opacity-45 uppercase tracking-wider px-4 pt-3">Preferences</p>
                {[
                  { label: 'Notification sounds', sub: 'Play sound on notification', state: notifSound, set: setNotifSound },
                  { label: 'Show preview', sub: 'Display content in banners', state: notifPreview, set: setNotifPreview },
                  { label: 'Badge count', sub: 'Show unread count on bell icon', state: notifBadges, set: setNotifBadges },
                ].map((item, i) => (
                  <div key={item.label}>
                    {i > 0 && <div style={{ borderTop: `1px solid ${border}` }} />}
                    <div className="p-4">
                      <Row
                        label={item.label}
                        sub={item.sub}
                        right={<Toggle on={item.state} onToggle={() => item.set(v => !v)} accent={accent} />}
                      />
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Recent notifications with clear */}
            <div className="flex items-center justify-between mb-1 px-1">
              <p className="text-[11px] font-semibold opacity-55 uppercase tracking-wider">Recent ({notifications.length})</p>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-80"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={11} /> Clear all
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <Card className="p-6 flex flex-col items-center gap-2">
                <BellOff size={22} style={{ color: dk ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }} />
                <p className="text-[11px]" style={{ color: dk ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>No recent notifications</p>
              </Card>
            ) : (
              <Card>
                <div className="divide-y max-h-56 overflow-y-auto" style={{ '--tw-divide-color': border } as React.CSSProperties}>
                  {notifications.slice(0, 10).map(n => (
                    <div key={n.id} className="flex items-start gap-2.5 p-3">
                      <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: `${accent}20` }}>
                        <div className="w-full h-full rounded-md" style={{ opacity: 0.6 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium leading-snug">{n.title}</p>
                        <p className="text-[10px] opacity-40 truncate">{n.message}</p>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.isRead ? 'opacity-0' : ''}`} style={{ background: accent }} />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ═══════════════ ACCOUNT ═══════════════ */}
        {section === 'account' && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold">Account</h2>

            <Card className="p-4 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)` }}
              >
                {auth.userImage
                  ? <img src={auth.userImage} alt="" className="w-full h-full rounded-full object-cover" />
                  : <span>{auth.userName?.[0]?.toUpperCase() || 'G'}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{auth.isGuest ? 'Guest User' : auth.userName}</p>
                <p className="text-xs mt-0.5 opacity-40 truncate">{auth.userEmail || 'No email — cloud sync disabled'}</p>
                <p
                  className="text-xs mt-1.5"
                  style={{ color: auth.isAuthenticated && !auth.isGuest ? '#4ade80' : '#f59e0b' }}
                >
                  {auth.isAuthenticated && !auth.isGuest ? '✓ Synced to cloud' : '⚠ Local storage only'}
                </p>
              </div>
            </Card>

            {auth.isGuest && (
              <div className="p-4 rounded-xl" style={{ background: `${accent}12`, border: `1px solid ${accent}28` }}>
                <p className="text-xs font-semibold" style={{ color: accent }}>Sign in for cloud sync</p>
                <p className="text-[11px] opacity-55 mt-1">
                  Create an account to sync files, notes, tasks, and settings across all devices.
                </p>
              </div>
            )}

            <Card>
              {[
                { label: 'Privacy', sub: 'Manage data & permissions', icon: <Lock size={13} /> },
                { label: 'Security', sub: 'Password & 2FA', icon: <Shield size={13} /> },
                { label: 'Storage', sub: '21 GB / 50 GB used', icon: <Database size={13} /> },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <div style={{ borderTop: `1px solid ${border}` }} />}
                  <button
                    className="w-full flex items-center gap-3 p-3.5 text-left transition-colors"
                    style={{ color: text }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}15`, color: accent }}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] opacity-40">{item.sub}</p>
                    </div>
                    <ChevronRight size={13} className="opacity-30" />
                  </button>
                </div>
              ))}
            </Card>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 text-xs border transition-colors hover:bg-red-400/10"
              style={{ borderColor: 'rgba(248,113,113,0.2)' }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}

        {/* ═══════════════ ABOUT ═══════════════ */}
        {section === 'about' && (
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-bold">About WebLinuxOS</h2>

            <Card className="p-4 flex items-center gap-4"
              style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)`, border: `1px solid ${accent}28` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
                <span className="text-white font-black text-2xl">W</span>
              </div>
              <div>
                <div className="text-sm font-bold">WebLinuxOS</div>
                <div className="text-xs opacity-50 mt-0.5">Version 4.0.0 LTS</div>
                <div className="text-[10px] opacity-35 mt-1">A browser-based Ubuntu-style cloud desktop</div>
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-[11px] font-bold opacity-40 uppercase tracking-wider mb-3">System Information</p>
              <div className="space-y-2">
                {[
                  ['Build Stack',   'Next.js 14 · TypeScript · Tailwind CSS'],
                  ['Database',      'Neon PostgreSQL · Prisma ORM'],
                  ['Auth',          'NextAuth v4 (Email + OAuth)'],
                  ['AI Engine',     'NEXUS Intelligence System'],
                  ['Built-in Apps', '54 applications'],
                  ['Storage',       'Cloud sync + localStorage'],
                  ['Deployment',    'Vercel Edge Network'],
                  ['Processor',     'WebAssembly Virtual CPU'],
                  ['Memory',        '8 GB (Browser simulated)'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="opacity-40">{k}</span>
                    <span className="font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between text-[11px] mb-2">
                <span className="opacity-50">Storage Used</span>
                <span className="font-medium">21 GB / 50 GB</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '42%', background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
              </div>
            </Card>

            <button
              className="w-full py-2.5 rounded-xl text-[11px] font-semibold text-white transition-opacity hover:opacity-85 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              <RefreshCw size={13} /> Check for Updates
            </button>
          </div>
        )}

        {/* ═══════════════ PIONEERED BY ═══════════════ */}
        {section === 'pioneer' && (
          <div className="relative overflow-hidden" style={{ minHeight: '100%' }}>
            {/* Animated BG */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: dk
                  ? `radial-gradient(ellipse at 25% 40%, ${accent}1a 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, ${accent}12 0%, transparent 55%)`
                  : `radial-gradient(ellipse at 25% 40%, ${accent}14 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, ${accent}0e 0%, transparent 55%)`,
                animation: 'pioneerBgPulse 8s ease-in-out infinite',
              }}
            />
            {/* Grid lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(${dk ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)'} 1px, transparent 1px), linear-gradient(90deg, ${dk ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)'} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10 p-6 flex flex-col" style={{ minHeight: 540 }}>

              {/* Top label */}
              <div className="text-center mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 mb-5">
                  PIONEERED BY
                </p>

                {/* Animated avatar ring */}
                <div className="flex justify-center mb-5">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                        boxShadow: `0 0 0 3px ${accent}30, 0 0 0 6px ${accent}15, 0 0 32px ${accent}40`,
                        animation: 'pioneerAvatarPulse 3s ease-in-out infinite',
                      }}
                    >
                      SM
                    </div>
                    {/* Orbit dot */}
                    <div
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: accent,
                        top: -4, right: -4,
                        boxShadow: `0 0 8px ${accent}80`,
                        animation: 'pioneerOrbitDot 3s linear infinite',
                      }}
                    />
                  </div>
                </div>

                {/* Name reveal */}
                <PioneerName accent={accent} />

                <p className="text-[10px] mt-3 tracking-[0.3em] uppercase" style={{ color: dk ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.38)' }}>
                  Full-Stack Engineer · Builder · AI Enthusiast
                </p>
                <p className="text-[10px] mt-1.5 opacity-30">
                  📍 Chennai, India
                </p>
              </div>

              {/* Quote */}
              <div
                className="rounded-r-xl mb-5"
                style={{
                  padding: '10px 14px',
                  borderLeft: `3px solid ${accent}`,
                  background: `${accent}0a`,
                  fontStyle: 'italic',
                  fontSize: 11,
                  lineHeight: 1.65,
                  opacity: 0.75,
                }}
              >
                "Crafting digital experiences that blur the line between web&nbsp;&&nbsp;operating system — one pixel at a time."
              </div>

              {/* Link cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Portfolio */}
                <a
                  href="https://shaik-muzzammil-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-4 transition-all group/portfolio"
                  style={{
                    background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${accent}28`,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = `${accent}14`;
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = `0 8px 24px ${accent}20`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🌐</div>
                  <p className="text-xs font-bold mb-0.5">Portfolio</p>
                  <p className="text-[10px] mb-3" style={{ color: dk ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
                    shaik-muzzammil-portfolio
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: accent }}>
                    Visit <ExternalLink size={9} />
                  </div>
                </a>

                {/* Linktree */}
                <a
                  href="https://linktr.ee/Shaik_Muzzammil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-4 transition-all"
                  style={{
                    background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(57,211,83,0.25)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = 'rgba(57,211,83,0.10)';
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = '0 8px 24px rgba(57,211,83,0.15)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🌿</div>
                  <p className="text-xs font-bold mb-0.5">Linktree</p>
                  <p className="text-[10px] mb-3" style={{ color: dk ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
                    @Shaik_Muzzammil
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#39d353' }}>
                    Connect <ExternalLink size={9} />
                  </div>
                </a>
              </div>

              {/* Stats */}
              <div
                className="rounded-xl mb-4 grid grid-cols-3 gap-px overflow-hidden"
                style={{ border: `1px solid ${border}` }}
              >
                {[
                  { value: '54+', label: 'Built-in Apps' },
                  { value: 'v4.0', label: 'Version' },
                  { value: '1', label: 'Developer' },
                ].map(({ value, label }, i) => (
                  <div
                    key={label}
                    className="py-3 text-center"
                    style={{
                      background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      borderRight: i < 2 ? `1px solid ${border}` : 'none',
                    }}
                  >
                    <div className="text-lg font-black" style={{ color: accent }}>{value}</div>
                    <div className="text-[9px] opacity-35 uppercase tracking-wider mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Email (optional contact) */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3 mb-4 cursor-pointer transition-all hover:opacity-80"
                style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
                onClick={copyEmail}
                title="Click to copy"
              >
                <span className="text-[11px] opacity-60">muzzammil160806@gmail.com</span>
                <span className="text-[10px] font-semibold" style={{ color: accent }}>
                  {copyTip || 'Copy ↗'}
                </span>
              </div>

              {/* Footer */}
              <div className="mt-auto text-center text-[9px] opacity-20 leading-relaxed">
                WebLinuxOS · Built entirely from scratch<br />
                Next.js · TypeScript · Tailwind CSS · Neon · Vercel
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
