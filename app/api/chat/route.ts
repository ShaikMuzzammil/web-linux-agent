import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Creative AI name — never expose underlying provider
const AI_NAME = 'NEXUS';
const AI_FULL = 'NEXUS Intelligence System';

const SMART_FALLBACK = (input: string): string => {
  const q = input.toLowerCase();
  if (/\b(hi|hello|hey|greet)\b/.test(q))
    return `Hello! I'm **${AI_NAME}**, WebLinuxOS's built-in intelligence system. How can I help you today?`;
  if (/\bhelp\b/.test(q))
    return `**${AI_NAME}** can assist with:\n• **App navigation** — open, use, and manage apps\n• **Terminal** — Linux commands and shell scripting\n• **Files** — file management, paths, permissions\n• **Coding** — JS, TS, React, Python, and more\n• **System** — settings, customization, shortcuts\n\nJust ask anything!`;
  if (/\btime\b/.test(q))
    return `Current time: **${new Date().toLocaleTimeString()}**`;
  if (/\bdate\b/.test(q))
    return `Today is **${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}**`;
  if (/\bjoke|funny\b/.test(q))
    return 'Why do programmers prefer dark mode? Because **light attracts bugs**! 🐛';
  if (/who are you|what are you/.test(q))
    return `I'm **${AI_NAME}** (${AI_FULL}), the built-in intelligence layer of WebLinuxOS. I can help with anything from terminal commands to coding questions. What would you like to explore?`;
  if (/terminal|command/.test(q))
    return 'Key terminal commands:\n• `ls -la` — list files\n• `cd <dir>` — change directory\n• `mkdir <name>` — create folder\n• `cat <file>` — show file contents\n• `grep <pattern> <file>` — search\n• `pwd` — current path\n• `history` — command history\n\nType `help` in the Terminal app for the full list!';
  if (/app|open|launch/.test(q))
    return 'Available WebLinuxOS apps:\n📁 **File Manager** · ⌨️ **Terminal** · 🌐 **Browser** · 📝 **Text Editor** · 📅 **Calendar** · 🌤️ **Weather** · 🤖 **Chat** · ⚙️ **Settings** · 🎮 **Games** (Chess, Snake, Tetris) · 📊 **System Monitor** · 🎵 **Music Player** · and 40+ more!\n\nDouble-click any icon in the App Launcher to open it.';
  return `I'm **${AI_NAME}**, WebLinuxOS's built-in intelligence. I can help with apps, terminal commands, coding, and more. What would you like to know?`;
};

export async function POST(req: Request) {
  try {
    const { messages, system } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const lastMsg = (messages?.[messages.length - 1]?.content || '') as string;
      return NextResponse.json({ content: SMART_FALLBACK(lastMsg) });
    }

    // Build Gemini-compatible history
    const history = (messages || []).slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages?.[messages.length - 1]?.content || '';

    const systemInstruction = system ||
      `You are ${AI_NAME}, the built-in intelligence system of WebLinuxOS — a browser-based Ubuntu-style desktop environment. Be helpful, concise, and friendly. Help with apps, Linux commands, coding (JS/TS/React/Python), and general questions. Use **bold** and bullet points for clarity. Never mention being built on any specific AI model or provider.`;

    const geminiPayload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] },
      ],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    };

    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      const lastMsg = (messages?.[messages.length - 1]?.content || '') as string;
      return NextResponse.json({ content: SMART_FALLBACK(lastMsg) });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || SMART_FALLBACK('');
    return NextResponse.json({ content: text });
  } catch {
    return NextResponse.json({ content: "I'm having a brief moment. Please try again! — NEXUS" });
  }
}
