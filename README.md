<div align="center">

# 🐧 Web Linux Agent v2

### Interactive Ubuntu 22.04 Desktop — as a Portfolio Website

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma_v7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-00e5a0?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**Built by [Shaik Muzzammil](https://github.com/ShaikMuzzammil) · CSE @ Amrita Vishwa Vidyapeetham, Chennai**

[Live Demo](https://web-linux-agent.vercel.app) · [GitHub](https://github.com/ShaikMuzzammil/web-linux-agent) · [LinkedIn](https://linkedin.com/in/shaik-muzzammil)

</div>

---

## ✨ What is this?

A fully interactive **Ubuntu 22.04 desktop environment** that runs in the browser — built as a next-generation developer portfolio. Visitors get a real OS simulation with 11 working applications, a terminal with 35+ commands, multi-user authentication backed by Neon PostgreSQL, and a contact system powered by Resend.

---

## 🖥️ Desktop Features

| Feature | Details |
|---|---|
| **Boot Screen** | 3-phase animation: kernel log lines → Ubuntu logo → splash |
| **Lock Screen** | Sign In / Sign Up / Guest Mode — email+password + OAuth |
| **Desktop** | Draggable/resizable windows, right-click context menu, desktop icons |
| **Taskbar** | Live clock, volume/brightness sliders, user menu, open-app dots |
| **Dock** | Left sidebar + full-screen app launcher overlay |
| **Wallpapers** | 6 animated gradient themes with real-time switching |

---

## 📱 11 Working Applications

| App | What It Does |
|---|---|
| 🖥️ **Terminal** | 35+ bash commands: `neofetch`, `ls`, `cat`, `git`, `ping`, `cowsay`, `matrix`, `sl`, `about`, `skills`, `projects` |
| 💙 **VS Code** | Monaco Editor, file tree, multi-tab, syntax highlighting for 10+ languages |
| 📁 **Files** | Grid/list views, sidebar bookmarks, breadcrumb navigation, search |
| 🦊 **Browser** | URL bar, tabs, bookmarks, portfolio renderer, iframe sandbox |
| 👨‍💻 **About Me** | 5-tab portfolio: Overview · Skills · Projects · Education · Certifications |
| 📧 **Contact** | Live form → Resend email to owner + auto-reply to sender → saved to DB |
| 🧮 **Calculator** | Standard + Scientific modes, full keyboard support |
| ⚙️ **Settings** | Wallpaper picker, 8 accent colors, font/dock size, terminal theme, account |
| 📝 **Text Editor** | Multi-tab, line numbers, Ctrl+S, word/char count |
| 🐙 **GitHub** | Profile viewer, repos, contribution heatmap, activity feed |
| 🗑️ **Trash** | File management, permanent delete, empty trash |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-native, no config file) |
| State | Zustand v5 (windows + desktop — localStorage persisted) |
| Editor | Monaco Editor (VS Code app) |
| Auth | NextAuth.js v5 beta (credentials + GitHub + Google OAuth) |
| ORM | **Prisma v7** + `@prisma/adapter-pg` |
| Database | Neon PostgreSQL (serverless) |
| Email | Resend v6 (lazy init, non-fatal errors) |
| Drag | react-draggable v4 |
| Deploy | Vercel (zero-config) |

> **Prisma v7 Note:** v7 removed `url` from `schema.prisma`. This project uses the correct pattern: `prisma.config.ts` holds the URL for CLI commands; `@prisma/adapter-pg` passes the connection to `PrismaClient`.

---

## 🚀 Local Development

### 1. Clone & Install

```bash
git clone https://github.com/ShaikMuzzammil/web-linux-agent.git
cd web-linux-agent
npm install        # postinstall runs `prisma generate || true`
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASS@HOST/DBNAME?sslmode=require"
AUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

### 3. Set Up Neon Database

1. [neon.tech](https://neon.tech) → New Project → `web-linux-agent`
2. Copy **Pooled connection string** → paste into `DATABASE_URL`
3. Run: `npm run db:push`

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## ☁️ Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git remote add origin https://github.com/ShaikMuzzammil/web-linux-agent.git
git push -u origin main --force
```

> Use `--force` to overwrite the stale old code on GitHub.

### Step 2 — Import on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → Import from GitHub → `web-linux-agent`
2. **Framework**: Next.js *(auto-detected)*
3. **Build Command**: `npm run build` → runs `prisma generate && next build`

### Step 3 — Environment Variables on Vercel

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | ✅ |
| `AUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | ✅ |
| `RESEND_API_KEY` | `re_xxxxx` from resend.com | ✅ |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` or verified domain | ✅ |
| `GITHUB_CLIENT_ID` | From GitHub OAuth app | Optional |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth app | Optional |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Optional |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Optional |

### Step 4 — Deploy

Click **Deploy**. Vercel automatically:
1. `npm install` → `postinstall` → `prisma generate` ✅
2. `npm run build` → `prisma generate && next build` ✅
3. Deploys to global CDN ✅

---

## 🗃️ Database Schema

```
User
 ├── UserPreferences  (1:1) — wallpaper, accentColor, fontSize, dockSize
 ├── UserFile[]        (1:N) — Text Editor saved files
 ├── ContactMessage[]  (1:N) — Contact form submissions
 ├── Account[]         (1:N) — OAuth providers
 └── Session[]         (1:N) — Active JWT sessions
```

Push schema to DB: `npm run db:push`

---

## 📂 Project Structure

```
web-linux-agent/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth v5
│   │   ├── auth/register/route.ts       # Email registration
│   │   ├── contact/route.ts             # Resend + DB save
│   │   └── user/preferences/route.ts   # GET/PATCH prefs
│   ├── error.tsx                         # Error boundary
│   ├── globals.css                       # Tailwind v4 + animations
│   ├── layout.tsx                        # Root layout
│   ├── loading.tsx                       # Loading state
│   ├── not-found.tsx                     # 404 page
│   └── page.tsx                          # Boot → Lock → Desktop
│
├── components/
│   ├── boot/         BootScreen, LockScreen
│   ├── desktop/      Desktop, Taskbar, Dock, WindowManager, ContextMenu
│   ├── apps/         Terminal, VSCode, FileManager, Browser, AboutMe,
│   │                 Contact, Calculator, Settings, TextEditor, GitHub, Trash
│   └── providers/    AuthProvider
│
├── lib/
│   ├── auth.ts       NextAuth v5 config
│   ├── prisma.ts     Prisma v7 + @prisma/adapter-pg
│   └── resend.ts     Email helpers (lazy init)
│
├── store/
│   ├── windowStore.ts     Window state machine
│   └── desktopStore.ts    Desktop prefs (persisted)
│
├── types/
│   ├── index.ts       AppName, AppWindow, etc.
│   └── next-auth.d.ts NextAuth type augmentation
│
├── prisma/schema.prisma   DB schema (no url — Prisma v7)
├── prisma.config.ts        Prisma v7 CLI config
├── proxy.ts                Next.js 16 proxy
├── next.config.ts          Next.js config
├── postcss.config.mjs      Tailwind v4 PostCSS
└── .env.example            Env variable guide
```

---

## 🎨 Personalise It

| File | What to change |
|---|---|
| `components/apps/AboutMe/index.tsx` | Your name, bio, skills, projects, education, certs |
| `components/apps/Contact/index.tsx` | Email, LinkedIn, GitHub, phone |
| `components/apps/Terminal/index.tsx` | `about`, `skills`, `projects`, `contact` command output |
| `components/apps/GitHub/index.tsx` | GitHub username, repos, contribution data |
| `lib/resend.ts` | `OWNER_EMAIL` constant |
| `app/layout.tsx` | `<title>` and meta description |

---

## 👨‍💻 Author

**Shaik Muzzammil** — 3rd Year CSE @ Amrita Vishwa Vidyapeetham, Chennai

| | |
|---|---|
| 📧 | muzzammil160806@gmail.com |
| 🐙 | [github.com/ShaikMuzzammil](https://github.com/ShaikMuzzammil) |
| 💼 | [linkedin.com/in/shaik-muzzammil](https://linkedin.com/in/shaik-muzzammil) |
| 📍 | Chennai, Tamil Nadu, India |

---

## 📄 License

MIT © 2025 Shaik Muzzammil

---

<div align="center">
<strong>⭐ Star this repo if it helped!</strong><br>
Built with 💻 + ☕ + 🐧
</div>
