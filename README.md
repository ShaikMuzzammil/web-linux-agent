<div align="center">

# 🐧 Web Linux Agent v2

### Interactive Ubuntu 22.04 Desktop — as a Portfolio Website

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-00e5a0?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**Built by [Shaik Muzzammil](https://github.com/ShaikMuzzammil) · CSE @ Amrita Vishwa Vidyapeetham**

[Live Demo](https://web-linux-agent.vercel.app) · [GitHub](https://github.com/ShaikMuzzammil/web-linux-agent) · [LinkedIn](https://linkedin.com/in/shaik-muzzammil)

![Web Linux Agent Preview](public/preview.png)

</div>

---

## ✨ What is this?

**Web Linux Agent** is a full-featured, interactive Ubuntu 22.04 desktop environment that runs entirely in the browser — built as a next-generation developer portfolio. Instead of a static page, visitors explore a real OS simulation with working apps, a functional terminal, per-user authentication, and a contact system.

Inspired by [vivek9patel.github.io](https://vivek9patel.github.io) and significantly extended with full-stack capabilities.

---

## 🖥️ Feature Overview

### Desktop Environment
| Feature | Details |
|---|---|
| **Boot Screen** | Animated Ubuntu boot log → Ubuntu logo splash |
| **Lock Screen** | Auth-gated with Sign In / Sign Up / Guest Mode |
| **Desktop** | Draggable windows, right-click context menu, desktop icons |
| **Taskbar** | Live clock, volume/brightness sliders, user menu, notification dots |
| **Dock** | Left sidebar with app launcher overlay, open-app indicators |
| **Wallpapers** | 6 animated gradient themes (Ubuntu Classic, Aurora, Mountains, Neon City, Ocean, Forest) |

### 11 Fully Functional Applications

| App | Description |
|---|---|
| 🖥️ **Terminal** | 35+ commands: `neofetch`, `ls`, `cd`, `cat`, `git`, `ping`, `cowsay`, `matrix`, portfolio commands |
| 💙 **VS Code** | Monaco Editor with file tree, tabs, syntax highlight, 10+ languages |
| 📁 **File Manager** | Full file system simulation, grid/list view, bookmarks, search |
| 🦊 **Browser** | URL bar, tab system, bookmarks, portfolio page renderer, iframe for whitelisted sites |
| 👨‍💻 **About Me** | Full portfolio: skills bars, project cards, education, certifications |
| 📧 **Contact** | Working form → Resend email API → confirmation email to sender |
| 🧮 **Calculator** | Standard + Scientific modes, keyboard support |
| ⚙️ **Settings** | Wallpaper picker, accent colours, font size, dock size, terminal theme |
| 📝 **Text Editor** | Multi-tab editor, line numbers, Ctrl+S save, word count |
| 🐙 **GitHub** | Profile viewer, repo list, contribution graph, activity feed |
| 🗑️ **Trash** | File management, permanent delete, empty trash |

### Authentication & Multi-User
- Email/password sign-up & sign-in (stored in Neon PostgreSQL via Prisma)
- GitHub OAuth login
- Google OAuth login
- Guest mode (no account needed)
- Per-user preference persistence (wallpaper, accent colour, terminal theme, dock size)

### Backend APIs
| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth v5 handler |
| `/api/auth/register` | POST | Email/password registration |
| `/api/contact` | POST | Contact form → Resend emails |
| `/api/user/preferences` | GET/PATCH | Load & save user desktop preferences |

---

## 🛠️ Tech Stack

```
Frontend
├── Next.js 16 (App Router, Turbopack)
├── TypeScript 5
├── Tailwind CSS v4
├── Zustand v5 (window + desktop state)
├── React Draggable (window drag)
├── Monaco Editor (VS Code app)
└── Framer Motion (animations)

Backend
├── Next.js API Routes (serverless)
├── NextAuth.js v5 beta (JWT sessions)
├── Prisma ORM v7
└── Resend v6 (transactional email)

Database
└── Neon PostgreSQL (serverless, connection pooling)

Deployment
└── Vercel (zero-config, automatic previews)
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/ShaikMuzzammil/web-linux-agent.git
cd web-linux-agent
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual values (see below)
```

### 3. Set Up Database (Neon)

1. Go to **[neon.tech](https://neon.tech)** → Sign up / Log in
2. Create a **New Project** → name it `web-linux-agent`
3. Copy the **Pooled connection string** → paste into `DATABASE_URL`
4. Copy the **Direct connection string** → paste into `DIRECT_URL`

```bash
# Push the schema to your Neon database
npx prisma db push

# (Optional) Explore your database
npx prisma studio
```

### 4. Generate Auth Secret

```bash
openssl rand -base64 32
# Paste the output into AUTH_SECRET in .env.local
```

### 5. Configure Resend

1. Sign up at **[resend.com](https://resend.com)**
2. Go to **API Keys** → Create key → paste into `RESEND_API_KEY`
3. For testing, set `RESEND_FROM_EMAIL=onboarding@resend.dev`
4. For production, verify your domain at Resend → use `portfolio@yourdomain.com`

### 6. (Optional) OAuth Providers

**GitHub:**
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID & Secret → paste into `.env.local`

**Google:**
1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID & Secret → paste into `.env.local`

### 7. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## ☁️ Deploy to Vercel (Recommended)

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "feat: complete web linux agent v2"
git remote add origin https://github.com/ShaikMuzzammil/web-linux-agent.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Add New Project**
2. Import from **GitHub** → select `web-linux-agent`
3. **Framework**: Next.js (auto-detected)
4. **Build Command**: `npm run build` *(runs `prisma generate && next build`)*
5. **Root Directory**: `.` (leave default)

### Step 3 — Add Environment Variables

In Vercel dashboard → **Settings → Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Your Neon pooled URL | Required |
| `DIRECT_URL` | Your Neon direct URL | Required |
| `AUTH_SECRET` | `openssl rand -base64 32` | Required |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Required for production |
| `RESEND_API_KEY` | `re_xxxxx` | Required for contact |
| `RESEND_FROM_EMAIL` | `portfolio@yourdomain.com` | Required for contact |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |

### Step 4 — Deploy

Click **Deploy**. Vercel will:
1. Install dependencies (`npm install` → `postinstall` → `prisma generate`)
2. Build (`next build`)
3. Deploy globally on edge CDN

### Step 5 — Update OAuth Callbacks (if using OAuth)

After deploy, update your OAuth apps' callback URLs to use your production domain:
- GitHub: `https://your-app.vercel.app/api/auth/callback/github`
- Google: `https://your-app.vercel.app/api/auth/callback/google`

---

## 🗃️ Database Schema

```
User ──┬── UserPreferences  (1:1 — wallpaper, theme, etc.)
       ├── UserFile[]        (1:N — saved files in Text Editor)
       ├── ContactMessage[]  (1:N — messages sent from Contact app)
       ├── Account[]         (1:N — OAuth accounts)
       └── Session[]         (1:N — active sessions)
```

Key models:
- **`User`** — email, hashed password, name, avatar
- **`UserPreferences`** — wallpaper, accentColor, fontSize, terminalTheme, dockSize
- **`ContactMessage`** — name, email, subject, message, status, optional userId
- **`UserFile`** — path, content, type (per-user filesystem in Text Editor)

---

## 📂 Project Structure

```
web-linux-agent/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── register/route.ts       # Email registration
│   │   ├── contact/route.ts            # Contact form → Resend
│   │   └── user/preferences/route.ts  # User prefs CRUD
│   ├── globals.css                     # Tailwind v4 + animations
│   ├── layout.tsx                      # Root layout + metadata
│   └── page.tsx                        # Boot → Lock → Desktop
│
├── components/
│   ├── boot/
│   │   ├── BootScreen.tsx              # Ubuntu boot animation
│   │   └── LockScreen.tsx             # Auth lock screen
│   ├── desktop/
│   │   ├── Desktop.tsx                 # Main desktop canvas
│   │   ├── Taskbar.tsx                 # Top bar (clock, tray)
│   │   ├── Dock.tsx                    # Left app sidebar
│   │   ├── WindowManager.tsx           # Draggable windows
│   │   └── DesktopContextMenu.tsx      # Right-click menu
│   ├── apps/
│   │   ├── Terminal/      # 35+ bash commands
│   │   ├── VSCode/        # Monaco editor + file tree
│   │   ├── FileManager/   # Grid/list file browser
│   │   ├── Browser/       # Full browser simulation
│   │   ├── AboutMe/       # Portfolio tabs
│   │   ├── Contact/       # Resend-powered form
│   │   ├── Calculator/    # Standard + Scientific
│   │   ├── Settings/      # Desktop customisation
│   │   ├── TextEditor/    # Multi-tab code editor
│   │   ├── GitHub/        # Profile + repos viewer
│   │   └── Trash/         # Recycle bin
│   └── providers/
│       └── AuthProvider.tsx
│
├── lib/
│   ├── auth.ts             # NextAuth v5 config
│   ├── prisma.ts           # Prisma singleton
│   └── resend.ts           # Email helpers (lazy init)
│
├── store/
│   ├── windowStore.ts      # Zustand — open windows state
│   └── desktopStore.ts     # Zustand — desktop prefs (persisted)
│
├── types/index.ts          # Shared TypeScript types
├── prisma/schema.prisma    # DB schema
├── middleware.ts            # Edge middleware
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind v4 config
└── .env.example            # Environment variable template
```

---

## 🎨 Customising for Your Own Portfolio

All personal content is centralised — easy to replace:

| File | What to change |
|---|---|
| `components/apps/AboutMe/index.tsx` | Name, bio, skills, projects, education, certs |
| `components/apps/Contact/index.tsx` | Email, LinkedIn, GitHub, phone |
| `components/apps/Terminal/index.tsx` | `about`, `skills`, `projects`, `contact` commands |
| `components/apps/GitHub/index.tsx` | GitHub username, repos, activity |
| `components/desktop/Desktop.tsx` | Desktop icon list |
| `lib/resend.ts` | `OWNER_EMAIL` constant |
| `app/layout.tsx` | Site `<title>` and meta description |

---

## 🧑‍💻 About the Author

**Shaik Muzzammil** — 3rd year CSE student at Amrita Vishwa Vidyapeetham, Chennai.  
Building scalable full-stack web applications, REST APIs, and database-driven systems.

| | |
|---|---|
| 📧 Email | muzzammil160806@gmail.com |
| 🐙 GitHub | [ShaikMuzzammil](https://github.com/ShaikMuzzammil) |
| 💼 LinkedIn | [shaik-muzzammil](https://linkedin.com/in/shaik-muzzammil) |
| 📍 Location | Chennai, Tamil Nadu, India |

---

## 📄 License

MIT © 2025 Shaik Muzzammil — fork it, extend it, make it your own.

---

<div align="center">

**If this helped you, please ⭐ the repo!**

Built with 💻 + ☕ + 🐧

</div>
