'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

interface Message { id: string; role: 'user' | 'assistant'; content: string; ts: number }

const SYSTEM = `You are a helpful AI assistant built into WebLinuxOS, a browser-based Linux desktop environment. You're friendly, concise, and knowledgeable. When users ask about the OS, help them navigate apps, use terminal commands, or accomplish tasks. Keep responses focused and useful.`;

const SUGGESTIONS = [
  'What apps are available?', 'How do I use the Terminal?', 'Show me terminal commands',
  'How do I sync my data?', 'Explain the file system', 'What is WebLinuxOS?',
];

export default function Chat({ windowId }: { windowId: string }) {
  const { theme, auth } = useOSStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg: Message = { id: Math.random().toString(36), role: 'user', content, ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          system: SYSTEM,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const assistantMsg: Message = { id: Math.random().toString(36), role: 'assistant', content: data.content || 'Sorry, I could not respond.', ts: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = { id: Math.random().toString(36), role: 'assistant', content: 'Sorry, I am currently unavailable. Please check your API configuration.', ts: Date.now() };
      setMessages((prev) => [...prev, errMsg]);
    } finally { setLoading(false); }
  }, [input, messages, loading]);

  const copyMsg = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)` }}>
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold">WebLinux AI</p>
            <p className="text-[10px] opacity-40">Powered by Claude</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[10px] opacity-40">Online</span>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Clear">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}30` }}>
              <Sparkles size={28} style={{ color: theme.accent }} />
            </div>
            <div className="text-center">
              <p className="font-semibold">Ask me anything</p>
              <p className="text-xs opacity-40 mt-1">I can help you with WebLinuxOS, terminal commands, and more</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all hover:brightness-110"
                  style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}25`, color: theme.accent }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: msg.role === 'user' ? theme.accent : 'rgba(255,255,255,0.1)' }}>
              {msg.role === 'user' ? <User size={13} className="text-white" /> : <Bot size={13} style={{ color: theme.accent }} />}
            </div>
            <div className="max-w-[80%] group relative">
              <div className="px-3 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap"
                style={{
                  background: msg.role === 'user' ? theme.accent : theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                  color: msg.role === 'user' ? '#fff' : 'inherit',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                }}>
                {msg.content}
              </div>
              <button onClick={() => copyMsg(msg.id, msg.content)}
                className="absolute -top-1 -right-6 opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-white/10">
                {copied === msg.id ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Bot size={13} style={{ color: theme.accent }} />
            </div>
            <div className="px-3 py-2.5 rounded-2xl flex gap-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
              {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: theme.accent, animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex gap-2 items-end p-2 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: `${theme.accent}30` }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-xs leading-relaxed"
            style={{ caretColor: theme.accent, maxHeight: 100 }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0"
            style={{ background: theme.accent }}>
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
