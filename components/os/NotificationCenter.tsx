'use client';
import { memo, useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { X, Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { OSNotification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const DynIcon = ({ name, ...p }: { name: string } & LucideProps) => {
  const C = (Icons as Record<string, React.ComponentType<LucideProps>>)[name];
  return C ? <C {...p} /> : <Icons.Box {...p} />;
};

interface ToastEntry { id: string; notif: OSNotification; visible: boolean }

export function NotificationToasts() {
  const { notifications, removeNotification, theme } = useOSStore();
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const shownRef = useRef(new Set<string>());

  useEffect(() => {
    const latest = notifications[0];
    if (!latest || shownRef.current.has(latest.id)) return;
    shownRef.current.add(latest.id);
    setToasts((prev) => [{ id: latest.id, notif: latest, visible: true }, ...prev].slice(0, 4));
    const hide = setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === latest.id ? { ...t, visible: false } : t));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== latest.id)), 350);
    }, 4000);
    return () => clearTimeout(hide);
  }, [notifications]);

  return (
    <div className="fixed top-9 right-3 z-[990] flex flex-col gap-2 pointer-events-none" style={{ width: 300 }}>
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto"
          style={{ opacity: t.visible ? 1 : 0, transform: t.visible ? 'translateX(0)' : 'translateX(110%)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="rounded-xl p-3 flex gap-3 items-start"
            style={{ background: 'rgba(18,18,30,0.97)', border: `1px solid ${theme.accent}30`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${theme.accent}20` }}>
              <DynIcon name={t.notif.appIcon} size={16} style={{ color: theme.accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white">{t.notif.appName}</p>
              <p className="text-xs font-medium text-white/80 truncate">{t.notif.title}</p>
              <p className="text-[10px] text-white/50 truncate">{t.notif.message}</p>
            </div>
            <button onClick={() => { removeNotification(t.id); setToasts((p) => p.filter((x) => x.id !== t.id)); }}
              className="text-white/30 hover:text-white/60 flex-shrink-0">
              <X size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(function NotificationCenter() {
  const { notifications, notificationCenterOpen, theme,
    markNotificationRead, clearNotifications, removeNotification, toggleNotificationCenter } = useOSStore();

  if (!notificationCenterOpen) return null;

  const grouped = notifications.reduce<Record<string, OSNotification[]>>((acc, n) => {
    if (!acc[n.appName]) acc[n.appName] = [];
    acc[n.appName].push(n);
    return acc;
  }, {});

  return (
    <>
      <div className="fixed inset-0 z-[880]" onClick={toggleNotificationCenter} />
      <div className="fixed right-2 top-8 z-[890] w-80 flex flex-col rounded-2xl overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 100px)', background: 'rgba(15,15,28,0.97)', backdropFilter: 'blur(24px)', border: `1px solid ${theme.accent}20`, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={14} style={{ color: theme.accent }} />
            <span className="text-sm font-semibold text-white">Notifications</span>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: theme.accent }}>
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="text-white/30 hover:text-white/60 transition-colors"><Trash2 size={13} /></button>
            )}
            <button onClick={toggleNotificationCenter} className="text-white/30 hover:text-white/60"><X size={13} /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/30">
              <BellOff size={32} className="mb-3 opacity-50" /><p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-1">
              {Object.entries(grouped).map(([app, notifs]) => (
                <div key={app}>
                  <p className="text-[10px] font-semibold text-white/30 px-2 py-1 uppercase tracking-wider">{app}</p>
                  {notifs.map((n) => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)}
                      className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all group"
                      style={{ background: n.isRead ? 'transparent' : `${theme.accent}08` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${theme.accent}20` }}>
                        <DynIcon name={n.appIcon} size={16} style={{ color: theme.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-white/80 truncate">{n.title}</p>
                          {!n.isRead && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: theme.accent }} />}
                        </div>
                        <p className="text-[11px] text-white/50 truncate">{n.message}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{formatDistanceToNow(n.timestamp, { addSuffix: true })}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 flex-shrink-0"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-white/5 flex-shrink-0">
            <button onClick={() => notifications.forEach((n) => markNotificationRead(n.id))}
              className="w-full text-[11px] text-white/40 hover:text-white/60 flex items-center justify-center gap-1">
              <CheckCheck size={11} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
});
