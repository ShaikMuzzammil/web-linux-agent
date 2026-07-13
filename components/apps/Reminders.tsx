'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X, BellRing, Check, Clock, Flag, Trash2 } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { Reminder } from '@/types';
import { generateId } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';

const PRIORITY_COLORS = { low: '#4ade80', medium: '#f59e0b', high: '#f87171' };
function load(): Reminder[] { try { return JSON.parse(localStorage.getItem('wlos_reminders') || '[]'); } catch { return []; } }
function save(r: Reminder[]) { localStorage.setItem('wlos_reminders', JSON.stringify(r)); }

export default function Reminders({ windowId }: { windowId: string }) {
  const { theme, auth, addNotification } = useOSStore();
  const [reminders, setReminders] = useState<Reminder[]>(load);
  const [title, setTitle] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    fetch('/api/sync/reminders').then(r => r.json()).then(d => { if (d.reminders?.length) { setReminders(d.reminders); save(d.reminders); } }).catch(() => {});
  }, [auth]);

  // Check for due reminders every 30s
  useEffect(() => {
    const check = () => {
      const now = new Date();
      reminders.filter(r => !r.isComplete && isPast(new Date(r.remindAt)) && isToday(new Date(r.remindAt))).forEach(r => {
        addNotification({ appId: 'reminders', appName: 'Reminders', appIcon: 'BellRing', title: r.title, message: r.description || format(new Date(r.remindAt), 'HH:mm'), isRead: false });
      });
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [reminders, addNotification]);

  const sync = useCallback((updated: Reminder[]) => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/sync/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reminders: updated }) }).catch(() => {});
    }, 1500);
  }, [auth]);

  const add = () => {
    if (!title.trim() || !remindAt) return;
    const r: Reminder = { id: generateId(), title, description: description || undefined, remindAt: new Date(remindAt).toISOString(), isComplete: false, priority, createdAt: Date.now(), updatedAt: Date.now() };
    const u = [r, ...reminders]; setReminders(u); save(u); sync(u);
    setTitle(''); setRemindAt(''); setDescription(''); setShowForm(false);
  };

  const toggle = (id: string) => { const u = reminders.map(r => r.id === id ? { ...r, isComplete: !r.isComplete, updatedAt: Date.now() } : r); setReminders(u); save(u); sync(u); };
  const del = (id: string) => { const u = reminders.filter(r => r.id !== id); setReminders(u); save(u); sync(u); };

  const upcoming = reminders.filter(r => !r.isComplete).sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());
  const completed = reminders.filter(r => r.isComplete);

  const ReminderItem = ({ r }: { r: Reminder }) => {
    const overdue = !r.isComplete && isPast(new Date(r.remindAt));
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl group transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${overdue ? '#f8717130' : 'rgba(255,255,255,0.06)'}`, opacity: r.isComplete ? 0.5 : 1 }}>
        <button onClick={() => toggle(r.id)} className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" style={{ borderColor: r.isComplete ? theme.accent : PRIORITY_COLORS[r.priority], background: r.isComplete ? theme.accent : 'transparent' }}>
          {r.isComplete && <Check size={11} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${r.isComplete ? 'line-through opacity-50' : ''}`}>{r.title}</p>
          {r.description && <p className="text-[10px] opacity-40 mt-0.5">{r.description}</p>}
          <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: overdue ? '#f87171' : 'rgba(255,255,255,0.4)' }}>
            <Clock size={9} />{overdue ? '⚠ ' : ''}{format(new Date(r.remindAt), "MMM d 'at' HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[r.priority] }} />
          <button onClick={() => del(r.id)} className="opacity-0 group-hover:opacity-100 text-red-400"><Trash2 size={12} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="p-3 border-b flex-shrink-0 flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2"><BellRing size={16} style={{ color: theme.accent }} /><span className="font-bold">Reminders</span></div>
        <button onClick={() => setShowForm(v => !v)} className="p-1.5 rounded-lg text-white" style={{ background: theme.accent }}><Plus size={13} /></button>
      </div>

      {showForm && (
        <div className="p-3 border-b flex-shrink-0 flex flex-col gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reminder title *" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', caretColor: theme.accent }} />
          <input type="datetime-local" value={remindAt} onChange={e => setRemindAt(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', colorScheme: 'dark', caretColor: theme.accent }} />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', caretColor: theme.accent }} />
          <div className="flex gap-1.5">
            {(['low','medium','high'] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)} className="flex-1 py-1 rounded-lg text-[10px] capitalize font-medium" style={{ background: priority === p ? PRIORITY_COLORS[p] + '30' : 'rgba(255,255,255,0.05)', color: priority === p ? PRIORITY_COLORS[p] : 'inherit' }}>{p}</button>
            ))}
          </div>
          <button onClick={add} disabled={!title.trim() || !remindAt} className="py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40" style={{ background: theme.accent }}>Add Reminder</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {upcoming.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40 mb-2">Upcoming ({upcoming.length})</p>
            <div className="space-y-1.5">{upcoming.map(r => <ReminderItem key={r.id} r={r} />)}</div>
          </div>
        )}
        {completed.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40 mb-2">Completed ({completed.length})</p>
            <div className="space-y-1.5">{completed.map(r => <ReminderItem key={r.id} r={r} />)}</div>
          </div>
        )}
        {reminders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-30"><BellRing size={32} /><p className="text-sm mt-2">No reminders yet</p></div>
        )}
      </div>
    </div>
  );
}
