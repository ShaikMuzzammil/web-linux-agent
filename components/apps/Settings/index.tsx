'use client';
import { useState, useCallback, useEffect } from 'react';
import {
  Bluetooth, Image, Palette, Bell, Volume2, Zap, Monitor,
  Mouse, Keyboard, Printer, HardDrive, Clock, Users, Star,
  Shield, Info, Sun, Moon, Check, LogOut, ChevronRight,
  Wifi, RefreshCw, Download, BatteryCharging, Lock, Eye, EyeOff,
  Globe, Layout, User, Laptop, Database, Chrome, Search,
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { signOut } from 'next-auth/react';
import { APP_REGISTRY } from '@/components/apps/registry';

const ACCENT_COLORS = [
  { name: 'Ubuntu Orange', value: '#E95420' },
  { name: 'Purple', value: '#7C4DFF' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Cyan', value: '#00BCD4' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Red', value: '#F44336' },
  { name: 'Amber', value: '#FFC107' },
  { name: 'Teal', value: '#009688' },
];

const WALLPAPERS = [
  { name: 'Ubuntu Dark', path: '/wallpapers/ubuntu-dark.svg', preview: 'linear-gradient(135deg,#1a0a05,#080506)' },
  { name: 'Default', path: '/wallpapers/default.svg', preview: 'linear-gradient(135deg,#0d0d1a,#1a0a2e 50%,#0d1a2e)' },
  { name: 'Aurora', path: '/wallpapers/aurora.svg', preview: 'linear-gradient(135deg,#0a0a1a,#0a3320 50%,#1a0a2e)' },
  { name: 'Nebula', path: '/wallpapers/nebula.svg', preview: 'linear-gradient(135deg,#0d0520,#000d30 50%,#100520)' },
  { name: 'Cyberpunk', path: '/wallpapers/cyberpunk.svg', preview: 'linear-gradient(135deg,#0a0008,#1a0520 50%,#2a0510)' },
  { name: 'Mountain', path: '/wallpapers/mountain.svg', preview: 'linear-gradient(135deg,#0a0818,#1a0e2e 50%,#2d1520)' },
  { name: 'Ocean', path: '/wallpapers/ocean.svg', preview: 'linear-gradient(135deg,#020d18,#041520 50%,#021018)' },
];

function Toggle({ on, onChange, accent }: { on: boolean; onChange: () => void; accent?: string }) {
  return (
    <button onClick={onChange}
      className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ background: on ? (accent || '#7C4DFF') : 'rgba(255,255,255,0.15)' }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: on ? '22px' : '2px' }} />
    </button>
  );
}

type Section =
  'bluetooth' | 'background' | 'appearance' | 'notifications' | 'sound' |
  'power' | 'display' | 'mouse' | 'keyboard' | 'printers' | 'removable' |
  'datetime' | 'users' | 'defaultapps' | 'privacy' | 'about';

const NAV: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'bluetooth',    label: 'Bluetooth',        Icon: Bluetooth },
  { id: 'background',   label: 'Background',       Icon: Image },
  { id: 'appearance',   label: 'Appearance',       Icon: Palette },
  { id: 'notifications',label: 'Notifications',    Icon: Bell },
  { id: 'sound',        label: 'Sound',            Icon: Volume2 },
  { id: 'power',        label: 'Power',            Icon: Zap },
  { id: 'display',      label: 'Display',          Icon: Monitor },
  { id: 'mouse',        label: 'Mouse & Touchpad', Icon: Mouse },
  { id: 'keyboard',     label: 'Keyboard',         Icon: Keyboard },
  { id: 'printers',     label: 'Printers',         Icon: Printer },
  { id: 'removable',    label: 'Removable Media',  Icon: HardDrive },
  { id: 'datetime',     label: 'Date & Time',      Icon: Clock },
  { id: 'users',        label: 'Users',            Icon: Users },
  { id: 'defaultapps',  label: 'Default Apps',     Icon: Star },
  { id: 'privacy',      label: 'Privacy',          Icon: Shield },
  { id: 'about',        label: 'About',            Icon: Info },
];

export default function Settings({ windowId }: { windowId?: string }) {
  const { theme, setTheme, toggleTheme, auth, dockItems, pinDockItem, unpinDockItem, logout } = useOSStore();
  const [section, setSection] = useState<Section>('appearance');
  const [search, setSearch] = useState('');
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(80);
  const [btOn, setBtOn] = useState(false);
  const [notifOn, setNotifOn] = useState(true);
  const [screenLock, setScreenLock] = useState(true);
  const [usageData, setUsageData] = useState(false);
  const [locationOn, setLocationOn] = useState(false);
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<null | 'uptodate' | 'found'>(null);
  const [mouseSpeed, setMouseSpeed] = useState(50);
  const [scrollDir, setScrollDir] = useState<'natural' | 'traditional'>('natural');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  const dk = theme.mode === 'dark';
  const bg = dk ? '#0b0b18' : '#f4f4fb';
  const text = dk ? '#e2e8f0' : '#1e1e2e';
  const cardBg = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const border = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const rowHover = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const accent = theme.accent;

  const handleSignOut = useCallback(async () => {
    if (!auth.isGuest) await signOut({ redirect: false });
    logout();
  }, [auth.isGuest, logout]);

  const checkUpdate = () => {
    setChecking(true);
    setTimeout(() => { setChecking(false); setUpdateStatus('uptodate'); }, 2200);
  };

  const filteredNav = NAV.filter(n =>
    !search || n.label.toLowerCase().includes(search.toLowerCase())
  );

  const Row = ({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b"
      style={{ borderColor: border }}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs opacity-40 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="flex h-full" style={{ background: bg, color: text }}>
      {/* ── Sidebar ─────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: border, background: dk ? 'rgba(8,8,18,0.85)' : 'rgba(225,225,238,0.85)' }}>
        <div className="px-3 pt-3 pb-2">
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2 px-1">System Settings</p>
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search settings…"
              className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[11px] outline-none"
              style={{ background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', caretColor: accent }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {filteredNav.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium transition-all"
              style={{
                background: section === n.id ? `${accent}22` : 'transparent',
                color: section === n.id ? accent : 'inherit',
              }}>
              <n.Icon size={14} style={{ opacity: section === n.id ? 1 : 0.5 }} />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* BLUETOOTH */}
        {section === 'bluetooth' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Bluetooth</h2>
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold">Bluetooth</span>
                <Toggle on={btOn} onChange={() => setBtOn(v => !v)} accent="#3b82f6" />
              </div>
            </div>
            {btOn && (
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
                <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest opacity-40"
                  style={{ background: cardBg }}>Devices</div>
                {[
                  { name: 'MacBook Pro', type: 'Computer', bat: '72%', connected: true },
                  { name: 'AirPods Pro', type: 'Audio', bat: '88%', connected: false },
                  { name: 'Magic Mouse', type: 'Mouse', bat: '45%', connected: false },
                  { name: 'Xbox Controller', type: 'Gamepad', bat: '—', connected: false },
                ].map(d => (
                  <div key={d.name}
                    className="flex items-center justify-between px-4 py-3 border-t cursor-pointer transition-colors"
                    style={{ borderColor: border }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = rowHover; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full"
                        style={{ background: d.connected ? '#4ade80' : 'rgba(255,255,255,0.15)' }} />
                      <div>
                        <p className="text-sm">{d.name}</p>
                        <p className="text-[10px] opacity-40">{d.type} · Battery {d.bat}</p>
                      </div>
                    </div>
                    <span className="text-[11px]" style={{ color: d.connected ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                      {d.connected ? 'Connected' : 'Connect'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BACKGROUND */}
        {section === 'background' && (
          <div className="space-y-5 max-w-2xl">
            <h2 className="text-lg font-bold">Background</h2>
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPERS.map(w => (
                <button key={w.path} onClick={() => setTheme({ wallpaper: w.path })}
                  className="relative flex flex-col items-center gap-2 group">
                  <div className="w-full aspect-video rounded-xl overflow-hidden transition-all relative"
                    style={{
                      background: w.preview,
                      border: theme.wallpaper === w.path ? `2px solid ${accent}` : `2px solid ${border}`,
                      boxShadow: theme.wallpaper === w.path ? `0 0 12px ${accent}40` : 'none',
                    }}>
                    {theme.wallpaper === w.path && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: accent }}>
                          <Check size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] opacity-60">{w.name}</span>
                </button>
              ))}
            </div>
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-60 mb-2">Custom Image URL</p>
              <div className="flex gap-2">
                <input
                  placeholder="https://example.com/wallpaper.jpg"
                  className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', caretColor: accent }}
                  onKeyDown={e => { if (e.key === 'Enter') setTheme({ wallpaper: (e.target as HTMLInputElement).value }); }}
                />
                <button className="px-4 py-2 rounded-xl text-xs text-white font-medium" style={{ background: accent }}>Set</button>
              </div>
            </div>
          </div>
        )}

        {/* APPEARANCE */}
        {section === 'appearance' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Appearance</h2>

            {/* Theme */}
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-3">Theme</p>
              <div className="flex gap-3">
                {[
                  { mode: 'dark', Icon: Moon, label: 'Dark' },
                  { mode: 'light', Icon: Sun, label: 'Light' },
                ].map(m => (
                  <button key={m.mode}
                    onClick={() => setTheme({ mode: m.mode as 'dark' | 'light' })}
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all"
                    style={{
                      background: theme.mode === m.mode ? `${accent}15` : 'transparent',
                      borderColor: theme.mode === m.mode ? accent : border,
                    }}>
                    <m.Icon size={20} style={{ color: theme.mode === m.mode ? accent : 'rgba(255,255,255,0.4)' }} />
                    <span className="text-xs" style={{ color: theme.mode === m.mode ? accent : 'inherit' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent */}
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-3">Accent Color</p>
              <div className="flex flex-wrap gap-2.5">
                {ACCENT_COLORS.map(c => (
                  <button key={c.value} onClick={() => setTheme({ accent: c.value })}
                    className="relative w-9 h-9 rounded-full transition-all"
                    title={c.name}
                    style={{
                      background: c.value,
                      border: theme.accent === c.value ? '3px solid white' : '3px solid transparent',
                      transform: theme.accent === c.value ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: theme.accent === c.value ? `0 0 12px ${c.value}80` : 'none',
                    }}>
                    {theme.accent === c.value && <Check size={14} className="absolute inset-0 m-auto text-white" />}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] opacity-40">Custom:</span>
                <input type="color" value={theme.accent} onChange={e => setTheme({ accent: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer" style={{ background: 'transparent', border: 'none' }} />
                <span className="text-[11px] font-mono opacity-40">{theme.accent}</span>
              </div>
            </div>

            {/* Font Size */}
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-3">Text Size</p>
              <div className="flex gap-2">
                {(['sm', 'md', 'lg'] as const).map(s => (
                  <button key={s}
                    onClick={() => setFontSize(s)}
                    className="flex-1 py-2 rounded-xl text-xs border-2 transition-all"
                    style={{
                      background: fontSize === s ? `${accent}18` : 'transparent',
                      borderColor: fontSize === s ? accent : border,
                      color: fontSize === s ? accent : 'inherit',
                    }}>
                    {{ sm: 'Small', md: 'Medium', lg: 'Large' }[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Dock apps */}
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-3">Pinned Dock Apps</p>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {APP_REGISTRY.slice(0, 20).map(app => {
                  const isPinned = dockItems.find(d => d.appId === app.id)?.isPinned;
                  return (
                    <div key={app.id}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = rowHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <span className="text-xs flex-1">{app.name}</span>
                      <span className="text-[10px] opacity-30">{app.category}</span>
                      <button
                        onClick={() => isPinned ? unpinDockItem(app.id) : pinDockItem(app.id)}
                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium transition-all"
                        style={{
                          background: isPinned ? `${accent}25` : 'rgba(255,255,255,0.06)',
                          color: isPinned ? accent : 'inherit',
                        }}>
                        {isPinned ? '✓ Pinned' : 'Pin'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {section === 'notifications' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Notifications</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="Notifications" sub="Show notifications from apps" right={<Toggle on={notifOn} onChange={() => setNotifOn(v => !v)} accent={accent} />} />
              <Row label="Do Not Disturb" sub="Block all notifications" right={<Toggle on={false} onChange={() => {}} accent={accent} />} />
              <Row label="Lock Screen" sub="Show notifications when locked" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest opacity-40" style={{ background: cardBg }}>
                App Notifications
              </div>
              {['Calendar', 'Email', 'Browser', 'System', 'Clock', 'Chat'].map(app => (
                <div key={app} className="flex items-center justify-between px-4 py-3 border-t"
                  style={{ borderColor: border }}>
                  <span className="text-sm">{app}</span>
                  <Toggle on={true} onChange={() => {}} accent={accent} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOUND */}
        {section === 'sound' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Sound</h2>
            <div className="p-4 rounded-2xl space-y-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider">Output Volume</p>
              <div className="flex items-center gap-3">
                <Volume2 size={14} className="opacity-40" />
                <input type="range" min={0} max={100} value={volume}
                  onChange={e => setVolume(+e.target.value)}
                  className="flex-1" style={{ accentColor: accent }} />
                <span className="text-sm font-mono w-10 text-right opacity-60">{volume}%</span>
              </div>
              <div className="flex gap-2">
                {['Built-in Speakers', 'Headphones', 'HDMI'].map((d, i) => (
                  <button key={d}
                    className="flex-1 py-2 text-[11px] rounded-xl border-2 transition-all"
                    style={{
                      background: i === 0 ? `${accent}18` : 'transparent',
                      borderColor: i === 0 ? accent : border,
                    }}>{d}</button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="System Sounds" sub="Play sounds for events" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
              <Row label="Input Volume" sub="Microphone level" right={
                <input type="range" min={0} max={100} defaultValue={60}
                  className="w-24" style={{ accentColor: accent }} />
              } />
            </div>
          </div>
        )}

        {/* POWER */}
        {section === 'power' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Power</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="Suspend when inactive for" sub="Power saving sleep mode" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>5 minutes</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>Never</option>
                </select>
              } />
              <Row label="Screen Blank" sub="Turn off screen after" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>2 minutes</option>
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>Never</option>
                </select>
              } />
              <Row label="Automatic Suspend" sub="Suspend when plugged in" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
              <Row label="Power Button Action" sub="What happens when you press power" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>Suspend</option>
                  <option>Shut Down</option>
                  <option>Nothing</option>
                </select>
              } />
            </div>
          </div>
        )}

        {/* DISPLAY */}
        {section === 'display' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Display</h2>
            <div className="p-4 rounded-2xl space-y-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider">Brightness</p>
              <div className="flex items-center gap-3">
                <Sun size={12} className="opacity-30" />
                <input type="range" min={10} max={100} value={brightness}
                  onChange={e => setBrightness(+e.target.value)}
                  className="flex-1" style={{ accentColor: accent }} />
                <Sun size={16} className="opacity-60" />
                <span className="text-sm font-mono w-10 text-right opacity-60">{brightness}%</span>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="Resolution" sub="Display resolution" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>1920 × 1080</option>
                  <option>2560 × 1440</option>
                  <option>3840 × 2160</option>
                </select>
              } />
              <Row label="Refresh Rate" sub="Monitor refresh rate" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>60 Hz</option>
                  <option>120 Hz</option>
                  <option>144 Hz</option>
                </select>
              } />
              <Row label="Night Light" sub="Reduce blue light at night" right={<Toggle on={false} onChange={() => {}} accent={accent} />} />
              <Row label="Scale" sub="Interface scaling" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>100%</option>
                  <option>125%</option>
                  <option>150%</option>
                  <option>200%</option>
                </select>
              } />
            </div>
          </div>
        )}

        {/* MOUSE */}
        {section === 'mouse' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Mouse & Touchpad</h2>
            <div className="p-4 rounded-2xl space-y-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider">Pointer Speed</p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] opacity-40">Slow</span>
                <input type="range" min={0} max={100} value={mouseSpeed}
                  onChange={e => setMouseSpeed(+e.target.value)}
                  className="flex-1" style={{ accentColor: accent }} />
                <span className="text-[10px] opacity-40">Fast</span>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="Primary Button" sub="Which button is primary" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>Left</option>
                  <option>Right</option>
                </select>
              } />
              <Row label="Scroll Direction" sub="Natural or traditional scrolling" right={
                <div className="flex gap-1">
                  {(['natural', 'traditional'] as const).map(d => (
                    <button key={d}
                      onClick={() => setScrollDir(d)}
                      className="px-2 py-1 rounded-lg text-[10px] border transition-all capitalize"
                      style={{
                        background: scrollDir === d ? `${accent}20` : 'transparent',
                        borderColor: scrollDir === d ? accent : border,
                        color: scrollDir === d ? accent : 'inherit',
                      }}>{d}</button>
                  ))}
                </div>
              } />
              <Row label="Tap to Click" sub="Touchpad tap gestures" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
              <Row label="Two-finger scroll" sub="Scroll with two fingers" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
            </div>
          </div>
        )}

        {/* KEYBOARD */}
        {section === 'keyboard' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Keyboard</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="Repeat Keys" sub="Delay before key repeat" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
              <Row label="Repeat Delay" sub="Delay before key repeat starts" right={
                <input type="range" min={100} max={1000} defaultValue={500}
                  className="w-24" style={{ accentColor: accent }} />
              } />
              <Row label="Repeat Speed" sub="Key repeat rate" right={
                <input type="range" min={1} max={100} defaultValue={30}
                  className="w-24" style={{ accentColor: accent }} />
              } />
            </div>
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-3">Keyboard Shortcuts</p>
              {[
                ['Open App Launcher', 'Super'],
                ['Open Terminal', 'Ctrl+Alt+T'],
                ['Screenshot', 'Ctrl+Shift+P'],
                ['Lock Screen', 'Super+L'],
              ].map(([label, key]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: border }}>
                  <span className="text-xs">{label}</span>
                  <kbd className="px-2 py-0.5 rounded text-[10px] font-mono"
                    style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${border}` }}>
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRINTERS */}
        {section === 'printers' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Printers</h2>
            <div className="p-12 rounded-2xl flex flex-col items-center gap-3"
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <Printer size={32} className="opacity-20" />
              <p className="text-sm opacity-40">No printers configured</p>
              <button className="px-4 py-2 rounded-xl text-xs text-white mt-1" style={{ background: accent }}>
                + Add Printer
              </button>
            </div>
          </div>
        )}

        {/* REMOVABLE MEDIA */}
        {section === 'removable' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Removable Media</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="USB drives" sub="When a USB drive is connected" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>Ask what to do</option>
                  <option>Open File Manager</option>
                  <option>Do nothing</option>
                </select>
              } />
              <Row label="SD Cards" sub="When an SD card is inserted" right={
                <select className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: text }}>
                  <option>Ask what to do</option>
                  <option>Open File Manager</option>
                  <option>Do nothing</option>
                </select>
              } />
              <Row label="Auto-mount" sub="Mount media automatically" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
            </div>
          </div>
        )}

        {/* DATE & TIME */}
        {section === 'datetime' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Date & Time</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="Automatic Date & Time" sub="Set time from internet" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
              <Row label="Automatic Time Zone" sub="Set from location" right={<Toggle on={true} onChange={() => {}} accent={accent} />} />
              <Row label="Time Format" sub="24-hour or AM/PM" right={
                <div className="flex gap-1">
                  {['24h', 'AM/PM'].map(f => (
                    <button key={f}
                      className="px-2 py-1 rounded-lg text-[10px] border transition-all"
                      style={{
                        background: f === '24h' ? `${accent}20` : 'transparent',
                        borderColor: f === '24h' ? accent : border,
                        color: f === '24h' ? accent : 'inherit',
                      }}>{f}</button>
                  ))}
                </div>
              } />
              <Row label="Time Zone" sub="Current region" right={
                <span className="text-[11px] opacity-60">Asia/Kolkata (IST)</span>
              } />
            </div>
          </div>
        )}

        {/* USERS */}
        {section === 'users' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Users</h2>
            <div className="p-4 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: border }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}80)` }}>
                  {auth.userImage
                    ? <img src={auth.userImage} className="w-full h-full rounded-full object-cover" alt="" />
                    : (auth.userName?.[0]?.toUpperCase() || 'U')}
                </div>
                <div>
                  <p className="font-semibold">{auth.isGuest ? 'Guest' : auth.userName}</p>
                  <p className="text-xs opacity-40 mt-0.5">{auth.userEmail || 'No email'}</p>
                  <p className="text-[11px] mt-1" style={{ color: auth.isAuthenticated && !auth.isGuest ? '#4ade80' : '#f59e0b' }}>
                    {auth.isAuthenticated && !auth.isGuest ? '✓ Synced to cloud' : '⚠ Local only'}
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors text-sm">
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEFAULT APPS */}
        {section === 'defaultapps' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Default Apps</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              {[
                { label: 'Web Browser', value: 'Web Browser' },
                { label: 'Email Client', value: 'Email' },
                { label: 'Text Editor', value: 'Text Editor' },
                { label: 'File Manager', value: 'File Manager' },
                { label: 'Image Viewer', value: 'Image Viewer' },
                { label: 'Video Player', value: 'Video Player' },
                { label: 'Music Player', value: 'Music Player' },
                { label: 'Calendar', value: 'Calendar' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: border }}>
                  <span className="text-sm">{item.label}</span>
                  <span className="text-[11px] font-medium" style={{ color: accent }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRIVACY */}
        {section === 'privacy' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">Privacy</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <Row label="Screen Lock" sub="Lock screen after inactivity" right={
                <Toggle on={screenLock} onChange={() => setScreenLock(v => !v)} accent={accent} />
              } />
              <Row label="Usage Data" sub="Send anonymous usage statistics" right={
                <Toggle on={usageData} onChange={() => setUsageData(v => !v)} accent={accent} />
              } />
              <Row label="Location Services" sub="Allow apps to access your location" right={
                <Toggle on={locationOn} onChange={() => setLocationOn(v => !v)} accent={accent} />
              } />
              <Row label="Diagnostics" sub="Share diagnostics with developers" right={
                <Toggle on={false} onChange={() => {}} accent={accent} />
              } />
              <Row label="File History" sub="Track recently opened files" right={
                <Toggle on={true} onChange={() => {}} accent={accent} />
              } />
            </div>
            <div className="p-4 rounded-2xl"
              style={{ background: `${accent}08`, border: `1px solid ${accent}25` }}>
              <p className="text-xs opacity-60">
                WebLinuxOS stores data locally in your browser. Cloud sync only occurs when signed in. No data is shared with third parties.
              </p>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {section === 'about' && (
          <div className="space-y-5 max-w-xl">
            <h2 className="text-lg font-bold">About</h2>
            <div className="p-6 rounded-2xl flex flex-col items-center gap-3"
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}60)` }}>
                <span className="text-2xl font-bold text-white">U</span>
              </div>
              <div className="text-center">
                <p className="text-base font-bold">WebLinuxOS</p>
                <p className="text-xs opacity-40 mt-0.5">Version 3.0.0 LTS</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              {[
                ['Device Name', 'weblinuxos-desktop'],
                ['Memory', '8 GB'],
                ['Processor', 'WebAssembly Virtual CPU'],
                ['Graphics', 'WebGL 2.0'],
                ['Storage', '50 GB (Browser localStorage)'],
                ['Browser', typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 48) + '…' : 'Unknown'],
                ['Build', 'Next.js 14 + Neon PostgreSQL'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-4 py-3 border-b text-sm"
                  style={{ borderColor: border }}>
                  <span className="opacity-50">{k}</span>
                  <span className="font-medium text-xs font-mono">{v}</span>
                </div>
              ))}
            </div>
            {/* Storage bar */}
            <div className="p-4 rounded-2xl space-y-2" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex justify-between text-xs opacity-50">
                <span>Storage Used</span>
                <span>21 GB / 50 GB</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '42%', background: `linear-gradient(90deg, ${accent}, ${accent}80)` }} />
              </div>
            </div>
            <button onClick={checkUpdate}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
              {checking
                ? <><RefreshCw size={14} className="animate-spin" /> Checking…</>
                : updateStatus === 'uptodate'
                ? <><Check size={14} /> Up to Date</>
                : <><Download size={14} /> Check for Updates</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
