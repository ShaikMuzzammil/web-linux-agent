// ============================================================
// Chat — AI-powered chat with WebLinux Assistant (Claude)
// ============================================================

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Smile, Bot, User, Loader2, Trash2, Plus, MessageSquare } from 'lucide-react';

// ---- Types ----
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const EMOJIS = ['😀','😂','🥰','😎','🤔','👍','❤️','🎉','🔥','👏','😊','✨','💪','🙏','😅','🤩','🥳','😜','🤯','🎵'];

const EmojiPicker = memo(function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  return (
    <div
      className="absolute bottom-14 right-4 z-50 p-3 rounded-2xl"
      style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: 220 }}
    >
      <div className="grid grid-cols-5 gap-1">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-white/[0.08] transition-all"
            style={{ fontSize: 20 }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
});

// ---- Claude API call ----
const callClaude = async (messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> => {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are WebLinux AI, the built-in assistant of WebLinuxOS — a browser-based Ubuntu-style desktop environment built with React, Vite, and Tailwind CSS. You're friendly, concise, and knowledgeable about Linux, web development, and general computing. The user's name is Nova. Keep responses helpful and conversational. Format code with backticks. When asked about the OS, explain that it's a fully browser-based OS simulation with apps like Terminal, File Manager, Calendar, Weather, Settings, Games, and more. This OS is a showcase portfolio project by Nova (Shaik Muzzammil), a CSE student at Amrita Vishwa Vidyapeetham.`,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.content?.[0]?.text || 'Sorry, I could not generate a response.';
  } catch (err) {
    // Fallback to local responses
    return getFallbackResponse(messages[messages.length - 1]?.content || '');
  }
};

// Fallback responses if API unavailable
const getFallbackResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return "Hello, Nova! I'm your WebLinuxOS Assistant. How can I help you today?";
  if (lower.includes('help'))
    return "I can help you with:\n• **Opening apps** — just ask me to open any app\n• **System info** — ask about the OS or specs\n• **Linux commands** — I know Terminal commands\n• **Coding help** — JavaScript, TypeScript, React, and more\n• **General questions** — ask me anything!\n\nWhat would you like to know?";
  if (lower.includes('time'))
    return `The current time is **${new Date().toLocaleTimeString()}**.`;
  if (lower.includes('date'))
    return `Today is **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`;
  if (lower.includes('joke'))
    return "Why do programmers prefer dark mode? Because **light attracts bugs**! 🐛";
  if (lower.includes('app') || lower.includes('open'))
    return "WebLinuxOS has many built-in apps:\n• **Terminal** — bash-like shell\n• **File Manager** — browse files\n• **Browser** — web browsing\n• **Calendar** — events & dates\n• **Weather** — forecasts\n• **Code Editor** — write code\n• **Settings** — customize OS\n• **Games** — Chess, Snake, Tetris & more!\n\nDouble-click any app in the launcher to open it.";
  if (lower.includes('who are you') || lower.includes('what are you'))
    return "I'm **WebLinux AI**, the built-in assistant of WebLinuxOS! I'm powered by Claude (Anthropic's AI). I can help you with anything — from coding questions to OS features. Ask away! 🤖";
  if (lower.includes('nova') || lower.includes('who made') || lower.includes('creator'))
    return "WebLinuxOS was created by **Nova (Shaik Muzzammil)**, a CSE student at Amrita Vishwa Vidyapeetham in Chennai, India. It's a full-stack portfolio project built with React, TypeScript, Vite, and Tailwind CSS. Impressive work! 🚀";
  return "That's interesting! I'm your WebLinuxOS assistant. You can ask me about the OS, Linux commands, coding help, or just chat. What would you like to know? 😊";
};

// ---- Main Component ----
export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello, Nova! 👋 I'm **WebLinux AI**, your built-in OS assistant powered by Claude.\n\nI can help you with:\n• Linux commands & terminal tips\n• Coding questions (JS, TS, React, Python...)\n• OS features & app navigation\n• General knowledge & problem-solving\n\nWhat can I do for you today?",
      timestamp: Date.now() - 1000,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setShowEmoji(false);

    const userMsg: Message = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history for Claude (last 10 msgs, excluding initial greeting)
    const history = [...messages.slice(-9), userMsg]
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const reply = await callClaude(history);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again!",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const formatContent = (text: string) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(124,77,255,0.15);padding:1px 4px;border-radius:3px;font-family:monospace;font-size:11px;">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const safeTime = (ts: number) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#121212' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: '#1A1A1A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C4DFF,#E91E8C)' }}>
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">WebLinux AI</div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: loading ? '#FFB74D' : '#4CAF50' }} />
            <span className="text-[10px]" style={{ color: loading ? '#FFB74D' : '#4CAF50' }}>
              {loading ? 'Thinking...' : 'Online · Powered by Claude'}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setMessages([{
              id: '1', role: 'assistant',
              content: "Hello again, Nova! 👋 How can I help you today?",
              timestamp: Date.now(),
            }])}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            title="New conversation"
          >
            <Plus size={14} style={{ color: '#9E9E9E' }} />
          </button>
          <button
            onClick={() => setMessages([])}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            title="Clear chat"
          >
            <Trash2 size={14} style={{ color: '#9E9E9E' }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
            <MessageSquare size={48} style={{ color: 'rgba(124,77,255,0.3)', marginBottom: 12 }} />
            <p className="text-sm font-semibold text-white/40">Start a conversation</p>
            <p className="text-xs text-white/25 mt-1">Ask me anything about WebLinuxOS</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1" style={{ background: 'linear-gradient(135deg,#7C4DFF,#E91E8C)' }}>
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div style={{ maxWidth: '78%' }}>
              <div
                className="px-3 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                  color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.88)',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  wordBreak: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
              <div className={`text-[10px] text-white/25 mt-0.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {safeTime(msg.timestamp)}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1" style={{ background: 'rgba(124,77,255,0.25)' }}>
                <User size={14} style={{ color: 'var(--accent-primary)' }} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#7C4DFF,#E91E8C)' }}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px' }}>
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent-primary)', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="relative shrink-0 px-3 pb-3 pt-2" style={{ background: '#1A1A1A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {showEmoji && (
          <EmojiPicker onSelect={e => setInput(prev => prev + e)} onClose={() => setShowEmoji(false)} />
        )}
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={() => setShowEmoji(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.08] transition-colors shrink-0 mb-0.5"
          >
            <Smile size={16} style={{ color: '#9E9E9E' }} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message WebLinux AI... (Enter to send)"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 resize-none outline-none leading-relaxed"
            style={{ maxHeight: 120, minHeight: 22 }}
            rows={1}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
            style={{
              background: input.trim() && !loading ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
              opacity: !input.trim() || loading ? 0.4 : 1,
            }}
          >
            {loading ? <Loader2 size={15} className="text-white animate-spin" /> : <Send size={15} className="text-white" />}
          </button>
        </div>
        <p className="text-[10px] text-white/20 text-center mt-1">Shift+Enter for new line · Enter to send</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
