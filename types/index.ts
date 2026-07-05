export type AppName =
  | "terminal"
  | "vscode"
  | "filemanager"
  | "browser"
  | "aboutme"
  | "contact"
  | "calculator"
  | "settings"
  | "texteditor"
  | "github"
  | "gedit"
  | "trash";

export interface AppWindow {
  id: string;
  app: AppName;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface DockApp {
  name: AppName;
  label: string;
  icon: string;
  isOpen: boolean;
}

export interface DesktopFile {
  id: string;
  name: string;
  type: "file" | "folder" | "app";
  icon: string;
  app?: AppName;
  path: string;
}

export interface UserPrefs {
  wallpaper: string;
  theme: string;
  accentColor: string;
  fontSize: number;
  terminalTheme: string;
  dockPosition: string;
  dockSize: number;
}

export interface ContextMenuOption {
  label: string;
  icon?: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
}
