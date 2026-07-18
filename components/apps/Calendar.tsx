'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, AlignLeft, Calendar as CalIcon, List, LayoutGrid } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { CalendarEvent } from '@/types';
import { generateId } from '@/lib/utils';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isSameMonth, isToday, addMonths, subMonths, getDay, addWeeks, subWeeks,
  startOfWeek, addDays,
} from 'date-fns';

const EVENT_COLORS = ['#7C4DFF','#2196F3','#4CAF50','#FF6D00','#E91E63','#F44336','#00BCD4','#FFC107'];
type ViewMode = 'month' | 'week' | 'agenda';

function loadEvents(): CalendarEvent[] {
  try { return JSON.parse(localStorage.getItem('wlos_events') || '[]'); } catch { return []; }
}
function saveEvents(e: CalendarEvent[]) { localStorage.setItem('wlos_events', JSON.stringify(e)); }

export default function Calendar({ windowId }: { windowId: string }) {
  const { theme, auth } = useOSStore();
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    title: '', color: '#7C4DFF', allDay: true,
    startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00',
    endDate: format(new Date(), 'yyyy-MM-dd'), endTime: '10:00',
    location: '', description: '',
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dk = theme.mode === 'dark';

  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    fetch('/api/sync/events').then(r => r.json()).then(d => {
      if (d.events?.length) { setEvents(d.events); saveEvents(d.events); }
    }).catch(() => {});
  }, [auth]);

  const sync = useCallback((updated: CalendarEvent[]) => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { await fetch('/api/sync/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: updated }) }); } catch {}
    }, 1500);
  }, [auth]);

  const openForm = (day?: Date, existing?: CalendarEvent) => {
    const base = day || selected || new Date();
    if (existing) {
      setEditEvent(existing);
      setForm({
        title: existing.title,
        color: existing.color || '#7C4DFF',
        allDay: existing.allDay ?? true,
        startDate: format(new Date(existing.startDate), 'yyyy-MM-dd'),
        startTime: format(new Date(existing.startDate), 'HH:mm'),
        endDate: format(new Date(existing.endDate || existing.startDate), 'yyyy-MM-dd'),
        endTime: format(new Date(existing.endDate || existing.startDate), 'HH:mm'),
        location: existing.location || '',
        description: existing.description || '',
      });
    } else {
      setEditEvent(null);
      setForm(f => ({ ...f, title: '', startDate: format(base, 'yyyy-MM-dd'), endDate: format(base, 'yyyy-MM-dd') }));
    }
    setShowForm(true);
  };

  const saveEvent = () => {
    if (!form.title.trim()) return;
    const startISO = form.allDay
      ? new Date(form.startDate).toISOString()
      : new Date(`${form.startDate}T${form.startTime}`).toISOString();
    const endISO = form.allDay
      ? new Date(form.endDate).toISOString()
      : new Date(`${form.endDate}T${form.endTime}`).toISOString();

    let updated: CalendarEvent[];
    if (editEvent) {
      updated = events.map(e => e.id === editEvent.id
        ? { ...e, title: form.title, color: form.color, allDay: form.allDay, startDate: startISO, endDate: endISO, location: form.location, description: form.description, updatedAt: Date.now() }
        : e);
    } else {
      const evt: CalendarEvent = {
        id: generateId(), title: form.title, description: form.description || undefined,
        startDate: startISO, endDate: endISO, allDay: form.allDay,
        color: form.color, location: form.location || undefined,
        createdAt: Date.now(), updatedAt: Date.now(),
      };
      updated = [...events, evt];
    }
    setEvents(updated); saveEvents(updated); sync(updated);
    setShowForm(false); setEditEvent(null);
  };

  const deleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated); saveEvents(updated); sync(updated);
  };

  const dayEvents = (day: Date) => events.filter(e => isSameDay(new Date(e.startDate), day));
  const selectedEvents = selected ? dayEvents(selected) : [];

  // Month view days
  const monthDays = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startPad  = getDay(startOfMonth(current));
  const allDays   = [...Array(startPad).fill(null), ...monthDays];

  // Week view days
  const weekStart = startOfWeek(current, { weekStartsOn: 0 });
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Agenda: next 30 days
  const agendaDays = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i))
    .filter(d => dayEvents(d).length > 0);

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const bg     = dk ? '#0d0d1a' : '#f5f5fb';
  const txt    = dk ? '#e2e8f0' : '#1e1e2e';
  const border = dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
  const cellBg = dk ? 'rgba(255,255,255,0.02)' : '#fff';

  return (
    <div className="flex h-full" style={{ background: bg, color: txt }}>

      {/* ── Event form modal ───────────────────────────────────── */}
      {showForm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: dk ? '#1a1a2e' : '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
              <h3 className="font-semibold">{editEvent ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => { setShowForm(false); setEditEvent(null); }} className="opacity-40 hover:opacity-80"><X size={16} /></button>
            </div>
            {/* Body */}
            <div className="p-5 flex flex-col gap-3">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Event title"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: txt, border: `1px solid ${border}` }} />

              {/* All day toggle */}
              <div className="flex items-center gap-2">
                <button onClick={() => setForm(f => ({ ...f, allDay: !f.allDay }))}
                  className="w-9 h-5 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: form.allDay ? theme.accent : 'rgba(255,255,255,0.12)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: form.allDay ? '18px' : '2px' }} />
                </button>
                <span className="text-xs opacity-60">All day</span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] opacity-40 block mb-1">Start date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: txt, border: `1px solid ${border}` }} />
                </div>
                {!form.allDay && (
                  <div>
                    <label className="text-[10px] opacity-40 block mb-1">Start time</label>
                    <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: txt, border: `1px solid ${border}` }} />
                  </div>
                )}
                <div>
                  <label className="text-[10px] opacity-40 block mb-1">End date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: txt, border: `1px solid ${border}` }} />
                </div>
                {!form.allDay && (
                  <div>
                    <label className="text-[10px] opacity-40 block mb-1">End time</label>
                    <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: txt, border: `1px solid ${border}` }} />
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', border: `1px solid ${border}` }}>
                <MapPin size={13} className="opacity-30 flex-shrink-0" />
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Add location" className="flex-1 bg-transparent text-xs outline-none" style={{ color: txt }} />
              </div>

              {/* Description */}
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', border: `1px solid ${border}` }}>
                <AlignLeft size={13} className="opacity-30 flex-shrink-0 mt-0.5" />
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Add description" rows={2}
                  className="flex-1 bg-transparent text-xs outline-none resize-none" style={{ color: txt }} />
              </div>

              {/* Color */}
              <div>
                <label className="text-[10px] opacity-40 block mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-6 h-6 rounded-full transition-all"
                      style={{ background: c, outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: 2, transform: form.color === c ? 'scale(1.25)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="flex gap-2 px-5 py-4 border-t" style={{ borderColor: border }}>
              {editEvent && (
                <button onClick={() => { deleteEvent(editEvent.id); setShowForm(false); setEditEvent(null); }}
                  className="px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors mr-auto">
                  Delete
                </button>
              )}
              <button onClick={() => { setShowForm(false); setEditEvent(null); }}
                className="px-4 py-1.5 rounded-xl text-xs opacity-50 hover:opacity-80 transition-opacity ml-auto">Cancel</button>
              <button onClick={saveEvent}
                className="px-5 py-1.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: theme.accent }}>
                {editEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0" style={{ borderColor: border }}>
          <button onClick={() => view === 'month' ? setCurrent(subMonths(current, 1)) : view === 'week' ? setCurrent(subWeeks(current, 1)) : setCurrent(addDays(current, -7))} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><ChevronLeft size={15} /></button>
          <h2 className="text-sm font-bold flex-1">
            {view === 'month' && format(current, 'MMMM yyyy')}
            {view === 'week' && `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`}
            {view === 'agenda' && 'Upcoming Events'}
          </h2>
          <button onClick={() => view === 'month' ? setCurrent(addMonths(current, 1)) : view === 'week' ? setCurrent(addWeeks(current, 1)) : setCurrent(addDays(current, 7))} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><ChevronRight size={15} /></button>
          <button onClick={() => setCurrent(new Date())} className="px-2 py-0.5 rounded-lg text-xs" style={{ background: `${theme.accent}20`, color: theme.accent }}>Today</button>

          {/* View switcher */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: border }}>
            {([['month', LayoutGrid], ['week', CalIcon], ['agenda', List]] as [ViewMode, typeof LayoutGrid][]).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className="p-1.5 transition-colors text-xs"
                style={{ background: view === v ? `${theme.accent}25` : 'transparent', color: view === v ? theme.accent : undefined }}>
                <Icon size={13} />
              </button>
            ))}
          </div>
          <button onClick={() => openForm(selected || new Date())}
            className="p-1.5 rounded-lg text-white" style={{ background: theme.accent }}>
            <Plus size={14} />
          </button>
        </div>

        {/* ── Month View ─────────────────────────────────────────── */}
        {view === 'month' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Day labels */}
            <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${border}` }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center py-2 text-[11px] font-semibold opacity-40">{d}</div>
              ))}
            </div>
            {/* Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-7 h-full" style={{ gridAutoRows: 'minmax(70px, 1fr)' }}>
                {allDays.map((day, i) => {
                  if (!day) return <div key={`p-${i}`} style={{ borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}`, opacity: 0.3 }} />;
                  const de    = dayEvents(day);
                  const isSel = selected && isSameDay(day, selected);
                  const isT   = isToday(day);
                  return (
                    <div key={day.toISOString()}
                      onClick={() => { setSelected(day); }}
                      onDoubleClick={() => openForm(day)}
                      className="p-1 cursor-pointer transition-colors relative"
                      style={{
                        borderRight: `1px solid ${border}`,
                        borderBottom: `1px solid ${border}`,
                        background: isSel ? `${theme.accent}12` : 'transparent',
                        opacity: isSameMonth(day, current) ? 1 : 0.35,
                      }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mb-0.5"
                        style={{ background: isT ? theme.accent : isSel ? `${theme.accent}20` : 'transparent', color: isT ? '#fff' : undefined }}>
                        {format(day, 'd')}
                      </div>
                      {de.slice(0, 2).map(e => (
                        <div key={e.id} onClick={ev => { ev.stopPropagation(); openForm(day, e); }}
                          className="text-[9px] px-1 py-0.5 rounded mb-0.5 truncate font-medium cursor-pointer"
                          style={{ background: e.color + '25', color: e.color }}>
                          {e.title}
                        </div>
                      ))}
                      {de.length > 2 && <div className="text-[9px] opacity-40 px-1">+{de.length - 2}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Week View ─────────────────────────────────────────── */}
        {view === 'week' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-8" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="py-2 text-center text-[11px] opacity-0">TZ</div>
              {weekDays.map(d => (
                <div key={d.toISOString()} className="py-2 text-center" onClick={() => setSelected(d)}>
                  <div className="text-[10px] opacity-40 mb-0.5">{format(d, 'EEE')}</div>
                  <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold cursor-pointer`}
                    style={{ background: isToday(d) ? theme.accent : (selected && isSameDay(d, selected)) ? `${theme.accent}20` : 'transparent', color: isToday(d) ? '#fff' : undefined }}>
                    {format(d, 'd')}
                  </div>
                </div>
              ))}
            </div>
            {/* Time grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-8">
                {/* Times column */}
                <div>
                  {HOURS.map(h => (
                    <div key={h} className="text-[9px] opacity-30 pr-2 text-right leading-none" style={{ height: 48, paddingTop: 2, borderBottom: `1px solid ${border}` }}>
                      {h === 0 ? '' : `${h}:00`}
                    </div>
                  ))}
                </div>
                {/* Day columns */}
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="relative border-l" style={{ borderColor: border }}>
                    {HOURS.map(h => (
                      <div key={h} className="relative transition-colors hover:bg-white/02" style={{ height: 48, borderBottom: `1px solid ${border}` }}
                        onDoubleClick={() => { const d = new Date(day); d.setHours(h); setSelected(d); openForm(d); }} />
                    ))}
                    {/* Events */}
                    {dayEvents(day).map(e => {
                      const start = new Date(e.startDate);
                      const top   = (start.getHours() + start.getMinutes() / 60) * 48;
                      return (
                        <div key={e.id} onClick={() => openForm(day, e)}
                          className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[9px] font-medium cursor-pointer hover:brightness-110 transition-all overflow-hidden"
                          style={{ top, minHeight: 24, background: e.color + '30', color: e.color, border: `1px solid ${e.color}40` }}>
                          {e.title}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Agenda View ───────────────────────────────────────── */}
        {view === 'agenda' && (
          <div className="flex-1 overflow-y-auto p-4">
            {agendaDays.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                <CalIcon size={40} />
                <p className="text-sm">No upcoming events</p>
                <button onClick={() => openForm()} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: theme.accent + '20', color: theme.accent }}>
                  Add Event
                </button>
              </div>
            ) : agendaDays.map(day => (
              <div key={day.toISOString()} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                    style={{ background: isToday(day) ? theme.accent : 'rgba(255,255,255,0.08)' }}>
                    {format(day, 'd')}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{isToday(day) ? 'Today' : format(day, 'EEEE')}</p>
                    <p className="text-[10px] opacity-40">{format(day, 'MMMM d, yyyy')}</p>
                  </div>
                </div>
                {dayEvents(day).map(e => (
                  <div key={e.id} onClick={() => openForm(day, e)}
                    className="ml-10 mb-1.5 px-3 py-2 rounded-xl cursor-pointer hover:brightness-110 transition-all flex items-start gap-2"
                    style={{ background: e.color + '15', border: `1px solid ${e.color}25` }}>
                    <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: e.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: e.color }}>{e.title}</p>
                      {!e.allDay && (
                        <p className="text-[10px] opacity-50 flex items-center gap-1 mt-0.5">
                          <Clock size={9} />
                          {format(new Date(e.startDate), 'h:mm a')}
                          {e.endDate && ` – ${format(new Date(e.endDate), 'h:mm a')}`}
                        </p>
                      )}
                      {e.location && (
                        <p className="text-[10px] opacity-50 flex items-center gap-1 mt-0.5">
                          <MapPin size={9} /> {e.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right panel: selected day events ────────────────────── */}
      {view === 'month' && selected && (
        <div className="w-56 flex-shrink-0 flex flex-col border-l" style={{ borderColor: border }}>
          <div className="px-3 py-2 border-b" style={{ borderColor: border }}>
            <p className="text-xs font-bold">{format(selected, 'EEEE')}</p>
            <p className="text-[10px] opacity-40">{format(selected, 'MMMM d, yyyy')}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
            {selectedEvents.length === 0 ? (
              <p className="text-[10px] opacity-30 text-center mt-4">No events</p>
            ) : selectedEvents.map(e => (
              <div key={e.id} onClick={() => openForm(selected, e)}
                className="px-2 py-2 rounded-xl cursor-pointer hover:brightness-110 transition-all"
                style={{ background: e.color + '15', border: `1px solid ${e.color}20` }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <p className="text-xs font-semibold truncate" style={{ color: e.color }}>{e.title}</p>
                </div>
                {!e.allDay && (
                  <p className="text-[9px] opacity-50 ml-3.5">{format(new Date(e.startDate), 'h:mm a')}</p>
                )}
                {e.location && <p className="text-[9px] opacity-40 ml-3.5 truncate">{e.location}</p>}
              </div>
            ))}
            <button onClick={() => openForm(selected)}
              className="mt-1 py-1.5 rounded-xl text-[11px] opacity-40 hover:opacity-70 transition-opacity flex items-center justify-center gap-1"
              style={{ border: `1px dashed rgba(255,255,255,0.15)` }}>
              <Plus size={11} /> Add Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
