'use client';
import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useOSStore } from '@/hooks/useOSStore';
import BootSequence        from '@/components/os/BootSequence';
import LoginScreen         from '@/components/os/LoginScreen';
import TopPanel            from '@/components/os/TopPanel';
import Dock                from '@/components/os/Dock';
import Taskbar             from '@/components/os/Taskbar';
import Desktop             from '@/components/os/Desktop';
import WindowManager       from '@/components/os/WindowManager';
import AppLauncher         from '@/components/os/AppLauncher';
import ContextMenu         from '@/components/os/ContextMenu';
import NotificationCenter, { NotificationToasts } from '@/components/os/NotificationCenter';
import NotificationTrigger from '@/components/os/NotificationTrigger';

export default function OS() {
  const { data: session, status } = useSession();
  const { bootPhase, theme, auth, setBootPhase, login, initDock, setTheme } = useOSStore();

  // ── Boot sequence ──────────────────────────────────────────
  useEffect(() => {
    if (bootPhase === 'off') setBootPhase('booting');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync NextAuth session → OS store ──────────────────────
  useEffect(() => {
    if (status === 'loading' || bootPhase === 'off' || bootPhase === 'booting') return;
    if (status === 'authenticated' && session?.user) {
      login({
        isAuthenticated: true,
        isGuest: false,
        userId: session.user.id,
        userName: session.user.name || 'User',
        userEmail: session.user.email || null,
        userImage: session.user.image || null,
      });
      loadSettings(session.user.id);
    } else if (status === 'unauthenticated' && !auth.isGuest) {
      setBootPhase('login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, bootPhase]);

  const loadSettings = useCallback(async (_userId: string) => {
    try {
      const res = await fetch('/api/sync/settings');
      const { settings } = await res.json();
      if (settings) {
        const localTheme = (() => {
          try { const t = localStorage.getItem('wlos_theme'); return t ? JSON.parse(t) : null; }
          catch { return null; }
        })();
        setTheme({
          mode:      settings.themeMode   || localTheme?.mode,
          accent:    settings.accentColor || localTheme?.accent,
          wallpaper: localTheme?.wallpaper || settings.wallpaper,
        });
        if (settings.dockPinned) initDock(settings.dockPinned);
      }
    } catch { /* offline — localStorage serves as fallback */ }
  }, [setTheme, initDock]);

  // ── Apply theme to <html> ─────────────────────────────────
  useEffect(() => {
    document.documentElement.className = theme.mode;
    document.documentElement.style.setProperty('--accent',    theme.accent);
    document.documentElement.style.setProperty('--wallpaper', `url(${theme.wallpaper})`);
  }, [theme]);

  const onBootComplete = useCallback(() => setBootPhase('login'), [setBootPhase]);

  // ── Wallpaper style ────────────────────────────────────────
  const wallBg = theme.wallpaper
    ? { backgroundImage: `url(${theme.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : { background: 'linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 40%,#0d1a2e 100%)' };

  if (bootPhase === 'off' || bootPhase === 'booting') {
    return <BootSequence onComplete={onBootComplete} />;
  }

  if (bootPhase === 'login' || (!auth.isAuthenticated && !auth.isGuest)) {
    return (
      <div className="fixed inset-0" style={wallBg}>
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={wallBg}>
      {/* Subtle readability vignette — much lighter so wallpapers are visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: theme.mode === 'dark'
            ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.18) 100%)'
            : 'rgba(255,255,255,0.08)',
        }}
      />

      {/* OS Shell */}
      <div className="relative z-0 w-full h-full">
        <TopPanel />
        <Desktop />
        <WindowManager />
        <Dock />
        <Taskbar />
        <AppLauncher />
        <ContextMenu />
        <NotificationCenter />
        <NotificationToasts />
        <NotificationTrigger />
      </div>
    </div>
  );
}
