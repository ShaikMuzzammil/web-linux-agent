// ============================================================
// App.tsx — Main WebLinuxOS Shell (error-safe)
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { OSProvider, useOS } from '@/hooks/useOSStore';
import BootSequence from '@/components/BootSequence';
import LoginScreen from '@/components/LoginScreen';
import Desktop from '@/components/Desktop';
import TopPanel from '@/components/TopPanel';
import Dock from '@/components/Dock';
import AppLauncher from '@/components/AppLauncher';
import WindowManager from '@/components/WindowManager';
import ContextMenu from '@/components/ContextMenu';
import NotificationSystem from '@/components/NotificationSystem';
import NotificationCenter from '@/components/NotificationCenter';
import './App.css';

// ---- Alt-Tab Overlay ----
function AltTabOverlay() {
  const { state } = useOS();
  if (!state.isAltTabbing) return null;
  const visible = state.windows.filter(w => w.state !== 'minimized');

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="flex items-center gap-2 px-5 py-4 rounded-2xl"
        style={{
          background: 'rgba(28,28,28,0.94)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          animation: 'scaleIn 150ms ease',
        }}
      >
        {visible.map((w, i) => {
          const isSelected = i === state.altTabIndex;
          return (
            <div
              key={w.id}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
              style={{
                background: isSelected ? 'rgba(124,77,255,0.2)' : 'transparent',
                border: isSelected ? '1.5px solid rgba(124,77,255,0.6)' : '1.5px solid transparent',
                minWidth: 80,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {w.appId === 'terminal' ? '⌨️' :
                 w.appId === 'browser' ? '🌐' :
                 w.appId === 'filemanager' ? '📁' :
                 w.appId === 'settings' ? '⚙️' :
                 w.appId === 'calendar' ? '📅' :
                 w.appId === 'chat' ? '💬' :
                 w.appId === 'weather' ? '🌤️' :
                 w.appId === 'codeeditor' ? '💻' : '📱'}
              </div>
              <span
                className="text-[10px] font-medium text-center"
                style={{
                  color: isSelected ? '#E0E0E0' : '#9E9E9E',
                  maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {w.title}
              </span>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-xs text-white/40 px-4">No open windows</p>
        )}
      </div>
    </div>
  );
}

// ---- Main App Shell ----
function AppShell() {
  const { state, dispatch } = useOS();
  const { bootPhase, auth } = state;
  const [bootComplete, setBootComplete] = useState(false);
  const altHeld = useRef(false);

  // Kick off boot
  useEffect(() => {
    if (bootPhase === 'off') dispatch({ type: 'SET_BOOT_PHASE', phase: 'logo' });
  }, []);

  const handleBootComplete = useCallback(() => setBootComplete(true), []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_APP_LAUNCHER' });
        return;
      }
      if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        dispatch({ type: 'OPEN_WINDOW', appId: 'terminal' });
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        dispatch({ type: 'MINIMIZE_ALL' });
        return;
      }
      if (e.key === 'Alt') altHeld.current = true;
      if (e.key === 'Tab' && e.altKey) {
        e.preventDefault();
        if (!state.isAltTabbing) dispatch({ type: 'START_ALT_TAB' });
        else dispatch({ type: 'CYCLE_ALT_TAB' });
        return;
      }
      if (e.key === 'Escape') {
        if (state.appLauncherOpen) dispatch({ type: 'SET_APP_LAUNCHER', open: false });
        if (state.notificationCenterOpen) dispatch({ type: 'TOGGLE_NOTIFICATION_CENTER' });
        if (state.contextMenu.visible) dispatch({ type: 'HIDE_CONTEXT_MENU' });
      }
      if (e.ctrlKey && e.key === 'w' && state.activeWindowId) {
        e.preventDefault();
        dispatch({ type: 'CLOSE_WINDOW', windowId: state.activeWindowId });
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && state.isAltTabbing) {
        dispatch({ type: 'END_ALT_TAB' });
        altHeld.current = false;
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [dispatch, state.appLauncherOpen, state.notificationCenterOpen, state.isAltTabbing, state.activeWindowId, state.contextMenu.visible]);

  const showBoot    = bootPhase !== 'complete' && !bootComplete;
  const showLogin   = bootComplete && !auth.isAuthenticated;
  const showDesktop = bootComplete && auth.isAuthenticated;

  return (
    <div className={state.theme.mode === 'light' ? 'light' : ''} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {showBoot && <BootSequence onComplete={handleBootComplete} />}
      {showLogin && <LoginScreen />}
      {showDesktop && (
        <div className="relative w-full h-full" style={{ background: 'var(--bg-desktop)' }}>
          {/* Wallpaper */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${state.theme.wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
            }}
          />
          {/* Desktop icons */}
          <Desktop />
          {/* Windows */}
          <WindowManager />
          {/* UI shell */}
          <TopPanel />
          <Dock />
          {/* Overlays */}
          <AppLauncher />
          <ContextMenu />
          <NotificationSystem />
          <NotificationCenter />
          <AltTabOverlay />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <AppShell />
    </OSProvider>
  );
}
