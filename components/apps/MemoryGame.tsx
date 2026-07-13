'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { RotateCcw, Trophy } from 'lucide-react';
const EMOJIS = ['🎮','🚀','⭐','🎯','💎','🔥','🌈','🎪','🦄','🎸','🍕','🤖','🎭','🌸','💫','🎲'];
type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };
function makeCards(n: number): Card[] {
  const emojis = EMOJIS.slice(0, n).flatMap(e => [e, e]);
  for (let i = emojis.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [emojis[i], emojis[j]] = [emojis[j], emojis[i]]; }
  return emojis.map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
}
export default function MemoryGame({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [diff, setDiff] = useState(8);
  const [cards, setCards] = useState<Card[]>(() => makeCards(8));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const [best, setBest] = useState<Record<number, number>>(() => { try { return JSON.parse(localStorage.getItem('wlos_memory_best') || '{}'); } catch { return {}; }});
  const cols = diff <= 8 ? 4 : diff <= 12 ? 4 : 4;
  const reset = useCallback((n = diff) => { setDiff(n); setCards(makeCards(n)); setFlipped([]); setMoves(0); setLocked(false); setWon(false); }, [diff]);
  const flip = (id: number) => {
    if (locked || flipped.length === 2 || cards[id].matched || flipped.includes(id)) return;
    const next = [...flipped, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = next;
      setTimeout(() => {
        if (cards[a].emoji === cards[b].emoji) {
          setCards(prev => { const g = prev.map(c => next.includes(c.id) ? { ...c, matched: true } : c); if (g.every(c => c.matched)) { setWon(true); setBest(prev2 => { const nb = { ...prev2, [diff]: Math.min(prev2[diff] ?? 999, moves + 1) }; localStorage.setItem('wlos_memory_best', JSON.stringify(nb)); return nb; }); } return g; });
        } else {
          setCards(prev => prev.map(c => next.includes(c.id) ? { ...c, flipped: false } : c));
        }
        setFlipped([]); setLocked(false);
      }, 900);
    }
  };
  const matched = cards.filter(c => c.matched).length / 2;
  return (
    <div className="flex flex-col items-center h-full gap-3 p-3" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="flex gap-1">{[8,12,16].map(n => <button key={n} onClick={() => reset(n)} className="px-2 py-0.5 rounded text-[10px]" style={{ background: diff === n ? `${theme.accent}30` : 'transparent', color: diff === n ? theme.accent : 'inherit' }}>{n}</button>)}</div>
        <div className="text-xs"><span className="opacity-40">Moves: </span><b>{moves}</b>{best[diff] ? <span className="opacity-40 ml-2">Best: {best[diff]}</span> : null}</div>
        <button onClick={() => reset()} className="p-1.5 rounded-lg hover:bg-white/10"><RotateCcw size={14} /></button>
      </div>
      <div className="text-xs opacity-40">{matched}/{diff} pairs found</div>
      {won && <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm" style={{ background: '#4ade8030', color: '#4ade80' }}><Trophy size={16} />You won in {moves} moves!</div>}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map(card => (
          <button key={card.id} onClick={() => flip(card.id)} className="w-14 h-14 rounded-xl text-2xl transition-all duration-300 flex items-center justify-center"
            style={{ background: card.flipped || card.matched ? (card.matched ? `${theme.accent}20` : 'rgba(255,255,255,0.1)') : `${theme.accent}15`, border: `1px solid ${card.matched ? theme.accent + '60' : card.flipped ? 'rgba(255,255,255,0.2)' : theme.accent + '20'}`, transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)', cursor: card.matched ? 'default' : 'pointer' }}>
            {(card.flipped || card.matched) ? card.emoji : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
