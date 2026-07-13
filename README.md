# 🐧 WebLinuxOS v2.0

> **A production-grade, cloud-synced Linux desktop environment running entirely in the browser.**  
> Built with Next.js 14, NextAuth, Neon PostgreSQL, Prisma, and Zustand.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShaikMuzzammil/web-linux-agent-v2)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Neon](https://img.shields.io/badge/Database-Neon_PostgreSQL-00e699?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🖥️ OS Shell
| Feature | Description |
|---|---|
| **Boot Sequence** | Animated kernel log boot with progress bar |
| **Login Screen** | Email/Password · GitHub OAuth · Google OAuth · Guest mode |
| **Desktop** | Draggable icons, wallpaper, rubber-band selection |
| **Window Manager** | Drag · Resize · Maximize · Minimize · Double-click title to maximize |
| **Top Panel** | Clock, notifications bell, wifi, battery, theme toggle, user menu |
| **Dock** | Pinnable apps, bounce animations, running indicators, tooltips |
| **App Launcher** | Grid + search + category filter for all 54 apps |
| **Context Menus** | Right-click desktop, icons, dock — full action menus |
| **Notifications** | Corner toast pop-ups + slide-out notification center with history |
| **Alt+Tab** | Window cycling (keyboard) |
| **Theme System** | Dark/light mode + 8 accent colors + custom hex + custom wallpaper |
| **Cloud Sync** | All user data synced to Neon DB on every change |

### 📦 54 Built-in Apps

#### 🔧 System (7)
- **File Manager** — Grid/list view, breadcrumbs, drag icons, rename, quick access sidebar, trash
- **Terminal** — 35+ real commands (ls, cd, cat, grep, mkdir, rm, mv, find, ping, neofetch…)
- **Text Editor** — Tabs, line numbers, word wrap, find/replace, FS integration, auto-save
- **Calculator** — Basic + Scientific, history panel, keyboard input
- **System Settings** — Theme, wallpaper, dock pins, account, about
- **System Monitor** — Live CPU/RAM/Disk/Net charts (Recharts), process table
- **Archive Manager** — ZIP archive viewer

#### 📅 Productivity (10)
- **Notes** — Rich editing, pin, color tags, folders — **cloud synced**
- **Todo List** — Priority, due dates, filter, progress bar — **cloud synced**
- **Calendar** — Month/week view with events — **cloud synced**
- **Contacts** — Full contact management — **cloud synced**
- **Reminders** — Time-based with notifications — **cloud synced**
- **Password Manager** — Encrypted vault — **cloud synced**
- **Clock** — World clock, alarm, timer, stopwatch
- **Spreadsheet** — Formula-capable grid
- **Document Viewer** — PDF reader
- **Whiteboard** — Infinite canvas

#### 🌐 Internet (7)
- **Web Browser** — Tabs, bookmarks, address bar, new-tab page
- **Email** — Inbox UI with compose
- **Chat** — Claude AI assistant (Haiku-powered)
- **Weather** — Location-based forecast
- **RSS Reader** — Subscribe and read feeds
- **FTP Client** — File transfer UI
- **Network Tools** — Ping, traceroute, port scanner

#### 🎵 Media (7)
- Music Player, Video Player, Image Viewer, Photo Editor, Voice Recorder, Screen Recorder, Media Converter

#### 🎮 Games (11)
- **Minesweeper** — 3 difficulties, first-click safe, timer
- **Snake** — Speed levels, persistent high score
- **Tetris** — Full piece rotation and line clearing
- **Tic-Tac-Toe** — AI (minimax) + 2-player
- **2048** — Swipe/keyboard, persistent best score
- **Sudoku, Chess, Memory, Pong, Solitaire, Flappy Bird**

#### 🛠️ Dev Tools (8)
- JSON Formatter, Regex Tester, Markdown Preview, Git Client, API Tester, Base64 Tool, Color Palette, Code Editor

#### 🎨 Creative (4)
- Drawing, Color Picker, Image Gallery, ASCII Art

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 + CSS Variables |
| **State** | Zustand 4.5 (OS store) + React hooks (per-app) |
| **Auth** | NextAuth v4 — Credentials + GitHub + Google OAuth |
| **Database** | Neon PostgreSQL (serverless) |
| **ORM** | Prisma 5.22 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Animation** | Framer Motion + CSS keyframes |
| **Deployment** | Vercel (zero-config) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier)
- A [Vercel](https://vercel.com) account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/ShaikMuzzammil/web-linux-agent-v2.git
cd web-linux-agent-v2
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Optional OAuth
GITHUB_CLIENT_ID="your-github-app-client-id"
GITHUB_CLIENT_SECRET="your-github-app-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"

# Optional: Claude AI for Chat app
ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Database Setup

```bash
# Push schema to Neon
npm run db:push

# Or run migrations
npx prisma migrate deploy
```

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## ☁️ Deploy to Vercel

### Method A — One-Click
Click the **Deploy with Vercel** button at the top, then add your environment variables in the Vercel dashboard.

### Method B — CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Re-deploy
vercel --prod
```

### Method C — GitHub Integration
1. Push to GitHub: `git push origin main`
2. Connect repo in [vercel.com/new](https://vercel.com/new)
3. Add env vars in Project Settings → Environment Variables
4. Auto-deploys on every push ✅

---

## 🗄️ Database Schema

```
User ──┬── accounts (OAuth)
       ├── sessions
       ├── files (virtual FS)
       ├── notes
       ├── tasks
       ├── contacts
       ├── calendarEvents
       ├── reminders
       ├── passwords (encrypted)
       ├── notifications
       └── settings (1:1)
```

All data is **per-user**, scoped by `userId`, with cascading deletes.

---

## 🔧 GitHub Setup

```bash
# Initialize git
git init
git add .
git commit -m "feat: WebLinuxOS v2.0 — full cloud-synced Linux desktop"

# Create repo on GitHub, then:
git remote add origin https://github.com/ShaikMuzzammil/web-linux-agent-v2.git
git branch -M main
git push -u origin main
```

---

## 📁 Project Structure

```
web-linux-agent-v2/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── chat/                  # Claude AI proxy
│   │   └── sync/                  # Per-feature sync endpoints
│   │       ├── notes/
│   │       ├── tasks/
│   │       ├── settings/
│   │       └── ...
│   ├── layout.tsx                 # Root layout with SessionProvider
│   ├── page.tsx                   # OS entry point (boot→login→desktop)
│   ├── providers.tsx              # Client-side providers
│   └── globals.css
├── components/
│   ├── os/                        # OS shell components
│   │   ├── BootSequence.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── Desktop.tsx
│   │   ├── TopPanel.tsx
│   │   ├── Dock.tsx
│   │   ├── WindowFrame.tsx
│   │   ├── WindowManager.tsx
│   │   ├── AppLauncher.tsx
│   │   ├── ContextMenu.tsx
│   │   └── NotificationCenter.tsx
│   └── apps/                      # 54 app components
│       ├── Terminal.tsx
│       ├── FileManager.tsx
│       ├── Notes.tsx
│       ├── Todo.tsx
│       ├── Chat.tsx
│       └── ... (54 total)
├── hooks/
│   ├── useOSStore.ts              # Zustand OS state
│   └── useFileSystem.ts           # Virtual FS store
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── prisma.ts                  # Prisma singleton
│   └── utils.ts                   # Helpers
├── prisma/
│   └── schema.prisma              # DB schema
├── styles/
│   └── globals.css                # Design system
├── types/
│   ├── index.ts                   # All TypeScript types
│   └── next-auth.d.ts             # Session type augmentation
├── public/
│   └── wallpapers/                # Wallpaper images
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Customization

### Add a new app
1. Create `components/apps/MyApp.tsx`
2. Add to `APP_REGISTRY` in `components/apps/registry.ts`
3. Add lazy import to `WindowManager.tsx`

### Change accent color
In Settings → Appearance → Accent Color, or programmatically:
```ts
useOSStore.getState().setTheme({ accent: '#FF6D00' });
```

### Add wallpaper
Drop an image in `public/wallpapers/` and it appears in Settings → Wallpaper.

---

## 🔐 Authentication

| Method | Setup Required |
|---|---|
| Email/Password | Works out of the box (bcrypt hashed) |
| GitHub OAuth | Create app at github.com/settings/developers |
| Google OAuth | Create project at console.cloud.google.com |
| Guest mode | No setup — local storage only, no sync |

**OAuth callback URLs:**
- GitHub: `https://your-domain.vercel.app/api/auth/callback/github`
- Google: `https://your-domain.vercel.app/api/auth/callback/google`

---

## 📊 Cloud Sync Architecture

```
User action → App Component
                  │
                  ▼
           localStorage (immediate)
                  │
          [1500ms debounce]
                  │
                  ▼
          POST /api/sync/{feature}
                  │
                  ▼
          Neon PostgreSQL
```

On login, data is fetched from Neon and merged with localStorage, so the app works offline and syncs when online.

---

## 🧑‍💻 Developer Notes

### Key patterns
- `'use client'` on all interactive components (entire OS is client-side)
- `export const dynamic = 'force-dynamic'` on all DB-touching API routes
- Prisma client is a singleton to avoid connection exhaustion on Vercel
- Zustand store uses `subscribeWithSelector` middleware for efficient updates
- All apps are lazy-loaded via `React.lazy()` for fast initial bundle

### Environment matrix
| Variable | Dev | Production |
|---|---|---|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |
| `DATABASE_URL` | Neon connection string | Same |
| `NEXTAUTH_SECRET` | Any 32-char string | `openssl rand -base64 32` |

---

## 🤝 Contributing

```bash
# Fork & clone
git checkout -b feature/my-feature
# Make changes
git commit -m "feat: add my feature"
git push origin feature/my-feature
# Open a Pull Request
```

---

## 📄 License

MIT © 2025 [Shaik Muzzammil](https://github.com/ShaikMuzzammil)

---

<div align="center">
  <strong>Built with ❤️ using Next.js, Neon, and the web platform</strong><br/>
  <a href="https://github.com/ShaikMuzzammil">GitHub</a> · 
  <a href="https://linkedin.com/in/shaik-muzzammil">LinkedIn</a>
</div>
