'use client';
import { create } from 'zustand';
import type { FileSystemNode, FileSystemState, TrashItemMetadata } from '@/types';
import { generateId } from '@/lib/utils';

// ── Default FS tree ──────────────────────────────────────────
const buildDefaultFS = (): FileSystemState => {
  const root: FileSystemNode = { id: 'root', name: '/', type: 'folder', parentId: null, createdAt: Date.now(), modifiedAt: Date.now() };
  const home: FileSystemNode = { id: 'home', name: 'home', type: 'folder', parentId: 'root', createdAt: Date.now(), modifiedAt: Date.now() };
  const user: FileSystemNode = { id: 'user', name: 'user', type: 'folder', parentId: 'home', createdAt: Date.now(), modifiedAt: Date.now() };
  const docs: FileSystemNode = { id: 'docs', name: 'Documents', type: 'folder', parentId: 'user', createdAt: Date.now(), modifiedAt: Date.now() };
  const dl: FileSystemNode = { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'user', createdAt: Date.now(), modifiedAt: Date.now() };
  const pics: FileSystemNode = { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'user', createdAt: Date.now(), modifiedAt: Date.now() };
  const music: FileSystemNode = { id: 'music', name: 'Music', type: 'folder', parentId: 'user', createdAt: Date.now(), modifiedAt: Date.now() };
  const trash: FileSystemNode = { id: 'trash', name: 'Trash', type: 'folder', parentId: 'root', createdAt: Date.now(), modifiedAt: Date.now() };
  const readme: FileSystemNode = {
    id: 'readme', name: 'README.md', type: 'file', parentId: 'user',
    createdAt: Date.now(), modifiedAt: Date.now(),
    content: '# Welcome to WebLinuxOS\n\nThis is your personal cloud-synced Linux desktop in the browser.\n\nAll files, notes, tasks, contacts, and settings sync across devices when you\'re logged in.\n\n## Quick Start\n- Double-click desktop icons to open apps\n- Right-click for context menus\n- Drag windows to move them\n- Use Terminal for command-line fun\n',
    size: 256,
  };

  return {
    nodes: { root, home, user, docs, dl, pics, music, trash, readme },
    trashMetadata: {},
  };
};

// ── Store ────────────────────────────────────────────────────
interface FSStore extends FileSystemState {
  currentPath: string;
  selectedIds: string[];

  // Navigation
  setCurrentPath: (path: string) => void;

  // CRUD
  createFile: (parentId: string, name: string, content?: string) => string;
  createFolder: (parentId: string, name: string) => string;
  updateFile: (id: string, content: string) => void;
  renameNode: (id: string, name: string) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, newParentId: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;

  // Selection
  selectNode: (id: string, multi?: boolean) => void;
  clearSelection: () => void;

  // Helpers
  getNodeByPath: (path: string) => FileSystemNode | null;
  getChildren: (parentId: string) => FileSystemNode[];
  getPath: (id: string) => string;
  loadFromCloud: (data: FileSystemState) => void;
}

const loadFS = (): FileSystemState => {
  if (typeof window === 'undefined') return buildDefaultFS();
  try {
    const v = localStorage.getItem('wlos_fs');
    return v ? JSON.parse(v) : buildDefaultFS();
  } catch { return buildDefaultFS(); }
};

const saveFS = (state: FileSystemState) => {
  try { localStorage.setItem('wlos_fs', JSON.stringify(state)); } catch { /* ignore */ }
};

export const useFileSystem = create<FSStore>()((set, get) => {
  const initial = loadFS();
  return {
    ...initial,
    currentPath: '/home/user',
    selectedIds: [],

    setCurrentPath: (path) => set({ currentPath: path }),

    createFile: (parentId, name, content = '') => {
      const id = generateId();
      const node: FileSystemNode = {
        id, name, type: 'file', parentId,
        createdAt: Date.now(), modifiedAt: Date.now(),
        content, size: content.length,
      };
      set((s) => {
        const nodes = { ...s.nodes, [id]: node };
        saveFS({ nodes, trashMetadata: s.trashMetadata });
        return { nodes };
      });
      return id;
    },

    createFolder: (parentId, name) => {
      const id = generateId();
      const node: FileSystemNode = { id, name, type: 'folder', parentId, createdAt: Date.now(), modifiedAt: Date.now() };
      set((s) => {
        const nodes = { ...s.nodes, [id]: node };
        saveFS({ nodes, trashMetadata: s.trashMetadata });
        return { nodes };
      });
      return id;
    },

    updateFile: (id, content) =>
      set((s) => {
        const nodes = { ...s.nodes, [id]: { ...s.nodes[id], content, size: content.length, modifiedAt: Date.now() } };
        saveFS({ nodes, trashMetadata: s.trashMetadata });
        return { nodes };
      }),

    renameNode: (id, name) =>
      set((s) => {
        const nodes = { ...s.nodes, [id]: { ...s.nodes[id], name, modifiedAt: Date.now() } };
        saveFS({ nodes, trashMetadata: s.trashMetadata });
        return { nodes };
      }),

    deleteNode: (id) =>
      set((s) => {
        if (id === 'trash') return s;
        const originalPath = get().getPath(id);
        const meta: TrashItemMetadata = { originalPath, deletedAt: Date.now() };
        const node = { ...s.nodes[id], parentId: 'trash', modifiedAt: Date.now() };
        const nodes = { ...s.nodes, [id]: node };
        const trashMetadata = { ...s.trashMetadata, [id]: meta };
        saveFS({ nodes, trashMetadata });
        return { nodes, trashMetadata };
      }),

    moveNode: (id, newParentId) =>
      set((s) => {
        const nodes = { ...s.nodes, [id]: { ...s.nodes[id], parentId: newParentId, modifiedAt: Date.now() } };
        saveFS({ nodes, trashMetadata: s.trashMetadata });
        return { nodes };
      }),

    restoreFromTrash: (id) =>
      set((s) => {
        const meta = s.trashMetadata[id];
        const pathParts = meta?.originalPath?.split('/').filter(Boolean) || [];
        let parentId = 'user';
        if (pathParts.length > 1) {
          const parentNode = Object.values(s.nodes).find((n) => n.name === pathParts[pathParts.length - 2]);
          if (parentNode) parentId = parentNode.id;
        }
        const nodes = { ...s.nodes, [id]: { ...s.nodes[id], parentId, modifiedAt: Date.now() } };
        const trashMetadata = { ...s.trashMetadata };
        delete trashMetadata[id];
        saveFS({ nodes, trashMetadata });
        return { nodes, trashMetadata };
      }),

    emptyTrash: () =>
      set((s) => {
        const trashChildren = Object.values(s.nodes).filter((n) => n.parentId === 'trash').map((n) => n.id);
        const nodes = { ...s.nodes };
        trashChildren.forEach((id) => delete nodes[id]);
        const trashMetadata: Record<string, TrashItemMetadata> = {};
        saveFS({ nodes, trashMetadata });
        return { nodes, trashMetadata };
      }),

    selectNode: (id, multi = false) =>
      set((s) => ({
        selectedIds: multi
          ? s.selectedIds.includes(id) ? s.selectedIds.filter((i) => i !== id) : [...s.selectedIds, id]
          : [id],
      })),

    clearSelection: () => set({ selectedIds: [] }),

    getNodeByPath: (path) => {
      const parts = path.replace(/^\//, '').split('/').filter(Boolean);
      const nodes = get().nodes;
      if (parts.length === 0) return nodes['root'] || null;
      let current: FileSystemNode | undefined = nodes['root'];
      for (const part of parts) {
        const child = Object.values(nodes).find((n) => n.parentId === current?.id && n.name === part);
        if (!child) return null;
        current = child;
      }
      return current || null;
    },

    getChildren: (parentId) =>
      Object.values(get().nodes).filter((n) => n.parentId === parentId).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),

    getPath: (id) => {
      const nodes = get().nodes;
      const parts: string[] = [];
      let current: FileSystemNode | undefined = nodes[id];
      while (current && current.id !== 'root') {
        parts.unshift(current.name);
        current = current.parentId ? nodes[current.parentId] : undefined;
      }
      return '/' + parts.join('/');
    },

    loadFromCloud: (data) => {
      set({ nodes: data.nodes, trashMetadata: data.trashMetadata });
      saveFS(data);
    },
  };
});
