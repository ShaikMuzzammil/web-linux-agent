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
  const [dockSearch, setDockSearch]   = useState('');
  const [notifSound, setNotifSound]   = useState(true);
  const [notifBadges, setNotifBadges] = useState(true);
  const [notifPreview, setNotifPreview] = useState(true);
  const [copyTip, setCopyTip]         = useState('');
  const [linksUnlocked, setLinksUnlocked] = useState(false);
  const [unlocking, setUnlocking]         = useState(false);
  const [wpUrlInput, setWpUrlInput]       = useState('');
  const [wpPreviewUrl, setWpPreviewUrl]   = useState('');
  const [wpPreviewOk, setWpPreviewOk]     = useState<boolean|null>(null);
  const [wpUploading, setWpUploading]     = useState(false);

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
            <style>{`
              @keyframes wpFadeIn { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
              @keyframes wpCheck  { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
            `}</style>
            <div>
              <h2 className="text-sm font-bold">Wallpaper</h2>
              <p className="text-[11px] mt-0.5 opacity-40">Personalise your desktop background</p>
            </div>

            {/* ── Live current wallpaper preview ── */}
            <div className="relative w-full rounded-xl overflow-hidden"
              style={{ aspectRatio: '16/5', backgroundImage: `url(${theme.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `1px solid ${border}` }}>
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
              <div className="absolute inset-0 flex items-end p-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                  <span className="text-white text-[10px] font-medium">Active Wallpaper</span>
                </div>
              </div>
            </div>

            {/* ── Preset gallery ── */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40 mb-2">Preset Wallpapers</p>
              <div className="grid grid-cols-3 gap-2.5">
                {WALLPAPERS.map(w => {
                  const isActive = theme.wallpaper === w.path;
                  return (
                    <button key={w.path} onClick={() => saveWallpaper(w.path)}
                      className="relative flex flex-col items-center gap-1.5 group">
                      <div className="w-full rounded-xl overflow-hidden relative transition-all duration-200 group-hover:scale-[1.04]"
                        style={{
                          aspectRatio: '16/9',
                          border: isActive ? `2.5px solid ${accent}` : `1.5px solid ${border}`,
                          boxShadow: isActive ? `0 0 0 3px ${accent}28, 0 4px 16px rgba(0,0,0,0.3)` : '0 2px 6px rgba(0,0,0,0.2)',
                        }}>
                        <img src={w.path} alt={w.name} className="w-full h-full object-cover" loading="lazy"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; (e.currentTarget.parentElement as HTMLDivElement).style.background=w.preview; }} />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.18)' }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg" style={{ background: accent, animation: 'wpCheck 0.3s ease' }}>
                              <Check size={14} className="text-white" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: isActive ? accent : undefined, opacity: isActive ? 1 : 0.45 }}>{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── URL Input with live preview ── */}
            <Card className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-45 mb-3">Custom URL</p>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <input
                    value={wpUrlInput}
                    onChange={e => {
                      const val = e.target.value;
                      setWpUrlInput(val);
                      setWpPreviewOk(null);
                      if (val.trim()) {
                        setWpPreviewUrl(val.trim());
                      } else {
                        setWpPreviewUrl('');
                      }
                    }}
                    placeholder="https://example.com/wallpaper.jpg"
                    className="w-full px-3 py-2 rounded-lg text-[11px] outline-none pr-8"
                    style={{
                      background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      border: `1px solid ${wpPreviewOk === true ? '#22c55e' : wpPreviewOk === false ? '#ef4444' : border}`,
                      color: text, caretColor: accent, transition: 'border-color 0.2s',
                    }}
                    onKeyDown={e => { if (e.key === 'Enter' && wpUrlInput) { saveWallpaper(wpUrlInput); setWpUrlInput(''); setWpPreviewUrl(''); setWpPreviewOk(null); } }}
                  />
                  {wpPreviewOk === true && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-[10px]">✓</span>}
                  {wpPreviewOk === false && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 text-[10px]">✗</span>}
                </div>
                <button
                  onClick={() => { if (wpUrlInput) { saveWallpaper(wpUrlInput); setWpUrlInput(''); setWpPreviewUrl(''); setWpPreviewOk(null); } }}
                  className="px-4 py-2 rounded-lg text-[11px] font-bold text-white flex-shrink-0 hover:opacity-85 transition-opacity"
                  style={{ background: accent }}
                >Apply</button>
              </div>

              {/* Live URL preview */}
              {wpPreviewUrl && (
                <div className="rounded-xl overflow-hidden mt-2 relative" style={{ aspectRatio: '16/7', border: `1px solid ${border}`, animation: 'wpFadeIn 0.3s ease' }}>
                  <img
                    src={wpPreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onLoad={() => setWpPreviewOk(true)}
                    onError={() => { setWpPreviewOk(false); }}
                    style={{ display: 'block' }}
                  />
                  {wpPreviewOk === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: dk ? 'rgba(10,10,22,0.9)' : 'rgba(245,245,252,0.9)' }}>
                      <span className="text-xl">⚠️</span>
                      <p className="text-[10px] opacity-50">Could not load image from URL</p>
                    </div>
                  )}
                  {wpPreviewOk === true && (
                    <div className="absolute bottom-2 right-2">
                      <button
                        onClick={() => { saveWallpaper(wpUrlInput); setWpUrlInput(''); setWpPreviewUrl(''); setWpPreviewOk(null); }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white hover:opacity-85 transition-opacity"
                        style={{ background: accent, backdropFilter: 'blur(8px)' }}>
                        Set as Wallpaper ✓
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => { saveWallpaper('/wallpapers/default.svg'); setWpUrlInput(''); setWpPreviewUrl(''); setWpPreviewOk(null); }}
                className="mt-3 text-[10px] hover:opacity-70 transition-opacity" style={{ color: accent }}>
                ↩ Reset to Default
              </button>
            </Card>

            {/* ── File Upload ── */}
            <Card className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-45 mb-3">Upload from Device</p>
              <label
                className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-all"
                style={{
                  padding: '20px 16px',
                  border: `2px dashed ${accent}40`,
                  background: `${accent}06`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLLabelElement).style.background = `${accent}0e`; (e.currentTarget as HTMLLabelElement).style.borderColor = `${accent}70`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.background = `${accent}06`; (e.currentTarget as HTMLLabelElement).style.borderColor = `${accent}40`; }}
                onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLLabelElement).style.background = `${accent}18`; }}
                onDragLeave={e => { (e.currentTarget as HTMLLabelElement).style.background = `${accent}06`; }}
                onDrop={e => {
                  e.preventDefault();
                  (e.currentTarget as HTMLLabelElement).style.background = `${accent}06`;
                  const file = e.dataTransfer.files[0];
                  if (!file || !file.type.startsWith('image/')) return;
                  setWpUploading(true);
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const dataUrl = ev.target?.result as string;
                    saveWallpaper(dataUrl);
                    setWpUploading(false);
                  };
                  reader.readAsDataURL(file);
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setWpUploading(true);
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const dataUrl = ev.target?.result as string;
                      saveWallpaper(dataUrl);
                      setWpUploading(false);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
                {wpUploading ? (
                  <>
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
                    <p className="text-[11px] opacity-50">Applying wallpaper…</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${accent}18` }}>📁</div>
                    <div className="text-center">
                      <p className="text-xs font-semibold" style={{ color: accent }}>Click or drag &amp; drop</p>
                      <p className="text-[10px] opacity-40 mt-0.5">JPG, PNG, WebP, SVG, GIF supported</p>
                    </div>
                  </>
                )}
              </label>
              {theme.wallpaper?.startsWith('data:') && (
                <div className="flex items-center justify-between mt-3 px-3 py-2 rounded-lg" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
                  <span className="text-[10px] opacity-60 flex items-center gap-1.5">
                    <span className="text-green-400">✓</span> Custom image active
                  </span>
                  <button onClick={() => saveWallpaper('/wallpapers/default.svg')} className="text-[10px] hover:opacity-70 transition-opacity" style={{ color: accent }}>Remove</button>
                </div>
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
              onClick={() => {
                const btn = document.activeElement as HTMLButtonElement;
                if (btn) btn.textContent = '✓ WebLinuxOS v4.0 is up to date';
                setTimeout(() => { if (btn) btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;margin-right:6px"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>Check for Updates'; }, 2800);
              }}
            >
              <RefreshCw size={13} /> Check for Updates
            </button>
          </div>
        )}

        {/* ═══════════════ PIONEERED BY ═══════════════ */}
        {section === 'pioneer' && (
          <div className="relative overflow-hidden" style={{ minHeight: '100%' }}>
            <style>{`
              @keyframes pioneerBgPulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
              @keyframes pioneerAvatarPulse { 0%,100%{box-shadow:0 0 0 3px ${accent}30,0 0 0 6px ${accent}15,0 0 32px ${accent}40} 50%{box-shadow:0 0 0 4px ${accent}45,0 0 0 9px ${accent}20,0 0 48px ${accent}55} }
              @keyframes pioneerOrbitDot { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
              @keyframes decryptChar { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
              @keyframes unlockPulse { 0%,100%{box-shadow:0 0 0 0 ${accent}40} 50%{box-shadow:0 0 0 8px ${accent}00} }
              @keyframes scanLine { 0%{top:-20%} 100%{top:120%} }
            `}</style>
            {/* Animated BG */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: dk
                ? `radial-gradient(ellipse at 25% 40%, ${accent}18 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, ${accent}10 0%, transparent 55%)`
                : `radial-gradient(ellipse at 25% 40%, ${accent}12 0%, transparent 55%)`,
              animation: 'pioneerBgPulse 8s ease-in-out infinite',
            }} />
            {/* Subtle grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `linear-gradient(${dk ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), linear-gradient(90deg, ${dk ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />

            <div className="relative z-10 p-6 flex flex-col gap-5">
              {/* Header */}
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.5em] opacity-25 mb-4">PIONEERED BY</p>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl select-none"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}77)`,
                        animation: 'pioneerAvatarPulse 3s ease-in-out infinite',
                      }}>
                      SM
                    </div>
                    <div className="absolute w-3 h-3 rounded-full" style={{
                      background: accent, boxShadow: `0 0 10px ${accent}`,
                      top: '50%', left: '50%', marginTop: -6, marginLeft: -6,
                      animation: 'pioneerOrbitDot 3s linear infinite',
                      transformOrigin: '6px 6px',
                    }} />
                  </div>
                </div>
                <PioneerName accent={accent} />
                <p className="text-[10px] mt-2 tracking-[0.25em] uppercase" style={{ color: dk ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.35)' }}>
                  Full-Stack Engineer · Builder · AI Enthusiast
                </p>
                <p className="text-[10px] mt-1 opacity-25">📍 Chennai, India</p>
              </div>

              {/* Quote */}
              <div style={{
                padding: '10px 14px', borderLeft: `3px solid ${accent}`,
                background: `${accent}08`, fontStyle: 'italic',
                fontSize: 11, lineHeight: 1.65, opacity: 0.7, borderRadius: '0 8px 8px 0',
              }}>
                "Crafting digital experiences that blur the line between web&nbsp;&&nbsp;operating system — one pixel at a time."
              </div>

              {/* ── LOCKED LINK CARDS ──────────────────────────────── */}
              <div className="relative">
                {/* Cards (blurred when locked) */}
                <div className="grid grid-cols-2 gap-3" style={{
                  filter: linksUnlocked ? 'none' : 'blur(7px)',
                  pointerEvents: linksUnlocked ? 'auto' : 'none',
                  transition: 'filter 0.5s ease',
                  userSelect: linksUnlocked ? 'auto' : 'none',
                }}>
                  {/* Portfolio card */}
                  <a href="https://shaik-muzzammil-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl p-4 transition-all"
                    style={{ background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${accent}30`, textDecoration: 'none', color: 'inherit' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${accent}15`; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 20px ${accent}20`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🌐</div>
                    <p className="text-xs font-bold mb-0.5">Portfolio</p>
                    <p className="text-[10px] mb-3 font-mono" style={{ color: dk ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.35)' }}>shaik-muzzammil-portfolio</p>
                    <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: accent }}>Visit <ExternalLink size={9} /></div>
                  </a>
                  {/* Linktree card */}
                  <a href="https://linktr.ee/Shaik_Muzzammil" target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl p-4 transition-all"
                    style={{ background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: '1px solid rgba(57,211,83,0.28)', textDecoration: 'none', color: 'inherit' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(57,211,83,0.10)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 8px 20px rgba(57,211,83,0.15)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🌿</div>
                    <p className="text-xs font-bold mb-0.5">Linktree</p>
                    <p className="text-[10px] mb-3 font-mono" style={{ color: dk ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.35)' }}>@Shaik_Muzzammil</p>
                    <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#39d353' }}>Connect <ExternalLink size={9} /></div>
                  </a>
                </div>

                {/* Lock overlay — visible when locked */}
                {!linksUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl"
                    style={{ background: dk ? 'rgba(10,10,22,0.60)' : 'rgba(240,240,252,0.60)', backdropFilter: 'blur(2px)' }}>
                    <div className="text-2xl select-none">🔐</div>
                    <p className="text-[11px] font-semibold opacity-60">Links are encrypted</p>
                    <button
                      onClick={() => {
                        setUnlocking(true);
                        setTimeout(() => { setLinksUnlocked(true); setUnlocking(false); }, 1400);
                      }}
                      disabled={unlocking}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                        boxShadow: `0 4px 14px ${accent}40`,
                        animation: unlocking ? 'none' : 'unlockPulse 2s infinite',
                      }}
                    >
                      {unlocking ? (
                        <>
                          <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Decrypting…
                        </>
                      ) : (
                        <> 🔓 Unlock Profile</>
                      )}
                    </button>
                    {unlocking && (
                      <p className="text-[9px] font-mono opacity-40 animate-pulse">$ sudo reveal --profile nova</p>
                    )}
                  </div>
                )}

                {/* Re-lock button when unlocked */}
                {linksUnlocked && (
                  <button
                    onClick={() => setLinksUnlocked(false)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[9px] transition-opacity hover:opacity-80"
                    style={{ background: dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: dk ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                    title="Lock again"
                  >
                    🔒
                  </button>
                )}
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
                {[['54+','Built-in Apps'],['v4.0','Version'],['1','Developer']].map(([val, lbl], i) => (
                  <div key={lbl} className="py-3 text-center" style={{
                    background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderRight: i < 2 ? `1px solid ${border}` : 'none',
                  }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{val}</div>
                    <div className="text-[9px] opacity-30 uppercase tracking-wider mt-0.5">{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Footer — no email */}
              <div className="text-center text-[9px] opacity-20 leading-relaxed">
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
