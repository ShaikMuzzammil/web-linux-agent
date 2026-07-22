'use client';
import { memo, useEffect, useRef } from 'react';
import { X, Bell, CheckCheck, AlertCircle, Info, CheckCircle, Trash2, AlertTriangle, Moon } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { format, isValid } from 'date-fns';
import type { OSNotification } from '@/types';

const safeFormat = (ts: number | string | Date, fmt: string): string => {
  try {
    const d = new Date(ts as number);
    if (!d || !isValid(d)) return '--';
    return format(d, fmt);
  } catch { return '--'; }
};

function NotifIcon({ type }: { type?: string }) {
  const map: Record<string, React.ReactNode> = {
    error:   <AlertCircle size={13} className="text-red-400" />,
    success: <CheckCircle size={13} className="text-green-400" />,
    warning: <AlertTriangle size={13} className="text-yellow-400" />,
    info:    <Info size={13} className="text-indigo-400" />,
  };
  return <>{map[type ?? 'info'] ?? map.info}</>;
}

function typeColor(type?: string) {
  const map: Record<string, string> = {
    error: '#ef4444', success: '#22c55e', warning: '#f59e0b', info: '#6366f1',
  };
  return map[type ?? 'info'] ?? map.info;
}

function NotificationItem({
  n, onDismiss, onRead, dk
}: { n: OSNotification; onDismiss: () => void; onRead: () => void; dk: boolean }) {
  const color = typeColor(n.type);
  return (
    <div
      onClick={onRead}
      className="group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
      style={{
        background: n.isRead
          ? 'transparent'
          : dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        border: n.isRead
          ? '1px solid transparent'
          : `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: color + '18' }}
      >
        <NotifIcon type={n.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-xs font-semibold leading-snug"
            style={{ color: dk ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)', opacity: n.isRead ? 0.55 : 1 }}
          >{n.title}</p>
          {!n.isRead && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />}
        </div>
        {n.message && (
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: dk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
            {n.message}
          </p>
        )}
        <p className="text-[10px] mt-1" style={{ color: dk ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)' }}>
          {safeFormat(n.timestamp, 'h:mm a')}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDismiss(); }}
        className="opacity-0 group-hover:opacity-50 hover:!opacity-90 transition-all flex-shrink-0 mt-0.5"
        style={{ color: dk ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
      >
        <X size={11} />
      </button>
    </div>
  );
}

export default memo(function NotificationCenter() {
  const {
    notifications, notificationCenterOpen, theme,
    toggleNotificationCenter, removeNotification,
    markNotificationRead, markAllNotificationsRead, clearNotifications,
    doNotDisturb,
  } = useOSStore();
  const ref = useRef<HTMLDivElement>(null);
  const dk = theme.mode === 'dark';

  useEffect(() => {
    if (!notificationCenterOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        toggleNotificationCenter();
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [notificationCenterOpen, toggleNotificationCenter]);

  if (!notificationCenterOpen) return null;

  const unread = notifications.filter(n => !n.isRead);
  const groups: Record<string, OSNotification[]> = {};
  notifications.forEach(n => {
    const key = safeFormat(n.timestamp, 'MMM d, yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  const panelBg    = dk ? 'rgba(14,14,26,0.97)' : 'rgba(248,248,252,0.97)';
  const borderCol  = dk ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';
  const headerText = dk ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.85)';
  const groupLabel = dk ? 'rgba(255,255,255,0.28)'  : 'rgba(0,0,0,0.30)';

  return (
    <div
      ref={ref}
      className="fixed right-2 top-9 w-80 max-h-[calc(100vh-100px)] z-[1050] rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: panelBg,
        backdropFilter: 'blur(28px) saturate(180%)',
        border: `1px solid ${borderCol}`,
        boxShadow: dk
          ? '0 20px 60px rgba(0,0,0,0.7)'
          : '0 20px 60px rgba(0,0,0,0.18)',
        animation: 'popupIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: borderCol }}
      >
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color: theme.accent }} />
          <span className="text-sm font-semibold" style={{ color: headerText }}>Notifications</span>
          {unread.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white"
              style={{ background: theme.accent }}
            >{unread.length}</span>
          )}
          {doNotDisturb && (
            <span className="flex items-center gap-1 text-[10px] text-yellow-400 px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <Moon size={8} /> DND
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="p-1 rounded transition-colors"
              style={{ color: dk ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
              title="Clear all"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={toggleNotificationCenter}
            className="p-1 rounded transition-colors"
            style={{ color: dk ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCheck size={28} style={{ color: dk ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }} />
            <p className="text-xs" style={{ color: dk ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)' }}>
              No notifications
            </p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groups).map(([date, items]) => (
              <div key={date} className="mb-2">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1"
                  style={{ color: groupLabel }}
                >{date}</p>
                <div className="flex flex-col gap-0.5">
                  {items.map(n => (
                    <NotificationItem
                      key={n.id}
                      n={n}
                      dk={dk}
                      onDismiss={() => removeNotification(n.id)}
                      onRead={() => markNotificationRead(n.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {unread.length > 0 && (
        <div className="border-t p-2 flex-shrink-0" style={{ borderColor: borderCol }}>
          <button
            onClick={markAllNotificationsRead}
            className="w-full py-1.5 rounded-xl text-[11px] font-medium transition-colors"
            style={{ color: theme.accent }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
});

// ─── Toast Notifications ─────────────────────────────────────────────────────
export const NotificationToasts = memo(function NotificationToasts() {
  const { notifications, theme, removeNotification, doNotDisturb } = useOSStore();
  const shown = useRef<Set<string>>(new Set());
  const dk = theme.mode === 'dark';

  if (doNotDisturb) return null;

  const recent = notifications.filter(
    n => !n.isRead && Date.now() - n.timestamp < 5000 && !shown.current.has(n.id)
  );
  recent.forEach(n => shown.current.add(n.id));

  useEffect(() => {
    const timers = recent.map(n => setTimeout(() => removeNotification(n.id), 5000));
    return () => timers.forEach(t => clearTimeout(t));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  if (recent.length === 0) return null;

  return (
    <div className="fixed top-9 right-3 z-[1200] flex flex-col gap-2 pointer-events-none">
      {recent.slice(0, 3).map(n => {
        const color = typeColor(n.type) || theme.accent;
        return (
          <div
            key={n.id}
            className="notification-toast w-72 flex items-start gap-3 px-3.5 py-3 rounded-xl pointer-events-auto"
            style={{
              background: dk ? 'rgba(16,16,28,0.97)' : 'rgba(250,250,255,0.97)',
              border: `1px solid ${color}30`,
              boxShadow: dk
                ? `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}10`
                : `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${color}10`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: color + '20' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-snug" style={{ color: dk ? '#fff' : '#000' }}>{n.title}</p>
              {n.message && (
                <p className="text-[10px] mt-0.5 leading-snug" style={{ color: dk ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  {n.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-80"
              style={{ color: dk ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            >
              <X size={11} />
            </button>
          </div>
        );
      })}
    </div>
  );
});
