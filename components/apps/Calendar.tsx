'use client';
import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  Tag, CalendarDays, List, LayoutGrid, Trash2, Edit3, Check,
} from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

interface CalEvent {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;
  color: string;
  location?: string;
  description?: string;
  category: 'work' | 'personal' | 'health' | 'event';
}

const COLORS = {
  work:     { bg: 'rgba(99,102,241,0.25)',  border: '#6366f1', text: '#a5b4fc', solid: '#6366f1' },
  personal: { bg: 'rgba(236,72,153,0.20)',  border: '#ec4899', text: '#f9a8d4', solid: '#ec4899' },
  health:   { bg: 'rgba(34,197,94,0.20)',   border: '#22c55e', text: '#86efac', solid: '#22c55e' },
  event:    { bg: 'rgba(251,146,60,0.20)',  border: '#fb923c', text: '#fdba74', solid: '#fb923c' },
};

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n: number) { return n.toString().padStart(2, '0'); }
function dateStr(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}`; }
function todayStr() { const d = new Date(); return dateStr(d.getFullYear(), d.getMonth(), d.getDate()); }

const DEMO_EVENTS: CalEvent[] = [
  { id:'1', title:'Team Standup',       date: todayStr(),       startTime:'09:00', endTime:'09:30', color:'#6366f1', category:'work',     location:'Zoom' },
  { id:'2', title:'Design Review',      date: todayStr(),       startTime:'14:00', endTime:'15:30', color:'#ec4899', category:'work',     description:'UI polish pass' },
  { id:'3', title:'Gym Session',        date: todayStr(),       startTime:'18:00', endTime:'19:30', color:'#22c55e', category:'health',   location:'City Gym' },
  { id:'4', title:'Birthday Party 🎉',  date: (() => { const d = new Date(); d.setDate(d.getDate()+3); return dateStr(d.getFullYear(), d.getMonth(), d.getDate()); })(), startTime:'19:00', endTime:'22:00', color:'#fb923c', category:'event' },
  { id:'5', title:'Sprint Planning',    date: (() => { const d = new Date(); d.setDate(d.getDate()+1); return dateStr(d.getFullYear(), d.getMonth(), d.getDate()); })(), startTime:'10:00', endTime:'11:30', color:'#6366f1', category:'work' },
];

function EventForm({ initial, onSave, onClose, accent }: {
  initial?: Partial<CalEvent>; onSave: (e: CalEvent) => void; onClose: () => void; accent: string;
}) {
  const [form, setForm] = useState<Partial<CalEvent>>({
    title: '', date: todayStr(), startTime: '09:00', endTime: '10:00',
    color: accent, category: 'work', ...initial,
  });
  const set = (k: keyof CalEvent, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  return (
    <div className="flex flex-col gap-3 p-4">
      <input value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="Event title…" className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/05 border border-white/08 outline-none" style={{ caretColor: accent }} autoFocus />
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-3">
          <label className="text-[10px] opacity-40 uppercase tracking-wider">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white/05 border border-white/08 outline-none mt-0.5" style={{ colorScheme: 'dark', caretColor: accent }} />
        </div>
        <div>
          <label className="text-[10px] opacity-40 uppercase tracking-wider">Start</label>
          <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white/05 border border-white/08 outline-none mt-0.5" style={{ colorScheme: 'dark' }} />
        </div>
        <div>
          <label className="text-[10px] opacity-40 uppercase tracking-wider">End</label>
          <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white/05 border border-white/08 outline-none mt-0.5" style={{ colorScheme: 'dark' }} />
        </div>
        <div>
          <label className="text-[10px] opacity-40 uppercase tracking-wider">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full px-2 py-2 rounded-xl text-xs bg-white/05 border border-white/08 outline-none mt-0.5" style={{ colorScheme: 'dark' }}>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="health">Health</option>
            <option value="event">Event</option>
          </select>
        </div>
      </div>
      <input value={form.location || ''} onChange={e => set('location', e.target.value)}
        placeholder="Location (optional)" className="px-3 py-2 rounded-xl text-xs bg-white/05 border border-white/08 outline-none" />
      <textarea value={form.description || ''} onChange={e => set('description', e.target.value)}
        placeholder="Description (optional)" rows={2}
        className="px-3 py-2 rounded-xl text-xs bg-white/05 border border-white/08 outline-none resize-none" />
      <div className="flex gap-2">
        {Object.entries(COLORS).map(([cat, c]) => (
          <button key={cat} onClick={() => { set('category', cat); set('color', c.solid); }}
            className="flex-1 py-1.5 rounded-xl text-[10px] border transition-all capitalize"
            style={{ background: form.category === cat ? c.bg : 'transparent', borderColor: form.category === cat ? c.border : 'rgba(255,255,255,0.08)', color: c.text }}>
            {cat}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs opacity-40 hover:opacity-70 transition-opacity border border-white/08">Cancel</button>
        <button
          onClick={() => {
            if (!form.title?.trim()) return;
            onSave({ id: initial?.id || Date.now().toString(), title: form.title!, date: form.date!, startTime: form.startTime!, endTime: form.endTime!, color: form.color || accent, category: (form.category || 'work') as CalEvent['category'], location: form.location, description: form.description });
          }}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all"
          style={{ background: accent }}>
          <Check size={11} className="inline mr-1" />Save Event
        </button>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { theme } = useOSStore();
  const accent = theme.accent;
  const dk = theme.mode === 'dark';
  const today = new Date();
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [events, setEvents] = useState<CalEvent[]>(DEMO_EVENTS);
  const [selected, setSelected] = useState<string | null>(todayStr());
  const [form, setForm] = useState<{ open: boolean; initial?: Partial<CalEvent>; editId?: string }>({ open: false });

  const bg   = dk ? '#0d0d1a' : '#f4f4fb';
  const card = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const bdr  = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const txt  = dk ? '#e2e8f0' : '#1e1e2e';

  const firstDay  = new Date(current.year, current.month, 1).getDay();
  const daysInMon = new Date(current.year, current.month + 1, 0).getDate();
  const prevDays  = new Date(current.year, current.month, 0).getDate();
  const cells: { day: number; month: 'cur' | 'prev' | 'next'; full: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const m = current.month === 0 ? 11 : current.month - 1;
    const y = current.month === 0 ? current.year - 1 : current.year;
    cells.push({ day: d, month: 'prev', full: dateStr(y, m, d) });
  }
  for (let d = 1; d <= daysInMon; d++) cells.push({ day: d, month: 'cur', full: dateStr(current.year, current.month, d) });
  while (cells.length % 7 !== 0) {
    const d = cells.length - daysInMon - firstDay + 1;
    const m = current.month === 11 ? 0 : current.month + 1;
    const y = current.month === 11 ? current.year + 1 : current.year;
    cells.push({ day: d, month: 'next', full: dateStr(y, m, d) });
  }

  const eventsOnDay = (date: string) => events.filter(e => e.date === date);
  const eventsOnWeek = useMemo(() => {
    const base = selected ? new Date(selected + 'T00:00:00') : new Date();
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i);
      const s = dateStr(d.getFullYear(), d.getMonth(), d.getDate());
      return { date: s, day: d, events: eventsOnDay(s) };
    });
  }, [selected, events]);

  const addEvent = (e: CalEvent) => {
    if (form.editId) setEvents(prev => prev.map(x => x.id === form.editId ? e : x));
    else setEvents(prev => [...prev, e]);
    setForm({ open: false });
  };
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const selectedEvents = selected ? eventsOnDay(selected) : [];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  function timeToMin(t: string): number {
    const [h, m] = t.split(':').map(Number); return h * 60 + m;
  }

  return (
    <div className="flex flex-col h-full" style={{ background: bg, color: txt }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ background: dk ? 'rgba(8,8,18,0.95)' : 'rgba(225,225,238,0.95)', borderColor: bdr }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(c => {
            const d = new Date(c.year, c.month - 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
          })} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><ChevronLeft size={14} /></button>
          <h2 className="text-sm font-bold min-w-[130px] text-center">
            {MONTHS[current.month]} {current.year}
          </h2>
          <button onClick={() => setCurrent(c => {
            const d = new Date(c.year, c.month + 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
          })} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><ChevronRight size={14} /></button>
          <button onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
            className="px-2 py-1 text-[10px] rounded-lg hover:bg-white/10 transition-colors opacity-50 hover:opacity-80">Today</button>
        </div>
        <div className="flex items-center gap-1">
          {[
            { id: 'month', Icon: LayoutGrid, label: 'Month' },
            { id: 'week',  Icon: CalendarDays, label: 'Week' },
            { id: 'agenda',Icon: List,       label: 'Agenda' },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id as typeof view)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all"
              style={{
                background: view === v.id ? `${accent}22` : 'transparent',
                color: view === v.id ? accent : 'inherit',
                opacity: view === v.id ? 1 : 0.5,
                border: view === v.id ? `1px solid ${accent}40` : '1px solid transparent',
              }}>
              <v.Icon size={11} /> {v.label}
            </button>
          ))}
          <button onClick={() => setForm({ open: true, initial: { date: selected || todayStr() } })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-white ml-1"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
            <Plus size={11} /> New
          </button>
        </div>
      </div>

      {/* ── MONTH VIEW ── */}
      {view === 'month' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Calendar grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Day names */}
            <div className="grid grid-cols-7 border-b flex-shrink-0" style={{ borderColor: bdr }}>
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold opacity-30 uppercase tracking-wide py-2">{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div className="flex-1 grid grid-cols-7 overflow-hidden">
              {cells.map((c, i) => {
                const cellEvents = eventsOnDay(c.full);
                const isToday = c.full === todayStr();
                const isSel = c.full === selected;
                const isCur = c.month === 'cur';
                return (
                  <div key={i}
                    onClick={() => setSelected(c.full)}
                    className="border-r border-b flex flex-col cursor-pointer transition-colors overflow-hidden"
                    style={{
                      borderColor: bdr,
                      background: isSel ? `${accent}10` : 'transparent',
                      minHeight: 80,
                    }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = dk ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'; }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <div className="flex items-start justify-between px-1.5 pt-1 flex-shrink-0">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all"
                        style={{
                          background: isToday ? accent : 'transparent',
                          color: isToday ? 'white' : isCur ? undefined : 'rgba(150,150,180,0.4)',
                          fontWeight: isToday ? 700 : isCur ? 500 : 400,
                        }}>
                        {c.day}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 px-1 pb-1 overflow-hidden">
                      {cellEvents.slice(0, 3).map(ev => {
                        const col = COLORS[ev.category];
                        return (
                          <div key={ev.id}
                            onClick={e => { e.stopPropagation(); setSelected(c.full); setForm({ open: true, initial: ev, editId: ev.id }); }}
                            className="text-[9px] px-1.5 py-0.5 rounded-md truncate font-medium cursor-pointer hover:brightness-110 transition-all"
                            style={{ background: col.bg, color: col.text, borderLeft: `2px solid ${col.border}` }}>
                            {ev.startTime} {ev.title}
                          </div>
                        );
                      })}
                      {cellEvents.length > 3 && (
                        <span className="text-[9px] opacity-40 px-1.5">+{cellEvents.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          {selected && (
            <div className="w-56 border-l flex flex-col flex-shrink-0" style={{ borderColor: bdr, background: dk ? 'rgba(8,8,18,0.92)' : 'rgba(225,225,238,0.92)' }}>
              <div className="px-3 py-3 border-b flex-shrink-0" style={{ borderColor: bdr }}>
                <div className="text-[11px] font-bold opacity-60 uppercase tracking-wider">
                  {new Date(selected + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long' })}
                </div>
                <div className="text-2xl font-bold" style={{ color: selected === todayStr() ? accent : undefined }}>
                  {new Date(selected + 'T00:00:00').getDate()}
                </div>
                <div className="text-[11px] opacity-40">
                  {new Date(selected + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {selectedEvents.length === 0
                  ? <p className="text-[11px] opacity-25 text-center py-6">No events</p>
                  : selectedEvents.map(ev => {
                    const col = COLORS[ev.category];
                    return (
                      <div key={ev.id} className="mb-2 p-2.5 rounded-xl"
                        style={{ background: col.bg, border: `1px solid ${col.border}30` }}>
                        <p className="text-xs font-semibold leading-tight" style={{ color: col.text }}>{ev.title}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">
                          <Clock size={8} className="inline mr-1" />{ev.startTime} – {ev.endTime}
                        </p>
                        {ev.location && <p className="text-[10px] opacity-50 mt-0.5"><MapPin size={8} className="inline mr-1" />{ev.location}</p>}
                        <div className="flex gap-1 mt-2">
                          <button onClick={() => setForm({ open: true, initial: ev, editId: ev.id })}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors"><Edit3 size={10} style={{ color: col.text }} /></button>
                          <button onClick={() => deleteEvent(ev.id)}
                            className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 size={10} className="text-red-400" /></button>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="p-2 border-t flex-shrink-0" style={{ borderColor: bdr }}>
                <button onClick={() => setForm({ open: true, initial: { date: selected } })}
                  className="w-full py-2 rounded-xl text-[11px] text-white flex items-center justify-center gap-1"
                  style={{ background: `${accent}40`, border: `1px solid ${accent}50` }}>
                  <Plus size={10} /> Add Event
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WEEK VIEW ── */}
      {view === 'week' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Day headers */}
          <div className="grid flex-shrink-0 border-b" style={{ gridTemplateColumns: '48px repeat(7,1fr)', borderColor: bdr }}>
            <div />
            {eventsOnWeek.map(d => {
              const isToday = dateStr(d.day.getFullYear(), d.day.getMonth(), d.day.getDate()) === todayStr();
              return (
                <div key={d.date} className="text-center py-2 cursor-pointer" onClick={() => setSelected(d.date)}>
                  <div className="text-[10px] opacity-40 uppercase">{DAYS[d.day.getDay()]}</div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto mt-0.5"
                    style={{ background: isToday ? accent : 'transparent', color: isToday ? 'white' : undefined }}>
                    {d.day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Hour grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid relative" style={{ gridTemplateColumns: '48px repeat(7,1fr)' }}>
              {hours.map(h => (
                <>
                  <div key={`h${h}`} className="text-right pr-2 text-[9px] opacity-30 pt-1 border-b flex-shrink-0"
                    style={{ height: 52, borderColor: bdr }}>
                    {h > 0 ? `${pad(h)}:00` : ''}
                  </div>
                  {eventsOnWeek.map(d => {
                    const evs = d.events.filter(e => {
                      const [eh] = e.startTime.split(':').map(Number); return eh === h;
                    });
                    return (
                      <div key={`${d.date}-${h}`}
                        className="border-b border-l relative"
                        style={{ height: 52, borderColor: bdr, background: h % 2 === 0 ? (dk ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)') : 'transparent' }}
                        onDoubleClick={() => { setSelected(d.date); setForm({ open: true, initial: { date: d.date, startTime: `${pad(h)}:00`, endTime: `${pad((h+1)%24)}:00` } }); }}>
                        {evs.map(ev => {
                          const col = COLORS[ev.category];
                          const startMin = timeToMin(ev.startTime) - h * 60;
                          const dur = Math.min(52, (timeToMin(ev.endTime) - timeToMin(ev.startTime)) / 60 * 52);
                          return (
                            <div key={ev.id}
                              className="absolute inset-x-0.5 rounded-lg px-1.5 text-[9px] font-medium overflow-hidden cursor-pointer hover:brightness-110"
                              style={{ top: startMin / 60 * 52, height: Math.max(18, dur), background: col.bg, borderLeft: `2px solid ${col.border}`, color: col.text, zIndex: 1 }}
                              onClick={e => { e.stopPropagation(); setForm({ open: true, initial: ev, editId: ev.id }); }}>
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AGENDA VIEW ── */}
      {view === 'agenda' && (
        <div className="flex-1 overflow-y-auto">
          {(() => {
            const start = new Date(); start.setDate(start.getDate() - 7);
            const days = Array.from({ length: 60 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
            return days.map(d => {
              const s = dateStr(d.getFullYear(), d.getMonth(), d.getDate());
              const dayEvs = eventsOnDay(s);
              const isToday = s === todayStr();
              return (
                <div key={s} className={`flex border-b ${!isToday && dayEvs.length === 0 ? 'opacity-0 h-0 overflow-hidden border-0 p-0' : ''}`}
                  style={{ borderColor: bdr }}>
                  {/* Date column */}
                  <div className="w-20 flex-shrink-0 px-3 py-3 text-center border-r" style={{ borderColor: bdr }}>
                    <div className="text-[10px] opacity-40 uppercase">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                    <div className={`text-lg font-bold mt-0.5 w-9 h-9 rounded-full flex items-center justify-center mx-auto`}
                      style={{ background: isToday ? accent : 'transparent', color: isToday ? 'white' : undefined }}>
                      {d.getDate()}
                    </div>
                    <div className="text-[9px] opacity-25">{MONTHS[d.getMonth()].slice(0,3)}</div>
                  </div>
                  {/* Events */}
                  <div className="flex-1 py-2 px-3">
                    {dayEvs.length === 0
                      ? isToday && <p className="text-xs opacity-20 py-2">No events today</p>
                      : dayEvs.map(ev => {
                        const col = COLORS[ev.category];
                        return (
                          <div key={ev.id}
                            className="flex items-start gap-3 mb-2 p-2.5 rounded-xl cursor-pointer hover:brightness-105 transition-all"
                            style={{ background: col.bg, borderLeft: `3px solid ${col.border}` }}
                            onClick={() => setForm({ open: true, initial: ev, editId: ev.id })}>
                            <div className="flex-1">
                              <p className="text-xs font-semibold" style={{ color: col.text }}>{ev.title}</p>
                              <p className="text-[10px] opacity-50 mt-0.5">{ev.startTime} – {ev.endTime}{ev.location ? ` · ${ev.location}` : ''}</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                              className="p-1 rounded hover:bg-red-500/20 transition-colors opacity-40 hover:opacity-80">
                              <Trash2 size={10} className="text-red-400" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ── Event Form Modal ── */}
      {form.open && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="w-80 rounded-2xl overflow-hidden"
            style={{ background: dk ? 'rgba(12,12,22,0.99)' : 'rgba(248,248,255,0.99)', border: `1px solid ${bdr}`, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: bdr }}>
              <h3 className="text-sm font-bold">{form.editId ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => setForm({ open: false })}><X size={14} className="opacity-40" /></button>
            </div>
            <EventForm
              initial={form.initial}
              onSave={addEvent}
              onClose={() => setForm({ open: false })}
              accent={accent}
            />
          </div>
        </div>
      )}
    </div>
  );
}
