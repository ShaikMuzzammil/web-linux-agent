import { create } from "zustand";
import { AppName, AppWindow } from "@/types";

const DEFAULT_SIZES: Record<AppName, { width: number; height: number }> = {
  terminal:    { width: 740,  height: 460 },
  vscode:      { width: 960,  height: 620 },
  filemanager: { width: 800,  height: 540 },
  browser:     { width: 1020, height: 680 },
  aboutme:     { width: 880,  height: 620 },
  contact:     { width: 680,  height: 580 },
  calculator:  { width: 320,  height: 500 },
  settings:    { width: 780,  height: 560 },
  texteditor:  { width: 720,  height: 520 },
  github:      { width: 920,  height: 660 },
  gedit:       { width: 720,  height: 520 },
  trash:       { width: 660,  height: 460 },
};

const APP_TITLES: Record<AppName, string> = {
  terminal:    "Terminal — Bash",
  vscode:      "Visual Studio Code",
  filemanager: "Files",
  browser:     "Firefox Browser",
  aboutme:     "About Shaik Muzzammil",
  contact:     "Contact Me",
  calculator:  "Calculator",
  settings:    "Settings",
  texteditor:  "Text Editor",
  github:      "GitHub — ShaikMuzzammil",
  gedit:       "gedit",
  trash:       "Trash",
};

interface WindowStore {
  windows: AppWindow[];
  topZIndex: number;
  openApp: (app: AppName) => void;
  closeApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  maximizeApp: (id: string) => void;
  focusApp: (id: string) => void;
  restoreApp: (id: string) => void;
  updatePosition: (id: string, pos: { x: number; y: number }) => void;
  updateSize: (id: string, size: { width: number; height: number }) => void;
  closeAll: () => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  topZIndex: 100,

  openApp(app) {
    const { windows, topZIndex, focusApp, restoreApp } = get();

    // Already open and visible → focus
    const open = windows.find((w) => w.app === app && !w.isMinimized);
    if (open) { focusApp(open.id); return; }

    // Minimized → restore
    const mini = windows.find((w) => w.app === app && w.isMinimized);
    if (mini) { restoreApp(mini.id); return; }

    const newZ = topZIndex + 1;
    const offset = (windows.length % 8) * 28;
    const size = DEFAULT_SIZES[app];

    const w: AppWindow = {
      id: `${app}-${Date.now()}`,
      app,
      title: APP_TITLES[app],
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      position: { x: 72 + offset, y: 36 + offset },
      size,
      zIndex: newZ,
    };

    set((s) => ({
      windows: s.windows.map((x) => ({ ...x, isFocused: false })).concat(w),
      topZIndex: newZ,
    }));
  },

  closeApp(id) {
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) }));
  },

  minimizeApp(id) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
      ),
    }));
  },

  maximizeApp(id) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized, isFocused: true } : w
      ),
    }));
  },

  focusApp(id) {
    const newZ = get().topZIndex + 1;
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, isFocused: true, zIndex: newZ } : { ...w, isFocused: false }
      ),
      topZIndex: newZ,
    }));
  },

  restoreApp(id) {
    const newZ = get().topZIndex + 1;
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id
          ? { ...w, isMinimized: false, isFocused: true, zIndex: newZ }
          : { ...w, isFocused: false }
      ),
      topZIndex: newZ,
    }));
  },

  updatePosition(id, position) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    }));
  },

  updateSize(id, size) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
  },

  closeAll() {
    set({ windows: [] });
  },
}));
