<div align="center">

<img src="public/icon.png" alt="WebLinuxOS" width="80" height="80" style="border-radius:20px"/>

# 🖥️ WebLinuxOS

### A fully-featured, browser-based Ubuntu-style desktop OS

[![Live Demo](https://img.shields.io/badge/Live%20Demo-web--linux--agent.vercel.app-E95420?style=for-the-badge&logo=vercel&logoColor=white)](https://web-linux-agent.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)

> *Run a complete operating system experience — entirely in your browser.  
> 54+ apps, multi-window management, cloud sync, AI chat, and more.*

</div>

---

## ✨ What Is WebLinuxOS?

WebLinuxOS is a **production-grade, browser-based operating system simulation** that delivers a full Ubuntu-inspired desktop experience without installing a single native app. Built with modern web technologies, it features real multi-window management, a virtual file system, cloud-sync, AI-powered chat (NEXUS), and 54+ built-in applications.

> Pioneered by [Shaik Muzzammil](https://shaik-muzzammil-portfolio.vercel.app/) · [Connect on Linktree](https://linktr.ee/Shaik_Muzzammil)

---

## 🚀 Core Features

| Feature | Details |
|---------|---------|
| **Multi-window management** | macOS-style traffic lights, 8-direction resize, snap zones, cascade |
| **Taskbar** | Active + minimized window buttons at bottom — click to restore |
| **Dock** | Magnification effects, pinned apps, right-click context menus |
| **Notification system** | Live toasts, Notification Center, Do Not Disturb mode |
| **Theme engine** | Dark/Light mode, 8 accent colors + custom hex, 7 wallpapers |
| **Cloud sync** | Settings, files, notes, tasks sync via Neon PostgreSQL |
| **NEXUS AI chat** | Google Gemini 2.0 Flash integration |
| **Virtual filesystem** | Create, rename, move, delete files and folders |
| **Boot animation** | Ubuntu-style animated boot sequence |
| **Auth** | NextAuth v4 — Email/Password + Google OAuth + Guest mode |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 App Router |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS + CSS custom properties |
| **State** | Zustand with `subscribeWithSelector` |
| **Database** | Neon PostgreSQL (serverless) |
| **ORM** | Prisma ORM |
| **Auth** | NextAuth v4 |
| **AI** | Google Gemini 2.0 Flash (NEXUS Intelligence System) |
| **Email** | Resend API |
| **Deployment** | Vercel Edge Network |
| **Icons** | Lucide React |
| **Animation** | CSS Keyframes + Framer Motion (selected apps) |

---

## 📱 54 Built-In Applications

### 🖥️ System
| App | Description |
|-----|-------------|
| Terminal | Full bash-like terminal emulator |
| File Manager | Virtual filesystem browser with drag & drop |
| System Monitor | Real-time CPU/memory/process visualization |
| Settings | Full system configuration (appearance, wallpaper, dock, notifications) |
| Browser | Tabbed web browser with proxy |
| Archive Manager | Zip/extract files |
| Screen Recorder | In-browser recording |

### 📋 Productivity
| App | Description |
|-----|-------------|
| Text Editor | Markdown-enabled rich editor |
| Code Editor | Monaco Editor with syntax highlighting |
| Notes | Pinnable notes with folders and color tags |
| Todo | Task lists with priorities and due dates |
| Calendar | Month / Week / Agenda views + CRUD events |
| Spreadsheet | Excel-like with formula support |
| Contacts | Full contact book with search |
| Email | SMTP email client |
| Reminders | Alerts with priority |
| Password Manager | AES-encrypted credential store |
| Document Viewer | PDF & document preview |
| Markdown Preview | Live markdown renderer |
| RSS Reader | Feed aggregator |
| Whiteboard | Infinite canvas |

### 🌐 Internet
| App | Description |
|-----|-------------|
| Browser | Proxy-based tabbed browser |
| NEXUS Chat | AI conversation (Gemini) |
| Weather | Live weather for any city |
| FTP Client | File transfer client |
| API Tester | HTTP request builder (like Postman) |
| Git Client | Repository manager |

### 🛠️ Developer Tools
| App | Description |
|-----|-------------|
| JSON Formatter | Pretty-print & validate JSON |
| Regex Tester | Pattern testing with live matches |
| Base64 Tool | Encode / decode |
| Color Picker | Eyedropper + HEX/RGB/HSL |
| Color Palette | Generate and export palettes |
| Network Tools | Ping, traceroute, DNS lookup |
| Media Converter | Format converter |

### 🎮 Games
| App | Description |
|-----|-------------|
| Snake | Classic arcade snake |
| Tetris | Full Tetris with levels |
| Minesweeper | Classic grid minesweeper |
| Chess | Two-player chess board |
| 2048 | Tile-merging puzzle |
| TicTacToe | Classic 3×3 game |
| Sudoku | 9×9 number puzzle |
| Pong | Classic bouncing ball |
| Memory Game | Card-matching game |
| Solitaire | Classic Klondike |
| Flappy Bird | Tap-to-fly obstacle game |

### 🎨 Creative & Media
| App | Description |
|-----|-------------|
| Drawing | Canvas drawing with tools |
| Photo Editor | Filters and adjustments |
| Music Player | Audio player with playlists |
| Video Player | HTML5 video with controls |
| Image Viewer | Zoom, rotate, lightbox |
| Image Gallery | Grid gallery viewer |
| ASCII Art | Text-to-ASCII converter |
| Voice Recorder | In-browser audio recording |
| Clock | World clock, timer, stopwatch |

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **PostgreSQL** (we recommend [Neon](https://neon.tech) — free tier available)
- **Google Gemini API key** — [Get one free](https://aistudio.google.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ShaikMuzzammil/weblinuxos
cd weblinuxos

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# → Edit .env.local with your values (see below)

# 4. Push Prisma schema to your database
npx prisma db push

# 5. Start the development server
npm run dev
# → Open http://localhost:3000
```

### Environment Variables

Create `.env.local`:

```env
# ── Database ────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# ── NextAuth ─────────────────────────────────────────────
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=http://localhost:3000

# ── AI (Required for NEXUS chat) ────────────────────────
GEMINI_API_KEY=your-gemini-api-key

# ── Optional — Google OAuth ──────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ── Optional — Email (Resend) ────────────────────────────
RESEND_API_KEY=
```

---

## 🌐 Deploy to Vercel

```bash
# Push to GitHub, then:
# 1. Import repo at vercel.com/new
# 2. Add all environment variables in the Vercel dashboard
# 3. Deploy — Vercel will auto-detect Next.js
```

| Variable | Required | Note |
|----------|:--------:|------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Your `https://your-app.vercel.app` URL |
| `GEMINI_API_KEY` | ✅ | Google Gemini 2.0 Flash |
| `GOOGLE_CLIENT_ID` | ⬜ | For Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | ⬜ | For Google OAuth login |
| `RESEND_API_KEY` | ⬜ | For email features |

---

## 🏗️ Project Structure

```
weblinuxos/
├── app/
│   ├── page.tsx              ← Main OS shell entry point
│   ├── layout.tsx            ← Root layout + SessionProvider
│   └── api/
│       ├── auth/[...nextauth]/   ← NextAuth endpoints
│       ├── chat/             ← Gemini AI proxy
│       ├── sync/             ← Cloud sync (settings, files, notes…)
│       └── proxy/            ← Browser proxy for iframe loading
│
├── components/
│   ├── os/                   ← OS shell components
│   │   ├── TopPanel.tsx      ← System menu bar (clock, tray, popups)
│   │   ├── Dock.tsx          ← App dock with magnification
│   │   ├── Taskbar.tsx       ← Active/minimized window bar (bottom)
│   │   ├── Desktop.tsx       ← Desktop icons + right-click menu
│   │   ├── WindowFrame.tsx   ← Window chrome (traffic lights, resize)
│   │   ├── WindowManager.tsx ← Renders all open windows lazily
│   │   ├── NotificationCenter.tsx
│   │   ├── AppLauncher.tsx
│   │   └── BootSequence.tsx
│   │
│   └── apps/                 ← 54 built-in apps
│       ├── registry.ts       ← App manifest (id, name, icon, size…)
│       ├── Settings.tsx      ← System Settings
│       ├── Terminal.tsx
│       ├── Chat.tsx          ← NEXUS AI (Gemini)
│       └── …
│
├── hooks/
│   └── useOSStore.ts         ← Zustand store (single source of truth)
│
├── types/
│   └── index.ts              ← All TypeScript interfaces
│
├── lib/
│   ├── auth.ts               ← NextAuth configuration
│   └── prisma.ts             ← Database client singleton
│
├── prisma/
│   └── schema.prisma         ← Database schema
│
└── public/
    ├── wallpapers/           ← SVG wallpapers
    └── icon.png
```

---

## 🎨 Customization

### Adding a New App

**Step 1** — Register it in `components/apps/registry.ts`:

```typescript
{
  id: 'myapp',
  name: 'My App',
  icon: 'Star',            // Lucide icon name
  category: 'Productivity',
  description: 'My custom application',
  defaultSize: { width: 700, height: 500 },
  minSize:     { width: 400, height: 300 },
}
```

**Step 2** — Create `components/apps/MyApp.tsx`:

```typescript
export default function MyApp({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  return (
    <div className="w-full h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb' }}>
      <p>Hello from My App!</p>
    </div>
  );
}
```

**Step 3** — Lazy-import in `components/os/WindowManager.tsx`:

```typescript
myapp: lazy(() => import('@/components/apps/MyApp')),
```

### Custom Accent Color

Users can pick any hex color in **Settings → Appearance → Accent Color → Custom**.

### Custom Wallpaper

Paste any image URL in **Settings → Wallpaper → Custom URL** and click **Set**.

---

## 🔑 Key Architecture Decisions

### State Management
- **Single Zustand store** (`useOSStore`) manages the entire OS state: windows, theme, notifications, dock, auth
- `subscribeWithSelector` allows granular subscriptions — components only re-render when their slice changes
- localStorage provides instant theme/layout persistence across refreshes

### Window System
- Each window is a `fixed` positioned `div` with an explicit `zIndex`
- `focusWindow()` increments a global `nextZIndex` counter so the last-clicked window is always on top
- Minimized windows are hidden via `display: none` (state === 'minimized') — not removed from DOM
- The new **Taskbar** shows all windows (normal + minimized) as clickable chips; clicking a minimized window calls `focusWindow()` which auto-restores it

### Notification Pipeline
```
openWindow() / addNotification()
    ↓
useOSStore.notifications[]
    ↓
NotificationToasts (auto-dismiss toast, top-right)
    ↓
NotificationCenter (panel, opens from bell icon)
```
Do Not Disturb mode gates both toasts and notification creation.

### Cloud Sync
- `/api/sync/settings` — GET/PATCH user preferences
- All data stored in Neon PostgreSQL via Prisma
- `localStorage` is the fallback when offline or unauthenticated

---

## 🤝 Contributing

Issues and PRs are welcome! Built and maintained by one developer.

```bash
npm run dev    # Start development server
npm run build  # Production build
npm run lint   # ESLint check
```

---

## 👤 About the Developer

<div align="center">

**Shaik Muzzammil** — Full-Stack Engineer from Chennai, India  
CSE Student at Amrita Vishwa Vidyapeetham

[![Portfolio](https://img.shields.io/badge/Portfolio-shaik--muzzammil-E95420?style=flat-square&logo=vercel)](https://shaik-muzzammil-portfolio.vercel.app/)
[![Linktree](https://img.shields.io/badge/Linktree-@Shaik__Muzzammil-39d353?style=flat-square&logo=linktree&logoColor=white)](https://linktr.ee/Shaik_Muzzammil)
[![GitHub](https://img.shields.io/badge/GitHub-ShaikMuzzammil-181717?style=flat-square&logo=github)](https://github.com/ShaikMuzzammil)

</div>

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**WebLinuxOS** — *The browser is the operating system.*

Built with ❤️ by [Shaik Muzzammil](https://shaik-muzzammil-portfolio.vercel.app/)

[Live Demo](https://web-linux-agent.vercel.app) · [Portfolio](https://shaik-muzzammil-portfolio.vercel.app/) · [Linktree](https://linktr.ee/Shaik_Muzzammil)

</div>
