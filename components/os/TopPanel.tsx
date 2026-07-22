'use client';
import { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  Bell, Wifi, WifiOff, Volume2, VolumeX, Volume1,
  CloudUpload, Loader2, Search, LogOut, Sun, Moon, User,
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  Bluetooth, BluetoothOff, Settings, Monitor, Moon as MoonIcon
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

function useBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    (navigator as Navigator & { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: (ev: string, cb: () => void) => void }> })
      .getBattery().then((bat) => {
        setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        const update = () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        bat.addEventListener('levelchange', update);
        bat.addEventListener('chargingchange', update);
      }).catch(() => {});
  }, []);
  return battery;
}

export default memo(function TopPanel() {
  const {
    theme, notifications, notificationCenterOpen, auth, isSyncing,
    toggleNotificationCenter, setAppLauncher, toggleTheme, logout, openWindow,
    doNotDisturb, setDoNotDisturb,
  } = useOSStore();
  const [time, setTime] = useState(new Date());
  const [activePopup, setActivePopup] = useState<'volume' | 'wifi' | 'battery' | 'bluetooth' | 'user' | 'clock' | null>(null);
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
  const dk  = theme.mode === 'dark';
  const bg  = dk ? 'rgba(12,12,22,0.95)' : 'rgba(238,238,248,0.95)';
  const txt = dk ? 'text-white/80' : 'text-gray-800';

  // Theme-aware popup style
  const popupBg     = dk ? 'rgba(14,14,26,0.97)' : 'rgba(248,248,254,0.97)';
  const popupBorder = dk ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';
  const popupTxt    = dk ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.80)';
  const popupMuted  = dk ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const hoverBg     = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  const Popup = ({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) => {
    const offset = align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';
    return (
      <div
        className={`absolute top-full mt-1.5 z-[1100] ${offset} min-w-[220px] rounded-xl overflow-hidden`}
        style={{
          background: popupBg,
          border: `1px solid ${popupBorder}`,
          boxShadow: dk ? '0 16px 48px rgba(0,0,0,0.65)' : '0 16px 48px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(24px) saturate(180%)',
          animation: 'popupIn 0.16s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {children}
      </div>
    );
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-9 h-5 rounded-full transition-all flex-shrink-0 relative"
      style={{ background: on ? theme.accent : (dk ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)') }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: on ? '18px' : '2px' }}
      />
    </button>
  );

  const BatteryIcon = battery?.charging
    ? BatteryCharging
    : !battery ? Battery
      : battery.level > 60 ? BatteryFull
        : battery.level > 30 ? BatteryMedium
          : BatteryLow;

  const batteryColor = battery
    ? battery.level > 40 ? 'text-green-400' : battery.level > 20 ? 'text-yellow-400' : 'text-red-400'
    : (dk ? 'text-white/40' : 'text-gray-400');

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 40 ? Volume1 : Volume2;

  const iconBtn = `p-1 rounded transition-colors ${dk ? 'hover:bg-white/10' : 'hover:bg-black/08'}`;

  return (
    <div
      ref={panelRef}
      className={`fixed top-0 left-0 right-0 z-[900] h-7 flex items-center px-3 select-none ${txt}`}
      style={{ background: bg, backdropFilter: 'blur(20px) saturate(180%)', borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}` }}
    >
      {/* Left — Logo */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => setAppLauncher(true)}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-opacity ${iconBtn}`}
          style={{ color: theme.accent }}
        >
          <svg width="16" height="16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="9"  r="9"  fill="currentColor"/>
            <circle cx="14" cy="71" r="9"  fill="currentColor"/>
            <circle cx="86" cy="71" r="9"  fill="currentColor"/>
            <path d="M50 18 A32 32 0 0 1 77.7 64" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M77.7 64 A32 32 0 0 1 22.3 64" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M22.3 64 A32 32 0 0 1 50 18" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
          </svg>
          <span className="hidden sm:block">WebLinuxOS</span>
        </button>
      </div>

      {/* Center — Clock */}
      <button
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
        onClick={() => toggle('clock')}
      >
        <span style={{ color: dk ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)' }}>
          {safeFormat(time, 'EEE MMM d')}
        </span>
        <span className="font-mono font-bold" style={{ color: theme.accent }}>
          {safeFormat(time, 'HH:mm:ss')}
        </span>
      </button>

      {/* Right — System tray */}
      <div className="flex items-center gap-0.5 flex-1 justify-end relative">
        {/* Syncing */}
        {isSyncing && (
          <div className="flex items-center gap-1 text-[10px] text-green-400 px-1.5">
            <Loader2 size={11} className="animate-spin" />
            <span className="hidden sm:block">Syncing</span>
          </div>
        )}
        {!isSyncing && auth.isAuthenticated && !auth.isGuest && (
          <CloudUpload size={12} className="text-green-400/50 mr-0.5" title="Cloud sync active" />
        )}

        {/* DND indicator */}
        {doNotDisturb && (
          <MoonIcon size={11} className="text-yellow-400 mr-0.5" title="Do Not Disturb on" />
        )}

        {/* Search */}
        <button onClick={() => setAppLauncher(true)} className={iconBtn} title="Search">
          <Search size={12} />
        </button>

        {/* Bluetooth */}
        <div className="relative">
          <button onClick={() => toggle('bluetooth')} className={iconBtn} title="Bluetooth"
            style={{ background: activePopup === 'bluetooth' ? hoverBg : '' }}>
            {btOn ? <Bluetooth size={12} className="text-blue-400" /> : <BluetoothOff size={12} className={dk ? 'opacity-30' : 'opacity-40'} />}
          </button>
          {activePopup === 'bluetooth' && (
            <Popup>
              <div className="px-3 py-2 border-b" style={{ borderColor: popupBorder }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: popupTxt }}>Bluetooth</span>
                  <Toggle on={btOn} onClick={() => setBtOn(v => !v)} />
                </div>
              </div>
              {btOn && (
                <div className="p-2">
                  <p className="text-[10px] px-1 mb-1" style={{ color: popupMuted }}>Devices</p>
                  {['MacBook Pro', 'AirPods Pro'].map(d => (
                    <button key={d} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left"
                      style={{ color: popupTxt }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs" style={{ color: popupMuted }}>{d}</span>
                    </button>
                  ))}
                </div>
              )}
            </Popup>
          )}
        </div>

        {/* Volume */}
        <div className="relative">
          <button onClick={() => toggle('volume')} className={iconBtn} title={`Volume: ${isMuted ? 'Muted' : volume + '%'}`}
            style={{ background: activePopup === 'volume' ? hoverBg : '' }}>
            <VolumeIcon size={12} className={isMuted ? (dk ? 'opacity-30' : 'opacity-40') : (dk ? 'opacity-70' : 'opacity-80')} />
          </button>
          {activePopup === 'volume' && (
            <Popup>
              <div className="p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: popupTxt }}>Volume</span>
                  <button onClick={() => setIsMuted(v => !v)} className="text-[10px] transition-opacity hover:opacity-80"
                    style={{ color: theme.accent }}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeX size={12} style={{ color: popupMuted }} className="flex-shrink-0" />
                  <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
                    onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
                    className="flex-1 h-1 cursor-pointer" style={{ accentColor: theme.accent }} />
                  <Volume2 size={12} style={{ color: popupMuted }} className="flex-shrink-0" />
                </div>
                <div className="text-center text-[11px] font-mono" style={{ color: theme.accent }}>
                  {isMuted ? 'Muted' : `${volume}%`}
                </div>
                <div className="border-t pt-2" style={{ borderColor: popupBorder }}>
                  <p className="text-[10px] mb-1.5" style={{ color: popupMuted }}>Output</p>
                  {['Built-in Speakers', 'Headphones'].map((d, i) => (
                    <button key={d} className="w-full flex items-center gap-2 px-1 py-1 rounded transition-colors text-left"
                      style={{ color: popupTxt }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                      <div className="w-1 h-1 rounded-full" style={{ background: i === 0 ? theme.accent : (dk ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') }} />
                      <span className="text-[11px]" style={{ color: popupMuted }}>{d}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Popup>
          )}
        </div>

        {/* WiFi */}
        <div className="relative">
          <button onClick={() => toggle('wifi')} className={iconBtn} title="Network"
            style={{ background: activePopup === 'wifi' ? hoverBg : '' }}>
            {wifiOn ? <Wifi size={12} className="text-green-400/80" /> : <WifiOff size={12} className={dk ? 'opacity-30' : 'opacity-40'} />}
          </button>
          {activePopup === 'wifi' && (
            <Popup>
              <div className="px-3 py-2 border-b" style={{ borderColor: popupBorder }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: popupTxt }}>Wi-Fi</span>
                  <Toggle on={wifiOn} onClick={() => setWifiOn(v => !v)} />
                </div>
              </div>
              {wifiOn && (
                <div className="p-2">
                  <p className="text-[10px] px-1 mb-1" style={{ color: popupMuted }}>Networks</p>
                  {[
                    { name: 'WebLinuxOS_5G', signal: 4 },
                    { name: 'Home Network', signal: 3 },
                    { name: 'Guest WiFi', signal: 2 },
                  ].map((n, i) => (
                    <button key={n.name} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left"
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                      <div className="flex gap-px items-end flex-shrink-0">
                        {[1,2,3,4].map(bar => (
                          <div key={bar} className="w-1 rounded-sm" style={{ height: bar*3, background: bar <= n.signal ? (i === 0 ? theme.accent : (dk ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')) : (dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }} />
                        ))}
                      </div>
                      <span className="text-xs flex-1" style={{ color: i === 0 ? theme.accent : popupTxt }}>{n.name}</span>
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
          <button onClick={() => toggle('battery')} className={`${iconBtn} flex items-center gap-0.5`} title={battery ? `${battery.level}%` : 'Battery'}
            style={{ background: activePopup === 'battery' ? hoverBg : '' }}>
            <BatteryIcon size={12} className={batteryColor} />
            {battery && <span className="text-[9px]" style={{ color: dk ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{battery.level}%</span>}
          </button>
          {activePopup === 'battery' && (
            <Popup>
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: popupTxt }}>Battery</span>
                  {battery?.charging && <span className="text-[10px] text-green-400">Charging</span>}
                </div>
                {battery ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', border: `1px solid ${popupBorder}` }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${battery.level}%`, background: battery.level > 40 ? '#22c55e' : battery.level > 20 ? '#eab308' : '#ef4444' }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: theme.accent }}>{battery.level}%</span>
                    </div>
                    <p className="text-[10px]" style={{ color: popupMuted }}>{battery.charging ? 'Plugged in — charging' : 'On battery power'}</p>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: popupMuted }}>Battery info not available</p>
                )}
              </div>
            </Popup>
          )}
        </div>

        {/* Display */}
        <button onClick={() => openWindow('settings')} className={`${iconBtn} hidden sm:block`} title="Display settings">
          <Monitor size={12} className={dk ? 'opacity-50' : 'opacity-60'} />
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className={iconBtn} title="Toggle theme">
          {dk
            ? <Sun size={12} className="text-yellow-400/70" />
            : <Moon size={12} className="text-indigo-500" />
          }
        </button>

        {/* Notifications bell */}
        <button
          onClick={toggleNotificationCenter}
          className={`relative ${iconBtn}`}
          style={{ background: notificationCenterOpen ? `${theme.accent}20` : '' }}
          title="Notifications"
        >
          <Bell size={12} style={{ color: notificationCenterOpen ? theme.accent : undefined }} />
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[13px] h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white px-0.5"
              style={{ background: theme.accent }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => toggle('user')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${dk ? 'hover:bg-white/10' : 'hover:bg-black/08'} transition-colors`}
            style={{ background: activePopup === 'user' ? hoverBg : '' }}
          >
            {auth.userImage
              ? <img src={auth.userImage} alt="" className="w-4 h-4 rounded-full" />
              : <User size={12} />
            }
            <span className="hidden md:block max-w-[70px] truncate text-[11px]">{auth.isGuest ? 'Guest' : auth.userName}</span>
          </button>
          {activePopup === 'user' && (
            <Popup>
              <div className="px-3 py-2 border-b" style={{ borderColor: popupBorder }}>
                <p className="text-xs font-semibold" style={{ color: popupTxt }}>{auth.isGuest ? 'Guest User' : auth.userName}</p>
                {auth.userEmail && <p className="text-[10px] truncate" style={{ color: popupMuted }}>{auth.userEmail}</p>}
              </div>
              <div className="p-1">
                {[
                  { label: 'Settings', icon: <Settings size={12} />, action: () => { openWindow('settings'); setActivePopup(null); } },
                  { label: doNotDisturb ? 'Turn Off DND' : 'Do Not Disturb', icon: <MoonIcon size={12} />, action: () => { setDoNotDisturb(!doNotDisturb); setActivePopup(null); } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full px-3 py-1.5 flex items-center gap-2 text-xs rounded-lg transition-colors"
                    style={{ color: popupTxt }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-xs text-red-400 rounded-lg transition-colors"
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </Popup>
          )}
        </div>
      </div>

      {/* Clock popup */}
      {activePopup === 'clock' && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-[1100] rounded-xl overflow-hidden min-w-[200px]"
          style={{ background: popupBg, border: `1px solid ${popupBorder}`, boxShadow: dk ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.15)', backdropFilter: 'blur(20px)' }}
        >
          <div className="p-4 text-center">
            <div className="text-3xl font-mono font-bold" style={{ color: theme.accent }}>{safeFormat(time, 'HH:mm:ss')}</div>
            <div className="text-sm mt-1" style={{ color: popupMuted }}>{safeFormat(time, 'EEEE, MMMM d yyyy')}</div>
          </div>
          <div className="border-t p-2" style={{ borderColor: popupBorder }}>
            <button
              onClick={() => { openWindow('clock'); setActivePopup(null); }}
              className="w-full text-xs py-1 rounded transition-colors"
              style={{ color: popupMuted }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
            >
              Open Clock app
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
