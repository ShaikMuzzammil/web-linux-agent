import { NextResponse } from 'next/server';

export const runtime = 'edge';

const FALLBACK_RESPONSES: Record<string, string> = {
  hello: "Hello! I'm WebLinux AI, your built-in assistant. How can I help you today?",
  hi: "Hi there! I'm your WebLinuxOS assistant. What can I do for you?",
  help: "I can help you with:\n• **Apps** — open, use, and navigate apps\n• **Terminal** — Linux commands and tips\n• **Files** — file management and organization\n• **Coding** — JavaScript, TypeScript, React, Python\n• **OS features** — settings, customization\n\nJust ask!",
  time: `Current time: **${new Date().toLocaleTimeString()}**`,
  joke: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  default: "I'm your WebLinuxOS assistant, powered by Claude. I can help with apps, terminal commands, coding questions, and more. What would you like to know?",
};

const getFallback = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(FALLBACK_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return FALLBACK_RESPONSES.default;
};

export async function POST(req: Request) {
  try {
    const { messages, system } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Graceful fallback when no API key
      const lastMsg = messages?.[messages.length - 1]?.content || '';
      return NextResponse.json({ content: getFallback(lastMsg) });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: system || `You are WebLinux AI, the built-in assistant of WebLinuxOS — a browser-based Ubuntu-style desktop. You're friendly, helpful, and concise. Help users with apps, Linux commands, coding, and general questions. Format using **bold** and bullet points for clarity.`,
        messages: messages || [],
      }),
    });

    if (!response.ok) {
      const lastMsg = messages?.[messages.length - 1]?.content || '';
      return NextResponse.json({ content: getFallback(lastMsg) });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || getFallback('');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: "Sorry, I'm having a moment. Please try again!" });
  }
}
