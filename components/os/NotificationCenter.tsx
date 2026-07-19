'use client';
import { memo, useEffect, useRef } from 'react';
import { X, Bell, CheckCheck, AlertCircle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { format, isValid } from 'date-fns';

const safeFormat = (ts: number | string | Date, fmt: string): string => {
  try {
    const d = new Date(ts as number);
    if (!d || !isValid(d)) return '--';
    return format(d, fmt);
  } catch { return '--'; }
};
import type { OSNotification } from '@/types';

function NotificationItem({ n, onDismiss, onRead }: { n: OSNotification; onDismiss: () => void; onRead: () => void }) {
  const Icon = n.type === 'error' ? AlertCircle : n.type === 'success' ? CheckCircle : Info;
  const color = n.type === 'error' ? '#ef4444' : n.type === 'success' ? '#22c55e' : n.type === 'warning' ? '#f59e0b' : '#6366f1';

  return (
    <div onClick={onRead}
      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/05"
      style={{ background: n.isRead ? 'transparent' : 'rgba(255,255,255,0.04)', border: n.isRead ? '1px solid transparent' : '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color + '15' }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold leading-snug" style={{ opacity: n.isRead ? 0.6 : 1 }}>{n.title}</p>
          {!n.isRead && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: color }} />}
        </div>
        {n.message && <p className="text-[11px] mt-0.5 leading-snug" style={{ opacity: 0.45 }}>{n.message}</p>}
        <p className="text-[10px] mt-1 opacity-25">{safeFormat(n.timestamp, 'h:mm a')}</p>
      </div>
      <button onClick={e => { e.stopPropagation(); onDismiss(); }} className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-all hover:text-red-400 mt-0.5 flex-shrink-0">
        <X size={11} />
      </button>
    </div>
  );
}

export default memo(function NotificationCenter() {
  const { notifications, notificationCenterOpen, theme, toggleNotificationCenter, dismissNotification, markNotificationRead, clearAllNotifications } = useOSStore();
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref}
      className="fixed right-2 top-9 w-80 max-h-[calc(100vh-80px)] z-[1050] rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'rgba(14,14,24,0.97)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', animation: 'popupIn 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color: theme.accent }} />
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unread.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: theme.accent }}>{unread.length}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button onClick={clearAllNotifications} className="p-1 rounded hover:bg-white/10 transition-colors" title="Clear all">
              <Trash2 size={12} className="text-white/40" />
            </button>
          )}
          <button onClick={toggleNotificationCenter} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X size={14} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCheck size={28} className="opacity-20" />
            <p className="text-xs opacity-30">No notifications</p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groups).map(([date, items]) => (
              <div key={date} className="mb-2">
                <p className="text-[10px] font-semibold opacity-30 uppercase tracking-widest px-2 py-1">{date}</p>
                <div className="flex flex-col gap-0.5">
                  {items.map(n => (
                    <NotificationItem key={n.id} n={n}
                      onDismiss={() => dismissNotification(n.id)}
                      onRead={() => markNotificationRead(n.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {unread.length > 0 && (
        <div className="border-t p-2 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={() => unread.forEach(n => markNotificationRead(n.id))}
            className="w-full py-1.5 rounded-xl text-[11px] font-medium transition-colors hover:bg-white/08"
            style={{ color: theme.accent }}>
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
});

// ─── Toast notifications ─────────────────────────────────────────────────────
export const NotificationToasts = memo(function NotificationToasts() {
  const { notifications, theme, dismissNotification } = useOSStore();
  const shown = useRef<Set<string>>(new Set());
  const recent = notifications.filter(n => !n.isRead && Date.now() - n.timestamp < 5000 && !shown.current.has(n.id));

  recent.forEach(n => shown.current.add(n.id));
  useEffect(() => {
    recent.forEach(n => {
      const t = setTimeout(() => dismissNotification(n.id), 5000);
      return () => clearTimeout(t);
    });
  }, [notifications]);

  if (recent.length === 0) return null;

  return (
    <div className="fixed top-9 right-3 z-[1200] flex flex-col gap-2 pointer-events-none">
      {recent.slice(0, 3).map(n => {
        const color = n.type === 'error' ? '#ef4444' : n.type === 'success' ? '#22c55e' : n.type === 'warning' ? '#f59e0b' : theme.accent;
        return (
          <div key={n.id}
            className="notification-toast w-72 flex items-start gap-3 px-3.5 py-3 rounded-xl pointer-events-auto"
            style={{ background: 'rgba(16,16,28,0.97)', border: `1px solid ${color}30`, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}10` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
              {n.message && <p className="text-[10px] opacity-50 mt-0.5 leading-snug">{n.message}</p>}
            </div>
            <button onClick={() => dismissNotification(n.id)} className="opacity-30 hover:opacity-80 flex-shrink-0 mt-0.5">
              <X size={11} className="text-white" />
            </button>
          </div>
        );
      })}
    </div>
  );
});
