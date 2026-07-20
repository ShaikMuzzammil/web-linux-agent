'use client';
import { useState, useCallback } from 'react';
import { Palette, Monitor, Bell, User, Zap, Layout, Shield, Info, Sun, Moon, Check, LogOut, ChevronRight, ExternalLink, Github, Linkedin, Mail, Code2, Award, BookOpen, Globe } from 'lucide-react';
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
  { name: 'Ubuntu Dark', path: '/wallpapers/ubuntu-dark.svg', preview: 'linear-gradient(135deg, #1a0a05 0%, #080506 100%)' },
  { name: 'Default', path: '/wallpapers/default.svg', preview: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a2e 100%)' },
  { name: 'Aurora', path: '/wallpapers/aurora.svg', preview: 'linear-gradient(135deg, #0a0a1a 0%, #0a3320 50%, #1a0a2e 100%)' },
  { name: 'Nebula', path: '/wallpapers/nebula.svg', preview: 'linear-gradient(135deg, #0d0520 0%, #000d30 50%, #100520 100%)' },
  { name: 'Cyberpunk', path: '/wallpapers/cyberpunk.svg', preview: 'linear-gradient(135deg, #0a0008 0%, #1a0520 50%, #2a0510 100%)' },
  { name: 'Mountain', path: '/wallpapers/mountain.svg', preview: 'linear-gradient(135deg, #0a0818 0%, #1a0e2e 50%, #2d1520 100%)' },
  { name: 'Ocean', path: '/wallpapers/ocean.svg', preview: 'linear-gradient(135deg, #020d18 0%, #041520 50%, #021018 100%)' },
];

type Section = 'appearance' | 'wallpaper' | 'dock' | 'notifications' | 'account' | 'about' | 'pioneer';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
  { id: 'wallpaper', label: 'Wallpaper', icon: <Monitor size={15} /> },
  { id: 'dock', label: 'Dock & Apps', icon: <Layout size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
  { id: 'account', label: 'Account', icon: <User size={15} /> },
  { id: 'about', label: 'About', icon: <Info size={15} /> },
  { id: 'pioneer', label: 'Pioneered By', icon: <Zap size={15} /> },
];

export default function Settings({ windowId }: { windowId: string }) {
  const { theme, setTheme, toggleTheme, auth, dockItems, pinDockItem, unpinDockItem, logout } = useOSStore();

  // Save wallpaper: localStorage (via setTheme) + cloud sync
  const saveWallpaper = useCallback(async (path: string) => {
    setTheme({ wallpaper: path });
    // Also push to cloud (fire-and-forget)
    try {
      await fetch('/api/sync/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { wallpaper: path, themeMode: theme.mode, accentColor: theme.accent } }),
      });
    } catch {}
  }, [setTheme, theme.mode, theme.accent]);
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
                <button key={w.path} onClick={() => saveWallpaper(w.path)}
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
                <input placeholder="https://example.com/wallpaper.jpg" className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`, caretColor: theme.accent }} onKeyDown={(e) => { if (e.key === 'Enter') saveWallpaper((e.target as HTMLInputElement).value); }} />
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

            {/* Logo + tagline */}
            <div className="p-5 rounded-xl flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent}06)`, border: `1px solid ${theme.accent}30` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)` }}>
                <span className="text-white font-black text-2xl">W</span>
              </div>
              <div>
                <div className="text-base font-bold">WebLinuxOS</div>
                <div className="text-xs opacity-60 mt-0.5">Version 2.0.0 LTS</div>
                <div className="text-xs opacity-40 mt-1">A browser-based Ubuntu-style cloud desktop</div>
              </div>
            </div>

            {/* System info */}
            <div className="p-4 rounded-xl space-y-2.5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="text-xs font-bold opacity-50 uppercase tracking-wider mb-3">System Information</p>
              {[
                ['Build Stack', 'Next.js 14 · TypeScript · Tailwind CSS'],
                ['Database', 'Neon PostgreSQL · Prisma ORM'],
                ['Auth', 'NextAuth v4 (Email + OAuth)'],
                ['AI Engine', 'NEXUS Intelligence System'],
                ['Built-in Apps', '54 applications'],
                ['Storage', 'Cloud sync + localStorage fallback'],
                ['Deployment', 'Vercel Edge Network'],
                ['Processor', 'WebAssembly Virtual CPU'],
                ['Memory', '8 GB (Browser simulated)'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="opacity-50">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>

            {/* Storage bar */}
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex justify-between text-xs mb-2">
                <span className="opacity-60">Storage Used</span>
                <span className="font-medium">21 GB / 50 GB</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full" style={{ width: '42%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}99)` }} />
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.accent}cc)` }}>
              Check for Updates
            </button>
          </div>
        )}

        {section === 'pioneer' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold">Pioneered By</h2>

            {/* Profile hero */}
            <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}08)`, border: `1px solid ${theme.accent}35` }}>
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-2xl shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)` }}
                >
                  SM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black tracking-tight">Shaik Muzzammil</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: theme.accent }}>Full-Stack Engineer · AI Enthusiast</div>
                  <div className="text-[10px] opacity-50 mt-1">📍 Chennai, India</div>
                </div>
              </div>
              <p className="text-xs leading-relaxed opacity-70">
                Third-year CSE undergraduate at Amrita Vishwa Vidyapeetham, building scalable full-stack web applications, REST APIs, and AI-integrated systems. Passionate about clean software architecture and real-world engineering.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Globe size={13}/>, label: 'Portfolio', href: 'https://shaik-muzzammil.vercel.app', color: theme.accent },
                { icon: <Github size={13}/>, label: 'GitHub', href: 'https://github.com/ShaikMuzzammil', color: '#E2E8F0' },
                { icon: <Linkedin size={13}/>, label: 'LinkedIn', href: 'https://linkedin.com/in/shaik-muzzammil', color: '#0A66C2' },
                { icon: <Mail size={13}/>, label: 'Email', href: 'mailto:muzzammil160806@gmail.com', color: '#EA4335' },
              ].map(({ icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-xs font-medium"
                  style={{ background: cardBg, border: `1px solid ${border}`, color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = color + '55'; (e.currentTarget as HTMLAnchorElement).style.background = color + '12'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = border; (e.currentTarget as HTMLAnchorElement).style.background = cardBg; }}
                >
                  <span style={{ color }}>{icon}</span>
                  {label}
                  <ExternalLink size={9} className="ml-auto opacity-40" />
                </a>
              ))}
            </div>

            {/* Education */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={13} style={{ color: theme.accent }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">Education</span>
              </div>
              <div className="text-xs font-semibold">B.Tech — Computer Science & Engineering</div>
              <div className="text-xs opacity-60">Amrita Vishwa Vidyapeetham, Chennai</div>
              <div className="text-[10px] opacity-40">2024 – 2028 (Expected)</div>
            </div>

            {/* Projects */}
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Code2 size={13} style={{ color: theme.accent }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">Flagship Projects</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'WebLinuxOS', stack: 'Next.js · TypeScript · Neon DB', desc: '54-app browser-based Ubuntu desktop' },
                  { name: 'CortexCart', stack: 'Next.js · PostgreSQL · Prisma', desc: 'Multi-portal e-commerce platform' },
                  { name: 'Smart Query Optimizer', stack: 'Next.js · AI · PostgreSQL', desc: 'NL→SQL AI-powered workspace' },
                  { name: 'OmniPoll', stack: 'React · WebSockets · PostgreSQL', desc: 'Real-time live polling platform' },
                  { name: 'AgroWave', stack: 'Next.js · Tailwind CSS', desc: 'Agriculture analytics dashboard (95+ Lighthouse)' },
                ].map(p => (
                  <div key={p.name} className="pl-3" style={{ borderLeft: `2px solid ${theme.accent}50` }}>
                    <div className="text-xs font-semibold">{p.name}</div>
                    <div className="text-[10px] opacity-50 mt-0.5">{p.stack}</div>
                    <div className="text-[10px] opacity-40">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={13} style={{ color: theme.accent }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">Technical Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['React.js','Next.js','TypeScript','Node.js','Python','Java','PostgreSQL','Prisma','Tailwind CSS','Git','Docker','Linux','REST APIs','WebSockets','LLMs'].map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}35`, color: theme.accent }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="p-4 rounded-xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Award size={13} style={{ color: theme.accent }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">Certifications</span>
              </div>
              <div className="space-y-2">
                {[
                  'JPMorgan Chase & Co. — Software Engineering Simulation',
                  'Vista Equity Partners — AI in Action Simulation',
                  'Databricks — Generative AI Fundamentals',
                  'Google — Gemini for University Students',
                ].map(c => (
                  <div key={c} className="flex items-start gap-2 text-[10px] opacity-60">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: theme.accent }} />
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center py-2">
              <p className="text-[10px] opacity-30">WebLinuxOS — Designed & built from scratch</p>
              <p className="text-[10px] opacity-20 mt-0.5">© 2024–2025 Shaik Muzzammil · All rights reserved</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
