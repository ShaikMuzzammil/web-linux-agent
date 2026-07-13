'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Copy, Check, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
export default function JsonFormatter({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);
  const format = () => { try { const p = JSON.parse(input); setOutput(JSON.stringify(p, null, indent)); setError(''); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Invalid JSON'); setOutput(''); } };
  const minify = () => { try { const p = JSON.parse(input); setOutput(JSON.stringify(p)); setError(''); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Invalid JSON'); } };
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d1117' : '#f6f8fa', color: theme.mode === 'dark' ? '#e6edf3' : '#24292f', fontFamily: 'monospace' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-bold">JSON Formatter</span>
        <div className="flex gap-1 ml-auto">
          {[2,4].map(n => <button key={n} onClick={() => setIndent(n)} className="px-2 py-0.5 rounded text-[10px]" style={{ background: indent === n ? `${theme.accent}30` : 'transparent', color: indent === n ? theme.accent : 'inherit' }}>{n} spaces</button>)}
          <button onClick={format} className="px-3 py-1 rounded-lg text-xs text-white" style={{ background: theme.accent }}>Format</button>
          <button onClick={minify} className="px-3 py-1 rounded-lg text-xs hover:bg-white/10">Minify</button>
          {output && <button onClick={copy} className="px-3 py-1 rounded-lg text-xs hover:bg-white/10">{copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}</button>}
        </div>
      </div>
      {error && <div className="px-3 py-2 text-xs text-red-400 flex items-center gap-1.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#f8717115' }}><AlertCircle size={12} />{error}</div>}
      <div className="flex-1 flex gap-0 overflow-hidden">
        <div className="flex-1 flex flex-col border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] opacity-40 px-3 py-1 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>Input</p>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder='{"key": "value"}' className="flex-1 p-3 bg-transparent resize-none outline-none text-xs leading-relaxed" style={{ caretColor: theme.accent }} />
        </div>
        <div className="flex-1 flex flex-col">
          <p className="text-[10px] opacity-40 px-3 py-1 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>Output</p>
          <pre className="flex-1 p-3 overflow-auto text-xs leading-relaxed whitespace-pre" style={{ color: '#4ade80' }}>{output}</pre>
        </div>
      </div>
    </div>
  );
}
