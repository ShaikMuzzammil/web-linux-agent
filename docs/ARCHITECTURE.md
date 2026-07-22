# WebLinuxOS — Architecture Guide v4.0

> Deep-dive into how WebLinuxOS is structured, why certain decisions were made, and how to extend it.

---

## 1. High-Level Overview

```
Browser
  └─ Next.js App Router (React)
       ├─ OS Shell  (TopPanel, Dock, Taskbar, Desktop, WindowManager)
       ├─ 54 Apps   (lazy-loaded React components)
       ├─ State     (Zustand — single store, subscribeWithSelector)
       ├─ Auth      (NextAuth v4)
       ├─ DB        (Neon PostgreSQL via Prisma, API routes)
       └─ AI        (Google Gemini 2.0 Flash via API route)
```

---

## 2. Directory Layout

```
weblinuxos/
├── app/
│   ├── layout.tsx               Root layout — mounts SessionProvider
│   ├── page.tsx                 OS entry — boot → login → desktop
│   └── api/
│       ├── auth/[...nextauth]/  NextAuth handler (credentials + Google)
│       ├── chat/                POST → Gemini 2.0 Flash streaming
│       ├── sync/
│       │   ├── settings/        GET/PATCH user preferences
│       │   ├── files/           GET/POST/DELETE virtual files
│       │   ├── notes/           CRUD notes
│       │   ├── tasks/           CRUD tasks
│       │   ├── contacts/        CRUD contacts
│       │   ├── events/          CRUD calendar events
│       │   └── reminders/       CRUD reminders
│       └── proxy/               Proxy iframe requests for Browser app
│
├── components/
│   ├── os/                      Shell — non-app OS UI
│   │   ├── BootSequence.tsx     Animated icon-step boot loader
│   │   ├── LoginScreen.tsx      Auth form (email/pass + Google + guest)
│   │   ├── TopPanel.tsx         System bar: clock, tray, popups
│   │   ├── Dock.tsx             Floating dock with magnification
│   │   ├── Taskbar.tsx          ★ NEW Bottom taskbar (open windows)
│   │   ├── Desktop.tsx          Draggable desktop icons
│   │   ├── WindowFrame.tsx      Window chrome: resize, move, traffic lights
│   │   ├── WindowManager.tsx    Lazy-renders all open windows
│   │   ├── NotificationCenter.tsx  Side panel notification list
│   │   ├── AppLauncher.tsx      Spotlight-style app search
│   │   ├── ContextMenu.tsx      Right-click menus
│   │   └── NotificationTrigger.tsx  Boot-time demo notifications
│   │
│   └── apps/                    54 applications (lazy-loaded)
│       ├── registry.ts          App manifest array
│       ├── Settings.tsx         Full settings UI
│       ├── Terminal.tsx
│       ├── Chat.tsx             NEXUS AI (Gemini)
│       └── … (51 more)
│
├── hooks/
│   └── useOSStore.ts            Zustand store — THE single source of truth
│
├── types/
│   └── index.ts                 All TypeScript interfaces
│
├── lib/
│   ├── auth.ts                  NextAuth config
│   ├── prisma.ts                Prisma singleton
│   └── utils.ts                 generateId, cn, …
│
├── prisma/
│   └── schema.prisma            DB schema
│
├── public/
│   └── wallpapers/              SVG wallpaper files
│
└── styles/
    └── globals.css              Tailwind + custom keyframes + CSS vars
```

---

## 3. State Management (Zustand)

### Store Shape

```typescript
interface OSStore extends OSState {
  // Auth
  login(), logout(), setBootPhase()

  // Windows
  openWindow(), closeWindow(), minimizeWindow()
  maximizeWindow(), restoreWindow(), focusWindow()
  moveWindow(), resizeWindow()
  cascadeWindows(), minimizeAll()

  // Desktop
  updateDesktopIconPos(), selectDesktopIcon()

  // Notifications
  addNotification(), removeNotification()
  markNotificationRead(), markAllNotificationsRead()
  clearNotifications()

  // Theme
  setTheme(), toggleTheme()

  // Dock
  pinDockItem(), unpinDockItem()

  // System
  setDoNotDisturb(), setNotificationsEnabled()
}
```

### Why Zustand?

- **Zero boilerplate** compared to Redux
- `subscribeWithSelector` lets each component select only the slice it needs → minimal re-renders
- Works perfectly with `localStorage` for instant persistence

### Window State Machine

```
         openWindow()
              │
              ▼
          [ normal ] ──── minimizeWindow() ──▶ [ minimized ]
              │                                      │
         maximizeWindow()                    focusWindow()
              │                                      │
              ▼                                      │
          [ maximized ]                             ▼
              │                               [ normal ]
         restoreWindow()
              │
              ▼
          [ normal ]
```

`focusWindow()` also restores minimized windows (state: minimized → normal).

---

## 4. Window System

### Z-Index Strategy

```
z-index range    Component
─────────────   ──────────────────────────────
100–899          Windows (nextZIndex counter)
800              Dock
850              Taskbar (always above windows)
900              TopPanel
1050             NotificationCenter
1100             Popup menus (in TopPanel)
1200             Notification toasts
```

### Resize Implementation

`WindowFrame.tsx` tracks a `resize.current` ref:
```typescript
{ sx, sy,          // start mouse position
  ow, oh,          // original size
  ox, oy,          // original position
  edge }           // 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
```

On `mousemove`, the frame computes the delta and updates both `size` and `position` simultaneously (for north/west edges, moving the origin while resizing).

### Taskbar (New in v4)

The Taskbar at `z-index: 850, bottom: 0, height: 40px` shows all `windows[]` from the store as clickable chips:

- **Normal/focused** → highlighted chip with accent border
- **Minimized** → dimmed chip with ▼ indicator
- **Click** → calls `focusWindow(id)` which also restores minimized windows
- **X button** (on hover) → calls `closeWindow(id)`
- **Show Desktop** → calls `minimizeAll()`

The Dock position was moved from `bottom-3` to `bottom-12` to sit above the 40px Taskbar.

---

## 5. Notification Pipeline

```
Event trigger                 addNotification() / openWindow()
      │
      ▼
useOSStore.notifications[]
      │
      ├─ doNotDisturb === true → blocked here, never added
      │
      ├─ NotificationToasts (top-right, auto-dismiss after 5s)
      │    Shows only notifications with isRead=false && age < 5s
      │
      └─ NotificationCenter (side panel, bell icon)
           Groups by date, shows all, read/dismiss controls
```

### Fixed bugs (v3 → v4)
- `dismissNotification` → `removeNotification` (method name mismatch in store)
- `clearAllNotifications` → `clearNotifications` (method name mismatch)
- Notification panel background now respects `theme.mode` (light mode was invisible)
- TopPanel popups now use theme-aware `popupBg` / `popupTxt` instead of hardcoded dark values

---

## 6. Settings System

### Sections

| Section | Key Features |
|---------|-------------|
| Appearance | Theme mode toggle, accent color picker (8 presets + custom hex), font size (applies CSS var) |
| Wallpaper | 7 SVG presets, custom URL input with **working Set button** |
| Dock & Apps | Searchable app list, pin/unpin per app |
| Notifications | Master toggle, DND toggle (writes to store), sound/badge/preview prefs, recent list |
| Account | User info, cloud sync status, sign out |
| About | System info, storage bar, update button |
| Pioneered By | Animated name reveal, avatar, 2 links only (Portfolio + Linktree) |

### Font size

```typescript
// Settings.tsx
const applyFontSize = (size: 'small'|'medium'|'large') => {
  const map = { small: '12px', medium: '13px', large: '15px' };
  document.documentElement.style.setProperty('--wlos-font-size', map[size]);
  setFontSize(size);
};
```

### Wallpaper custom URL (fixed in v4)

```tsx
<input value={customUrl} onChange={e => setCustomUrl(e.target.value)} />
<button onClick={() => { if (customUrl) saveWallpaper(customUrl); }}>Set</button>
```

Previously the Set button had no `onClick` — now fixed.

---

## 7. Theme System

The `Theme` interface:

```typescript
interface Theme {
  mode:     'dark' | 'light';
  accent:   string;    // hex color
  wallpaper: string;   // path or URL
  fontSize?: 'small' | 'medium' | 'large';
  animations?: boolean;
}
```

The theme is:
1. Stored in `useOSStore` (in-memory)
2. Persisted to `localStorage` (`wlos_theme`) on every `setTheme()` call
3. Synced to Neon on `PATCH /api/sync/settings` (cloud)
4. Applied to `<html>` via `className` (dark/light for Tailwind) and CSS variables (`--accent`, `--wallpaper`)

All shell components derive colors from `theme.mode` at render time — no hardcoded dark values.

---

## 8. Authentication Flow

```
User visits / → BootSequence → LoginScreen
      │
      ├─ Guest mode      → login({ isGuest: true }) → desktop (localStorage only)
      ├─ Email/Password  → NextAuth credentials provider → DB lookup → login()
      └─ Google OAuth    → NextAuth Google provider → login()

On page load:
  useSession() (NextAuth)
      ├─ authenticated → login() + loadSettings() from API
      └─ unauthenticated → setBootPhase('login')
```

---

## 9. AI (NEXUS Intelligence System)

```
Chat app → POST /api/chat
             { messages: [{role, content}], systemPrompt }
                   │
                   ▼
         Google Gemini 2.0 Flash API
                   │
             streaming response
                   │
                   ▼
         Chat app renders markdown
```

Branding: The app is called "NEXUS Intelligence System" (backed by Gemini).  
API key: `GEMINI_API_KEY` env var on Vercel.

---

## 10. Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| **Lazy loading** | Every app is `lazy(() => import(...))` in WindowManager — initial bundle is tiny |
| **Selective subscriptions** | `useOSStore(s => s.windows)` — component only re-renders on its slice |
| **CSS animations** | Boot, window open, popup, toast — all pure CSS keyframes (no JS) |
| **localStorage cache** | Theme + desktop icons persist in localStorage for instant restore |
| **Memoized components** | `memo()` on TopPanel, Dock, Taskbar, NotificationCenter, WindowFrame |

---

## 11. Adding a New API Route

```typescript
// app/api/myroute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await prisma.myModel.findMany({ where: { userId: session.user.id } });
  return NextResponse.json({ data });
}
```

---

## 12. Prisma Schema Summary

```prisma
model User {
  id            String     @id @default(cuid())
  name          String?
  email         String?    @unique
  image         String?
  password      String?
  settings      Settings?
  files         File[]
  notes         Note[]
  tasks         Task[]
  contacts      Contact[]
  events        Event[]
  reminders     Reminder[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime   @default(now())
}

model Settings {
  id            String   @id @default(cuid())
  userId        String   @unique
  themeMode     String   @default("dark")
  accentColor   String   @default("#E95420")
  wallpaper     String   @default("/wallpapers/default.svg")
  dockPinned    String[] @default([])
  user          User     @relation(fields: [userId], references: [id])
}
```

---

## 13. Deployment Checklist

- [ ] `DATABASE_URL` set in Vercel env
- [ ] `NEXTAUTH_SECRET` set (random 32-char string)
- [ ] `NEXTAUTH_URL` = `https://your-app.vercel.app`
- [ ] `GEMINI_API_KEY` set
- [ ] `npx prisma db push` run against production DB
- [ ] (Optional) `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for OAuth
- [ ] (Optional) `RESEND_API_KEY` for email features

---

## 14. v3 → v4 Changelog

| Area | Change |
|------|--------|
| **Taskbar** | New bottom taskbar showing all open windows; click to focus/restore |
| **Dock** | Moved from `bottom-3` to `bottom-12` to sit above Taskbar |
| **NotificationCenter** | Fixed `dismissNotification` → `removeNotification`; fixed `clearAllNotifications` → `clearNotifications`; full light-mode support |
| **TopPanel** | All popups (volume, wifi, battery, bluetooth, user, clock) now use theme-aware colors — fixed invisible light-mode menus |
| **Settings** | Added missing Notifications section; fixed wallpaper Set button; made font-size functional; complete Pioneer redesign |
| **Pioneer** | Removed education/skills/projects/certs; animated name reveal; only Portfolio + Linktree links; stats row; animated avatar |
| **WindowFrame** | Added SE/SW resize corner visual indicators; improved keyboard cursor on resize edges; respects bottom Taskbar height |
| **Types** | Added `type?: NotificationType` to `OSNotification`; added `doNotDisturb`, `notificationsEnabled` to store state |
| **Store** | Added `setDoNotDisturb()`, `setNotificationsEnabled()`, `markAllNotificationsRead()`, `minimizeAll()`; `addNotification` now respects DND mode |
| **README** | Complete rewrite — badges, app table, architecture diagram, deployment guide |
| **This doc** | New `docs/ARCHITECTURE.md` |

---

*Built by [Shaik Muzzammil](https://shaik-muzzammil-portfolio.vercel.app/) · WebLinuxOS v4.0*
