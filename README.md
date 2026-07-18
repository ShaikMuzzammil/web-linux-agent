# WebLinuxOS v2.0 — Cloud Desktop

> A full browser-based Ubuntu-style cloud desktop built with Next.js 15, Neon PostgreSQL, NextAuth v5, Tailwind CSS, and Zustand.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🖥️ What Is This?

WebLinuxOS is a fully functional desktop operating system running entirely in the browser — no installs, no downloads. Everything syncs to the cloud via Neon PostgreSQL.

**54 built-in apps** across 7 categories: System, Productivity, Internet, Media, Games, DevTools, and Creative.

---

## ✨ Features

### OS Shell
- **Boot sequence** — animated 4-step loader (Kernel → Services → Desktop → Cloud sync)
- **Login screen** — email/password register + sign in, with guest mode
- **Top panel** — real-time clock, interactive volume/WiFi/battery popups, theme toggle, user menu
- **Dock** — macOS-style with magnification effect, hover tooltips, right-click menus
- **App launcher** — searchable grid with categories, recent apps, keyboard navigation (ESC/Enter)
- **Window manager** — drag, resize, minimize, maximize, multi-window, focus management
- **Context menus** — right-click on desktop and dock icons
- **Notifications** — toast system + notification center
- **7 wallpapers** — SVG-based: Aurora, Nebula, Cyberpunk, Mountain, Ocean, Ubuntu Dark, Default

### Cloud Sync (10 API routes)
- Files, Notes, Todo tasks, Contacts, Passwords, Reminders, Calendar events, Settings, Preferences, Auth

### Apps Highlights
| App | Feature |
|-----|---------|
| **Browser** | Proxy-based (strips X-Frame-Options), tabs, bookmarks sidebar, history, speed dial new tab |
| **Terminal** | 35+ real commands: ls, cd, mkdir, touch, cat, echo, curl, nano, ping, htop, git… |
| **Calendar** | Month / Week / Agenda views, CRUD events with color tags, location, time |
| **Weather** | Open-Meteo API (free/no key) — geocoding + 7-day forecast + hourly |
| **Chat** | Claude AI-powered |
| **Code Editor** | Syntax highlighting, multi-file tabs |
| **System Monitor** | Live CPU/memory/disk/network charts |
| **Games** | Chess (AI), Snake, Tetris, Minesweeper, Sudoku, 2048, Pong, Solitaire, Flappy Bird… |

---

## 🚀 Deploy to Vercel (5 minutes)

### 1. Environment Variables

In Vercel → Settings → Environment Variables, add:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

> **Get secrets:** Run `openssl rand -base64 32` for `NEXTAUTH_SECRET`

### 2. Database

Get a free Neon DB at [neon.tech](https://neon.tech):
- Copy **Connection string** → `DATABASE_URL` (pooled URL)
- Copy **Direct URL** → `DIRECT_URL`

### 3. Push to GitHub → Vercel auto-deploys

```bash
git add -A
git commit -m "feat: WebLinuxOS v2.0"
git push origin main
```

The build command runs automatically:
```
prisma generate && prisma db push --accept-data-loss && next build
```

This creates all DB tables on every deploy — no manual migration needed.

---

## 🛠️ Local Development

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env.local
# Fill in your DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL=http://localhost:3000

# 3. Push DB schema
npx prisma db push

# 4. Run
npm run dev
```

---

## 📁 Project Structure

```
/app
  /api
    /auth        — NextAuth credentials provider
    /proxy       — Browser proxy (strips X-Frame-Options)
    /sync        — 9 cloud sync endpoints (notes, todos, events…)
    /user        — User preferences
    /chat        — AI chat (Claude)
  /page.tsx      — Root: boot → login → desktop
/components
  /os            — OS shell (TopPanel, Dock, WindowFrame, AppLauncher…)
  /apps          — 54 apps
  /desktop       — Desktop + wallpaper
/hooks
  /useOSStore.ts — Zustand global state
/prisma
  /schema.prisma — DB schema
/public
  /wallpapers    — 7 SVG wallpapers
/styles
  /globals.css   — All animations & global styles
```

---

## 🔑 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Database | Neon PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 (credentials) |
| Icons | Lucide React |
| Date utils | date-fns |
| AI | Anthropic Claude |
| Hosting | Vercel |

---

## 📝 License

MIT — Build, fork, and ship freely.
