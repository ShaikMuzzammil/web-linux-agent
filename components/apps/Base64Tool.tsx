'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { Copy, Check, ArrowDown, ArrowUp } from 'lucide-react';
export default function Base64Tool({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'encode'|'decode'>('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const run = () => {
    try {
      setResult(mode === 'encode' ? btoa(unescape(encodeURIComponent(text))) : decodeURIComponent(escape(atob(text))));
      setError('');
    } catch { setError('Invalid input for ' + mode); setResult(''); }
  };
  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="flex gap-2">
        {(['encode','decode'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className="flex-1 py-2 rounded-xl text-sm font-medium capitalize" style={{ background: mode === m ? theme.accent : 'rgba(255,255,255,0.06)', color: mode === m ? '#fff' : 'inherit' }}>{m}</button>
        ))}
      </div>
      <div>
        <p className="text-[10px] opacity-50 mb-1">{mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}</p>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Enter base64 to decode…'}
          className="w-full px-3 py-2 rounded-xl text-xs font-mono resize-none outline-none" style={{ background: 'rgba(255,255,255,0.06)', caretColor: theme.accent }} />
      </div>
      <button onClick={run} className="py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: theme.accent }}>
        {mode === 'encode' ? <ArrowDown size={14} /> : <ArrowUp size={14} />} {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {result && (
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-[10px] opacity-50">{mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}</p>
            <button onClick={copy} className="text-[10px] flex items-center gap-1" style={{ color: theme.accent }}>
              {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
            </button>
          </div>
          <pre className="px-3 py-2 rounded-xl text-xs font-mono overflow-x-auto break-all" style={{ background: 'rgba(255,255,255,0.06)', color: theme.accent }}>{result}</pre>
        </div>
      )}
    </div>
  );
}
