'use client';
import { useState, useCallback, useEffect } from 'react';
import { Delete, Clock, RotateCcw } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

type CalcMode = 'basic' | 'scientific';

const BTN_ROWS_BASIC = [
  [{ l: 'C', cls: 'func' }, { l: '±', cls: 'func' }, { l: '%', cls: 'func' }, { l: '÷', cls: 'op' }],
  [{ l: '7' }, { l: '8' }, { l: '9' }, { l: '×', cls: 'op' }],
  [{ l: '4' }, { l: '5' }, { l: '6' }, { l: '−', cls: 'op' }],
  [{ l: '1' }, { l: '2' }, { l: '3' }, { l: '+', cls: 'op' }],
  [{ l: '0', wide: true }, { l: '.' }, { l: '=', cls: 'eq' }],
];

const SCI_EXTRA = ['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', 'x³', 'π', 'e', '(', ')'];

export default function Calculator({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [mode, setMode] = useState<CalcMode>('basic');
  const [showHistory, setShowHistory] = useState(false);
  const [prevResult, setPrevResult] = useState<string | null>(null);

  const handleBtn = useCallback((label: string) => {
    if (label === 'C') { setDisplay('0'); setExpr(''); setPrevResult(null); return; }
    if (label === '⌫') { setDisplay((d) => d.length > 1 ? d.slice(0, -1) : '0'); return; }
    if (label === '±') { setDisplay((d) => d.startsWith('-') ? d.slice(1) : '-' + d); return; }
    if (label === '%') { try { setDisplay(String(parseFloat(display) / 100)); } catch { } return; }

    if (label === '=') {
      try {
        const e = expr + display;
        const safe = e
          .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
          .replace(/π/g, String(Math.PI)).replace(/e$/g, String(Math.E))
          .replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(').replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(').replace(/√\(/g, 'Math.sqrt(')
          .replace(/(\d+)\²/g, 'Math.pow($1,2)').replace(/(\d+)\³/g, 'Math.pow($1,3)');
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${safe})`)();
        const resultStr = Number.isInteger(result) ? String(result) : parseFloat(result.toFixed(10)).toString();
        setHistory((h) => [{ expr: e, result: resultStr }, ...h].slice(0, 20));
        setPrevResult(resultStr);
        setDisplay(resultStr);
        setExpr('');
      } catch { setDisplay('Error'); setExpr(''); }
      return;
    }

    const ops = ['+', '−', '×', '÷'];
    if (ops.includes(label)) {
      setExpr(display + label);
      setDisplay('0');
      return;
    }

    if (label === 'π') { setDisplay(String(Math.PI)); return; }
    if (label === 'e') { setDisplay(String(Math.E)); return; }
    if (label === 'x²') { const r = Math.pow(parseFloat(display), 2); setDisplay(String(r)); return; }
    if (label === 'x³') { const r = Math.pow(parseFloat(display), 3); setDisplay(String(r)); return; }

    const sciFunc: Record<string, (x: number) => number> = {
      sin: Math.sin, cos: Math.cos, tan: Math.tan,
      log: Math.log10, ln: Math.log, '√': Math.sqrt,
    };
    if (sciFunc[label]) {
      const r = sciFunc[label](parseFloat(display));
      setDisplay(parseFloat(r.toFixed(10)).toString());
      return;
    }

    if (label === '(' || label === ')') { setDisplay((d) => d + label); return; }

    if (label === '.') {
      if (!display.includes('.')) setDisplay((d) => d + '.');
      return;
    }

    setDisplay((d) => {
      if (d === '0' || (prevResult && d === prevResult)) { setPrevResult(null); return label; }
      return d.length < 15 ? d + label : d;
    });
  }, [display, expr, prevResult]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = { Enter: '=', Backspace: '⌫', Escape: 'C', '*': '×', '/': '÷', '-': '−' };
      const key = map[e.key] || e.key;
      if ('0123456789.+=×÷−+C⌫%'.includes(key)) handleBtn(key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleBtn]);

  const accentBg = `${theme.accent}30`;

  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Mode & history toggle */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0">
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {(['basic', 'scientific'] as CalcMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className="px-2 py-0.5 rounded-md text-[10px] font-medium capitalize transition-all"
              style={{ background: mode === m ? accentBg : 'transparent', color: mode === m ? theme.accent : 'inherit' }}>{m}</button>
          ))}
        </div>
        <button onClick={() => setShowHistory((v) => !v)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="History">
          <Clock size={14} />
        </button>
      </div>

      {/* Display */}
      <div className="px-4 py-3 text-right">
        {expr && <p className="text-xs opacity-40 truncate">{expr}</p>}
        <p className="text-3xl font-light tracking-tight truncate" style={{ color: theme.mode === 'dark' ? '#fff' : '#000' }}>
          {display}
        </p>
      </div>

      {/* Scientific row */}
      {mode === 'scientific' && (
        <div className="grid grid-cols-6 gap-1 px-2 pb-1">
          {SCI_EXTRA.map((b) => (
            <button key={b} onClick={() => handleBtn(b)}
              className="py-1.5 rounded-lg text-[11px] font-medium transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', color: theme.accent }}>
              {b}
            </button>
          ))}
        </div>
      )}

      {/* Main buttons */}
      <div className="flex-1 flex flex-col gap-1 px-2 pb-2">
        {BTN_ROWS_BASIC.map((row, ri) => (
          <div key={ri} className="flex gap-1 flex-1">
            {row.map((btn) => {
              const isFunc = btn.cls === 'func';
              const isOp = btn.cls === 'op';
              const isEq = btn.cls === 'eq';
              return (
                <button
                  key={btn.l}
                  onClick={() => handleBtn(btn.l)}
                  className="flex-1 rounded-xl font-medium text-lg transition-all hover:brightness-110 active:scale-95"
                  style={{
                    flex: btn.wide ? 2 : 1,
                    background: isEq ? theme.accent : isOp ? accentBg : isFunc ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                    color: isEq ? '#fff' : isOp ? theme.accent : 'inherit',
                    fontWeight: isOp || isEq ? 600 : 400,
                  }}
                >
                  {btn.l}
                </button>
              );
            })}
            {ri === 0 && (
              <button onClick={() => handleBtn('⌫')} className="rounded-xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95"
                style={{ flex: 0, width: 50, background: 'rgba(255,255,255,0.07)', color: '#f87171' }}>
                <Delete size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t z-20"
          style={{ background: theme.mode === 'dark' ? 'rgba(15,15,25,0.97)' : 'rgba(240,240,248,0.97)', borderColor: 'rgba(255,255,255,0.1)', maxHeight: '50%' }}>
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-semibold opacity-60">History</span>
            <div className="flex gap-2">
              <button onClick={() => setHistory([])} className="text-[10px] opacity-40 hover:opacity-70"><RotateCcw size={11} /></button>
              <button onClick={() => setShowHistory(false)} className="text-[10px] opacity-40 hover:opacity-70">✕</button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-40 p-2 space-y-1">
            {history.length === 0 ? <p className="text-xs text-center opacity-30 py-4">No history</p> : history.map((h, i) => (
              <div key={i} onClick={() => { setDisplay(h.result); setShowHistory(false); }} className="flex justify-between items-center px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/05 text-xs">
                <span className="opacity-40">{h.expr}</span>
                <span className="font-mono font-semibold">{h.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
