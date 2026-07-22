// ============================================================
// WebLinuxOS — Core Type Definitions  v4.0
// ============================================================

export interface Position { x: number; y: number }
export interface Size { width: number; height: number }
export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface OSWindow {
  id: string;
  appId: string;
  title: string;
  position: Position;
  size: Size;
  state: WindowState;
  prevPosition?: Position;
  prevSize?: Size;
  isFocused: boolean;
  zIndex: number;
  icon: string;
  createdAt: number;
}

export type AppCategory =
  | 'System' | 'Productivity' | 'Internet' | 'Media'
  | 'Games' | 'DevTools' | 'Creative';

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  category: AppCategory;
  description: string;
  defaultSize: Size;
  minSize: Size;
}

// ── Virtual File System ──────────────────────────────────────
export type FileNodeType = 'file' | 'folder';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileNodeType;
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
  content?: string;
  size?: number;
  isHidden?: boolean;
}

export interface TrashItemMetadata {
  originalPath: string;
  deletedAt: number;
}

export interface FileSystemState {
  nodes: Record<string, FileSystemNode>;
  trashMetadata: Record<string, TrashItemMetadata>;
}

// ── Desktop ──────────────────────────────────────────────────
export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  appId?: string;
  fileSystemNodeId?: string;
  position: Position;
  isSelected: boolean;
}

// ── Theme ────────────────────────────────────────────────────
export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  accent: string;
  wallpaper: string;
  fontSize?: 'small' | 'medium' | 'large';
  animations?: boolean;
  dockPosition?: 'bottom' | 'left';
  transparency?: number;
}

// ── Notifications ────────────────────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface OSNotification {
  id: string;
  appId: string;
  appName: string;
  appIcon: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  type?: NotificationType;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
}

// ── Dock ─────────────────────────────────────────────────────
export interface DockItem {
  appId: string;
  isPinned: boolean;
  isOpen: boolean;
  isFocused: boolean;
  bounce: boolean;
}

// ── Context Menu ─────────────────────────────────────────────
export type ContextMenuType = 'desktop' | 'file' | 'dockIcon' | 'windowTitle' | 'text';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: string;
  disabled?: boolean;
  divider?: boolean;
  toggle?: boolean;
  toggled?: boolean;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: ContextMenuType;
  items: ContextMenuItem[];
  contextData?: Record<string, unknown>;
}

// ── Boot / Auth ──────────────────────────────────────────────
export type BootPhase = 'off' | 'booting' | 'login' | 'desktop';

export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  userImage: string | null;
}

// ── OS Store State ───────────────────────────────────────────
export interface OSState {
  bootPhase: BootPhase;
  auth: AuthState;
  windows: OSWindow[];
  desktopIcons: DesktopIcon[];
  theme: Theme;
  notifications: OSNotification[];
  dockItems: DockItem[];
  contextMenu: ContextMenuState;
  appLauncherOpen: boolean;
  notificationCenterOpen: boolean;
  activeWindowId: string | null;
  nextZIndex: number;
  isAltTabbing: boolean;
  altTabIndex: number;
  isSyncing: boolean;
  doNotDisturb: boolean;
  notificationsEnabled: boolean;
}

// ── Notes ────────────────────────────────────────────────────
export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  folderId?: string;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

// ── Tasks ────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  listId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ── Contacts ─────────────────────────────────────────────────
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  website?: string;
  avatar?: string;
  notes?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ── Calendar ─────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
  location?: string;
  recurring?: string;
  createdAt: number;
  updatedAt: number;
}

// ── Reminder ─────────────────────────────────────────────────
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  remindAt: string;
  isComplete: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
}

// ── Password Entry ───────────────────────────────────────────
export interface PasswordEntry {
  id: string;
  siteName: string;
  siteUrl?: string;
  username: string;
  password: string;
  notes?: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

// ── User Settings ────────────────────────────────────────────
export interface UserPreferences {
  themeMode: ThemeMode;
  accentColor: string;
  wallpaper: string;
  dockPinned: string[];
  desktopIcons: Record<string, { x: number; y: number }>;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  notifications: boolean;
  doNotDisturb: boolean;
}
