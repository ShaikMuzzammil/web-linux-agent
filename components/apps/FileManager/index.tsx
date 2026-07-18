'use client';
import { useState, useCallback, useRef } from 'react';
import { Folder, File, ArrowLeft, ArrowRight, ArrowUp, Home, Trash2, RefreshCw, Plus, FolderPlus, Search, Grid3x3, List, ChevronRight, MoreHorizontal, Upload, Download, Eye, Pencil, Copy, Scissors, X, Check } from 'lucide-react';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useOSStore } from '@/hooks/useOSStore';
import type { FileSystemNode } from '@/types';
import { formatBytes } from '@/lib/utils';
import { format as _dfFormat } from 'date-fns';
const format = (d: Date | number | string, fmt: string): string => {
  try {
    const dt = typeof d === 'string' ? new Date(d) : typeof d === 'number' ? new Date(d) : d;
    if (!dt || isNaN(dt.getTime())) return '—';
    return _dfFormat(dt, fmt);
  } catch { return '—'; }
};

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';

export default function FileManager({ windowId }: { windowId: string }) {
  const fs = useFileSystem();
  const { theme, openWindow } = useOSStore();
  const [view, setView] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [query, setQuery] = useState('');
  const [navBack, setNavBack] = useState<string[]>([]);
  const [navForward, setNavForward] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [createName, setCreateName] = useState('');
  const [preview, setPreview] = useState<FileSystemNode | null>(null);
  const [clipboard, setClipboard] = useState<{ node: FileSystemNode; op: 'copy' | 'cut' } | null>(null);
  const lastClick = useRef<{ id: string; ts: number }>({ id: '', ts: 0 });

  const currentNode = fs.getNodeByPath(fs.currentPath);
  const allChildren = currentNode ? fs.getChildren(currentNode.id) : [];
  const children = allChildren
    .filter((c) => !c.isHidden && (!query || c.name.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return b.modifiedAt - a.modifiedAt;
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return a.name.localeCompare(b.name);
    });

  const navigate = useCallback((path: string) => {
    setNavBack((prev) => [...prev, fs.currentPath]);
    setNavForward([]);
    fs.setCurrentPath(path);
    setQuery('');
    setPreview(null);
  }, [fs]);

  const goBack = useCallback(() => {
    const prev = navBack[navBack.length - 1];
    if (!prev) return;
    setNavForward((f) => [fs.currentPath, ...f]);
    setNavBack((b) => b.slice(0, -1));
    fs.setCurrentPath(prev);
  }, [navBack, fs]);

  const goForward = useCallback(() => {
    const next = navForward[0];
    if (!next) return;
    setNavBack((b) => [...b, fs.currentPath]);
    setNavForward((f) => f.slice(1));
    fs.setCurrentPath(next);
  }, [navForward, fs]);

  const goUp = useCallback(() => {
    const parts = fs.currentPath.split('/').filter(Boolean);
    if (parts.length === 0) return;
    parts.pop();
    navigate('/' + parts.join('/') || '/');
  }, [fs.currentPath, navigate]);

  const handleNodeClick = useCallback((node: FileSystemNode) => {
    const now = Date.now();
    const isDouble = lastClick.current.id === node.id && now - lastClick.current.ts < 400;
    lastClick.current = { id: node.id, ts: now };

    if (isDouble) {
      if (node.type === 'folder') { navigate(fs.getPath(node.id)); }
      else { setPreview(node); openWindow('texteditor'); }
      return;
    }
    fs.selectNode(node.id);
    setPreview(node);
  }, [fs, navigate, openWindow]);

  const startRename = (node: FileSystemNode) => { setRenaming(node.id); setRenameVal(node.name); };
  const commitRename = () => { if (renaming && renameVal.trim()) fs.renameNode(renaming, renameVal.trim()); setRenaming(null); };

  const startCreate = (type: 'file' | 'folder') => { setCreating(type); setCreateName(type === 'file' ? 'untitled.txt' : 'New Folder'); };
  const commitCreate = () => {
    if (!createName.trim() || !currentNode) return;
    if (creating === 'file') fs.createFile(currentNode.id, createName.trim(), '');
    else fs.createFolder(currentNode.id, createName.trim());
    setCreating(null);
  };

  const getIcon = (node: FileSystemNode) => {
    if (node.type === 'folder') return <Folder size={view === 'grid' ? 32 : 16} style={{ color: '#60a5fa' }} />;
    const ext = node.name.split('.').pop()?.toLowerCase() || '';
    const colorMap: Record<string, string> = { md: '#f59e0b', txt: '#94a3b8', js: '#f7df1e', ts: '#3b82f6', json: '#22d3ee', html: '#f97316', css: '#a78bfa', py: '#22c55e', sh: '#22c55e', jpg: '#ec4899', png: '#ec4899' };
    return <File size={view === 'grid' ? 28 : 16} style={{ color: colorMap[ext] || '#94a3b8' }} />;
  };

  const breadcrumbs = fs.currentPath.split('/').filter(Boolean);

  // Sidebar quick-access
  const SIDEBAR = [
    { label: 'Home', path: '/home/user', icon: <Home size={14} /> },
    { label: 'Documents', path: '/home/user/Documents', icon: <Folder size={14} style={{ color: '#60a5fa' }} /> },
    { label: 'Downloads', path: '/home/user/Downloads', icon: <Folder size={14} style={{ color: '#22c55e' }} /> },
    { label: 'Pictures', path: '/home/user/Pictures', icon: <Folder size={14} style={{ color: '#ec4899' }} /> },
    { label: 'Music', path: '/home/user/Music', icon: <Folder size={14} style={{ color: '#f59e0b' }} /> },
    { label: 'Trash', path: '/trash', icon: <Trash2 size={14} style={{ color: '#f87171' }} /> },
  ];

  return (
    <div className="flex h-full text-sm" style={{ background: theme.mode === 'dark' ? '#0f0f1a' : '#f8f8fc', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Sidebar */}
      <div className="w-44 flex-shrink-0 flex flex-col gap-1 p-2 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)', background: theme.mode === 'dark' ? 'rgba(10,10,20,0.8)' : 'rgba(230,230,240,0.8)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-40 px-2 pt-1 pb-0.5">Quick Access</p>
        {SIDEBAR.map((s) => (
          <button key={s.path} onClick={() => navigate(s.path)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-all"
            style={{ background: fs.currentPath.startsWith(s.path) ? `${theme.accent}25` : 'transparent', color: fs.currentPath.startsWith(s.path) ? theme.accent : 'inherit' }}
            onMouseEnter={(e) => { if (!fs.currentPath.startsWith(s.path)) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { if (!fs.currentPath.startsWith(s.path)) e.currentTarget.style.background = 'transparent'; }}
          >
            {s.icon}<span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={goBack} disabled={navBack.length === 0} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"><ArrowLeft size={14} /></button>
          <button onClick={goForward} disabled={navForward.length === 0} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"><ArrowRight size={14} /></button>
          <button onClick={goUp} className="p-1.5 rounded hover:bg-white/10 transition-colors"><ArrowUp size={14} /></button>
          <button onClick={() => navigate('/home/user')} className="p-1.5 rounded hover:bg-white/10 transition-colors"><Home size={14} /></button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-0.5 flex-1 px-2 py-1 rounded-lg text-xs overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <span className="opacity-40">/</span>
            {breadcrumbs.map((b, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <button
                  onClick={() => navigate('/' + breadcrumbs.slice(0, i + 1).join('/'))}
                  className="hover:text-purple-400 transition-colors truncate"
                >
                  {b}
                </button>
                {i < breadcrumbs.length - 1 && <ChevronRight size={11} className="opacity-30 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
              className="pl-6 pr-2 py-1 rounded-lg text-xs outline-none w-28"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', caretColor: theme.accent }} />
          </div>

          <div className="flex gap-0.5">
            <button onClick={() => startCreate('file')} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="New file"><Plus size={14} /></button>
            <button onClick={() => startCreate('folder')} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="New folder"><FolderPlus size={14} /></button>
          </div>

          <div className="flex gap-0.5 border-l border-white/10 pl-1.5 ml-0.5">
            <button onClick={() => setView('grid')} className="p-1.5 rounded transition-colors" style={{ background: view === 'grid' ? `${theme.accent}30` : 'transparent' }}><Grid3x3 size={14} /></button>
            <button onClick={() => setView('list')} className="p-1.5 rounded transition-colors" style={{ background: view === 'list' ? `${theme.accent}30` : 'transparent' }}><List size={14} /></button>
          </div>
        </div>

        {/* File grid / list */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Create new input */}
          {creating && (
            <div className="flex items-center gap-2 mb-2 p-2 rounded-lg border" style={{ borderColor: theme.accent, background: `${theme.accent}10` }}>
              {creating === 'folder' ? <Folder size={16} style={{ color: '#60a5fa' }} /> : <File size={16} style={{ color: '#94a3b8' }} />}
              <input value={createName} onChange={(e) => setCreateName(e.target.value)}
                autoFocus onKeyDown={(e) => { if (e.key === 'Enter') commitCreate(); if (e.key === 'Escape') setCreating(null); }}
                className="flex-1 bg-transparent outline-none text-sm" style={{ caretColor: theme.accent }} />
              <button onClick={commitCreate} className="text-green-400"><Check size={14} /></button>
              <button onClick={() => setCreating(null)} className="text-red-400"><X size={14} /></button>
            </div>
          )}

          {children.length === 0 && !creating && (
            <div className="flex flex-col items-center justify-center h-32 opacity-30">
              <Folder size={36} />
              <p className="text-xs mt-2">{query ? 'No matching files' : 'Empty folder'}</p>
            </div>
          )}

          {view === 'grid' ? (
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}>
              {children.map((node) => (
                <div
                  key={node.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-all select-none"
                  style={{ background: fs.selectedIds.includes(node.id) ? `${theme.accent}20` : 'transparent', border: `1px solid ${fs.selectedIds.includes(node.id) ? theme.accent + '40' : 'transparent'}` }}
                  onClick={() => handleNodeClick(node)}
                  onContextMenu={(e) => { e.preventDefault(); startRename(node); }}
                  onMouseEnter={(e) => { if (!fs.selectedIds.includes(node.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={(e) => { if (!fs.selectedIds.includes(node.id)) e.currentTarget.style.background = 'transparent'; }}
                >
                  {getIcon(node)}
                  {renaming === node.id ? (
                    <input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null); }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-center text-xs bg-transparent outline-none border-b border-purple-400" style={{ caretColor: theme.accent }} />
                  ) : (
                    <p className="text-[10px] text-center leading-tight line-clamp-2 break-all max-w-full">{node.name}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {['Name', 'Date', 'Size', 'Type'].map((h, i) => (
                    <th key={h} className="text-left py-1 px-2 font-medium opacity-50 cursor-pointer hover:opacity-80"
                      onClick={() => setSortBy(['name', 'date', 'size', 'type'][i] as SortBy)}
                      style={{ color: sortBy === ['name', 'date', 'size', 'type'][i] ? theme.accent : 'inherit' }}>
                      {h}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {children.map((node) => (
                  <tr key={node.id} className="border-b cursor-pointer transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.03)', background: fs.selectedIds.includes(node.id) ? `${theme.accent}15` : 'transparent' }}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={(e) => { if (!fs.selectedIds.includes(node.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { if (!fs.selectedIds.includes(node.id)) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td className="py-1.5 px-2"><div className="flex items-center gap-2">{getIcon(node)}<span>{node.name}</span></div></td>
                    <td className="py-1.5 px-2 opacity-50">{format(node.modifiedAt, 'MMM d, yyyy')}</td>
                    <td className="py-1.5 px-2 opacity-50">{node.type === 'file' ? formatBytes(node.size || 0) : '—'}</td>
                    <td className="py-1.5 px-2 opacity-50">{node.type === 'folder' ? 'Folder' : node.name.split('.').pop()?.toUpperCase() || 'File'}</td>
                    <td className="py-1.5 px-2">
                      <button onClick={(e) => { e.stopPropagation(); fs.deleteNode(node.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Status bar */}
        <div className="px-3 py-1 text-[10px] opacity-40 border-t flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span>{children.length} items{fs.selectedIds.length > 0 ? `, ${fs.selectedIds.length} selected` : ''}</span>
          <span>{fs.currentPath}</span>
        </div>
      </div>
    </div>
  );
}
