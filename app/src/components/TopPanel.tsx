// ============================================================
// TopPanel — Activities, clock, system tray with safe dates
// ============================================================

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Wifi, Volume2, BatteryFull, Power, BellRing } from 'lucide-react';
import { useOS } from '@/hooks/useOSStore';

const safeFormat = (date: Date, type: 'time' | 'date'): string => {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '—';
    if (type === 'time') {
      return date.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
};

const TopPanel = memo(function TopPanel() {
  const { state, dispatch } = useOS();
  const [time, setTime] = useState(() => new Date());
  const [volume, setVolume] = useState(80);
  const [sysMenuOpen, setSysMenuOpen] = useState(false);
  const [volMenuOpen, setVolMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setSysMenuOpen(false);
      if (volRef.current && !volRef.current.contains(e.target as Node)) setVolMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = state.notifications.filter(n => !n.isRead).length;

  const formattedTime = safeFormat(time, 'time');
  const formattedDate = safeFormat(time, 'date');

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-2 select-none"
      style={{
        height: 28,
        background: 'rgba(20,20,20,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        color: '#E0E0E0',
      }}
    >
      {/* Left: Activities + App name */}
      <div className="flex items-center">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_APP_LAUNCHER' })}
          className="h-7 px-3 rounded text-xs font-medium hover:bg-white/[0.08] transition-colors"
          style={{ color: '#E0E0E0' }}
        >
          Activities
        </button>
        {state.activeWindowId && (() => {
          const win = state.windows.find(w => w.id === state.activeWindowId);
          return win ? (
            <span className="text-xs text-white/50 ml-1">{win.title}</span>
          ) : null;
        })()}
      </div>

      {/* Center: Clock */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATION_CENTER' })}
        className="absolute left-1/2 -translate-x-1/2 h-7 px-3 rounded text-xs font-medium hover:bg-white/[0.08] transition-colors group"
        title={formattedDate}
      >
        <span style={{ color: '#E0E0E0' }}>{formattedTime}</span>
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none z-[5000]"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#E0E0E0',
            opacity: 0,
            transition: 'opacity 150ms ease',
          }}
          ref={el => {
            if (el) {
              el.parentElement?.addEventListener('mouseenter', () => el.style.opacity = '1');
              el.parentElement?.addEventListener('mouseleave', () => el.style.opacity = '0');
            }
          }}
        >
          {formattedDate}
        </div>
      </button>

      {/* Right: System tray */}
      <div className="flex items-center gap-0.5">
        {/* Notification bell */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATION_CENTER' })}
          className="relative h-7 px-1.5 rounded hover:bg-white/[0.08] transition-colors flex items-center"
          title="Notifications"
        >
          <BellRing size={13} style={{ color: unreadCount > 0 ? '#FFB74D' : '#9E9E9E' }} />
          {unreadCount > 0 && (
            <div
              className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: '#F44336', padding: '0 3px' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        {/* Wifi */}
        <button className="h-7 px-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Network">
          <Wifi size={13} style={{ color: '#9E9E9E' }} />
        </button>

        {/* Volume */}
        <div className="relative" ref={volRef}>
          <button
            onClick={() => setVolMenuOpen(v => !v)}
            className="h-7 px-1.5 rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1"
            title="Volume"
          >
            <Volume2 size={13} style={{ color: '#9E9E9E' }} />
          </button>
          {volMenuOpen && (
            <div
              className="absolute top-full right-0 mt-1 p-3 rounded-xl z-[5000]"
              style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', width: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Volume2 size={14} style={{ color: '#9E9E9E' }} />
                <span className="text-xs text-white/70">Volume</span>
                <span className="text-xs text-white/50 ml-auto">{volume}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
            </div>
          )}
        </div>

        {/* Battery */}
        <button className="h-7 px-1.5 rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1" title="Battery">
          <BatteryFull size={13} style={{ color: '#9E9E9E' }} />
          <span style={{ fontSize: 10, color: '#9E9E9E' }}>100%</span>
        </button>

        {/* Power / System menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setSysMenuOpen(v => !v)}
            className="h-7 w-8 rounded hover:bg-white/[0.08] transition-colors flex items-center justify-center"
            title="System"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C4DFF,#4A148C)' }}>
              <span className="text-white font-bold" style={{ fontSize: 10 }}>
                {state.auth.userName[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </button>

          {sysMenuOpen && (
            <div
              className="absolute top-full right-0 mt-1 py-2 rounded-xl z-[5000]"
              style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', width: 256, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'menuAppear 120ms ease' }}
            >
              {/* User */}
              <div className="flex items-center gap-3 px-4 py-2 mb-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C4DFF,#4A148C)' }}>
                  <span className="text-white font-bold text-sm">{state.auth.userName[0]?.toUpperCase() || 'U'}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{state.auth.userName}</div>
                  <div className="text-[10px] text-white/40">{state.auth.isGuest ? 'Guest' : 'Standard User'}</div>
                </div>
                <button
                  className="ml-auto w-7 h-7 rounded flex items-center justify-center hover:bg-white/[0.08]"
                  onClick={() => { setSysMenuOpen(false); dispatch({ type: 'OPEN_WINDOW', appId: 'settings' }); }}
                  title="Settings"
                >
                  <span style={{ fontSize: 14 }}>⚙</span>
                </button>
              </div>

              <div className="mx-3 my-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Quick toggles */}
              {[
                { label: 'Wi-Fi', icon: '📶', value: true },
                { label: 'Bluetooth', icon: '🔵', value: false },
                { label: 'Dark Mode', icon: '🌙', value: state.theme.mode === 'dark', action: () => dispatch({ type: 'TOGGLE_THEME' }) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.06] cursor-pointer"
                  onClick={item.action}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span className="text-sm text-white/80 flex-1">{item.label}</span>
                  <div
                    className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ background: item.value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.15)' }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: item.value ? 'calc(100% - 18px)' : '2px' }}
                    />
                  </div>
                </div>
              ))}

              <div className="mx-3 my-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/[0.06] transition-colors text-left"
                onClick={() => { setSysMenuOpen(false); dispatch({ type: 'LOGOUT' }); }}
              >
                <Power size={14} style={{ color: '#F44336' }} />
                <span className="text-white/80">Log Out</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/[0.06] transition-colors text-left"
                onClick={() => setSysMenuOpen(false)}
              >
                <span style={{ fontSize: 14 }}>⏻</span>
                <span className="text-white/80">Power Off / Restart</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes menuAppear {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
});

export default TopPanel;
