'use client';
import { useState, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { RotateCcw, Lightbulb, Check } from 'lucide-react';

const PUZZLES = [
  [5,3,0,0,7,0,0,0,0,6,0,0,1,9,5,0,0,0,0,9,8,0,0,0,0,6,0,8,0,0,0,6,0,0,0,3,4,0,0,8,0,3,0,0,1,7,0,0,0,2,0,0,0,6,0,6,0,0,0,0,2,8,0,0,0,0,4,1,9,0,0,5,0,0,0,0,8,0,0,7,9],
];
const SOLUTION = [5,3,4,6,7,8,9,1,2,6,7,2,1,9,5,3,4,8,1,9,8,3,4,2,5,6,7,8,5,9,7,6,1,4,2,3,4,2,6,8,5,3,7,9,1,7,1,3,9,2,4,8,5,6,9,6,1,5,3,7,2,8,4,2,8,7,4,1,9,6,3,5,3,4,5,2,8,6,1,7,9];

type Cell = { val: number; given: boolean; notes: Set<number>; error: boolean };

function makeGrid(puzzle: number[]): Cell[] {
  return puzzle.map(v => ({ val: v, given: v !== 0, notes: new Set<number>(), error: false }));
}

export default function Sudoku({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [grid, setGrid] = useState<Cell[]>(() => makeGrid(PUZZLES[0]));
  const [selected, setSelected] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState(false);

  const input = useCallback((num: number) => {
    if (selected === null || grid[selected].given) return;
    setGrid(prev => {
      const g = prev.map(c => ({ ...c, notes: new Set(c.notes) }));
      if (noteMode) {
        if (g[selected].notes.has(num)) g[selected].notes.delete(num);
        else g[selected].notes.add(num);
        g[selected].val = 0;
      } else {
        g[selected].val = num;
        g[selected].notes.clear();
        const correct = SOLUTION[selected] === num;
        g[selected].error = !correct;
        if (!correct) setMistakes(m => m + 1);
        // Check win
        if (g.every((c, i) => c.val === SOLUTION[i])) setWon(true);
      }
      return g;
    });
  }, [selected, grid, noteMode]);

  const hint = () => {
    if (selected === null || grid[selected].given || grid[selected].val === SOLUTION[selected]) return;
    setGrid(prev => {
      const g = prev.map(c => ({ ...c, notes: new Set(c.notes) }));
      g[selected].val = SOLUTION[selected];
      g[selected].error = false;
      g[selected].notes.clear();
      return g;
    });
  };

  const reset = () => { setGrid(makeGrid(PUZZLES[0])); setSelected(null); setMistakes(0); setWon(false); };

  const getConflicts = (idx: number) => {
    const v = grid[idx].val; if (!v) return false;
    const r = Math.floor(idx / 9), c = idx % 9, b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    return grid.some((cell, i) => i !== idx && cell.val === v && (
      Math.floor(i / 9) === r || i % 9 === c ||
      (Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)) === b
    ));
  };

  const selRow = selected !== null ? Math.floor(selected / 9) : -1;
  const selCol = selected !== null ? selected % 9 : -1;
  const selBox = selected !== null ? Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3) : -1;

  return (
    <div className="flex flex-col items-center h-full gap-3 p-3" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-xs"><span className="opacity-40">Mistakes: </span><span className="font-bold text-red-400">{mistakes}/3</span></div>
        <div className="flex gap-1">
          <button onClick={() => setNoteMode(n => !n)} className="px-2 py-1 rounded-lg text-[10px] font-medium" style={{ background: noteMode ? `${theme.accent}30` : 'rgba(255,255,255,0.07)', color: noteMode ? theme.accent : 'inherit' }}>✏️ Notes</button>
          <button onClick={hint} className="p-1.5 rounded-lg hover:bg-white/10"><Lightbulb size={14} style={{ color: '#fbbf24' }} /></button>
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/10"><RotateCcw size={14} /></button>
        </div>
      </div>

      {won && <div className="px-4 py-2 rounded-xl font-bold text-sm" style={{ background: '#4ade8030', color: '#4ade80' }}>🎉 Puzzle Complete!</div>}

      <div className="rounded-xl overflow-hidden" style={{ border: `2px solid ${theme.accent}40` }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(9, 36px)', gridTemplateRows: 'repeat(9, 36px)' }}>
          {grid.map((cell, i) => {
            const row = Math.floor(i / 9), col = i % 9;
            const boxRow = Math.floor(row / 3), boxCol = Math.floor(col / 3);
            const isSel = i === selected;
            const isHighlit = !isSel && selected !== null && (Math.floor(i / 9) === selRow || i % 9 === selCol || Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3) === selBox);
            const isSameNum = !isSel && selected !== null && cell.val && cell.val === grid[selected].val;
            const hasConflict = cell.val && getConflicts(i);
            const borderR = col % 3 === 2 && col < 8 ? `2px solid ${theme.accent}50` : '1px solid rgba(255,255,255,0.06)';
            const borderB = row % 3 === 2 && row < 8 ? `2px solid ${theme.accent}50` : '1px solid rgba(255,255,255,0.06)';
            return (
              <div key={i} onClick={() => setSelected(i)}
                className="flex items-center justify-center cursor-pointer relative transition-colors"
                style={{ borderRight: borderR, borderBottom: borderB, background: isSel ? `${theme.accent}30` : isHighlit ? `${theme.accent}10` : isSameNum ? `${theme.accent}18` : 'transparent' }}>
                {cell.val ? (
                  <span className="text-sm font-bold select-none" style={{ color: cell.given ? (theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e') : hasConflict || cell.error ? '#f87171' : theme.accent }}>
                    {cell.val}
                  </span>
                ) : cell.notes.size > 0 ? (
                  <div className="grid grid-cols-3 w-full h-full p-0.5">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <span key={n} className="flex items-center justify-center text-[7px] opacity-50">{cell.notes.has(n) ? n : ''}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-1.5">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => input(n)} className="w-9 h-9 rounded-xl text-sm font-bold transition-all hover:scale-110 active:scale-95"
            style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`, color: theme.accent }}>
            {n}
          </button>
        ))}
        <button onClick={() => input(0)} className="w-9 h-9 rounded-xl text-xs hover:bg-white/10">✕</button>
      </div>
      <p className="text-[10px] opacity-30">Click cell → click number to fill</p>
    </div>
  );
}
