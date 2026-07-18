'use client';
import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useOSStore } from '@/hooks/useOSStore';
import BootSequence from '@/components/os/BootSequence';
import LoginScreen from '@/components/os/LoginScreen';
import TopPanel from '@/components/os/TopPanel';
import Dock from '@/components/os/Dock';
import Desktop from '@/components/os/Desktop';
import WindowManager from '@/components/os/WindowManager';
import AppLauncher from '@/components/os/AppLauncher';
import ContextMenu from '@/components/os/ContextMenu';
import NotificationCenter, { NotificationToasts } from '@/components/os/NotificationCenter';

export default function OS() {
  const { data: session, status } = useSession();
  const { bootPhase, theme, auth, setBootPhase, login, initDock, setTheme } = useOSStore();

  // ── Boot sequence ────────────────────────────────────────────
  useEffect(() => {
    if (bootPhase === 'off') {
      setBootPhase('booting');
    }
  }, []);

  // ── Sync session → OS store ──────────────────────────────────
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
      // Load cloud settings
      loadSettings(session.user.id);
    } else if (status === 'unauthenticated' && !auth.isGuest) {
      setBootPhase('login');
    }
  }, [session, status, bootPhase]);

  const loadSettings = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/sync/settings');
      const { settings } = await res.json();
      if (settings) {
        setTheme({ mode: settings.themeMode, accent: settings.accentColor, wallpaper: settings.wallpaper });
        initDock(settings.dockPinned);
      }
    } catch { /* offline */ }
  }, [setTheme, initDock]);

  // ── Theme class on <html> ────────────────────────────────────
  useEffect(() => {
    document.documentElement.className = theme.mode;
  }, [theme.mode]);

  // ── Wallpaper CSS var ────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty('--wallpaper', `url(${theme.wallpaper})`);
    document.documentElement.style.setProperty('--accent', theme.accent);
  }, [theme]);

  const onBootComplete = useCallback(() => {
    setBootPhase('login');
  }, [setBootPhase]);

  // ── Render ───────────────────────────────────────────────────
  if (bootPhase === 'off' || bootPhase === 'booting') {
    return <BootSequence onComplete={onBootComplete} />;
  }

  const wallBg = theme.wallpaper
    ? { backgroundImage: `url(${theme.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 40%, #0d1a2e 100%)' };

  if (bootPhase === 'login' || (!auth.isAuthenticated && !auth.isGuest)) {
    return (
      <div className="fixed inset-0" style={wallBg}>
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={wallBg}>
      {/* Subtle overlay for readability */}
      <div className="absolute inset-0" style={{ background: theme.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)' }} />

      {/* OS Shell */}
      <div className="relative z-0 w-full h-full">
        <TopPanel />
        <Desktop />
        <WindowManager />
        <Dock />
        <AppLauncher />
        <ContextMenu />
        <NotificationCenter />
        <NotificationToasts />
      </div>
    </div>
  );
}
