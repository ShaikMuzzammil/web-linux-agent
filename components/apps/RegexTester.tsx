'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
export default function RegexTester({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  let matches: RegExpMatchArray[] = [];
  let highlighted = text;
  try {
    if (pattern) {
      const re = new RegExp(pattern, flags);
      const raw = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
      matches = raw;
      highlighted = text.replace(re, m => `<mark style="background:${theme.accent}40;color:${theme.accent};border-radius:3px;padding:0 1px">${m}</mark>`);
      setError('');
    }
  } catch (e: unknown) { if (e instanceof Error) setError(e.message); }
  const COMMON = [['Email', '[\\w.-]+@[\\w.-]+\\.\\w+'], ['URL', 'https?://[^\\s]+'], ['Phone', '\\d{10}|\\d{3}[-.]\\d{3}[-.]\\d{4}'], ['IP', '\\d{1,3}(\\.\\d{1,3}){3}'], ['Hex Color', '#[0-9a-fA-F]{3,6}'], ['Number', '-?\\d+\\.?\\d*']];
  return (
    <div className="flex flex-col h-full text-sm" style={{ background: theme.mode === 'dark' ? '#0d1117' : '#f6f8fa', color: theme.mode === 'dark' ? '#e6edf3' : '#24292f' }}>
      <div className="p-3 border-b flex-shrink-0 space-y-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 flex-1 px-2 py-1.5 rounded-lg font-mono text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <span className="opacity-40">/</span>
            <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="pattern" className="flex-1 bg-transparent outline-none" style={{ caretColor: theme.accent }} />
            <span className="opacity-40">/</span>
            <input value={flags} onChange={e => setFlags(e.target.value)} className="w-8 bg-transparent outline-none" style={{ color: theme.accent }} />
          </div>
          <div className="flex items-center gap-1.5 text-xs opacity-60">
            <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{ background: `${theme.accent}20`, color: theme.accent }}>{matches.length}</span> matches
          </div>
        </div>
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        <div className="flex gap-1 flex-wrap">
          {COMMON.map(([l, p]) => <button key={l} onClick={() => setPattern(p)} className="px-2 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.07)' }}>{l}</button>)}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter test string…" className="flex-1 p-3 bg-transparent resize-none outline-none text-xs font-mono" style={{ caretColor: theme.accent }} />
        {matches.length > 0 && (
          <div className="border-t p-3 max-h-32 overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] opacity-40 mb-1">Matches</p>
            {matches.map((m, i) => <div key={i} className="text-xs font-mono py-0.5" style={{ color: theme.accent }}>[{i+1}] &quot;{m[0]}&quot; at index {m.index}</div>)}
          </div>
        )}
        {pattern && text && (
          <div className="border-t p-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] opacity-40 mb-1">Preview</p>
            <div className="text-xs font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: highlighted }} />
          </div>
        )}
      </div>
    </div>
  );
}
