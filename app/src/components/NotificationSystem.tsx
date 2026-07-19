// ============================================================
// NotificationSystem — Toast stack + auto-generate notifications
// ============================================================

import { useEffect, useState, memo, useCallback, useRef } from 'react';
import { X, Bell } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useOS } from '@/hooks/useOSStore';
import type { Notification } from '@/types';

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Bell {...props} />;
};

// ---- System Notification Definitions ----
const SYSTEM_NOTIFS = [
  { appId: 'system', appName: 'System', appIcon: 'Monitor', title: 'WebLinuxOS v2.0.0', message: 'System is up to date. All services running normally.' },
  { appId: 'system', appName: 'Security', appIcon: 'Shield', title: 'System Scan Complete', message: 'No threats detected. Your system is secure.' },
  { appId: 'system', appName: 'Updates', appIcon: 'Download', title: 'Updates Available', message: '3 package updates are ready to install.' },
  { appId: 'calendar', appName: 'Calendar', appIcon: 'Calendar', title: 'Reminder', message: 'Daily standup meeting in 15 minutes.' },
  { appId: 'system', appName: 'Storage', appIcon: 'HardDrive', title: 'Storage Notice', message: 'You have 21 GB used of 50 GB available.' },
  { appId: 'system', appName: 'Network', appIcon: 'Wifi', title: 'Connected', message: 'You are connected to the internet.' },
  { appId: 'terminal', appName: 'Terminal', appIcon: 'Terminal', title: 'Task Completed', message: 'Background process finished successfully.' },
  { appId: 'chat', appName: 'OS Assistant', appIcon: 'Bot', title: 'Hello, Nova!', message: 'WebLinuxOS is ready. Open the Chat app to ask me anything.' },
];

// ---- Toast Component ----
interface ToastProps {
  notification: Notification;
  index: number;
  onClose: () => void;
}

const Toast = memo(function Toast({ notification: n, index, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [hovered, setHovered] = useState(false);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  useEffect(() => {
    if (hovered) return;
    const DURATION = 5000;
    const STEP = 50;
    const dec = (STEP / DURATION) * 100;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p <= dec) { clearInterval(timer); dismiss(); return 0; }
        return p - dec;
      });
    }, STEP);
    return () => clearInterval(timer);
  }, [hovered, dismiss]);

  const safeTime = (() => {
    try {
      const d = new Date(n.timestamp);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  })();

  return (
    <div
      className="w-[360px] overflow-hidden"
      style={{
        background: 'rgba(32,32,32,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        padding: '12px 14px 10px',
        marginBottom: 8,
        animation: exiting ? 'toastOut 250ms ease forwards' : 'toastIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(124,77,255,0.2)' }}>
          <DynamicIcon name={n.appIcon} size={16} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] font-bold text-white/50">{n.appName}</span>
            <span className="text-[10px] text-white/25 ml-auto">{safeTime}</span>
            <button
              onClick={dismiss}
              className="w-4 h-4 rounded flex items-center justify-center text-white/30 hover:text-white/70 ml-1"
            >
              <X size={10} />
            </button>
          </div>
          <p className="text-xs font-semibold text-white/90 leading-tight">{n.title}</p>
          <p className="text-[11px] text-white/55 mt-0.5 line-clamp-2">{n.message}</p>
        </div>
      </div>
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] rounded-b-xl transition-none"
        style={{ width: `${progress}%`, background: 'var(--accent-primary)', opacity: 0.6 }}
      />
    </div>
  );
});

// ---- Main Component ----
const NotificationSystem = memo(function NotificationSystem() {
  const { state, dispatch } = useOS();
  const [toasts, setToasts] = useState<Notification[]>([]);
  const seenRef = useRef(new Set<string>());
  const notifQueueRef = useRef<Notification[]>([]);
  const notifTimersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  // Show new notifications as toasts
  useEffect(() => {
    const newest = state.notifications.filter(n => !seenRef.current.has(n.id)).slice(0, 3);
    if (newest.length === 0) return;
    newest.forEach(n => seenRef.current.add(n.id));
    if (!state.notificationCenterOpen) {
      setToasts(prev => [...newest, ...prev].slice(0, 5));
    }
  }, [state.notifications, state.notificationCenterOpen]);

  // Auto-generate system notifications after login
  useEffect(() => {
    if (!state.auth.isAuthenticated) return;

    // Clear any existing timers
    notifTimersRef.current.forEach(clearTimeout);
    notifTimersRef.current = [];

    // Queue up system notifications at staggered times
    const delays = [1500, 4000, 8000, 18000, 35000];
    delays.forEach((delay, i) => {
      const notif = SYSTEM_NOTIFS[i % SYSTEM_NOTIFS.length];
      const timer = setTimeout(() => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          notification: { ...notif, isRead: false },
        });
      }, delay);
      notifTimersRef.current.push(timer as unknown as ReturnType<typeof setInterval>);
    });

    return () => notifTimersRef.current.forEach(clearTimeout);
  }, [state.auth.isAuthenticated, dispatch]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[3000] flex flex-col items-end pointer-events-none"
      style={{ top: 36, right: 12 }}
    >
      {toasts.map((t, i) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            notification={t}
            index={i}
            onClose={() => dismissToast(t.id)}
          />
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0); max-height: 100px; }
          to { opacity: 0; transform: translateX(60px); max-height: 0; padding: 0; margin: 0; }
        }
      `}</style>
    </div>
  );
});

export default NotificationSystem;
