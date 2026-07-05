<div align="center">

# 🐧 Web Linux Agent v2

### Interactive Ubuntu 22.04 Desktop — as a Portfolio Website

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma_v7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Neon](https://img.shields.io/badge/Neon_PostgreSQL-00e5a0?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**Built by [Shaik Muzzammil](https://github.com/ShaikMuzzammil) · CSE @ Amrita Vishwa Vidyapeetham, Chennai**

[Live Demo](https://web-linux-agent.vercel.app) · [GitHub](https://github.com/ShaikMuzzammil/web-linux-agent) · [LinkedIn](https://linkedin.com/in/shaik-muzzammil)

</div>

---

## ✨ What is this?

A full-featured, interactive **Ubuntu 22.04 desktop environment** running entirely in the browser — built as a next-generation developer portfolio. Visitors explore a real OS simulation with 11 working apps, a functional terminal with 35+ commands, per-user authentication saved to a real PostgreSQL database, and a contact system powered by Resend.

---

## 🖥️ Features

### Desktop Environment
| Feature | Details |
|---|---|
| **Boot Screen** | Animated kernel log lines → Ubuntu logo → splash screen |
| **Lock Screen** | Sign In / Sign Up / Guest Mode with auth |
| **Desktop** | Draggable windows, right-click context menu, desktop icons |
| **Taskbar** | Live clock, volume/brightness sliders, user avatar menu |
| **Dock** | Left sidebar with app launcher overlay, open-app indicators |
| **Wallpapers** | 6 gradient themes — Ubuntu Classic, Aurora, Mountains, Neon City, Ocean, Forest |
| **Settings** | Accent color picker, font/dock size, terminal theme, account management |

### 11 Fully Functional Apps

| App | Highlights |
|---|---|
| 🖥️ **Terminal** | 35+ commands: `neofetch`, `ls`, `cd`, `cat`, `git`, `ping`, `cowsay`, `matrix`, `sl`, `about`, `skills`, `projects` |
| 💙 **VS Code** | Monaco Editor, file tree, multi-tab, syntax highlighting for 10+ languages |
| 📁 **Files** | Grid/list view, sidebar bookmarks, breadcrumb nav, search, simulated filesystem |
| 🦊 **Browser** | Address bar, tabs, bookmarks, portfolio page renderer, iframe sandbox |
| 👨‍💻 **About Me** | 5-tab portfolio — Overview, Skills, Projects, Education, Certifications |
| 📧 **Contact** | Working form → Resend email → confirmation to sender → saved to DB |
| 🧮 **Calculator** | Standard + Scientific modes, full keyboard support |
| ⚙️ **Settings** | Desktop customisation + account management |
| 📝 **Text Editor** | Multi-tab, line numbers, Ctrl+S save, word/char count |
| 🐙 **GitHub** | Profile viewer, repo list, contribution heatmap, activity feed |
| 🗑️ **Trash** | Permanent delete, empty trash |

### Auth & Database
- Email/password sign-up & sign-in — hashed with bcrypt, stored in Neon PostgreSQL
- GitHub OAuth & Google OAuth login
- Guest mode (no account needed)
- Per-user preferences persistence (wallpaper, accent color, terminal theme, dock size)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand v5 (windows + desktop prefs) |
| Editor | Monaco Editor (VS Code app) |
| Auth | NextAuth.js v5 beta |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| Database | Neon PostgreSQL (serverless) |
| Email | Resend v6 |
| Drag | react-draggable |
| Deploy | Vercel |

> **Note on Prisma v7:** v7 removed `url` from `schema.prisma`. This project uses `@prisma/adapter-pg` (pg driver adapter) and `prisma.config.ts` for the connection URL — the correct v7 pattern.

---

## 🚀 Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/ShaikMuzzammil/web-linux-agent.git
cd web-linux-agent
npm install        # automatically runs `prisma generate` via postinstall
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
AUTH_SECRET="run: openssl rand -base64 32"
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"   # works for testing without domain
```

### 3. Set Up Neon Database

1. Go to **[neon.tech](https://neon.tech)** → Create account → **New Project**
2. Name it `web-linux-agent`
3. Copy the **Pooled connection string** → paste into `DATABASE_URL`

```bash
# Push the schema to your database
npm run db:push

# Browse your data (optional)
npm run db:studio
```

### 4. Generate Auth Secret

```bash
openssl rand -base64 32
# Paste output into AUTH_SECRET in .env.local
```

### 5. Resend (Contact Emails)

1. Sign up at **[resend.com](https://resend.com)**
2. Create an API key → paste into `RESEND_API_KEY`
3. For testing: `RESEND_FROM_EMAIL=onboarding@resend.dev`
4. For production: verify your domain at Resend → use `portfolio@yourdomain.com`

### 6. OAuth (Optional)

**GitHub:**
```
1. github.com/settings/developers → OAuth Apps → New OAuth App
2. Homepage URL: http://localhost:3000
3. Callback URL: http://localhost:3000/api/auth/callback/github
4. Copy Client ID + Secret → .env.local
```

**Google:**
```
1. console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Redirect URI: http://localhost:3000/api/auth/callback/google
4. Copy Client ID + Secret → .env.local
```

### 7. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## ☁️ Deploy on Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "feat: web linux agent v2 complete"
git remote add origin https://github.com/ShaikMuzzammil/web-linux-agent.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. **[vercel.com](https://vercel.com)** → **Add New Project** → Import from GitHub
2. Select `web-linux-agent`
3. **Framework Preset**: Next.js *(auto-detected)*
4. **Build Command**: `npm run build` *(runs `prisma generate && next build`)*
5. Leave everything else as default

### Step 3 — Add Environment Variables

In **Vercel Dashboard → Settings → Environment Variables**, add these:

| Name | Value | Required |
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

> **⚠️ Important:** Set variables for **Production**, **Preview**, and **Development** environments.

### Step 4 — Deploy

Click **Deploy**. Vercel automatically:
1. Runs `npm install` → triggers `postinstall` → `prisma generate`
2. Runs `prisma generate && next build`
3. Deploys to global CDN

### Step 5 — Update OAuth Callback URLs

After deploy, update your OAuth apps to use the production domain:
- GitHub callback: `https://your-app.vercel.app/api/auth/callback/github`
- Google redirect: `https://your-app.vercel.app/api/auth/callback/google`

### Step 6 — Push Schema to Production DB

```bash
# Set DATABASE_URL to your production Neon URL locally
DATABASE_URL="your-neon-url" npm run db:push
```

Or run it from Vercel's **Functions** tab after deployment.

---

## 🗃️ Database Schema

```
User ──┬── UserPreferences   (1:1)  wallpaper, accentColor, fontSize, dockSize
       ├── UserFile[]         (1:N)  Text Editor saved files
       ├── ContactMessage[]   (1:N)  Contact form submissions
       ├── Account[]          (1:N)  OAuth accounts (GitHub/Google)
       └── Session[]          (1:N)  Active sessions
```

---

## 📂 Project Structure

```
web-linux-agent/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth v5 handler
│   │   │   └── register/route.ts       # Email/password registration
│   │   ├── contact/route.ts            # Contact → Resend + DB save
│   │   └── user/preferences/route.ts  # GET/PATCH user prefs
│   ├── globals.css                     # Tailwind v4 + keyframe animations
│   ├── layout.tsx                      # Root layout + metadata + viewport
│   └── page.tsx                        # Boot → Lock → Desktop orchestrator
│
├── components/
│   ├── boot/
│   │   ├── BootScreen.tsx              # 3-phase Ubuntu boot animation
│   │   └── LockScreen.tsx             # Auth lock screen (sign in/up/guest)
│   ├── desktop/
│   │   ├── Desktop.tsx                 # Desktop canvas + wallpaper
│   │   ├── Taskbar.tsx                 # Top bar (clock, tray, system menu)
│   │   ├── Dock.tsx                    # Left sidebar + app launcher overlay
│   │   ├── WindowManager.tsx           # Draggable window frames
│   │   └── DesktopContextMenu.tsx      # Right-click context menu
│   ├── apps/
│   │   ├── Terminal/      # 35+ bash commands, neofetch, portfolio cmds
│   │   ├── VSCode/        # Monaco Editor with file tree + tabs
│   │   ├── FileManager/   # Grid/list browser, bookmarks, search
│   │   ├── Browser/       # URL bar, tabs, iframe sandbox, portfolio renderer
│   │   ├── AboutMe/       # 5-tab portfolio (skills, projects, certs…)
│   │   ├── Contact/       # Resend-powered form + confirmation email
│   │   ├── Calculator/    # Standard + Scientific + keyboard
│   │   ├── Settings/      # Full desktop customisation
│   │   ├── TextEditor/    # Multi-tab, line numbers, Ctrl+S
│   │   ├── GitHub/        # Profile, repos, contribution graph
│   │   └── Trash/         # Recycle bin
│   └── providers/
│       └── AuthProvider.tsx            # NextAuth SessionProvider
│
├── lib/
│   ├── auth.ts             # NextAuth v5 config (credentials + OAuth)
│   ├── prisma.ts           # Prisma v7 singleton with pg adapter
│   └── resend.ts           # Email helpers (lazy init)
│
├── store/
│   ├── windowStore.ts      # Zustand — open windows state machine
│   └── desktopStore.ts     # Zustand — desktop prefs (localStorage persist)
│
├── types/index.ts          # AppName, AppWindow, DockItem, etc.
├── prisma/schema.prisma    # DB schema (Prisma v7 — no url in datasource)
├── prisma.config.ts        # Prisma v7 CLI config (url for db push/migrate)
├── middleware.ts            # Next.js edge middleware
├── next.config.ts           # Next.js config
├── postcss.config.mjs      # Tailwind v4 PostCSS
└── .env.example            # Full environment variable guide
```

---

## 🎨 Personalising for Your Portfolio

Replace these to make it yours:

| File | Change |
|---|---|
| `components/apps/AboutMe/index.tsx` | Name, bio, skills, projects, education, certifications |
| `components/apps/Contact/index.tsx` | Email, LinkedIn, GitHub, phone, location |
| `components/apps/Terminal/index.tsx` | `about`, `skills`, `projects`, `contact` command output |
| `components/apps/GitHub/index.tsx` | GitHub username, repos list, activity |
| `lib/resend.ts` | `OWNER_EMAIL` constant |
| `app/layout.tsx` | `<title>` and meta description |
| `components/desktop/Desktop.tsx` | Desktop icon list |

---

## 👨‍💻 About the Author

**Shaik Muzzammil** — 3rd Year CSE @ Amrita Vishwa Vidyapeetham, Chennai  
Building scalable full-stack web apps, REST APIs, and database-driven systems.

| Contact | Link |
|---|---|
| 📧 Email | muzzammil160806@gmail.com |
| 🐙 GitHub | [ShaikMuzzammil](https://github.com/ShaikMuzzammil) |
| 💼 LinkedIn | [shaik-muzzammil](https://linkedin.com/in/shaik-muzzammil) |
| 📍 Location | Chennai, Tamil Nadu, India |

---

## 📄 License

MIT © 2025 Shaik Muzzammil — fork it, star it, make it yours.

---

<div align="center">
<strong>If this helped you, ⭐ the repo!</strong><br>
Built with 💻 + ☕ + 🐧
</div>
