'use client';
// ============================================================
// Chat — NEXUS Intelligence System
// ============================================================
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Loader2, Trash2, Copy, Check, Zap, User, RotateCcw } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

interface Message { id: string; role: 'user' | 'assistant'; content: string; ts: number }

const AI_NAME  = 'NEXUS';
const AI_TITLE = 'Intelligence System';

const SYSTEM = `You are ${AI_NAME}, the built-in intelligence system of WebLinuxOS — a modern browser-based Ubuntu-style desktop environment built with Next.js, React, TypeScript, and Tailwind CSS. You are friendly, concise, and highly knowledgeable. Help users with apps, Linux commands, coding questions (JavaScript, TypeScript, React, Python), system navigation, and anything else they need. Format responses with **bold** for emphasis and use bullet points for lists. Never reveal or hint at the underlying AI model or provider.`;

const SUGGESTIONS = [
  'What apps are available?', 'How do I use the Terminal?',
  'Show me terminal commands', 'What is WebLinuxOS?',
  'Help me with JavaScript', 'Explain the file system',
];

// Simple markdown-to-HTML: bold + code + bullets + newlines
const renderContent = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.85em">$1</code>')
    .replace(/^• /gm, '• ')
    .replace(/\n/g, '<br/>');

const MessageBubble = memo(function MessageBubble({
  msg, accent, onCopy, copied
}: { msg: Message; accent: string; onCopy: (id: string, c: string) => void; copied: string | null }) {
  const isUser = msg.role === 'user';
  const ts = (() => { try { return new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } })();

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
        >
          <Zap size={15} className="text-white" />
        </div>
      )}

      <div style={{ maxWidth: '78%' }}>
        <div
          className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
          style={{
            background: isUser ? accent : 'rgba(255,255,255,0.07)',
            color: isUser ? '#fff' : 'rgba(255,255,255,0.92)',
            borderRadius: isUser ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
        />
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{ts}</span>
          {!isUser && (
            <button
              onClick={() => onCopy(msg.id, msg.content)}
              className="flex items-center gap-0.5 text-[10px] opacity-0 hover:opacity-100 transition-opacity px-1 rounded"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {copied === msg.id ? <Check size={9} /> : <Copy size={9} />}
              {copied === msg.id ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <User size={15} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </div>
      )}
    </div>
  );
});

export default function Chat({ windowId }: { windowId: string }) {
  const { theme, auth } = useOSStore();
  const accent = theme.accent || '#E95420';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { id: Math.random().toString(36).slice(2), role: 'user', content, ts: Date.now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setHasError(false);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          system: SYSTEM,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessages(p => [...p, {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: data.content || 'No response received.',
        ts: Date.now(),
      }]);
    } catch {
      setHasError(true);
      setMessages(p => [...p, {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: `Unable to connect right now. Please check your internet connection and try again.`,
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const copyMsg = useCallback((id: string, c: string) => {
    navigator.clipboard.writeText(c).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setHasError(false);
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: '#111113' }}>

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: '#1A1A1E', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}AA)` }}
        >
          <Zap size={20} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white tracking-wide">{AI_NAME}</div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: loading ? '#FFA726' : '#4CAF50', animation: loading ? 'nexusPulse 1s ease-in-out infinite' : 'none' }}
            />
            <span className="text-[10px]" style={{ color: loading ? '#FFA726' : '#4CAF50' }}>
              {loading ? 'Processing...' : `${AI_TITLE} · Online`}
            </span>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Clear conversation"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'thin' }}>

        {/* Welcome state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-8 gap-4">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl mb-2"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)` }}
            >
              <Zap size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">{AI_NAME} Intelligence System</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 240 }}>
                Your built-in AI assistant for WebLinuxOS. Ask me anything.
              </p>
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mt-2" style={{ maxWidth: 300 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${accent}22`;
                    e.currentTarget.style.borderColor = `${accent}55`;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} accent={accent} onCopy={copyMsg} copied={copied} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${accent},${accent}99)` }}>
              <Zap size={15} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '18px 18px 18px 5px' }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accent, animation: `nexusDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Retry on error */}
        {hasError && !loading && messages.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                const lastUser = [...messages].reverse().find(m => m.role === 'user');
                if (lastUser) {
                  setMessages(p => p.slice(0, -1));
                  send(lastUser.content);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors"
              style={{ background: 'rgba(255,100,50,0.15)', border: '1px solid rgba(255,100,50,0.3)', color: 'rgba(255,150,100,0.9)' }}
            >
              <RotateCcw size={11} /> Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 px-3 pb-3 pt-2" style={{ background: '#1A1A1E', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-3.5 py-2.5"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${input.trim() ? `${accent}55` : 'rgba(255,255,255,0.09)'}`,
            transition: 'border-color 200ms ease',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${AI_NAME}... (Enter to send)`}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 resize-none outline-none leading-relaxed"
            style={{ maxHeight: 120, minHeight: 22 }}
            rows={1}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
            style={{
              background: input.trim() && !loading ? accent : 'rgba(255,255,255,0.07)',
              opacity: !input.trim() || loading ? 0.4 : 1,
            }}
          >
            {loading
              ? <Loader2 size={14} className="text-white animate-spin" />
              : <Send size={14} className="text-white" />
            }
          </button>
        </div>
        <p className="text-center mt-1.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)' }}>
          Shift+Enter for new line · Powered by {AI_NAME}
        </p>
      </div>

      <style>{`
        @keyframes nexusPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes nexusDot { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-5px);} }
      `}</style>
    </div>
  );
}
