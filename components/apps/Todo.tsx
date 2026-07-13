'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, Circle, ChevronDown, Calendar, Flag, Tag, Search, Cloud, Loader2, Filter } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { Task } from '@/types';
import { generateId } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high'] as const;
const PRIORITY_COLORS = { low: '#4ade80', medium: '#f59e0b', high: '#f87171' };

function loadTasks(): Task[] { try { return JSON.parse(localStorage.getItem('wlos_tasks') || '[]'); } catch { return []; } }
function saveTasks(t: Task[]) { localStorage.setItem('wlos_tasks', JSON.stringify(t)); }

export default function Todo({ windowId }: { windowId: string }) {
  const { theme, auth } = useOSStore();
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newDue, setNewDue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncToCloud = useCallback(async (updated: Task[]) => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        await fetch('/api/sync/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks: updated }),
        });
      } catch { } finally { setSyncing(false); }
    }, 1500);
  }, [auth]);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    fetch('/api/sync/tasks').then((r) => r.json()).then((data) => {
      if (data.tasks?.length > 0) { setTasks(data.tasks); saveTasks(data.tasks); }
    }).catch(() => {});
  }, [auth]);

  const addTask = useCallback(() => {
    if (!newTitle.trim()) return;
    const task: Task = { id: generateId(), title: newTitle.trim(), completed: false, priority: newPriority, dueDate: newDue || undefined, tags: [], createdAt: Date.now(), updatedAt: Date.now() };
    const updated = [task, ...tasks];
    setTasks(updated); saveTasks(updated);
    setNewTitle(''); setNewDue('');
    syncToCloud(updated);
  }, [newTitle, newPriority, newDue, tasks, syncToCloud]);

  const toggle = useCallback((id: string) => {
    const updated = tasks.map((t) => t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t);
    setTasks(updated); saveTasks(updated); syncToCloud(updated);
  }, [tasks, syncToCloud]);

  const remove = useCallback((id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated); saveTasks(updated); syncToCloud(updated);
  }, [tasks, syncToCloud]);

  const filtered = tasks.filter((t) => {
    const matchFilter = filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed;
    const matchQuery = !query || t.title.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pm = { high: 0, medium: 1, low: 2 };
    return pm[a.priority] - pm[b.priority];
  });

  const done = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col h-full text-sm" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base">My Tasks</h1>
            <p className="text-xs opacity-40">{done}/{tasks.length} completed</p>
          </div>
          {syncing && <Loader2 size={14} className="animate-spin text-purple-400" />}
          {!syncing && auth.isAuthenticated && !auth.isGuest && <Cloud size={14} className="text-green-400/60" />}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: tasks.length ? `${(done / tasks.length) * 100}%` : '0%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}80)` }} />
        </div>
      </div>

      {/* Add task input */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
              placeholder="Add a task…" className="flex-1 bg-transparent outline-none text-sm"
              style={{ caretColor: theme.accent }} />
            <button onClick={addTask} disabled={!newTitle.trim()} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30" style={{ background: theme.accent }}>
              <Plus size={14} className="text-white" />
            </button>
          </div>
          <div className="flex gap-2 items-center">
            {/* Priority */}
            <div className="flex gap-1">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setNewPriority(p)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-all"
                  style={{ background: newPriority === p ? PRIORITY_COLORS[p] + '30' : 'rgba(255,255,255,0.05)', color: newPriority === p ? PRIORITY_COLORS[p] : 'inherit', border: newPriority === p ? `1px solid ${PRIORITY_COLORS[p]}40` : '1px solid transparent' }}>
                  <Flag size={9} className="inline mr-0.5" />{p}
                </button>
              ))}
            </div>
            {/* Due date */}
            <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[10px] opacity-50 cursor-pointer"
              style={{ colorScheme: 'dark' }} />
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="px-3 pb-2 flex gap-2 flex-shrink-0">
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="px-2 py-0.5 rounded-md text-[10px] capitalize transition-all"
              style={{ background: filter === f ? `${theme.accent}25` : 'transparent', color: filter === f ? theme.accent : 'inherit' }}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
            className="w-full pl-5 pr-2 py-1 rounded-lg text-[10px] outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', caretColor: theme.accent }} />
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 opacity-30">
            <Check size={24} /><p className="text-xs mt-2">No tasks</p>
          </div>
        ) : filtered.map((task) => {
          const isOverdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
          const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
          return (
            <div key={task.id} className="flex items-start gap-2.5 p-3 rounded-xl transition-all group"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${task.completed ? 'transparent' : 'rgba(255,255,255,0.06)'}`, opacity: task.completed ? 0.5 : 1 }}>
              <button onClick={() => toggle(task.id)} className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                style={{ borderColor: task.completed ? theme.accent : PRIORITY_COLORS[task.priority], background: task.completed ? theme.accent : 'transparent' }}>
                {task.completed && <Check size={11} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                {task.dueDate && (
                  <p className="text-[10px] mt-0.5 flex items-center gap-1"
                    style={{ color: isOverdue ? '#f87171' : isDueToday ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>
                    <Calendar size={9} />
                    {isOverdue ? 'Overdue · ' : isDueToday ? 'Today · ' : ''}
                    {format(new Date(task.dueDate), 'MMM d')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[task.priority] }} />
                <button onClick={() => remove(task.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
