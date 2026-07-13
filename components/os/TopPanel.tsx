'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { Bell, Wifi, Battery, Volume2, CloudUpload, Loader2, Search, LogOut, Sun, Moon, User } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { signOut } from 'next-auth/react';
import { format } from 'date-fns';

export default memo(function TopPanel() {
  const { theme, notifications, notificationCenterOpen, auth, isSyncing,
    toggleNotificationCenter, setAppLauncher, toggleTheme, logout } = useOSStore();
  const [time, setTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSignOut = useCallback(async () => {
    if (auth.isGuest) {
      logout();
    } else {
      await signOut({ redirect: false });
      logout();
    }
    setShowUserMenu(false);
  }, [auth.isGuest, logout]);

  const bg = theme.mode === 'dark'
    ? 'rgba(15,15,25,0.88)'
    : 'rgba(240,240,245,0.88)';
  const textColor = theme.mode === 'dark' ? 'text-white/80' : 'text-gray-800';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[900] h-7 flex items-center px-3 select-none ${textColor}`}
      style={{ background: bg, backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Left - App menu */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setAppLauncher(true)}
          className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
          style={{ color: theme.accent }}
        >
          <span className="text-sm">λ</span>
          <span className="hidden sm:block">WebLinuxOS</span>
        </button>

        {/* Active window title shown here in real OS but we skip */}
      </div>

      {/* Center - Clock */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-medium">
        <span>{format(time, 'EEE MMM d')}</span>
        <span className="font-mono" style={{ color: theme.accent }}>{format(time, 'HH:mm:ss')}</span>
      </div>

      {/* Right - System tray */}
      <div className="flex items-center gap-1 flex-1 justify-end">
        {/* Sync indicator */}
        {isSyncing && (
          <div className="flex items-center gap-1 text-[10px] text-purple-400 px-1.5">
            <Loader2 size={11} className="animate-spin" />
            <span className="hidden sm:block">Syncing</span>
          </div>
        )}
        {!isSyncing && auth.isAuthenticated && !auth.isGuest && (
          <CloudUpload size={12} className="text-green-400/60 mr-1" />
        )}

        {/* Search */}
        <button
          onClick={() => setAppLauncher(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <Search size={13} />
        </button>

        {/* Volume */}
        <button className="p-1 rounded hover:bg-white/10 transition-colors hidden sm:block">
          <Volume2 size={13} />
        </button>

        {/* Wifi */}
        <button className="p-1 rounded hover:bg-white/10 transition-colors">
          <Wifi size={13} className="text-green-400/70" />
        </button>

        {/* Battery */}
        <button className="p-1 rounded hover:bg-white/10 transition-colors hidden sm:block">
          <Battery size={13} className="text-green-400/70" />
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-1 rounded hover:bg-white/10 transition-colors">
          {theme.mode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotificationCenter}
          className="relative p-1 rounded hover:bg-white/10 transition-colors"
          style={{ background: notificationCenterOpen ? 'rgba(124,77,255,0.2)' : '' }}
        >
          <Bell size={13} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white px-0.5"
              style={{ background: theme.accent }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors text-xs"
          >
            {auth.userImage ? (
              <img src={auth.userImage} alt="" className="w-4 h-4 rounded-full" />
            ) : (
              <User size={13} />
            )}
            <span className="hidden md:block max-w-[80px] truncate">{auth.isGuest ? 'Guest' : auth.userName}</span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-[1000]" onClick={() => setShowUserMenu(false)} />
              <div
                className="absolute right-0 top-full mt-1 w-48 rounded-xl overflow-hidden z-[1001]"
                style={{ background: 'rgba(20,20,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-xs font-semibold text-white">{auth.isGuest ? 'Guest User' : auth.userName}</p>
                  {auth.userEmail && <p className="text-[10px] text-white/40 truncate">{auth.userEmail}</p>}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
