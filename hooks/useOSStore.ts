'use client';
// ============================================================
// WebLinuxOS — Zustand Store
// ============================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { OSState, OSWindow, DesktopIcon, OSNotification, Theme, DockItem, ContextMenuItem, ContextMenuType, AuthState, BootPhase, Size, Position, WindowState } from '@/types';
import { APP_REGISTRY, getAppById, DEFAULT_DOCK } from '@/components/apps/registry';
import { generateId } from '@/lib/utils';

const TOP_PANEL_HEIGHT = 28;

function createWindow(state: OSState, appId: string, title?: string): OSWindow {
  const app = getAppById(appId);
  if (!app) throw new Error(`Unknown app: ${appId}`);
  const id = generateId();
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const offset = state.windows.filter((w) => w.appId === appId).length * 28;
  const x = Math.max(20, Math.min(vw - app.defaultSize.width - 20, 60 + offset));
  const y = Math.max(TOP_PANEL_HEIGHT + 10, Math.min(vh - app.defaultSize.height - 60, 40 + offset));
  return {
    id, appId, title: title || app.name,
    position: { x, y }, size: { ...app.defaultSize },
    state: 'normal', isFocused: true, zIndex: state.nextZIndex,
    icon: app.icon, createdAt: Date.now(),
  };
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

const defaultDesktopIcons: DesktopIcon[] = [
  { id: 'desk-home', name: 'Home', icon: 'Home', appId: 'filemanager', position: { x: 16, y: 16 }, isSelected: false },
  { id: 'desk-trash', name: 'Trash', icon: 'Trash2', appId: 'filemanager', position: { x: 16, y: 106 }, isSelected: false },
  { id: 'desk-editor', name: 'Text Editor', icon: 'FileText', appId: 'texteditor', position: { x: 16, y: 196 }, isSelected: false },
  { id: 'desk-terminal', name: 'Terminal', icon: 'Terminal', appId: 'terminal', position: { x: 16, y: 286 }, isSelected: false },
  { id: 'desk-settings', name: 'Settings', icon: 'Settings', appId: 'settings', position: { x: 96, y: 16 }, isSelected: false },
  { id: 'desk-browser', name: 'Browser', icon: 'Globe', appId: 'browser', position: { x: 96, y: 106 }, isSelected: false },
  { id: 'desk-chat', name: 'Chat', icon: 'MessageSquare', appId: 'chat', position: { x: 96, y: 196 }, isSelected: false },
];

const createDockItems = (pinned: string[]): DockItem[] =>
  APP_REGISTRY.map((app) => ({
    appId: app.id,
    isPinned: pinned.includes(app.id),
    isOpen: false,
    isFocused: false,
    bounce: false,
  }));

interface OSStore extends OSState {
  // Auth actions
  setBootPhase: (phase: BootPhase) => void;
  login: (auth: Partial<AuthState>) => void;
  logout: () => void;

  // Window actions
  openWindow: (appId: string, title?: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, pos: Position) => void;
  resizeWindow: (id: string, size: Size) => void;
  cascadeWindows: () => void;
  minimizeAll: () => void;

  // Desktop
  updateDesktopIconPos: (id: string, pos: Position) => void;
  selectDesktopIcon: (id: string | null) => void;
  addDesktopIcon: (icon: Omit<DesktopIcon, 'id'>) => void;
  removeDesktopIcon: (id: string) => void;

  // App launcher
  toggleAppLauncher: () => void;
  setAppLauncher: (open: boolean) => void;

  // Notification center
  toggleNotificationCenter: () => void;

  // Notifications
  addNotification: (n: Omit<OSNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Theme
  setTheme: (t: Partial<Theme>) => void;
  toggleTheme: () => void;

  // Dock
  pinDockItem: (appId: string) => void;
  unpinDockItem: (appId: string) => void;
  initDock: (pinned: string[]) => void;

  // Context menu
  showContextMenu: (x: number, y: number, type: ContextMenuType, items: ContextMenuItem[], data?: Record<string, unknown>) => void;
  hideContextMenu: () => void;

  // Alt-tab
  startAltTab: () => void;
  cycleAltTab: () => void;
  endAltTab: () => void;

  // Sync
  setSyncing: (v: boolean) => void;
}

export const useOSStore = create<OSStore>()(
  subscribeWithSelector((set, get) => ({
    bootPhase: 'off',
    auth: { isAuthenticated: false, isGuest: false, userId: null, userName: 'User', userEmail: null, userImage: null },
    windows: [],
    desktopIcons: loadFromStorage('wlos_desktop_icons', defaultDesktopIcons),
    theme: loadFromStorage('wlos_theme', { mode: 'dark' as const, accent: '#E95420', wallpaper: '/wallpapers/default.svg' }),
    notifications: [],
    dockItems: createDockItems(DEFAULT_DOCK),
    contextMenu: { visible: false, x: 0, y: 0, type: 'desktop', items: [] },
    appLauncherOpen: false,
    notificationCenterOpen: false,
    activeWindowId: null,
    nextZIndex: 100,
    isAltTabbing: false,
    altTabIndex: 0,
    isSyncing: false,

    setBootPhase: (phase) => set({ bootPhase: phase }),

    login: (auth) =>
      set((s) => ({
        auth: { ...s.auth, ...auth, isAuthenticated: true },
        bootPhase: 'desktop',
      })),

    logout: () =>
      set({
        auth: { isAuthenticated: false, isGuest: false, userId: null, userName: 'User', userEmail: null, userImage: null },
        windows: [],
        bootPhase: 'login',
        activeWindowId: null,
        dockItems: createDockItems(DEFAULT_DOCK),
      }),

    openWindow: (appId, title) =>
      set((s) => {
        const win = createWindow(s, appId, title);
        const wins = s.windows.map((w) => ({ ...w, isFocused: false }));
        const dock = s.dockItems.map((d) =>
          d.appId === appId ? { ...d, isOpen: true, isFocused: true, bounce: true } : { ...d, isFocused: false }
        );
        // Send notification when app opens
        const app = getAppById(appId);
        const notif: OSNotification = {
          id: generateId(), appId, appName: app?.name || appId, appIcon: app?.icon || 'App',
          title: `${app?.name || appId} opened`, message: 'Double-click to bring to front',
          timestamp: Date.now(), isRead: false,
        };
        return {
          windows: [...wins, win],
          activeWindowId: win.id,
          nextZIndex: s.nextZIndex + 1,
          dockItems: dock,
          notifications: [notif, ...s.notifications].slice(0, 50),
        };
      }),

    closeWindow: (id) =>
      set((s) => {
        const appId = s.windows.find((w) => w.id === id)?.appId;
        const remaining = s.windows.filter((w) => w.id !== id);
        const hasOther = remaining.some((w) => w.appId === appId);
        const dock = appId && !hasOther
          ? s.dockItems.map((d) => d.appId === appId ? { ...d, isOpen: false, isFocused: false } : d)
          : s.dockItems;
        const newActive = remaining.length > 0
          ? remaining.filter((w) => w.state !== 'minimized').reduce((a, b) => a.zIndex > b.zIndex ? a : b, remaining[0])?.id ?? null
          : null;
        return { windows: remaining, activeWindowId: newActive, dockItems: dock };
      }),

    minimizeWindow: (id) =>
      set((s) => {
        const appId = s.windows.find((w) => w.id === id)?.appId;
        const wins = s.windows.map((w) => w.id === id ? { ...w, state: 'minimized' as WindowState, isFocused: false } : w);
        const others = wins.filter((w) => w.state !== 'minimized');
        const newActive = others.length > 0 ? others.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id : null;
        const dock = appId ? s.dockItems.map((d) => d.appId === appId ? { ...d, isFocused: false } : d) : s.dockItems;
        return { windows: wins, activeWindowId: newActive, dockItems: dock };
      }),

    maximizeWindow: (id) =>
      set((s) => ({
        windows: s.windows.map((w) =>
          w.id === id
            ? { ...w, state: 'maximized' as WindowState, prevPosition: w.position, prevSize: w.size, isFocused: true }
            : { ...w, isFocused: false }
        ),
        activeWindowId: id,
      })),

    restoreWindow: (id) =>
      set((s) => ({
        windows: s.windows.map((w) =>
          w.id === id
            ? { ...w, state: 'normal' as WindowState, position: w.prevPosition || w.position, size: w.prevSize || w.size, isFocused: true }
            : { ...w, isFocused: false }
        ),
        activeWindowId: id,
      })),

    focusWindow: (id) =>
      set((s) => {
        const win = s.windows.find((w) => w.id === id);
        if (!win) return s;
        const appId = win.appId;
        return {
          windows: s.windows.map((w) =>
            w.id === id
              ? { ...w, isFocused: true, zIndex: s.nextZIndex, state: w.state === 'minimized' ? 'normal' as WindowState : w.state }
              : { ...w, isFocused: false }
          ),
          activeWindowId: id,
          nextZIndex: s.nextZIndex + 1,
          dockItems: s.dockItems.map((d) => d.appId === appId ? { ...d, isFocused: true, isOpen: true } : { ...d, isFocused: false }),
        };
      }),

    moveWindow: (id, pos) =>
      set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, position: pos } : w) })),

    resizeWindow: (id, size) =>
      set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, size } : w) })),

    cascadeWindows: () =>
      set((s) => {
        let offset = 0;
        return {
          windows: s.windows
            .filter((w) => w.state !== 'minimized')
            .map((w) => {
              const pos = { x: 60 + offset * 28, y: 40 + offset * 28 };
              offset++;
              return { ...w, state: 'normal' as WindowState, position: pos };
            })
            .concat(s.windows.filter((w) => w.state === 'minimized')),
        };
      }),

    minimizeAll: () =>
      set((s) => ({
        windows: s.windows.map((w) => ({ ...w, state: 'minimized' as WindowState, isFocused: false })),
        activeWindowId: null,
      })),

    updateDesktopIconPos: (id, pos) => {
      set((s) => {
        const icons = s.desktopIcons.map((i) => i.id === id ? { ...i, position: pos } : i);
        localStorage.setItem('wlos_desktop_icons', JSON.stringify(icons));
        return { desktopIcons: icons };
      });
    },

    selectDesktopIcon: (id) =>
      set((s) => ({ desktopIcons: s.desktopIcons.map((i) => ({ ...i, isSelected: i.id === id })) })),

    addDesktopIcon: (icon) =>
      set((s) => ({ desktopIcons: [...s.desktopIcons, { ...icon, id: generateId() }] })),

    removeDesktopIcon: (id) =>
      set((s) => ({ desktopIcons: s.desktopIcons.filter((i) => i.id !== id) })),

    toggleAppLauncher: () => set((s) => ({ appLauncherOpen: !s.appLauncherOpen })),
    setAppLauncher: (open) => set({ appLauncherOpen: open }),
    toggleNotificationCenter: () => set((s) => ({ notificationCenterOpen: !s.notificationCenterOpen })),

    addNotification: (n) =>
      set((s) => ({
        notifications: [
          { ...n, id: generateId(), timestamp: Date.now() },
          ...s.notifications,
        ].slice(0, 50),
      })),

    removeNotification: (id) =>
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

    markNotificationRead: (id) =>
      set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n) })),

    clearNotifications: () => set({ notifications: [] }),

    setTheme: (t) =>
      set((s) => {
        const theme = { ...s.theme, ...t };
        localStorage.setItem('wlos_theme', JSON.stringify(theme));
        return { theme };
      }),

    toggleTheme: () =>
      set((s) => {
        const theme = { ...s.theme, mode: s.theme.mode === 'dark' ? 'light' as const : 'dark' as const };
        localStorage.setItem('wlos_theme', JSON.stringify(theme));
        return { theme };
      }),

    pinDockItem: (appId) =>
      set((s) => ({ dockItems: s.dockItems.map((d) => d.appId === appId ? { ...d, isPinned: true } : d) })),

    unpinDockItem: (appId) =>
      set((s) => ({ dockItems: s.dockItems.map((d) => d.appId === appId ? { ...d, isPinned: false } : d) })),

    initDock: (pinned) => set({ dockItems: createDockItems(pinned) }),

    showContextMenu: (x, y, type, items, data) =>
      set({ contextMenu: { visible: true, x, y, type, items, contextData: data } }),

    hideContextMenu: () =>
      set({ contextMenu: { visible: false, x: 0, y: 0, type: 'desktop', items: [] } }),

    startAltTab: () => set((s) => ({ isAltTabbing: true, altTabIndex: s.windows.findIndex((w) => w.isFocused) })),
    cycleAltTab: () => set((s) => ({ altTabIndex: (s.altTabIndex + 1) % s.windows.length })),
    endAltTab: () =>
      set((s) => {
        const win = s.windows[s.altTabIndex];
        if (win) get().focusWindow(win.id);
        return { isAltTabbing: false };
      }),

    setSyncing: (v) => set({ isSyncing: v }),
  }))
);

// Type-safe selector hooks
export const useOS = () => useOSStore();
