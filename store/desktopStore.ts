import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ContextMenu {
  x: number; y: number; visible: boolean; type: string;
}

interface DesktopStore {
  wallpaper: string;
  accentColor: string;
  terminalTheme: string;
  fontSize: number;
  dockSize: number;
  volume: number;
  brightness: number;
  isBooting: boolean;
  isLocked: boolean;
  bootComplete: boolean;
  contextMenu: ContextMenu;

  setWallpaper: (v: string) => void;
  setAccentColor: (v: string) => void;
  setTerminalTheme: (v: string) => void;
  setFontSize: (v: number) => void;
  setDockSize: (v: number) => void;
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
  setIsBooting: (v: boolean) => void;
  setIsLocked: (v: boolean) => void;
  setBootComplete: (v: boolean) => void;
  showContextMenu: (x: number, y: number, type: string) => void;
  hideContextMenu: () => void;
}

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      wallpaper: "warty-final-ubuntu",
      accentColor: "#E95420",
      terminalTheme: "ubuntu",
      fontSize: 14,
      dockSize: 48,
      volume: 75,
      brightness: 100,
      isBooting: true,
      isLocked: false,
      bootComplete: false,
      contextMenu: { x: 0, y: 0, visible: false, type: "desktop" },

      setWallpaper: (wallpaper) => set({ wallpaper }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setTerminalTheme: (terminalTheme) => set({ terminalTheme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setDockSize: (dockSize) => set({ dockSize }),
      setVolume: (volume) => set({ volume }),
      setBrightness: (brightness) => set({ brightness }),
      setIsBooting: (isBooting) => set({ isBooting }),
      setIsLocked: (isLocked) => set({ isLocked }),
      setBootComplete: (bootComplete) => set({ bootComplete }),
      showContextMenu: (x, y, type) =>
        set({ contextMenu: { x, y, visible: true, type } }),
      hideContextMenu: () =>
        set({ contextMenu: { x: 0, y: 0, visible: false, type: "desktop" } }),
    }),
    {
      name: "wla-desktop-v1",
      partialize: (s) => ({
        wallpaper: s.wallpaper,
        accentColor: s.accentColor,
        terminalTheme: s.terminalTheme,
        fontSize: s.fontSize,
        dockSize: s.dockSize,
        volume: s.volume,
        brightness: s.brightness,
      }),
    }
  )
);
