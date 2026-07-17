<div align="center">
  <img src="public/wallpapers/ubuntu-dark.svg" alt="WebLinuxOS" width="80" height="80" style="border-radius:20px"/>

  # WebLinuxOS v2.0

  **A browser-based Ubuntu-style cloud desktop environment**

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
  ![Next.js](https://img.shields.io/badge/Next.js-15-black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
  ![Prisma](https://img.shields.io/badge/Prisma-ORM-green)
</div>

---

## ✨ Features

- 🖥️ **Full Desktop Shell** — TopPanel, Dock with magnification, Window Manager, App Launcher, Context Menus
- 🌐 **54 Working Apps** — Browser with proxy, Calendar (Month/Week/Agenda), Clock (World/Alarm/Stopwatch/Timer), real Weather, Terminal (35+ commands), and more
- 🎨 **7 SVG Wallpapers** — Aurora, Nebula, Cyberpunk, Mountain, Ocean, Ubuntu Dark, Default
- ☁️ **Cloud Sync** — Notes, Todos, Calendar, Contacts, Settings synced to Neon PostgreSQL
- 🔒 **Pure Auth** — Credentials only (email + password). No OAuth.
- 🌙 **Dark/Light Mode** — System-wide theme toggle

## 🚀 Quick Deploy

### 1. Clone & Push
```bash
git clone https://github.com/ShaikMuzzammil/web-linux-agent
cd web-linux-agent
# Extract zip files and overwrite
git add -A
git commit -m "v3 upgrade"
git push origin main
```

### 2. Set Vercel Environment Variables
```
DATABASE_URL      = <Neon pooled connection string>
DIRECT_URL        = <Neon direct connection string>
NEXTAUTH_SECRET   = <run: openssl rand -base64 32>
NEXTAUTH_URL      = https://your-app.vercel.app
```

### 3. Done!
Vercel auto-runs `prisma db push && prisma generate && next build`

---

## 🗂️ Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React, Tailwind CSS |
| State | Zustand |
| Database | Neon PostgreSQL + Prisma |
| Auth | NextAuth.js v5 |
| Weather API | Open-Meteo (free, no key) |
| Deploy | Vercel |

## 📁 Documentation
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Full code map
- [`docs/APPS.md`](docs/APPS.md) — All 54 apps described

---

*Built by [ShaikMuzzammil](https://github.com/ShaikMuzzammil)*
