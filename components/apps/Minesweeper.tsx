'use client';
import { useState, useCallback, useEffect } from 'react';
import { Bomb, Flag, Clock, RotateCcw, Smile, Meh, Frown } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; adj: number };
type Status = 'idle' | 'playing' | 'won' | 'lost';
type Difficulty = 'easy' | 'medium' | 'hard';

const CONFIG = { easy: { rows: 9, cols: 9, mines: 10 }, medium: { rows: 16, cols: 16, mines: 40 }, hard: { rows: 16, cols: 30, mines: 99 } };
const ADJ_COLORS = ['', '#3b82f6', '#16a34a', '#ef4444', '#7e22ce', '#b45309', '#0e7490', '#1f2937', '#6b7280'];

function buildGrid(rows: number, cols: number, mines: number, safe?: [number, number]): Cell[][] {
  const grid: Cell[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 })));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols);
    if (grid[r][c].mine) continue;
    if (safe && Math.abs(r - safe[0]) <= 1 && Math.abs(c - safe[1]) <= 1) continue;
    grid[r][c].mine = true; placed++;
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c].mine) continue;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) count++;
    }
    grid[r][c].adj = count;
  }
  return grid;
}

function reveal(grid: Cell[][], r: number, c: number, rows: number, cols: number): Cell[][] {
  const g = grid.map((row) => row.map((cell) => ({ ...cell })));
  const queue = [[r, c]];
  while (queue.length) {
    const [cr, cc] = queue.pop()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = g[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adj === 0 && !cell.mine) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) queue.push([cr + dr, cc + dc]);
  }
  return g;
}

export default function Minesweeper({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [diff, setDiff] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<Cell[][]>(() => buildGrid(9, 9, 10));
  const [status, setStatus] = useState<Status>('idle');
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const { rows, cols, mines } = CONFIG[diff];

  useEffect(() => {
    if (status !== 'playing') return;
    const iv = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [status]);

  const reset = useCallback(() => {
    const { rows, cols, mines } = CONFIG[diff];
    setGrid(buildGrid(rows, cols, mines));
    setStatus('idle'); setFlags(0); setTime(0); setFirstClick(true);
  }, [diff]);

  useEffect(reset, [diff]);

  const leftClick = useCallback((r: number, c: number) => {
    if (status === 'won' || status === 'lost') return;
    const cell = grid[r][c];
    if (cell.flagged || cell.revealed) return;

    let g = grid;
    if (firstClick) {
      g = buildGrid(rows, cols, mines, [r, c]);
      setFirstClick(false); setStatus('playing');
    }

    if (g[r][c].mine) {
      const blown = g.map((row) => row.map((cell) => cell.mine ? { ...cell, revealed: true } : cell));
      setGrid(blown); setStatus('lost'); return;
    }

    const newGrid = reveal(g, r, c, rows, cols);
    const won = newGrid.every((row) => row.every((cell) => cell.mine || cell.revealed));
    setGrid(newGrid);
    if (won) setStatus('won');
  }, [grid, status, firstClick, rows, cols, mines]);

  const rightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === 'won' || status === 'lost') return;
    const cell = grid[r][c];
    if (cell.revealed) return;
    const newGrid = grid.map((row) => row.map((c2) => ({ ...c2 })));
    newGrid[r][c].flagged = !newGrid[r][c].flagged;
    setGrid(newGrid);
    setFlags((f) => cell.flagged ? f - 1 : f + 1);
  }, [grid, status]);

  const Face = status === 'won' ? Smile : status === 'lost' ? Frown : Meh;

  return (
    <div className="flex flex-col h-full items-center" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Controls */}
      <div className="w-full flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div className="flex gap-1">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} onClick={() => setDiff(d)} className="px-2 py-0.5 rounded text-xs capitalize transition-all"
              style={{ background: diff === d ? `${theme.accent}30` : 'transparent', color: diff === d ? theme.accent : 'inherit' }}>{d}</button>
          ))}
        </div>
        <button onClick={reset} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><Face size={20} style={{ color: status === 'won' ? '#4ade80' : status === 'lost' ? '#f87171' : 'inherit' }} /></button>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><Flag size={12} style={{ color: '#f87171' }} />{mines - flags}</span>
          <span className="flex items-center gap-1"><Clock size={12} />{time}s</span>
        </div>
      </div>

      {/* Status banner */}
      {(status === 'won' || status === 'lost') && (
        <div className="px-4 py-1.5 rounded-xl text-sm font-bold mb-2" style={{ background: status === 'won' ? '#4ade8030' : '#f8717130', color: status === 'won' ? '#4ade80' : '#f87171' }}>
          {status === 'won' ? '🎉 You won!' : '💥 Game over!'}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-auto flex-1 flex items-start justify-center p-2">
        <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 2 }}>
          {grid.map((row, r) => row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => leftClick(r, c)}
              onContextMenu={(e) => rightClick(e, r, c)}
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-all select-none"
              style={{
                background: cell.revealed
                  ? (cell.mine ? '#ef444420' : 'rgba(255,255,255,0.04)')
                  : 'rgba(255,255,255,0.08)',
                border: `1px solid ${cell.revealed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)'}`,
                color: cell.revealed && cell.adj > 0 && !cell.mine ? ADJ_COLORS[cell.adj] : 'inherit',
                cursor: cell.revealed ? 'default' : 'pointer',
              }}
            >
              {cell.revealed && cell.mine && <Bomb size={13} style={{ color: '#f87171' }} />}
              {cell.revealed && !cell.mine && cell.adj > 0 && cell.adj}
              {!cell.revealed && cell.flagged && <Flag size={11} style={{ color: '#f87171' }} />}
            </button>
          )))}
        </div>
      </div>
    </div>
  );
}
