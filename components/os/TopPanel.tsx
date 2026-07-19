'use client';
import { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  Bell, Wifi, WifiOff, Volume2, VolumeX, Volume1,
  CloudUpload, Loader2, Search, LogOut, Sun, Moon, User,
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  Bluetooth, BluetoothOff, Settings, Monitor
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { signOut } from 'next-auth/react';
import { format, isValid } from 'date-fns';

const safeFormat = (date: Date | number, fmt: string): string => {
  try {
    const d = typeof date === 'number' ? new Date(date) : date;
    if (!d || !isValid(d)) return '--';
    return format(d, fmt);
  } catch { return '--'; }
};

// ─── Battery Hook ───────────────────────────────────────────
function useBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    (navigator as Navigator & { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: Function }> })
      .getBattery().then((bat) => {
        setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        bat.addEventListener('levelchange', () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging }));
        bat.addEventListener('chargingchange', () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging }));
      }).catch(() => {});
  }, []);
  return battery;
}

// ─── Popup wrapper ──────────────────────────────────────────
function Popup({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  const offset = align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';
  return (
    <div className={`absolute top-full mt-1.5 z-[1100] ${offset} min-w-[200px] rounded-xl overflow-hidden`}
      style={{ background: 'rgba(14,14,24,0.97)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
      {children}
    </div>
  );
}

export default memo(function TopPanel() {
  const { theme, notifications, notificationCenterOpen, auth, isSyncing,
    toggleNotificationCenter, setAppLauncher, toggleTheme, logout, openWindow } = useOSStore();
  const [time, setTime] = useState(new Date());

  // Popup states
  const [activePopup, setActivePopup] = useState<'volume' | 'wifi' | 'battery' | 'bluetooth' | 'user' | 'clock' | null>(null);

  // System state
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(false);
  const battery = useBattery();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Close popup on outside click
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
    ? BatteryCharging
    : !battery
      ? Battery
      : battery.level > 60
        ? BatteryFull
        : battery.level > 30
          ? BatteryMedium
          : BatteryLow;

  const batteryColor = battery
    ? battery.level > 40 ? 'text-green-400' : battery.level > 20 ? 'text-yellow-400' : 'text-red-400'
    : 'text-white/40';

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 40 ? Volume1 : Volume2;

  return (
    <div ref={panelRef}
      className={`fixed top-0 left-0 right-0 z-[900] h-7 flex items-center px-3 select-none ${txt}`}
      style={{ background: bg, backdropFilter: 'blur(20px) saturate(180%)', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>

      {/* Left — Logo + Active App */}
      <div className="flex items-center gap-3 flex-1">
        <button onClick={() => setAppLauncher(true)}
          className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
          style={{ color: theme.accent }}>
          <svg width="16" height="16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
      </div>

      {/* Center — Clock (clickable) */}
      <button
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
        onClick={() => toggle('clock')}>
        <span className="opacity-60">{safeFormat(time, 'EEE MMM d')}</span>
        <span className="font-mono font-bold" style={{ color: theme.accent }}>{safeFormat(time, 'HH:mm:ss')}</span>
      </button>

      {/* Right — System tray */}
      <div className="flex items-center gap-0.5 flex-1 justify-end relative">

        {/* Sync */}
        {isSyncing && (
          <div className="flex items-center gap-1 text-[10px] text-green-400 px-1.5">
            <Loader2 size={11} className="animate-spin" />
            <span className="hidden sm:block">Syncing</span>
          </div>
        )}
        {!isSyncing && auth.isAuthenticated && !auth.isGuest && (
          <CloudUpload size={12} className="text-green-400/50 mr-0.5" title="Cloud sync active" />
        )}

        {/* Search */}
        <button onClick={() => setAppLauncher(true)} className="p-1 rounded hover:bg-white/10 transition-colors" title="Search (click Ubuntu logo)">
          <Search size={12} />
        </button>

        {/* Bluetooth */}
        <div className="relative">
          <button onClick={() => toggle('bluetooth')} className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ background: activePopup === 'bluetooth' ? 'rgba(255,255,255,0.1)' : '' }} title="Bluetooth">
            {btOn ? <Bluetooth size={12} className="text-blue-400" /> : <BluetoothOff size={12} className="opacity-30" />}
          </button>
          {activePopup === 'bluetooth' && (
            <Popup>
              <div className="px-3 py-2 border-b border-white/08">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Bluetooth</span>
                  <button onClick={() => setBtOn(v => !v)}
                    className="w-9 h-5 rounded-full transition-all flex-shrink-0 relative"
                    style={{ background: btOn ? '#3b82f6' : 'rgba(255,255,255,0.12)' }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: btOn ? '18px' : '2px' }} />
                  </button>
                </div>
              </div>
              {btOn && (
                <div className="p-2">
                  <p className="text-[10px] opacity-30 px-1 mb-1">Devices</p>
                  {['MacBook Pro', 'AirPods Pro'].map(d => (
                    <button key={d} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/05 transition-colors text-left">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs opacity-70">{d}</span>
                    </button>
                  ))}
                </div>
              )}
            </Popup>
          )}
        </div>

        {/* Volume */}
        <div className="relative">
          <button onClick={() => toggle('volume')} className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ background: activePopup === 'volume' ? 'rgba(255,255,255,0.1)' : '' }} title={`Volume: ${isMuted ? 'Muted' : volume + '%'}`}>
            <VolumeIcon size={12} className={isMuted ? 'opacity-30' : 'opacity-70'} />
          </button>
          {activePopup === 'volume' && (
            <Popup>
              <div className="p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Volume</span>
                  <button onClick={() => setIsMuted(v => !v)} className="text-[10px] opacity-40 hover:opacity-70 transition-opacity">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeX size={12} className="opacity-30 flex-shrink-0" />
                  <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
                    onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
                    className="flex-1 accent-orange-500 h-1 cursor-pointer" />
                  <Volume2 size={12} className="opacity-30 flex-shrink-0" />
                </div>
                <div className="text-center text-[11px] font-mono" style={{ color: theme.accent }}>
                  {isMuted ? 'Muted' : `${volume}%`}
                </div>
                <div className="border-t border-white/06 pt-2">
                  <p className="text-[10px] opacity-30 mb-1.5">Output</p>
                  {['Built-in Speakers', 'Headphones'].map(d => (
                    <button key={d} className="w-full flex items-center gap-2 px-1 py-1 rounded hover:bg-white/05 text-left">
                      <div className="w-1 h-1 rounded-full" style={{ background: d === 'Built-in Speakers' ? theme.accent : 'rgba(255,255,255,0.2)' }} />
                      <span className="text-[11px] opacity-60">{d}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Popup>
          )}
        </div>

        {/* WiFi */}
        <div className="relative">
          <button onClick={() => toggle('wifi')} className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ background: activePopup === 'wifi' ? 'rgba(255,255,255,0.1)' : '' }} title="Network">
            {wifiOn ? <Wifi size={12} className="text-green-400/80" /> : <WifiOff size={12} className="opacity-30" />}
          </button>
          {activePopup === 'wifi' && (
            <Popup>
              <div className="px-3 py-2 border-b border-white/08">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Wi-Fi</span>
                  <button onClick={() => setWifiOn(v => !v)}
                    className="w-9 h-5 rounded-full transition-all relative"
                    style={{ background: wifiOn ? '#22c55e' : 'rgba(255,255,255,0.12)' }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: wifiOn ? '18px' : '2px' }} />
                  </button>
                </div>
              </div>
              {wifiOn && (
                <div className="p-2">
                  <p className="text-[10px] opacity-30 px-1 mb-1">Networks</p>
                  {[
                    { name: 'WebLinuxOS_5G', signal: 4 },
                    { name: 'Home Network', signal: 3 },
                    { name: 'Guest WiFi', signal: 2 },
                  ].map((n, i) => (
                    <button key={n.name} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/05 transition-colors text-left">
                      <div className="flex gap-px items-end flex-shrink-0">
                        {[1, 2, 3, 4].map(bar => (
                          <div key={bar} className="w-1 rounded-sm" style={{ height: bar * 3, background: bar <= n.signal ? (i === 0 ? theme.accent : 'rgba(255,255,255,0.5)') : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <span className="text-xs flex-1" style={{ color: i === 0 ? theme.accent : 'rgba(255,255,255,0.6)' }}>{n.name}</span>
                      {i === 0 && <span className="text-[9px] text-green-400">Connected</span>}
                    </button>
                  ))}
                </div>
              )}
            </Popup>
          )}
        </div>

        {/* Battery */}
        <div className="relative hidden sm:block">
          <button onClick={() => toggle('battery')} className="p-1 rounded hover:bg-white/10 transition-colors flex items-center gap-0.5"
            style={{ background: activePopup === 'battery' ? 'rgba(255,255,255,0.1)' : '' }} title={battery ? `${battery.level}%` : 'Battery'}>
            <BatteryIcon size={12} className={batteryColor} />
            {battery && <span className="text-[9px] opacity-50">{battery.level}%</span>}
          </button>
          {activePopup === 'battery' && (
            <Popup>
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Battery</span>
                  {battery?.charging && <span className="text-[10px] text-green-400">Charging</span>}
                </div>
                {battery ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${battery.level}%`, background: battery.level > 40 ? '#22c55e' : battery.level > 20 ? '#eab308' : '#ef4444' }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: batteryColor.includes('green') ? '#4ade80' : batteryColor.includes('yellow') ? '#facc15' : '#f87171' }}>
                        {battery.level}%
                      </span>
                    </div>
                    <p className="text-[10px] opacity-30">{battery.charging ? 'Plugged in — charging' : 'On battery power'}</p>
                  </>
                ) : (
                  <p className="text-xs opacity-40">Battery info not available</p>
                )}
              </div>
            </Popup>
          )}
        </div>

        {/* Display / Brightness */}
        <button onClick={() => openWindow('settings')} className="p-1 rounded hover:bg-white/10 transition-colors hidden sm:block" title="Display settings">
          <Monitor size={12} className="opacity-50" />
        </button>

        {/* Theme */}
        <button onClick={toggleTheme} className="p-1 rounded hover:bg-white/10 transition-colors" title="Toggle theme">
          {dk ? <Sun size={12} className="text-yellow-400/70" /> : <Moon size={12} className="text-indigo-400" />}
        </button>

        {/* Notifications */}
        <button onClick={toggleNotificationCenter}
          className="relative p-1 rounded hover:bg-white/10 transition-colors"
          style={{ background: notificationCenterOpen ? `${theme.accent}20` : '' }} title="Notifications">
          <Bell size={12} style={{ color: notificationCenterOpen ? theme.accent : undefined }} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[13px] h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white px-0.5"
              style={{ background: theme.accent }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => toggle('user')}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors text-xs"
            style={{ background: activePopup === 'user' ? 'rgba(255,255,255,0.1)' : '' }}>
            {auth.userImage
              ? <img src={auth.userImage} alt="" className="w-4 h-4 rounded-full" />
              : <User size={12} />
            }
            <span className="hidden md:block max-w-[70px] truncate text-[11px]">{auth.isGuest ? 'Guest' : auth.userName}</span>
          </button>
          {activePopup === 'user' && (
            <Popup>
              <div className="px-3 py-2 border-b border-white/08">
                <p className="text-xs font-semibold text-white">{auth.isGuest ? 'Guest User' : auth.userName}</p>
                {auth.userEmail && <p className="text-[10px] text-white/40 truncate">{auth.userEmail}</p>}
              </div>
              <div className="p-1">
                <button onClick={() => { openWindow('settings'); setActivePopup(null); }} className="w-full px-3 py-1.5 flex items-center gap-2 text-xs text-white/60 hover:bg-white/05 rounded-lg transition-colors">
                  <Settings size={12} /> Settings
                </button>
                <button onClick={handleSignOut} className="w-full px-3 py-1.5 flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </Popup>
          )}
        </div>
      </div>

      {/* Clock popup */}
      {activePopup === 'clock' && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-[1100] rounded-xl overflow-hidden"
          style={{ background: 'rgba(14,14,24,0.97)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', minWidth: 200 }}>
          <div className="p-4 text-center">
            <div className="text-3xl font-mono font-bold" style={{ color: theme.accent }}>{safeFormat(time, 'HH:mm:ss')}</div>
            <div className="text-sm opacity-60 mt-1">{safeFormat(time, 'EEEE, MMMM d yyyy')}</div>
          </div>
          <div className="border-t border-white/06 p-2">
            <button onClick={() => { openWindow('clock'); setActivePopup(null); }} className="w-full text-xs opacity-40 hover:opacity-70 py-1">Open Clock app</button>
          </div>
        </div>
      )}
    </div>
  );
});
