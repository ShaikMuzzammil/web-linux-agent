'use client';
import { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  Bell, Wifi, WifiOff, Volume2, VolumeX, Volume1,
  CloudUpload, Loader2, Search, LogOut, Sun, Moon, User,
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  Bluetooth, BluetoothOff, Settings, Monitor, Accessibility, LayoutGrid
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { signOut } from 'next-auth/react';

// ─── Safe date formatter (fixes "Invalid time value") ───────────────────
function safeFormatTime(d: Date, type: 'time' | 'date' | 'seconds'): string {
  try {
    if (!d || isNaN(d.getTime())) return '—';
    if (type === 'time') return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    if (type === 'seconds') return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    if (type === 'date') return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return d.toString();
  } catch { return '—'; }
}
function safeFullDate(d: Date): string {
  try {
    if (!d || isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

// ─── Battery Hook ───────────────────────────────────────────────────────
function useBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) return;
    (navigator as any).getBattery().then((bat: any) => {
      const update = () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
      update();
      bat.addEventListener('levelchange', update);
      bat.addEventListener('chargingchange', update);
    }).catch(() => {});
  }, []);
  return battery;
}

// ─── Popup wrapper ─────────────────────────────────────────────────────
function Popup({ children, align = 'right', wide = false }: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  wide?: boolean;
}) {
  const offset = align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';
  return (
    <div className={`absolute top-full mt-2 z-[1100] ${offset} rounded-2xl overflow-hidden`}
      style={{
        minWidth: wide ? 280 : 220,
        background: 'rgba(12,12,22,0.98)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        backdropFilter: 'blur(28px)',
        animation: 'popupIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      {children}
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────
function Toggle({ on, onChange, accent }: { on: boolean; onChange: () => void; accent?: string }) {
  return (
    <button onClick={onChange}
      className="relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ background: on ? (accent || '#E95420') : 'rgba(255,255,255,0.15)' }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: on ? '17px' : '2px' }} />
    </button>
  );
}

export default memo(function TopPanel() {
  const {
    theme, notifications, notificationCenterOpen, auth, isSyncing,
    toggleNotificationCenter, setAppLauncher, toggleTheme, logout, openWindow,
  } = useOSStore();

  const [time, setTime] = useState<Date>(() => new Date());
  const [activePopup, setActivePopup] = useState<'volume' | 'wifi' | 'battery' | 'bluetooth' | 'user' | 'clock' | null>(null);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const battery = useBattery();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setTime(new Date());
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActivePopup(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (popup: typeof activePopup) =>
    setActivePopup(prev => prev === popup ? null : popup);

  const handleSignOut = useCallback(async () => {
    setActivePopup(null);
    if (auth.isGuest) { logout(); } else { await signOut({ redirect: false }); logout(); }
  }, [auth.isGuest, logout]);

  const unread = notifications.filter(n => !n.isRead).length;
  const dk = theme.mode === 'dark';
  const bg = dk ? 'rgba(12,12,22,0.92)' : 'rgba(238,238,248,0.92)';
  const txt = dk ? 'text-white/80' : 'text-gray-800';

  const BatteryIcon = battery?.charging
    ? BatteryCharging : !battery ? Battery
    : battery.level > 60 ? BatteryFull
    : battery.level > 30 ? BatteryMedium : BatteryLow;
  const batteryColor = battery
    ? battery.level > 40 ? '#4ade80' : battery.level > 20 ? '#facc15' : '#f87171'
    : 'rgba(255,255,255,0.3)';
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 40 ? Volume1 : Volume2;

  const TrayBtn = ({
    id, onClick, title, children, active = false
  }: {
    id: string; onClick: () => void; title: string;
    children: React.ReactNode; active?: boolean;
  }) => (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHoveredIcon(id)}
        onMouseLeave={() => setHoveredIcon(null)}
        className="p-1.5 rounded-lg transition-all duration-150"
        style={{ background: active ? 'rgba(255,255,255,0.12)' : hoveredIcon === id ? 'rgba(255,255,255,0.08)' : 'transparent' }}
        title={title}
      >
        {children}
      </button>
      {/* Tooltip */}
      {hoveredIcon === id && !activePopup && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 rounded-lg text-[10px] text-white/80 whitespace-nowrap pointer-events-none z-[1200]"
          style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
          {title}
        </div>
      )}
    </div>
  );

  return (
    <div ref={panelRef}
      className={`fixed top-0 left-0 right-0 z-[900] h-7 flex items-center px-3 select-none ${txt}`}
      style={{ background: bg, backdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

      {/* ── Left: Logo + Label ─────────────────────────── */}
      <div className="flex items-center gap-2 flex-1">
        <button onClick={() => setAppLauncher(true)}
          className="flex items-center gap-1.5 text-[11px] font-semibold hover:opacity-80 transition-opacity"
          style={{ color: theme.accent }}>
          <svg width="14" height="14" viewBox="0 0 100 100">
            <circle cx="50" cy="9"  r="9"  fill="currentColor"/>
            <circle cx="14" cy="71" r="9"  fill="currentColor"/>
            <circle cx="86" cy="71" r="9"  fill="currentColor"/>
            <path d="M50 18 A32 32 0 0 1 77.7 64" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M77.7 64 A32 32 0 0 1 22.3 64" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M22.3 64 A32 32 0 0 1 50 18" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <circle cx="50" cy="9"  r="4" fill="white"/>
            <circle cx="14" cy="71" r="4" fill="white"/>
            <circle cx="86" cy="71" r="4" fill="white"/>
          </svg>
          <span className="hidden sm:block">WebLinuxOS</span>
        </button>
        {isSyncing && (
          <div className="flex items-center gap-1 text-[9px] text-green-400">
            <Loader2 size={10} className="animate-spin" />
            <span className="hidden md:block">Syncing</span>
          </div>
        )}
        {!isSyncing && auth.isAuthenticated && !auth.isGuest && (
          <CloudUpload size={10} className="text-green-400/50" title="Cloud sync active" />
        )}
      </div>

      {/* ── Center: Clock ──────────────────────────────── */}
      <div className="relative">
        <button
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 flex items-center gap-1.5 text-[11px] font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
          style={{ top: '50%' }}
          onClick={() => toggle('clock')}
        >
          <span className="opacity-50">{safeFormatTime(time, 'date')}</span>
          <span className="font-mono font-bold" style={{ color: theme.accent }}>
            {safeFormatTime(time, 'seconds')}
          </span>
        </button>
        {activePopup === 'clock' && (
          <Popup align="center" wide>
            <div className="p-4 text-center">
              <div className="text-3xl font-mono font-bold" style={{ color: theme.accent }}>
                {safeFormatTime(time, 'time')}
              </div>
              <div className="text-[11px] opacity-50 mt-1 font-mono">
                {safeFormatTime(time, 'seconds').split(':')[2]} s
              </div>
              <div className="text-sm opacity-60 mt-2">{safeFullDate(time)}</div>
            </div>
            <div className="border-t border-white/06 p-2">
              <button
                onClick={() => { openWindow('clock'); setActivePopup(null); }}
                className="w-full text-[11px] opacity-40 hover:opacity-70 py-1 transition-opacity"
              >
                Open Clock App
              </button>
              <button
                onClick={() => { openWindow('calendar'); setActivePopup(null); }}
                className="w-full text-[11px] opacity-40 hover:opacity-70 py-1 transition-opacity"
              >
                Open Calendar
              </button>
            </div>
          </Popup>
        )}
      </div>

      {/* ── Right: System Tray ──────────────────────────── */}
      <div className="flex items-center gap-0 flex-1 justify-end relative">

        {/* Search */}
        <TrayBtn id="search" onClick={() => setAppLauncher(true)} title="Search apps">
          <Search size={11} className="opacity-50" />
        </TrayBtn>

        {/* Accessibility */}
        <TrayBtn id="access" onClick={() => openWindow('settings')} title="Accessibility">
          <Accessibility size={11} className="opacity-40" />
        </TrayBtn>

        {/* Screen */}
        <TrayBtn id="display" onClick={() => openWindow('settings')} title="Display Settings">
          <Monitor size={11} className="opacity-40" />
        </TrayBtn>

        {/* Bluetooth */}
        <div className="relative">
          <TrayBtn id="bluetooth" onClick={() => toggle('bluetooth')} title="Bluetooth"
            active={activePopup === 'bluetooth'}>
            {btOn
              ? <Bluetooth size={11} style={{ color: '#60a5fa' }} />
              : <BluetoothOff size={11} className="opacity-30" />}
          </TrayBtn>
          {activePopup === 'bluetooth' && (
            <Popup>
              <div className="px-3 py-2.5 border-b border-white/06">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bluetooth size={12} style={{ color: btOn ? '#60a5fa' : 'rgba(255,255,255,0.3)' }} />
                    <span className="text-xs font-semibold text-white/80">Bluetooth</span>
                  </div>
                  <Toggle on={btOn} onChange={() => setBtOn(v => !v)} accent="#3b82f6" />
                </div>
              </div>
              {btOn && (
                <div className="p-2">
                  <p className="text-[9px] uppercase tracking-widest opacity-30 px-2 mb-1">Devices</p>
                  {[
                    { name: 'MacBook Pro', status: 'Connected', connected: true },
                    { name: 'AirPods Pro', status: 'Not connected', connected: false },
                    { name: 'Magic Mouse', status: 'Not connected', connected: false },
                  ].map(d => (
                    <button key={d.name}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/05 transition-colors text-left">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: d.connected ? '#4ade80' : 'rgba(255,255,255,0.2)' }} />
                      <div>
                        <p className="text-xs text-white/70">{d.name}</p>
                        <p className="text-[9px] opacity-30">{d.status}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t border-white/06 p-2">
                <button onClick={() => { openWindow('settings'); setActivePopup(null); }}
                  className="w-full text-[10px] opacity-30 hover:opacity-60 py-1 transition-opacity">
                  Bluetooth Settings…
                </button>
              </div>
            </Popup>
          )}
        </div>

        {/* Volume */}
        <div className="relative">
          <TrayBtn id="volume" onClick={() => toggle('volume')} title={`Volume: ${isMuted ? 'Muted' : volume + '%'}`}
            active={activePopup === 'volume'}>
            <VolumeIcon size={11} className={isMuted ? 'opacity-25' : 'opacity-60'} />
          </TrayBtn>
          {activePopup === 'volume' && (
            <Popup>
              <div className="p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VolumeIcon size={12} className="opacity-50" />
                    <span className="text-xs font-semibold text-white/80">Volume</span>
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: isMuted ? '#f87171' : theme.accent }}>
                    {isMuted ? 'Muted' : `${volume}%`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeX size={10} className="opacity-30 flex-shrink-0" />
                  <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
                    onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
                    className="flex-1 h-1 cursor-pointer" style={{ accentColor: theme.accent }} />
                  <Volume2 size={10} className="opacity-30 flex-shrink-0" />
                </div>
                <Toggle on={!isMuted} onChange={() => setIsMuted(v => !v)} accent={theme.accent} />
                <div className="border-t border-white/06 pt-2">
                  <p className="text-[9px] uppercase tracking-widest opacity-30 mb-1.5">Output</p>
                  {['Built-in Speakers', 'Headphones', 'HDMI Output'].map((d, i) => (
                    <button key={d}
                      className="w-full flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-white/05 text-left transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: i === 0 ? theme.accent : 'rgba(255,255,255,0.15)' }} />
                      <span className="text-[11px]" style={{ opacity: i === 0 ? 0.85 : 0.45 }}>{d}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Popup>
          )}
        </div>

        {/* WiFi */}
        <div className="relative">
          <TrayBtn id="wifi" onClick={() => toggle('wifi')} title="Network" active={activePopup === 'wifi'}>
            {wifiOn
              ? <Wifi size={11} className="text-green-400/80" />
              : <WifiOff size={11} className="opacity-25" />}
          </TrayBtn>
          {activePopup === 'wifi' && (
            <Popup>
              <div className="px-3 py-2.5 border-b border-white/06">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi size={12} style={{ color: wifiOn ? '#4ade80' : 'rgba(255,255,255,0.3)' }} />
                    <span className="text-xs font-semibold text-white/80">Wi-Fi</span>
                  </div>
                  <Toggle on={wifiOn} onChange={() => setWifiOn(v => !v)} accent="#22c55e" />
                </div>
              </div>
              {wifiOn && (
                <div className="p-2">
                  <p className="text-[9px] uppercase tracking-widest opacity-30 px-2 mb-1">Networks</p>
                  {[
                    { name: 'WebLinuxOS_5G', signal: 4, secured: true, connected: true },
                    { name: 'Home Network', signal: 3, secured: true, connected: false },
                    { name: 'Guest WiFi', signal: 2, secured: false, connected: false },
                    { name: 'iPhone Hotspot', signal: 1, secured: true, connected: false },
                  ].map((n, i) => (
                    <button key={n.name}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/05 transition-colors text-left">
                      <div className="flex gap-px items-end flex-shrink-0">
                        {[1, 2, 3, 4].map(bar => (
                          <div key={bar} className="w-1 rounded-sm"
                            style={{
                              height: bar * 3 + 2,
                              background: bar <= n.signal
                                ? n.connected ? theme.accent : 'rgba(255,255,255,0.6)'
                                : 'rgba(255,255,255,0.1)',
                            }} />
                        ))}
                      </div>
                      <span className="text-xs flex-1 truncate"
                        style={{ color: n.connected ? theme.accent : 'rgba(255,255,255,0.6)' }}>
                        {n.name}
                      </span>
                      {n.connected && <span className="text-[9px] text-green-400 flex-shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t border-white/06 p-2">
                <button onClick={() => { openWindow('settings'); setActivePopup(null); }}
                  className="w-full text-[10px] opacity-30 hover:opacity-60 py-1 transition-opacity">
                  Network Settings…
                </button>
              </div>
            </Popup>
          )}
        </div>

        {/* Battery */}
        <div className="relative hidden sm:block">
          <TrayBtn id="battery"
            onClick={() => toggle('battery')}
            title={battery ? `${battery.level}%${battery.charging ? ' – Charging' : ''}` : 'Battery'}
            active={activePopup === 'battery'}>
            <div className="flex items-center gap-0.5">
              <BatteryIcon size={11} style={{ color: batteryColor }} />
              {battery && (
                <span className="text-[9px]" style={{ color: batteryColor, opacity: 0.8 }}>
                  {battery.level}%
                </span>
              )}
            </div>
          </TrayBtn>
          {activePopup === 'battery' && (
            <Popup>
              <div className="p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Battery</span>
                  {battery?.charging && (
                    <span className="text-[10px] text-green-400 flex items-center gap-1">
                      <BatteryCharging size={10} /> Charging
                    </span>
                  )}
                </div>
                {battery ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${battery.level}%`,
                            background: battery.level > 40
                              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                              : battery.level > 20
                              ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                              : 'linear-gradient(90deg, #dc2626, #ef4444)',
                          }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: batteryColor }}>
                        {battery.level}%
                      </span>
                    </div>
                    <p className="text-[10px] opacity-30">
                      {battery.charging ? 'Plugged in — charging' : 'Running on battery'}
                    </p>
                  </>
                ) : (
                  <p className="text-xs opacity-40">Battery info not available on desktop</p>
                )}
              </div>
              <div className="border-t border-white/06 p-2">
                <button onClick={() => { openWindow('settings'); setActivePopup(null); }}
                  className="w-full text-[10px] opacity-30 hover:opacity-60 py-1 transition-opacity">
                  Power Settings…
                </button>
              </div>
            </Popup>
          )}
        </div>

        {/* Theme toggle */}
        <TrayBtn id="theme" onClick={toggleTheme} title={dk ? 'Switch to Light mode' : 'Switch to Dark mode'}>
          {dk
            ? <Sun size={11} className="text-yellow-400/70" />
            : <Moon size={11} className="text-indigo-400" />}
        </TrayBtn>

        {/* Notifications bell */}
        <div className="relative">
          <TrayBtn id="notif" onClick={toggleNotificationCenter} title="Notifications"
            active={notificationCenterOpen}>
            <div className="relative">
              <Bell size={11} style={{ color: notificationCenterOpen ? theme.accent : undefined, opacity: notificationCenterOpen ? 1 : 0.65 }} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[12px] h-3 rounded-full text-[8px] font-bold flex items-center justify-center text-white px-0.5"
                  style={{ background: theme.accent }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>
          </TrayBtn>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => toggle('user')}
            onMouseEnter={() => setHoveredIcon('user')}
            onMouseLeave={() => setHoveredIcon(null)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all"
            style={{ background: activePopup === 'user' ? 'rgba(255,255,255,0.12)' : hoveredIcon === 'user' ? 'rgba(255,255,255,0.07)' : 'transparent' }}
          >
            {auth.userImage
              ? <img src={auth.userImage} alt="" className="w-4 h-4 rounded-full" />
              : (
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)` }}>
                  {auth.isGuest ? 'G' : (auth.userName?.[0]?.toUpperCase() || 'U')}
                </div>
              )
            }
            <span className="hidden md:block text-[10px] max-w-[70px] truncate">
              {auth.isGuest ? 'Guest' : auth.userName}
            </span>
          </button>
          {activePopup === 'user' && (
            <Popup>
              <div className="px-3 py-3 border-b border-white/06 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}60)` }}>
                  {auth.userImage
                    ? <img src={auth.userImage} alt="" className="w-full h-full rounded-full object-cover" />
                    : auth.isGuest ? 'G' : (auth.userName?.[0]?.toUpperCase() || 'U')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{auth.isGuest ? 'Guest User' : auth.userName}</p>
                  {auth.userEmail && <p className="text-[10px] text-white/40 truncate">{auth.userEmail}</p>}
                  <p className="text-[9px] mt-0.5" style={{ color: auth.isAuthenticated && !auth.isGuest ? '#4ade80' : '#f59e0b' }}>
                    {auth.isAuthenticated && !auth.isGuest ? '● Synced' : '● Guest mode'}
                  </p>
                </div>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { openWindow('settings'); setActivePopup(null); }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-xs text-white/60 hover:bg-white/06 rounded-xl transition-colors">
                  <Settings size={12} /> System Settings
                </button>
                <button
                  onClick={() => { setAppLauncher(true); setActivePopup(null); }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-xs text-white/60 hover:bg-white/06 rounded-xl transition-colors">
                  <LayoutGrid size={12} /> All Apps
                </button>
              </div>
              <div className="border-t border-white/06 p-1.5">
                <button onClick={handleSignOut}
                  className="w-full px-3 py-2 flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </Popup>
          )}
        </div>
      </div>
    </div>
  );
});
