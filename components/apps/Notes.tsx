'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Trash2, Pin, PinOff, Folder, FolderPlus, Bold, Italic, List, ListOrdered, Code, Hash, Save, Cloud, Loader2, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { Note } from '@/types';
import { generateId } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#1e1e2e', '#1a1a2e', '#162032', '#1a2e1a', '#2e1a1a', '#2e2a1a', '#1a2a2e'];

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem('wlos_notes') || '[]'); } catch { return []; }
}
function saveNotes(n: Note[]) { localStorage.setItem('wlos_notes', JSON.stringify(n)); }

export default function Notes({ windowId }: { windowId: string }) {
  const { theme, auth, addNotification } = useOSStore();
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote = notes.find((n) => n.id === selected);

  const update = useCallback((patch: Partial<Note>) => {
    if (!selected) return;
    const updated = notes.map((n) => n.id === selected ? { ...n, ...patch, updatedAt: Date.now() } : n);
    setNotes(updated);
    saveNotes(updated);
    setSynced(false);

    // Debounced cloud sync
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!auth.isAuthenticated || auth.isGuest) return;
      setSyncing(true);
      try {
        await fetch('/api/sync/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: updated }),
        });
        setSynced(true);
      } catch { /* offline */ } finally { setSyncing(false); }
    }, 1500);
  }, [selected, notes, auth]);

  const createNote = useCallback(() => {
    const note: Note = { id: generateId(), title: 'Untitled Note', content: '', color: COLORS[0], isPinned: false, createdAt: Date.now(), updatedAt: Date.now() };
    const updated = [note, ...notes];
    setNotes(updated); saveNotes(updated);
    setSelected(note.id);
  }, [notes]);

  const deleteNote = useCallback((id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated); saveNotes(updated);
    if (selected === id) setSelected(null);
  }, [notes, selected]);

  const togglePin = useCallback((id: string) => {
    const updated = notes.map((n) => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    setNotes(updated); saveNotes(updated);
  }, [notes]);

  // Load from cloud on mount
  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    fetch('/api/sync/notes').then((r) => r.json()).then((data) => {
      if (data.notes?.length > 0) { setNotes(data.notes); saveNotes(data.notes); }
    }).catch(() => { /* offline */ });
  }, [auth]);

  const filtered = notes
    .filter((n) => !query || n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });

  const pinned = filtered.filter((n) => n.isPinned);
  const unpinned = filtered.filter((n) => !n.isPinned);

  const NoteItem = ({ note }: { note: Note }) => (
    <div
      onClick={() => setSelected(note.id)}
      className="p-3 rounded-xl cursor-pointer transition-all border"
      style={{
        background: selected === note.id ? `${theme.accent}20` : note.color,
        borderColor: selected === note.id ? theme.accent : 'transparent',
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs font-semibold text-white truncate flex-1">{note.title || 'Untitled'}</p>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); togglePin(note.id); }} className="text-white/40 hover:text-yellow-400 transition-colors">
            {note.isPinned ? <Pin size={11} /> : <PinOff size={11} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-white/40 hover:text-red-400 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <p className="text-[11px] text-white/50 mt-1 line-clamp-2">{note.content || 'No content'}</p>
      <p className="text-[10px] text-white/30 mt-1.5">{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</p>
    </div>
  );

  // Toolbar action
  const applyFormat = (tag: string) => {
    if (!selectedNote) return;
    const textarea = document.getElementById('notes-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const { selectionStart: s, selectionEnd: e } = textarea;
    const sel = textarea.value.slice(s, e);
    const wrap: Record<string, [string, string]> = {
      bold: ['**', '**'], italic: ['_', '_'], code: ['`', '`'],
      h1: ['# ', ''], h2: ['## ', ''], ul: ['- ', ''], ol: ['1. ', ''],
    };
    const [pre, suf] = wrap[tag] || ['', ''];
    const newContent = textarea.value.slice(0, s) + pre + sel + suf + textarea.value.slice(e);
    update({ content: newContent });
  };

  return (
    <div className="flex h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Sidebar */}
      <div className="w-56 flex flex-col border-r flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-2 flex gap-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={createNote} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
            style={{ background: theme.accent }}
          >
            <Plus size={13} /> New Note
          </button>
        </div>

        {/* Search */}
        <div className="p-2 relative">
          <Search size={11} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…"
            className="w-full pl-6 pr-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', caretColor: theme.accent }} />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pinned.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40 px-1 mb-1">Pinned</p>
              {pinned.map((n) => <NoteItem key={n.id} note={n} />)}
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40 px-1 mb-1 mt-2">Notes</p>}
              {unpinned.map((n) => <NoteItem key={n.id} note={n} />)}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 opacity-30">
              <Hash size={24} /><p className="text-xs mt-2">No notes yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      {selectedNote ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Format toolbar */}
          <div className="flex items-center gap-0.5 px-3 py-1.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[['bold','Bold',<Bold key="b" size={12}/>],['italic','Italic',<Italic key="i" size={12}/>],['code','Code',<Code key="c" size={12}/>],['h1','H1',<span key="h1" className="font-bold text-xs">H1</span>],['h2','H2',<span key="h2" className="font-bold text-xs">H2</span>],['ul','Bullet',<List key="ul" size={12}/>],['ol','Ordered',<ListOrdered key="ol" size={12}/>]].map(([tag, title, icon]) => (
              <button key={String(tag)} onClick={() => applyFormat(String(tag))} title={String(title)} className="p-1.5 rounded hover:bg-white/10 transition-colors opacity-60 hover:opacity-100">
                {icon}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              {syncing && <><Loader2 size={11} className="animate-spin text-purple-400" /><span className="text-[10px] text-purple-400">Saving…</span></>}
              {synced && !syncing && <><Cloud size={11} className="text-green-400" /><span className="text-[10px] text-green-400">Saved</span></>}
              {!auth.isAuthenticated && <span className="text-[10px] opacity-30">Local only</span>}
            </div>
          </div>

          {/* Title */}
          <input
            value={selectedNote.title}
            onChange={(e) => update({ title: e.target.value })}
            className="px-4 pt-4 pb-1 text-xl font-bold bg-transparent outline-none w-full"
            placeholder="Note title"
            style={{ caretColor: theme.accent }}
          />

          {/* Content */}
          <textarea
            id="notes-editor"
            value={selectedNote.content}
            onChange={(e) => update({ content: e.target.value })}
            className="flex-1 px-4 py-2 bg-transparent outline-none resize-none text-sm leading-relaxed"
            placeholder="Start writing…"
            style={{ caretColor: theme.accent }}
          />

          {/* Color picker */}
          <div className="flex gap-1.5 px-4 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-[10px] opacity-40 self-center">Color:</span>
            {COLORS.map((c) => (
              <button key={c} onClick={() => update({ color: c })}
                className="w-5 h-5 rounded-full transition-all"
                style={{ background: c, border: selectedNote.color === c ? `2px solid ${theme.accent}` : '1px solid rgba(255,255,255,0.1)', transform: selectedNote.color === c ? 'scale(1.2)' : 'scale(1)' }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-3">
          <Hash size={48} />
          <p className="text-sm">Select a note or create one</p>
          <button onClick={createNote} className="text-xs px-4 py-2 rounded-lg" style={{ background: `${theme.accent}30`, color: theme.accent }}>
            <Plus size={13} className="inline mr-1" />New Note
          </button>
        </div>
      )}
    </div>
  );
}
