'use client';
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useOSStore } from '@/hooks/useOSStore';

interface HistoryEntry { input: string; output: string; type: 'output' | 'error' | 'info' | 'success' }

const BANNER = `\u001b[35mWebLinuxOS\u001b[0m v2.0.0 — Type \u001b[36mhelp\u001b[0m for commands\n`;

export default function Terminal({ windowId }: { windowId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([{ input: '', output: BANNER, type: 'info' }]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIdx, setCmdIdx] = useState(-1);
  const { auth, theme, openWindow } = useOSStore();
  const fs = useFileSystem();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const prompt = `\u001b[32m${auth.userName.toLowerCase()}@weblinux\u001b[0m:\u001b[34m${fs.currentPath}\u001b[0m$ `;

  const resolvePath = useCallback((p: string): string => {
    if (p.startsWith('/')) return p;
    if (p === '~') return '/home/user';
    if (p.startsWith('~/')) return '/home/user/' + p.slice(2);
    if (p === '..') {
      const parts = fs.currentPath.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/') || '/';
    }
    return fs.currentPath + (fs.currentPath.endsWith('/') ? '' : '/') + p;
  }, [fs.currentPath]);

  const run = useCallback((cmd: string): HistoryEntry => {
    const [name, ...args] = cmd.trim().split(/\s+/);
    const out = (o: string, t: HistoryEntry['type'] = 'output') => ({ input: cmd, output: o, type: t });

    switch (name) {
      case 'help':
        return out([
          '┌─────────────────────────────────────┐',
          '│       WebLinuxOS — Commands          │',
          '├─────────────────────────────────────┤',
          '  ls [-la]       List directory',
          '  cd <dir>       Change directory',
          '  pwd            Print working directory',
          '  cat <file>     Show file contents',
          '  echo <text>    Print text',
          '  mkdir <dir>    Create directory',
          '  touch <file>   Create file',
          '  rm <path>      Delete file/dir',
          '  mv <src> <dst> Move/rename',
          '  cp <src> <dst> Copy file',
          '  find <name>    Find files by name',
          '  grep <pat> <f> Search in file',
          '  head/tail <f>  First/last 10 lines',
          '  wc <file>      Word/line count',
          '  history        Command history',
          '  clear          Clear terminal',
          '  date           Show date/time',
          '  whoami         Current user',
          '  uname [-a]     System info',
          '  df             Disk usage',
          '  free           Memory info',
          '  ps             Running processes',
          '  env            Environment vars',
          '  which <cmd>    Find command path',
          '  man <cmd>      Manual page',
          '  open <app>     Open application',
          '  calc <expr>    Calculator',
          '  base64 <txt>   Encode base64',
          '  md5 <txt>      MD5 hash (simulated)',
          '  curl <url>     HTTP request (simulated)',
          '  ping <host>    Ping host (simulated)',
          '  neofetch       System info art',
          '└─────────────────────────────────────┘',
        ].join('\n'), 'info');

      case 'clear':
        setHistory([{ input: '', output: BANNER, type: 'info' }]);
        return { input: cmd, output: '', type: 'output' };

      case 'pwd':
        return out(fs.currentPath);

      case 'whoami':
        return out(auth.userName.toLowerCase());

      case 'date':
        return out(new Date().toString());

      case 'uname': {
        const full = args.includes('-a');
        return out(full ? 'Linux weblinux 6.8.0-webos #1 SMP x86_64 GNU/Linux' : 'Linux');
      }

      case 'ls': {
        const showAll = args.includes('-a') || args.includes('-la');
        const longForm = args.includes('-l') || args.includes('-la');
        const targetPath = args.find((a) => !a.startsWith('-'));
        const node = targetPath ? fs.getNodeByPath(resolvePath(targetPath)) : fs.getNodeByPath(fs.currentPath);
        if (!node || node.type !== 'folder') return out(`ls: cannot access '${targetPath}': No such file or directory`, 'error');
        const children = fs.getChildren(node.id).filter((c) => showAll || !c.isHidden);
        if (children.length === 0) return out('');
        if (longForm) {
          const rows = children.map((c) => {
            const type = c.type === 'folder' ? 'd' : '-';
            const size = (c.size || 0).toString().padStart(6);
            const date = new Date(c.modifiedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            const nameColor = c.type === 'folder' ? '\x1b[34m' : '\x1b[0m';
            return `${type}rw-r--r-- 1 user user ${size} ${date} ${nameColor}${c.name}\x1b[0m`;
          });
          return out(rows.join('\n'));
        }
        const names = children.map((c) => c.type === 'folder' ? `\x1b[34m${c.name}/\x1b[0m` : c.name);
        return out(names.join('  '));
      }

      case 'cd': {
        const target = args[0] || '~';
        const newPath = resolvePath(target);
        const node = fs.getNodeByPath(newPath);
        if (!node) return out(`cd: ${args[0]}: No such file or directory`, 'error');
        if (node.type !== 'folder') return out(`cd: ${args[0]}: Not a directory`, 'error');
        fs.setCurrentPath(newPath);
        return out('');
      }

      case 'cat': {
        if (!args[0]) return out('cat: missing operand', 'error');
        const node = fs.getNodeByPath(resolvePath(args[0]));
        if (!node) return out(`cat: ${args[0]}: No such file or directory`, 'error');
        if (node.type === 'folder') return out(`cat: ${args[0]}: Is a directory`, 'error');
        return out(node.content || '(empty file)');
      }

      case 'echo':
        return out(args.join(' '));

      case 'mkdir': {
        if (!args[0]) return out('mkdir: missing operand', 'error');
        const parent = fs.getNodeByPath(fs.currentPath);
        if (!parent) return out('mkdir: cannot create directory', 'error');
        fs.createFolder(parent.id, args[0]);
        return out('');
      }

      case 'touch': {
        if (!args[0]) return out('touch: missing file operand', 'error');
        const parent = fs.getNodeByPath(fs.currentPath);
        if (!parent) return out('touch: error', 'error');
        fs.createFile(parent.id, args[0], '');
        return out('');
      }

      case 'rm': {
        if (!args[0]) return out('rm: missing operand', 'error');
        const node = fs.getNodeByPath(resolvePath(args[0]));
        if (!node) return out(`rm: cannot remove '${args[0]}': No such file or directory`, 'error');
        fs.deleteNode(node.id);
        return out('');
      }

      case 'mv':
      case 'cp': {
        if (!args[0] || !args[1]) return out(`${name}: missing operand`, 'error');
        const src = fs.getNodeByPath(resolvePath(args[0]));
        if (!src) return out(`${name}: '${args[0]}': No such file or directory`, 'error');
        const destParent = fs.getNodeByPath(resolvePath(args[1]).split('/').slice(0, -1).join('/') || '/');
        if (!destParent) return out(`${name}: destination not found`, 'error');
        if (name === 'mv') {
          fs.renameNode(src.id, args[1].split('/').pop() || src.name);
          fs.moveNode(src.id, destParent.id);
        } else {
          fs.createFile(destParent.id, args[1].split('/').pop() || src.name, src.content || '');
        }
        return out('');
      }

      case 'find': {
        if (!args[0]) return out('find: missing name', 'error');
        const results = Object.values(fs.nodes).filter((n) => n.name.includes(args[0]));
        return out(results.length ? results.map((n) => fs.getPath(n.id)).join('\n') : 'No matches found', 'info');
      }

      case 'grep': {
        if (!args[0] || !args[1]) return out('grep: usage: grep <pattern> <file>', 'error');
        const node = fs.getNodeByPath(resolvePath(args[1]));
        if (!node || node.type === 'folder') return out(`grep: ${args[1]}: Not a file`, 'error');
        const lines = (node.content || '').split('\n').filter((l) => l.includes(args[0]));
        return out(lines.length ? lines.join('\n') : `grep: no matches for '${args[0]}'`, lines.length ? 'output' : 'info');
      }

      case 'head':
      case 'tail': {
        if (!args[0]) return out(`${name}: missing file operand`, 'error');
        const node = fs.getNodeByPath(resolvePath(args[0]));
        if (!node || node.type === 'folder') return out(`${name}: not a file`, 'error');
        const lines = (node.content || '').split('\n');
        return out((name === 'head' ? lines.slice(0, 10) : lines.slice(-10)).join('\n'));
      }

      case 'wc': {
        if (!args[0]) return out('wc: missing operand', 'error');
        const node = fs.getNodeByPath(resolvePath(args[0]));
        if (!node || node.type === 'folder') return out('wc: not a file', 'error');
        const content = node.content || '';
        const lines = content.split('\n').length;
        const words = content.split(/\s+/).filter(Boolean).length;
        const chars = content.length;
        return out(`  ${lines}  ${words}  ${chars} ${args[0]}`);
      }

      case 'history':
        return out(cmdHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n') || 'No history', 'info');

      case 'df':
        return out(['Filesystem     Size   Used  Avail  Use%  Mounted on',
          '/dev/virtual   50G    4.2G  45.8G   9%   /',
          'tmpfs          2.0G   0     2.0G    0%   /tmp',
        ].join('\n'));

      case 'free':
        return out(['              total        used        free',
          `Mem:        ${(8 * 1024).toLocaleString()}       ${Math.floor(Math.random() * 3000 + 1000).toLocaleString()}      ${Math.floor(Math.random() * 4000 + 3000).toLocaleString()}`,
          `Swap:       ${(2 * 1024).toLocaleString()}         0      ${(2 * 1024).toLocaleString()}`,
        ].join('\n'));

      case 'ps':
        return out(['PID    TTY     TIME     CMD',
          '  1    pts/0   00:00:00 systemd',
          '  2    pts/0   00:00:00 bash',
          '  3    pts/0   00:00:00 node',
          ' 42    pts/0   00:00:01 weblinux-desktop',
          `${Math.floor(Math.random() * 900 + 100)}    pts/0   00:00:00 terminal`,
        ].join('\n'));

      case 'env':
        return out([`USER=${auth.userName.toLowerCase()}`, 'HOME=/home/user', `PATH=/usr/local/bin:/usr/bin:/bin`, 'SHELL=/bin/bash', `TERM=xterm-256color`, `DISPLAY=:0`, `LANG=en_US.UTF-8`].join('\n'));

      case 'which':
        return args[0] ? out(`/usr/bin/${args[0]}`) : out('which: missing argument', 'error');

      case 'man':
        return args[0] ? out(`No manual entry for ${args[0]} — try 'help'`, 'info') : out('man: what manual page?', 'error');

      case 'open': {
        const appMap: Record<string, string> = {
          terminal: 'terminal', files: 'filemanager', editor: 'texteditor', browser: 'browser',
          settings: 'settings', notes: 'notes', todo: 'todo', calc: 'calculator',
          calendar: 'calendar', chat: 'chat', code: 'codeeditor',
        };
        const appId = appMap[args[0]] || args[0];
        openWindow(appId);
        return out(`Opening ${args[0]}...`, 'success');
      }

      case 'calc': {
        if (!args[0]) return out('calc: usage: calc <expression>', 'error');
        try {
          const expr = args.join(' ').replace(/[^0-9+\-*/().\s%]/g, '');
          // eslint-disable-next-line no-eval
          const result = Function(`"use strict"; return (${expr})`)();
          return out(`${args.join(' ')} = ${result}`, 'success');
        } catch { return out('calc: invalid expression', 'error'); }
      }

      case 'base64': {
        const text = args.join(' ');
        return out(btoa(text), 'success');
      }

      case 'md5':
        return out(`${Math.random().toString(16).slice(2).repeat(4).slice(0, 32)}  ${args.join(' ')}`, 'success');

      case 'curl':
        return out(`Simulated HTTP GET ${args[0] || 'http://localhost'}\n200 OK\nContent-Type: application/json\n\n{"status":"ok","simulated":true}`, 'info');

      case 'ping': {
        const host = args[0] || 'localhost';
        const lines = Array.from({ length: 4 }, (_, i) => `64 bytes from ${host}: icmp_seq=${i + 1} ttl=64 time=${(Math.random() * 30 + 2).toFixed(1)} ms`);
        return out(['PING ' + host, ...lines, `\n--- ${host} ping statistics ---`, `4 packets transmitted, 4 received, 0% packet loss`].join('\n'), 'info');
      }

      case 'neofetch': {
        const art = [
          '        _     ',
          '   /\\__/\\    ',
          '  /`    \'\\   ',
          ' |  0  0  |  ',
          ' \\  --  /   ',
          '  |      |   ',
        ];
        const info = [
          `\x1b[35mOS\x1b[0m: WebLinuxOS 2.0`,
          `\x1b[35mKernel\x1b[0m: 6.8.0-webos`,
          `\x1b[35mShell\x1b[0m: wlsh 2.0`,
          `\x1b[35mUser\x1b[0m: ${auth.userName}`,
          `\x1b[35mResolution\x1b[0m: ${window.innerWidth}x${window.innerHeight}`,
          `\x1b[35mTheme\x1b[0m: Catppuccin Mocha`,
          `\x1b[35mMemory\x1b[0m: ${Math.floor(Math.random() * 2048 + 512)}MiB / 8192MiB`,
        ];
        const lines = art.map((a, i) => a + '  ' + (info[i] || ''));
        return out(lines.join('\n'), 'info');
      }

      case '':
        return out('');

      default:
        return out(`${name}: command not found. Type 'help' for available commands.`, 'error');
    }
  }, [fs, auth, openWindow, resolvePath, cmdHistory]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && input !== '') { setInput(''); return; }
    const entry = run(input);
    if (input.trim() && input !== 'clear') {
      setCmdHistory((prev) => [input, ...prev].slice(0, 100));
    }
    if (input !== 'clear') setHistory((prev) => [...prev, entry]);
    setInput('');
    setCmdIdx(-1);
  }, [input, run]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { handleSubmit(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(cmdIdx + 1, cmdHistory.length - 1);
      setCmdIdx(idx);
      setInput(cmdHistory[idx] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(cmdIdx - 1, -1);
      setCmdIdx(idx);
      setInput(idx === -1 ? '' : cmdHistory[idx] || '');
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([{ input: '', output: BANNER, type: 'info' }]);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion
      const parts = input.split(' ');
      const last = parts[parts.length - 1];
      if (last) {
        const node = fs.getNodeByPath(fs.currentPath);
        if (node) {
          const children = fs.getChildren(node.id).filter((c) => c.name.startsWith(last));
          if (children.length === 1) {
            parts[parts.length - 1] = children[0].name + (children[0].type === 'folder' ? '/' : '');
            setInput(parts.join(' '));
          }
        }
      }
    }
  }, [input, cmdIdx, cmdHistory, handleSubmit, fs]);

  const renderLine = (line: string, idx: number) => {
    const colored = line
      .replace(/\x1b\[(\d+)m/g, (_, code) => {
        const map: Record<string, string> = { '0': '</span>', '32': '<span style="color:#22c55e">', '34': '<span style="color:#60a5fa">', '35': '<span style="color:#a78bfa">', '36': '<span style="color:#22d3ee">' };
        return map[code] || '';
      });
    return <span key={idx} dangerouslySetInnerHTML={{ __html: colored || '&ZeroWidthSpace;' }} />;
  };

  return (
    <div
      className="w-full h-full flex flex-col font-mono-terminal text-sm"
      style={{ background: '#0d0d16', color: '#e2e8f0' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {history.map((entry, i) => (
          <div key={i}>
            {entry.input && (
              <div className="flex gap-2">
                <span style={{ color: '#a78bfa' }}>{auth.userName.toLowerCase()}@weblinux</span>
                <span style={{ color: '#60a5fa' }}>{fs.currentPath}</span>
                <span style={{ color: '#94a3b8' }}>$</span>
                <span style={{ color: '#f1f5f9' }}>{entry.input}</span>
              </div>
            )}
            {entry.output && (
              <pre
                className="whitespace-pre-wrap break-words"
                style={{ color: entry.type === 'error' ? '#f87171' : entry.type === 'success' ? '#4ade80' : entry.type === 'info' ? '#94a3b8' : '#e2e8f0' }}
              >
                {entry.output.split('\n').map(renderLine)}
              </pre>
            )}
          </div>
        ))}

        {/* Current prompt */}
        <div className="flex gap-2 items-center">
          <span style={{ color: '#a78bfa' }}>{auth.userName.toLowerCase()}@weblinux</span>
          <span style={{ color: '#60a5fa' }}>{fs.currentPath}</span>
          <span style={{ color: '#94a3b8' }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-white"
            style={{ caretColor: '#a78bfa', color: '#f1f5f9' }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
