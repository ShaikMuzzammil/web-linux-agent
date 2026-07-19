// ============================================================
// NotificationCenter — Slide-out panel: DND + calendar + notifs
// ============================================================

import { useState, memo, useCallback, useEffect } from 'react';
import { Bell, X, ChevronLeft, ChevronRight, BellOff, Check, Trash2 } from 'lucide-react';
import { useOS } from '@/hooks/useOSStore';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Bell {...props} />;
};

const safeTimeStr = (ts: number) => {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const safeRelativeTime = (ts: number) => {
  try {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  } catch { return ''; }
};

// Simple calendar grid
const buildCalendarDays = (year: number, month: number): (Date | null)[] => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const NotificationCenter = memo(function NotificationCenter() {
  const { state, dispatch } = useOS();
  const { notificationCenterOpen, notifications } = state;
  const [calDate, setCalDate] = useState(() => new Date());
  const [dnd, setDnd] = useState(false);
  const today = new Date();

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const days = buildCalendarDays(year, month);

  const handleClose = useCallback(() => {
    dispatch({ type: 'TOGGLE_NOTIFICATION_CENTER' });
  }, [dispatch]);

  const markAllRead = useCallback(() => {
    notifications.forEach(n => {
      if (!n.isRead) dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id });
    });
  }, [dispatch, notifications]);

  // Mark as read when center opens
  useEffect(() => {
    if (notificationCenterOpen) {
      setTimeout(() => {
        notifications.forEach(n => {
          if (!n.isRead) dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id });
        });
      }, 500);
    }
  }, [notificationCenterOpen]);

  if (!notificationCenterOpen) return null;

  return (
    <div
      className="fixed right-0 bottom-0 z-[2500] flex flex-col"
      style={{
        top: 28,
        width: 380,
        background: 'rgba(24,24,24,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        animation: 'slideFromRight 280ms cubic-bezier(0, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <h2 className="text-base font-bold text-white">Notifications</h2>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] px-2 py-1 rounded-full hover:bg-white/[0.08] transition-colors flex items-center gap-1"
              style={{ color: 'var(--accent-primary)' }}
            >
              <Check size={10} />
              Mark all read
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
            className="text-[10px] px-2 py-1 rounded-full hover:bg-white/[0.08] transition-colors flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Trash2 size={10} />
            Clear
          </button>
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Do Not Disturb */}
      <div
        className="flex items-center justify-between mx-4 mb-3 px-3 py-2 rounded-xl cursor-pointer"
        style={{ background: dnd ? 'rgba(244,67,54,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        onClick={() => setDnd(d => !d)}
      >
        <div className="flex items-center gap-2">
          {dnd ? <BellOff size={14} style={{ color: '#F44336' }} /> : <Bell size={14} style={{ color: 'var(--text-secondary)' }} />}
          <span className="text-xs font-medium text-white/70">Do Not Disturb</span>
        </div>
        <div
          className="w-10 h-5 rounded-full relative transition-all duration-200"
          style={{ background: dnd ? '#F44336' : 'rgba(255,255,255,0.15)' }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: dnd ? 'calc(100% - 18px)' : '2px' }}
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="mx-4 mb-3 p-3 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCalDate(new Date(year, month - 1, 1))}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.08] transition-colors text-white/50"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-semibold text-white/80">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => setCalDate(new Date(year, month + 1, 1))}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.08] transition-colors text-white/50"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-[10px] text-white/30 py-0.5">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
            return (
              <button
                key={i}
                className="h-7 text-[10px] font-medium rounded-full flex items-center justify-center transition-colors"
                style={{
                  color: isToday ? 'white' : 'rgba(255,255,255,0.65)',
                  background: isToday ? 'var(--accent-primary)' : 'transparent',
                  fontWeight: isToday ? 700 : 400,
                }}
                onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'transparent'; }}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/30">
            <Bell size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-1 opacity-60">You're all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className="p-3 rounded-xl relative group"
                style={{
                  background: n.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(124,77,255,0.08)',
                  border: n.isRead ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(124,77,255,0.2)',
                  transition: 'all 200ms ease',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DynamicIcon name={n.appIcon} size={14} style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--accent-primary)' }} />
                  <span className="text-[10px] font-bold text-white/60 flex-1">{n.appName}</span>
                  <span className="text-[10px] text-white/30">{safeRelativeTime(n.timestamp)}</span>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id })}
                    className="w-4 h-4 rounded flex items-center justify-center text-white/30 hover:text-white/70 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={10} />
                  </button>
                </div>
                <p className="text-xs font-semibold text-white/85">{n.title}</p>
                <p className="text-[10px] text-white/50 mt-0.5 line-clamp-2">{n.message}</p>
                {!n.isRead && (
                  <div className="absolute top-3 right-9 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
});

export default NotificationCenter;
