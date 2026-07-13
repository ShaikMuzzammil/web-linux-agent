'use client';
import { useState } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
const DEMO = `# Welcome to Markdown Preview\n\n## Features\n- **Bold** and *italic* text\n- \`inline code\`\n- [Links](https://example.com)\n\n### Code Block\n\`\`\`js\nconsole.log("Hello WebLinuxOS!");\n\`\`\`\n\n> Blockquote text here\n\n| Column 1 | Column 2 |\n|---|---|\n| Value 1 | Value 2 |\n`;
function parseMarkdown(md: string) {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded text-[11px]" style="background:rgba(255,255,255,0.1);font-family:monospace">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline" style="color:#7C4DFF">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 pl-3 opacity-60 my-1" style="border-color:#7C4DFF">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^```[\w]*\n([\s\S]*?)```/gm, '<pre class="p-3 rounded-lg my-2 text-xs overflow-x-auto" style="background:rgba(0,0,0,0.4);font-family:monospace">$1</pre>')
    .replace(/\|\s*(.+?)\s*\|/g, (m) => `<td class="px-2 py-1 border" style="border-color:rgba(255,255,255,0.1)">${m.replace(/\|/g,'').trim()}</td>`)
    .replace(/\n/g, '<br/>');
}
export default function MarkdownPreview({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [md, setMd] = useState(DEMO);
  const [split, setSplit] = useState(true);
  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d1117' : '#f6f8fa', color: theme.mode === 'dark' ? '#e6edf3' : '#24292f' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-bold">Markdown Preview</span>
        <div className="ml-auto flex gap-1">
          {[['Split','split'],['Edit','edit'],['Preview','preview']].map(([l,v]) => (
            <button key={v} onClick={() => setSplit(v === 'split')} className="px-2 py-0.5 rounded text-[10px]" style={{ background: split === (v === 'split') ? `${theme.accent}30` : 'transparent', color: split === (v === 'split') ? theme.accent : 'inherit' }}>{l}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {split && (
          <div className="flex-1 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <textarea value={md} onChange={e => setMd(e.target.value)} className="w-full h-full p-4 bg-transparent resize-none outline-none text-xs font-mono leading-relaxed" style={{ caretColor: theme.accent }} />
          </div>
        )}
        <div className="flex-1 p-4 overflow-y-auto prose prose-invert max-w-none">
          <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: parseMarkdown(md) }} />
        </div>
      </div>
    </div>
  );
}
