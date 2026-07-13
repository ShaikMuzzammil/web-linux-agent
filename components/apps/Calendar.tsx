'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Repeat } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { CalendarEvent } from '@/types';
import { generateId } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths, getDay } from 'date-fns';

const EVENT_COLORS = ['#7C4DFF','#2196F3','#4CAF50','#FF6D00','#E91E63','#F44336','#00BCD4','#FFC107'];
function loadEvents(): CalendarEvent[] { try { return JSON.parse(localStorage.getItem('wlos_events') || '[]'); } catch { return []; } }
function saveEvents(e: CalendarEvent[]) { localStorage.setItem('wlos_events', JSON.stringify(e)); }

export default function Calendar({ windowId }: { windowId: string }) {
  const { theme, auth } = useOSStore();
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', color: '#7C4DFF', allDay: true, startDate: '', endDate: '', location: '', description: '' });
  const [view, setView] = useState<'month' | 'week'>('month');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    fetch('/api/sync/events').then(r => r.json()).then(d => { if (d.events?.length) { setEvents(d.events); saveEvents(d.events); } }).catch(() => {});
  }, [auth]);

  const sync = useCallback((updated: CalendarEvent[]) => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { await fetch('/api/sync/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: updated }) }); } catch {}
    }, 1500);
  }, [auth]);

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startPad = getDay(startOfMonth(current));
  const allDays = [...Array(startPad).fill(null), ...days];

  const addEvent = () => {
    if (!form.title.trim()) return;
    const start = selected ? selected.toISOString() : new Date().toISOString();
    const evt: CalendarEvent = { id: generateId(), title: form.title, description: form.description || undefined, startDate: form.startDate || start, endDate: form.endDate || start, allDay: form.allDay, color: form.color, location: form.location || undefined, createdAt: Date.now(), updatedAt: Date.now() };
    const updated = [...events, evt]; setEvents(updated); saveEvents(updated); sync(updated);
    setForm({ title: '', color: '#7C4DFF', allDay: true, startDate: '', endDate: '', location: '', description: '' });
    setShowForm(false);
  };

  const removeEvent = (id: string) => { const u = events.filter(e => e.id !== id); setEvents(u); saveEvents(u); sync(u); };
  const dayEvents = (day: Date) => events.filter(e => isSameDay(new Date(e.startDate), day));
  const selectedEvents = selected ? dayEvents(selected) : [];

  return (
    <div className="flex h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-1.5 rounded-lg hover:bg-white/10"><ChevronLeft size={16} /></button>
          <h2 className="text-base font-bold flex-1 text-center">{format(current, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-1.5 rounded-lg hover:bg-white/10"><ChevronRight size={16} /></button>
          <button onClick={() => setCurrent(new Date())} className="px-2 py-1 rounded-lg text-xs" style={{ background: `${theme.accent}20`, color: theme.accent }}>Today</button>
          <button onClick={() => { setShowForm(true); setForm(f => ({ ...f, startDate: (selected || new Date()).toISOString().slice(0,10) })); }} className="p-1.5 rounded-lg text-white" style={{ background: theme.accent }}><Plus size={14} /></button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center py-2 text-[11px] font-semibold opacity-40">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 h-full" style={{ gridAutoRows: 'minmax(80px, 1fr)' }}>
            {allDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} style={{ borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />;
              const de = dayEvents(day);
              const isSel = selected && isSameDay(day, selected);
              const isT = isToday(day);
              return (
                <div key={day.toISOString()} onClick={() => setSelected(day)}
                  className="p-1 cursor-pointer transition-colors"
                  style={{ borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isSel ? `${theme.accent}15` : 'transparent', opacity: isSameMonth(day, current) ? 1 : 0.3 }}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${isT ? 'text-white' : ''}`}
                    style={{ background: isT ? theme.accent : 'transparent', fontSize: 11 }}>
                    {format(day, 'd')}
                  </div>
                  {de.slice(0, 2).map(e => (
                    <div key={e.id} className="text-[9px] px-1 py-0.5 rounded mb-0.5 truncate font-medium" style={{ background: e.color + '30', color: e.color }}>{e.title}</div>
                  ))}
                  {de.length > 2 && <div className="text-[9px] opacity-40">+{de.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <div className="w-56 flex-shrink-0 border-l flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="px-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-bold">{format(selected, 'EEEE, MMMM d')}</p>
            <p className="text-[10px] opacity-40">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-30">
                <Clock size={20} /><p className="text-xs mt-1">No events</p>
              </div>
            ) : selectedEvents.map(e => (
              <div key={e.id} className="p-2 rounded-xl group" style={{ background: e.color + '20', border: `1px solid ${e.color}40` }}>
                <div className="flex justify-between items-start">
                  <p className="text-xs font-semibold" style={{ color: e.color }}>{e.title}</p>
                  <button onClick={() => removeEvent(e.id)} className="opacity-0 group-hover:opacity-100 text-red-400"><X size={10} /></button>
                </div>
                {e.location && <p className="text-[10px] opacity-50 flex items-center gap-1 mt-0.5"><MapPin size={9}/>{e.location}</p>}
                {e.description && <p className="text-[10px] opacity-50 mt-0.5">{e.description}</p>}
              </div>
            ))}
          </div>
          <button onClick={() => { setShowForm(true); setForm(f => ({ ...f, startDate: selected.toISOString().slice(0,10) })); }}
            className="m-2 py-2 rounded-xl text-xs font-medium text-white" style={{ background: theme.accent }}>
            <Plus size={12} className="inline mr-1" />Add Event
          </button>
        </div>
      )}

      {/* Add Event Modal */}
      {showForm && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-80 rounded-2xl p-5 flex flex-col gap-3" style={{ background: theme.mode === 'dark' ? '#1a1a2e' : '#fff', border: `1px solid ${theme.accent}30` }}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold">New Event</h3>
              <button onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            {[
              { label: 'Title *', key: 'title', type: 'text', placeholder: 'Event title' },
              { label: 'Start Date', key: 'startDate', type: 'date', placeholder: '' },
              { label: 'End Date', key: 'endDate', type: 'date', placeholder: '' },
              { label: 'Location', key: 'location', type: 'text', placeholder: 'Optional location' },
              { label: 'Description', key: 'description', type: 'text', placeholder: 'Optional notes' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <p className="text-[10px] opacity-50 mb-1">{label}</p>
                <input type={type} value={form[key as keyof typeof form] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark', caretColor: theme.accent }} />
              </div>
            ))}
            <div>
              <p className="text-[10px] opacity-50 mb-1">Color</p>
              <div className="flex gap-2">
                {EVENT_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} className="w-5 h-5 rounded-full transition-all"
                    style={{ background: c, transform: form.color === c ? 'scale(1.25)' : 'scale(1)', border: form.color === c ? '2px solid white' : 'none' }} />
                ))}
              </div>
            </div>
            <button onClick={addEvent} disabled={!form.title.trim()} className="py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: theme.accent }}>
              Add Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
