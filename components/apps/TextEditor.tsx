'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Save, Plus, X, FileText, Moon, Sun, WrapText, Search, Replace } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { useFileSystem } from '@/hooks/useFileSystem';

interface EditorTab { id: string; name: string; content: string; dirty: boolean; fsNodeId?: string }

const LANG_MAP: Record<string, string> = {
  js: 'JavaScript', ts: 'TypeScript', tsx: 'TSX', jsx: 'JSX', py: 'Python',
  md: 'Markdown', json: 'JSON', html: 'HTML', css: 'CSS', sh: 'Shell', txt: 'Text',
};

const getLang = (name: string) => LANG_MAP[name.split('.').pop()?.toLowerCase() || ''] || 'Text';

export default function TextEditor({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const fs = useFileSystem();
  const [tabs, setTabs] = useState<EditorTab[]>([{ id: '1', name: 'untitled.txt', content: '', dirty: false }]);
  const [activeId, setActiveId] = useState('1');
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNums, setLineNums] = useState(true);
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const current = tabs.find((t) => t.id === activeId) || tabs[0];

  // Check if a file node was requested to be opened (via FS)
  useEffect(() => {
    const selected = fs.selectedIds[0];
    if (!selected) return;
    const node = fs.nodes[selected];
    if (!node || node.type === 'folder') return;
    const already = tabs.find((t) => t.fsNodeId === selected);
    if (already) { setActiveId(already.id); return; }
    const id = Math.random().toString(36).slice(2);
    setTabs((prev) => [...prev, { id, name: node.name, content: node.content || '', dirty: false, fsNodeId: selected }]);
    setActiveId(id);
  }, [fs.selectedIds]);

  const updateContent = useCallback((content: string) => {
    setTabs((prev) => prev.map((t) => t.id === activeId ? { ...t, content, dirty: true } : t));
  }, [activeId]);

  const save = useCallback(() => {
    if (current.fsNodeId) {
      fs.updateFile(current.fsNodeId, current.content);
    } else {
      // Create new file in FS
      const node = fs.getNodeByPath('/home/user/Documents');
      const parentId = node?.id || 'user';
      const nodeId = fs.createFile(parentId, current.name, current.content);
      setTabs((prev) => prev.map((t) => t.id === activeId ? { ...t, dirty: false, fsNodeId: nodeId } : t));
      return;
    }
    setTabs((prev) => prev.map((t) => t.id === activeId ? { ...t, dirty: false } : t));
  }, [current, activeId, fs]);

  const newTab = () => {
    const id = Math.random().toString(36).slice(2);
    setTabs((prev) => [...prev, { id, name: 'untitled.txt', content: '', dirty: false }]);
    setActiveId(id);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) { setTabs([{ id: '1', name: 'untitled.txt', content: '', dirty: false }]); setActiveId('1'); return; }
    const idx = tabs.findIndex((t) => t.id === id);
    const next = tabs[idx === tabs.length - 1 ? idx - 1 : idx + 1];
    setTabs((prev) => prev.filter((t) => t.id !== id));
    setActiveId(next.id);
  };

  const handleFind = () => {
    if (!findText || !textareaRef.current) return;
    const idx = current.content.toLowerCase().indexOf(findText.toLowerCase());
    if (idx >= 0) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(idx, idx + findText.length);
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    const newContent = current.content.replaceAll(findText, replaceText);
    updateContent(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') { e.preventDefault(); save(); }
      if (e.key === 'f') { e.preventDefault(); setFindOpen((v) => !v); }
      if (e.key === 'n') { e.preventDefault(); newTab(); }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: s, selectionEnd: end } = ta;
      const newContent = current.content.slice(0, s) + '  ' + current.content.slice(end);
      updateContent(newContent);
      setTimeout(() => ta.setSelectionRange(s + 2, s + 2), 0);
    }
  };

  const lines = current.content.split('\n').length;
  const col = textareaRef.current ? current.content.slice(0, textareaRef.current.selectionStart || 0).split('\n').pop()?.length ?? 0 : 0;

  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d1117' : '#f6f8fa', color: theme.mode === 'dark' ? '#e6edf3' : '#24292f', fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace' }}>
      {/* Tabs */}
      <div className="flex items-center gap-0 overflow-x-auto border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: theme.mode === 'dark' ? 'rgba(10,10,20,0.8)' : 'rgba(225,230,235,0.9)' }}>
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => setActiveId(tab.id)}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer border-r flex-shrink-0 min-w-[100px] max-w-[160px] group"
            style={{ background: tab.id === activeId ? (theme.mode === 'dark' ? '#0d1117' : '#f6f8fa') : 'transparent', borderColor: 'rgba(255,255,255,0.06)', borderBottom: tab.id === activeId ? `2px solid ${theme.accent}` : '2px solid transparent' }}>
            <FileText size={11} className="flex-shrink-0 opacity-40" />
            <span className="text-xs truncate flex-1">{tab.name}{tab.dirty ? ' ●' : ''}</span>
            <button onClick={(e) => closeTab(tab.id, e)} className="opacity-0 group-hover:opacity-100 flex-shrink-0"><X size={10} /></button>
          </div>
        ))}
        <button onClick={newTab} className="p-2 hover:bg-white/08 flex-shrink-0"><Plus size={13} /></button>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-1 px-2">
          <button onClick={() => setWordWrap((v) => !v)} title="Word Wrap" className="p-1.5 rounded hover:bg-white/10" style={{ color: wordWrap ? theme.accent : 'inherit' }}><WrapText size={13} /></button>
          <button onClick={() => setFindOpen((v) => !v)} title="Find (Ctrl+F)" className="p-1.5 rounded hover:bg-white/10"><Search size={13} /></button>
          <button onClick={save} title="Save (Ctrl+S)" className="p-1.5 rounded hover:bg-white/10" style={{ color: current.dirty ? theme.accent : 'inherit' }}><Save size={13} /></button>
        </div>
      </div>

      {/* Find/Replace bar */}
      {findOpen && (
        <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
          <Search size={13} className="opacity-40" />
          <input value={findText} onChange={(e) => setFindText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleFind(); if (e.key === 'Escape') setFindOpen(false); }}
            placeholder="Find…" className="bg-transparent outline-none text-xs px-2 py-1 rounded border w-32" style={{ borderColor: 'rgba(255,255,255,0.15)', caretColor: theme.accent }} autoFocus />
          <Replace size={13} className="opacity-40" />
          <input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace…"
            className="bg-transparent outline-none text-xs px-2 py-1 rounded border w-32" style={{ borderColor: 'rgba(255,255,255,0.15)', caretColor: theme.accent }} />
          <button onClick={handleFind} className="text-xs px-2 py-1 rounded" style={{ background: `${theme.accent}20`, color: theme.accent }}>Find</button>
          <button onClick={handleReplace} className="text-xs px-2 py-1 rounded" style={{ background: `${theme.accent}20`, color: theme.accent }}>Replace All</button>
          <button onClick={() => setFindOpen(false)} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex">
        {/* Line numbers */}
        {lineNums && (
          <div className="flex-shrink-0 py-2 px-2 text-right select-none overflow-hidden" style={{ background: theme.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', minWidth: 44, color: 'rgba(128,128,160,0.5)', fontSize: 12, lineHeight: '1.6', fontFamily: 'inherit' }}>
            {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={current.content}
          onChange={(e) => updateContent(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent outline-none resize-none text-xs leading-relaxed"
          style={{ caretColor: theme.accent, whiteSpace: wordWrap ? 'pre-wrap' : 'pre', overflowWrap: wordWrap ? 'break-word' : 'normal', overflowX: wordWrap ? 'hidden' : 'auto', lineHeight: 1.6 }}
          placeholder="Start typing…"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 text-[10px] opacity-50 border-t flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: theme.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)' }}>
        <span>{getLang(current.name)}</span>
        <span>Ln {lines}, Col {col}</span>
        <span>{current.content.length} chars</span>
        <span>UTF-8</span>
        <span>{current.dirty ? 'Modified' : 'Saved'}</span>
      </div>
    </div>
  );
}
