# WebLinuxOS v2.0 — Changelog (v2.1 Enhanced)

## 🚀 Major Changes in This Build

### 1. Web Browser — Complete Rewrite
**Problem**: `www.google.com`, GitHub, YouTube etc. all show "Firefox Can't Open This Page" because they block iframe embedding with `X-Frame-Options: DENY`.

**Solution**:
- Added `/api/proxy/route.ts` — a server-side proxy that fetches external pages, strips `X-Frame-Options` and `Content-Security-Policy` headers, injects `<base>` tags to fix relative URLs, and intercepts navigation clicks to re-route through the proxy
- For known-blocked sites (Google, Facebook, Twitter, Instagram, LinkedIn) shows a dedicated "can't embed" UI with an **Open in New Tab** button
- `iframe` loads `/api/proxy?url=https://target.com` instead of the raw URL
- **New Tab page**: speed dial grid (8 sites), embedded search bar, bookmark shortcuts, wallpaper-gradient background
- **Bookmarks**: persistent via `localStorage`, side panel + star button + new-tab quick-access
- **History**: last 100 visits, side panel, clearable
- **Multi-tab**: open/close tabs, active tab tracking, loading spinner per tab
- Status bar, secure/insecure lock icon, "Open Externally" button

### 2. Boot Sequence — Icon Steps
**Problem**: The boot loader showed plain numbers `1 2 3 4` in orange circles.

**Solution**: Replaced with semantic SVG icon-based steps:
- Step 1 — CPU/gear icon → **Initializing Kernel**
- Step 2 — WiFi signal icon → **Starting Services**
- Step 3 — Monitor icon → **Loading Desktop**
- Step 4 — Cloud upload icon → **Syncing Cloud Data**
- Tick-mark circles (✓) show on completed steps
- 12-tick outer ring fills progressively with orange colour
- Animated `bootLogoGlow` pulse on Ubuntu logo
- Glowing SVG arc progress indicator

### 3. TopPanel — Fully Interactive System Tray
**Problem**: Volume, WiFi, Battery icons were static — clicking did nothing.

**Solution**: Each icon now opens a popup (click → toggle, click outside → close):
- 🔊 **Volume** — range slider + mute toggle + output device list
- 📶 **WiFi** — on/off toggle switch + network list with animated signal bars
- 🔋 **Battery** — uses real `navigator.getBattery()` API, animated level bar, charging indicator (colour-coded: green/yellow/red)
- 🔵 **Bluetooth** — on/off toggle + paired device list
- 🕒 **Clock** — popup with live HH:MM:SS and full date, "Open Clock app" shortcut
- 👤 **User menu** — name/email, Settings shortcut, Sign Out
- 🌗 **Theme toggle** — sun/moon icon switches dark/light mode

### 4. App Launcher — Sidebar + Recents + Pin Toggle
- Added **sidebar category navigation** with app counts
- **Recently used** apps shown as quick-access chips
- **Frequently used** apps shown at top (File Manager, Terminal, Browser, Text Editor, Settings)
- **★ Star button** on hover to pin/unpin app to Dock
- Keyboard: `↵` opens first result, `Esc` closes
- Smooth `popupIn` spring animation

### 5. Calendar — 3 Full Views
- **Month view**: full grid, event pills, click = day panel, double-click = new event, right panel shows selected day events
- **Week view**: 24h hourly grid, events positioned by time, double-click slot = new event
- **Agenda view**: next 30 days with events, empty state with "Add Event" button
- **Event form**: title, all-day toggle, start/end date+time, location, description, 8 colour swatches
- Create, edit, delete events; persists to localStorage + cloud sync

### 6. Dock — macOS Magnification
- Icons scale up as mouse approaches (up to 1.45× for hovered icon, tapering to neighbours)
- **Tooltip** with name shown on hover (animated slide-in)
- Running dot indicators per window (multiple windows = multiple dots)
- Right-click context menu: Open, Pin/Unpin, Close Window
- LayoutGrid button for App Launcher with own magnification

### 7. Desktop Wallpapers — 7 Premium SVGs
New wallpapers (all native SVG, no external image dependencies):
- 🌌 **Aurora Borealis** — starfield + green/purple aurora bands
- 🔭 **Nebula** — deep space with purple/blue gas clouds
- 🌆 **Cyberpunk** — neon-orange city skyline silhouette
- 🏔️ **Mountain** — sunrise behind mountain range
- 🌊 **Ocean** — dark teal waves with star reflections
- 🟠 **Ubuntu Dark** — minimal geometric with Ubuntu logo watermark
- ⬛ **Default** (unchanged)

Settings → Wallpaper to switch, or right-click desktop → "Change Wallpaper"

### 8. TopPanel — Wallpaper in Login Background
- Login screen now shows the selected wallpaper as background (same as desktop)
- Proper fallback gradient when no wallpaper selected

### 9. WindowFrame — Enhanced Traffic Lights
- Icons appear inside traffic-light buttons on hover (✕ − ⊞)
- Additional mini icon buttons (Minimize, Maximize/Restore) appear on title-bar hover for clarity
- All using `group-hover` Tailwind class

### 10. Infrastructure
- `vercel.json` — correct build order: `prisma generate && prisma db push --accept-data-loss && next build`
- `next.config.ts` — added proxy API headers, wildcard image domains
- `styles/globals.css` — 15+ new keyframe animations (bootLogoGlow, bootStepIn, popupIn, dockBounce, notificationSlide, windowOpen, windowClose, etc.)
- `app/api/proxy/route.ts` — new Edge runtime proxy endpoint

## 🐛 Bug Fixes
- Browser no longer tries to embed Google/YouTube directly (shows proper blocked-site UI)
- TopPanel battery/wifi/volume popups now close when clicking outside
- Desktop wallpaper now renders correctly from `theme.wallpaper` state
- Boot sequence no longer shows terminal/kernel log text

