'use client';
import { useState, useCallback } from 'react';
import { RotateCcw, Bot, Users } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

type Cell = 'X' | 'O' | null;
type Winner = Cell;
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(b: Cell[]): Winner {
  for (const [a, c, d] of WINS) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

function bestMove(b: Cell[]): number {
  const av = b.map((v, i) => (v === null ? i : -1)).filter(i => i >= 0);
  for (const m of av) { const t = [...b]; t[m] = 'O'; if (checkWinner(t) === 'O') return m; }
  for (const m of av) { const t = [...b]; t[m] = 'X'; if (checkWinner(t) === 'X') return m; }
  if (b[4] === null) return 4;
  const corners = av.filter(i => [0, 2, 6, 8].includes(i));
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return av[Math.floor(Math.random() * av.length)];
}

export default function TicTacToe({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [vs, setVs] = useState<'ai' | 'human'>('ai');
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });

  const winner = checkWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const play = useCallback((i: number) => {
    if (board[i] || winner || isDraw) return;
    const nb = [...board] as Cell[];
    nb[i] = turn;
    setBoard(nb);
    const w = checkWinner(nb);
    if (w) { setScores(s => ({ ...s, [w]: s[w] + 1 })); return; }
    if (nb.every(Boolean)) { setScores(s => ({ ...s, draw: s.draw + 1 })); return; }
    if (vs === 'ai' && turn === 'X') {
      const ai = bestMove(nb);
      const nb2 = [...nb] as Cell[];
      nb2[ai] = 'O';
      setBoard(nb2);
      const w2 = checkWinner(nb2);
      if (w2) setScores(s => ({ ...s, [w2]: s[w2] + 1 }));
      else if (nb2.every(Boolean)) setScores(s => ({ ...s, draw: s.draw + 1 }));
    } else {
      setTurn(t => (t === 'X' ? 'O' : 'X'));
    }
  }, [board, turn, winner, isDraw, vs]);

  const reset = () => { setBoard(Array(9).fill(null)); setTurn('X'); };
  const winLine = WINS.find(([a, c, d]) => board[a] && board[a] === board[c] && board[a] === board[d]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4"
      style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="flex gap-2">
        {(['ai', 'human'] as const).map(v => (
          <button key={v} onClick={() => { setVs(v); reset(); }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs"
            style={{ background: vs === v ? `${theme.accent}30` : 'transparent', color: vs === v ? theme.accent : 'inherit' }}>
            {v === 'ai' ? <Bot size={12} /> : <Users size={12} />}
            {v === 'ai' ? 'vs AI' : '2 Player'}
          </button>
        ))}
      </div>

      <div className="flex gap-6 text-sm">
        <div className="text-center"><p className="text-xs opacity-50">X</p><p className="font-bold">{scores.X}</p></div>
        <div className="text-center"><p className="text-xs opacity-50">Draw</p><p className="font-bold">{scores.draw}</p></div>
        <div className="text-center"><p className="text-xs opacity-50">O</p><p className="font-bold">{scores.O}</p></div>
      </div>

      {(winner || isDraw) ? (
        <div className="text-center">
          <p className="text-lg font-bold mb-2" style={{ color: winner ? theme.accent : 'inherit' }}>
            {winner ? `${winner} Wins! 🎉` : 'Draw!'}
          </p>
          <button onClick={reset} className="px-4 py-2 rounded-xl text-sm text-white" style={{ background: theme.accent }}>
            Play Again
          </button>
        </div>
      ) : (
        <p className="text-sm opacity-60">
          {turn}&apos;s turn{vs === 'ai' && turn === 'O' ? ' (AI)' : ''}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button key={i} onClick={() => play(i)}
            className="w-20 h-20 rounded-xl text-3xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: winLine?.includes(i) ? `${theme.accent}30` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${winLine?.includes(i) ? theme.accent : 'rgba(255,255,255,0.08)'}`,
              color: cell === 'X' ? theme.accent : '#f87171',
            }}>
            {cell}
          </button>
        ))}
      </div>

      <button onClick={reset} className="flex items-center gap-1.5 text-xs opacity-40 hover:opacity-70">
        <RotateCcw size={12} />Reset
      </button>
    </div>
  );
}
