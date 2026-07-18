'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { X, Bell, CheckCheck, AlertCircle, Info, CheckCircle, Trash2, ChevronLeft, ChevronRight, BellOff } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { OSNotification } from '@/types';

// Safe date formatter to avoid "Invalid time value"
function safeFormat(date: Date | string | number, opts: Intl.DateTimeFormatOptions): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, opts);
  } catch { return '—'; }
}
function safeTime(date: Date | string | number): string {
  return safeFormat(date, { hour: 'numeric', minute: '2-digit', hour12: true });
}
function formatMonthYear(d: Date): string {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

// ── Mini Calendar ─────────────────────────────────────────────────────────
function MiniCalendar() {
  const [current, setCurrent] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const today = new Date();

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number | null) =>
    d !== null && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prev = () => { const d = new Date(year, month - 1, 1); setCurrent(d); };
  const next = () => { const d = new Date(year, month + 1, 1); setCurrent(d); };

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <ChevronLeft size={13} className="text-white/50" />
        </button>
        <span className="text-xs font-semibold text-white/80">{formatMonthYear(current)}</span>
        <button onClick={next} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <ChevronRight size={13} className="text-white/50" />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[9px] font-semibold opacity-30 py-0.5">{d}</div>
        ))}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            {d !== null && (
              <button
                className="w-6 h-6 rounded-full text-[11px] transition-all flex items-center justify-center font-medium"
                style={{
                  background: isToday(d)
                    ? 'rgba(124,77,255,0.9)'
                    : 'transparent',
                  color: isToday(d) ? 'white' : 'rgba(255,255,255,0.7)',
                  fontWeight: isToday(d) ? 700 : 400,
                }}
              >
                {d}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notification Item ─────────────────────────────────────────────────────
function NotificationItem({ n, onDismiss, onRead }: {
  n: OSNotification;
  onDismiss: () => void;
  onRead: () => void;
}) {
  const Icon = n.type === 'error' ? AlertCircle : n.type === 'success' ? CheckCircle : Info;
  const color = n.type === 'error' ? '#ef4444'
    : n.type === 'success' ? '#22c55e'
    : n.type === 'warning' ? '#f59e0b'
    : '#7C4DFF';

  return (
    <div
      onClick={onRead}
      className="group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/05"
      style={{
        background: n.isRead ? 'transparent' : 'rgba(255,255,255,0.04)',
        border: n.isRead ? '1px solid transparent' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: color + '18' }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold leading-snug" style={{ opacity: n.isRead ? 0.6 : 1 }}>
            {n.title}
          </p>
          {!n.isRead && (
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: color }} />
          )}
        </div>
        {n.message && (
          <p className="text-[11px] mt-0.5 leading-snug" style={{ opacity: 0.45 }}>{n.message}</p>
        )}
        <p className="text-[10px] mt-1 opacity-25">{safeTime(n.timestamp)}</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDismiss(); }}
        className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-all hover:text-red-400 mt-0.5 flex-shrink-0"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ── Notification Toasts ───────────────────────────────────────────────────
export function NotificationToasts() {
  const { notifications, removeNotification } = useOSStore();
  const recent = notifications.filter(n => {
    const age = Date.now() - n.timestamp;
    return !n.isRead && age < 4000;
  }).slice(0, 3);

  if (!recent.length) return null;

  return (
    <div className="fixed top-10 right-3 z-[1200] flex flex-col gap-2 pointer-events-none">
      {recent.map(n => {
        const color = n.type === 'error' ? '#ef4444'
          : n.type === 'success' ? '#22c55e'
          : n.type === 'warning' ? '#f59e0b'
          : '#7C4DFF';
        return (
          <div key={n.id}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl max-w-[320px]"
            style={{
              background: 'rgba(14,14,24,0.97)',
              border: `1px solid ${color}30`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}15`,
              animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90">{n.title}</p>
              {n.message && <p className="text-[11px] text-white/50 mt-0.5">{n.message}</p>}
            </div>
            <button onClick={() => removeNotification(n.id)} className="text-white/20 hover:text-white/60 transition-colors">
              <X size={11} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Notification Center Panel ─────────────────────────────────────────────
export default memo(function NotificationCenter() {
  const {
    notifications, notificationCenterOpen, theme,
    toggleNotificationCenter, removeNotification,
    markNotificationRead, clearNotifications,
  } = useOSStore();
  const ref = useRef<HTMLDivElement>(null);
  const [dnd, setDnd] = useState(false);

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

  // Group notifications by date
  const groups: Record<string, OSNotification[]> = {};
  notifications.forEach(n => {
    const d = new Date(n.timestamp);
    const key = isNaN(d.getTime()) ? 'Today' : safeFormat(d, { month: 'short', day: 'numeric', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  return (
    <div
      ref={ref}
      className="fixed right-2 top-9 w-80 max-h-[calc(100vh-60px)] z-[1050] rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(14,14,24,0.97)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        animation: 'popupIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color: theme.accent }} />
          <span className="text-sm font-semibold text-white">Notifications</span>
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-[10px] font-medium text-white/40 hover:text-white/70 transition-colors px-2"
              title="Clear All"
            >
              Clear All
            </button>
          )}
          <button onClick={toggleNotificationCenter}
            className="p-1 rounded hover:bg-white/10 transition-colors">
            <X size={14} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* DND Toggle */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <BellOff size={12} className="text-white/40" />
          <span className="text-xs text-white/70">Do Not Disturb</span>
        </div>
        <button
          onClick={() => setDnd(v => !v)}
          className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
          style={{ background: dnd ? theme.accent : 'rgba(255,255,255,0.15)' }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: dnd ? '22px' : '2px' }}
          />
        </button>
      </div>

      {/* Mini Calendar */}
      <MiniCalendar />

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Bell size={22} className="opacity-20" />
            </div>
            <p className="text-xs opacity-30">No notifications</p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groups).map(([date, items]) => (
              <div key={date} className="mb-2">
                <p className="text-[10px] font-semibold opacity-30 uppercase tracking-widest px-2 py-1">
                  {date}
                </p>
                <div className="flex flex-col gap-0.5">
                  {items.map(n => (
                    <NotificationItem
                      key={n.id}
                      n={n}
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
    </div>
  );
});
