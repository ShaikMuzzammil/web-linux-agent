<div align="center">

# 🐧 WebLinuxOS v4

**A full browser-based Ubuntu-style cloud desktop built with Next.js 14**

[![Deploy](https://vercel.com/button)](https://vercel.com/new)
![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00e699) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)

</div>

## ✨ What's New in v4

### 🐛 Critical Bug Fixes
| Bug | Fix |
|-----|-----|
| `"Invalid time value"` crash on boot | Safe date formatters added in all components — `safeFormat()` wraps every `new Date()` call |
| Browser shows "Firefox Can't Open This Page" | Smart blocked-site detection now shows a native "Open in New Tab" overlay for Google, YouTube, etc. |
| Dock right-click "Close Window" did nothing | Context menu now correctly finds and closes the window |
| TopPanel tray buttons (volume/wifi/battery/bluetooth) not working | Fully interactive popups with toggles, sliders, device lists |
| Settings app missing most sections | Complete 15-section rewrite with all panels functional |

### 🆕 New Features

#### 🚀 Boot Sequence
- Numbered steps replaced with animated **icon-based boot steps** (Kernel → Storage → Network → Security → Display → Services → Cloud Sync)
- Animated ambient orbs, grid background scroll, per-step glow rings
- Real-time progress bar with step percentage

#### 🔔 Notification Center
- **Mini calendar** at the top of the notification panel (like GNOME)
- **Do Not Disturb** toggle
- Notifications grouped by date with color-coded severity icons
- Toast banners auto-appear for new notifications, auto-dismiss after 4s
- Per-notification dismiss and mark-read buttons

#### 🖥 Top Panel — Fully Interactive System Tray
| Tray Item | What it does |
|-----------|--------------|
| 🔊 Volume | Slider + output device list + mute toggle |
| 📶 WiFi | On/off toggle + signal bars + network list |
| 🔋 Battery | Real Battery Status API + charge % bar |
| 🎵 Bluetooth | Toggle + paired device list |
| 🕐 Clock | Click for date popup + "Open Clock / Calendar" |
| 👤 User | Profile card + Settings shortcut + Sign Out |
| 🌙 Theme | Instant Dark/Light mode toggle |
| 🔍 Search | Opens App Launcher |
| **Hover tooltips** | Every icon shows its name on hover |

#### ⚙️ Settings — 15 Fully Working Sections
`Bluetooth` · `Background` (7 wallpapers + custom URL) · `Appearance` (theme, accent, font size, pinned dock apps) · `Notifications` · `Sound` · `Power` · `Display` · `Mouse & Touchpad` · `Keyboard` (shortcuts) · `Printers` · `Removable Media` · `Date & Time` · `Users` · `Default Apps` · `Privacy` · `About` (storage bar, Check for Updates)

#### 🗓 Calendar — 3 Full Views
- **Month view** — calendar grid + selected-day side panel with event list
- **Week view** — 24-hour time grid, double-click to create events, events positioned by time
- **Agenda view** — 30-day scrollable list with color tags
- 4 color-coded event categories (Work, Personal, Health, Event)
- Full event form: title, date, start/end time, category, location, description

#### 🌐 Browser — Complete Rewrite
- **Multi-tab** with favicon, loading indicator, and close button
- **New Tab page** with speed dial grid (8 sites) + inline search
- **Bookmarks** sidebar (persisted to localStorage) + star button
- **History** sidebar with clear-all and per-entry navigation
- **Smart block detection** — known blocked sites (Google, Facebook, etc.) show an overlay with "Open in New Tab" button
- Address bar auto-detects URL vs search query

#### 🪟 Window Manager
- **8-direction resize handles** (all corners and edges)
- **Snap zones** — drag to left edge → left half, right edge → right half, top → maximize
- Visual ghost overlay during snap
- Traffic light buttons (macOS-style red/yellow/green) on every window
- Double-click title bar to maximize/restore

#### 🚢 Dock
- **macOS-style magnification** — hover scales up neighboring icons
- **Smooth tooltips** with arrow, slide-in animation
- **Right-click context menu** — Open, Keep in Dock / Remove from Dock, Close Window
- Running-app dot indicators (up to 3 dots for multiple windows)
- Animated bounce on new window open

## 🚀 Deploy to Vercel

```bash
git add -A
git commit -m "feat: WebLinuxOS v4"
git push origin main
```

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for environment variables and full setup guide.

## 🔑 Environment Variables
```env
DATABASE_URL=your_neon_connection_string
DIRECT_URL=your_neon_direct_string
NEXTAUTH_SECRET=random_hex_32
NEXTAUTH_URL=https://your-app.vercel.app
```

## 🏗 Tech Stack
- **Next.js 14** (App Router, Server Actions)
- **Prisma** + **Neon PostgreSQL** (cloud sync)
- **NextAuth v5** (credentials auth)
- **Zustand** (global OS state)
- **Tailwind CSS** (styling)
- **Lucide React** (icons)

## 📁 Project Structure
```
app/             — Next.js app router + API routes
components/
  os/            — Core OS shell (Boot, Login, Desktop, Dock, TopPanel, WindowFrame, etc.)
  apps/          — 54 individual app components
hooks/           — useOSStore (Zustand), useFileSystem
types/           — TypeScript interfaces
styles/          — globals.css with full animation library
docs/            — DEPLOY.md, APPS.md
```
