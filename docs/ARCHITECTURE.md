# WebLinuxOS v2.0 — Architecture Guide

## Overview
WebLinuxOS v2 is a full browser-based Ubuntu-style cloud desktop built with:
- **Frontend**: Next.js 15, Tailwind CSS, Zustand
- **Backend**: Next.js API routes, Prisma ORM, Neon PostgreSQL
- **Auth**: NextAuth.js v5 credentials-only (no OAuth)
- **Deploy**: Vercel (auto-deploy on push to `main`)

## Directory Structure
```
web-linux-fixed/
├── app/api/
│   ├── proxy/route.ts          # Browser proxy (strips X-Frame-Options)
│   ├── auth/[...nextauth]/     # NextAuth handlers
│   ├── chat/route.ts           # AI chat via Claude API
│   └── sync/                   # events, files, notes, settings, todos, contacts
├── components/
│   ├── os/                     # Shell: Boot, Login, TopPanel, Dock, Desktop, Window, AppLauncher
│   └── apps/                   # 54 apps (Browser, Calendar, Clock, Weather, Terminal…)
├── hooks/useOSStore.ts         # Zustand store — all OS state
├── public/wallpapers/          # 7 hand-crafted SVG wallpapers (no external deps)
└── styles/globals.css          # All keyframes, glass utilities, scrollbars
```

## Key Decisions
- **Browser proxy** at `/api/proxy?url=X` strips X-Frame-Options so external sites load in the iframe
- **Weather** uses [Open-Meteo](https://open-meteo.com) — fully free, no API key
- **Wallpapers** are SVG files — load instantly, no CDN dependency
- **Auth** is pure credentials (email + password). No GitHub/Google OAuth buttons
- **Boot steps** use icons (Cpu, Wifi, Monitor, Cloud) instead of numbered circles

## Env Variables (Vercel)
```
DATABASE_URL=postgresql://...    # Neon pooled connection
DIRECT_URL=postgresql://...      # Neon direct connection (for Prisma migrations)
NEXTAUTH_SECRET=...              # openssl rand -base64 32
NEXTAUTH_URL=https://your-app.vercel.app
```

## Deploy Steps
```bash
git add -A
git commit -m "v3 large-scale upgrade"
git push origin main
```
Vercel builds with: `prisma db push --accept-data-loss && prisma generate && next build`
