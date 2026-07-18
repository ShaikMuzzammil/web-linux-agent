# App Reference Guide — WebLinuxOS v2.0

All 54 built-in apps — what each does and how to use it.

---

## 🖥️ System (7 apps)

### File Manager
Browse and manage your cloud file system.
- Navigate directories with the breadcrumb bar
- Create folders, rename, delete files
- Quick Access panel for Home, Documents, Downloads, Pictures
- Search files by name
- Terminal integration: changes made in terminal reflect here

### Terminal
Full Linux-style CLI with 35+ real commands.
```
Commands: ls, cd, mkdir, rm, touch, cat, echo, pwd, clear, help
          cp, mv, chmod, nano (opens Text Editor)
          ping, curl, wget, ifconfig
          ps, kill, top (opens System Monitor)
          git status, git log
          python3, node (simulated)
          htop, df, du, env, printenv
          man <command>  — built-in manual pages
```

### Text Editor
Code-aware editor with syntax highlighting.
- Supports: JS, TS, Python, CSS, HTML, JSON, Markdown, Bash
- Multi-file tabs (Ctrl+T for new tab)
- Word count in status bar
- Line numbers toggle

### Calculator
Scientific calculator.
- Basic: `+ - × ÷`
- Scientific: `sin cos tan log √ π e`
- History panel (last 10 calculations)
- Keyboard input supported

### System Settings
Customize your desktop environment.
- **Appearance** — dark/light mode, accent color (8 options)
- **Wallpaper** — 7 built-in SVG wallpapers + custom URL
- **Dock** — pin/unpin apps, reorder
- **Notifications** — toggle per-app
- **Account** — view profile, sign out
- **About** — version, system info

### System Monitor
Live system metrics.
- CPU usage (animated bar chart)
- Memory, swap usage
- Disk partitions
- Network in/out speed
- Process list with kill option

### Archive Manager
ZIP file management.
- Create ZIP archives
- Extract contents
- View archive contents

---

## 📅 Productivity (10 apps)

### Calendar ⭐
Full-featured calendar with 3 views.
- **Month view** — grid + right panel showing selected day's events
- **Week view** — 24-hour time grid with drag-to-create (double-click)
- **Agenda view** — scrollable 30-day upcoming list
- Create events: title, color, date/time, location, description
- Events sync to cloud

### Notes
Rich text note-taking.
- Folders + nested organization
- Bold, italic, lists, headers
- Search across all notes
- Cloud sync

### Todo List
Task management with priorities.
- Priorities: High / Medium / Low
- Due dates
- Tags and categories
- Cloud sync

### Clock
Multi-function time app.
- **World Clock** — add any city
- **Timer** — countdown with alarm
- **Stopwatch** — with lap times
- **Alarm** — set multiple alarms

### Spreadsheet
Basic spreadsheet with formula support.
- Cell references (`=A1+B2`)
- SUM, AVG, MAX, MIN functions
- Multiple sheets
- CSV export

### Document Viewer
View text-based documents.
- Plain text, Markdown render
- Print preview

### Reminders
Time-based reminders.
- Priority levels
- Repeat options
- Cloud sync + browser notifications

### Contacts
Address book.
- Name, email, phone, avatar
- Search and filter
- Cloud sync

### Password Manager
Secure password vault.
- Encrypted storage
- Generate strong passwords
- Copy to clipboard (masked)
- Cloud sync

### Whiteboard
Infinite canvas.
- Freehand drawing
- Sticky notes
- Shapes and arrows

---

## 🌐 Internet (7 apps)

### Web Browser ⭐
Tabbed browser with proxy support.
- **New Tab page** — speed dial + bookmarks + search
- Multiple tabs (click + to add, click × to close)
- Proxy API strips `X-Frame-Options` to load more sites
- Bookmarks sidebar (★ to toggle)
- History sidebar
- Known-blocked sites (Google, Facebook…) show "Open in New Tab" button
- Address bar: enter URL or search query — auto-detects

### Email
Inbox + compose interface.
- Read/write emails (simulated)
- Folder navigation

### Chat ⭐
AI assistant powered by Claude.
- Context-aware responses
- Code formatting
- Conversation history in session

### Weather ⭐
Real weather data via Open-Meteo (free, no API key).
- Search any city
- Current conditions
- 7-day forecast
- Hourly forecast
- UV index, humidity, pressure, visibility, wind

### RSS Reader
Subscribe to any RSS feed.
- Add feeds by URL
- Read articles in-app
- Mark as read

### FTP Client
File transfer protocol client.
- Connect to FTP servers
- Browse remote directories
- Upload/download simulation

### Network Tools
Network diagnostics.
- Ping hostname
- Port scanner
- DNS lookup
- IP info

---

## 🎵 Media (7 apps)

### Music Player
Audio player with visualizer.
- Drag & drop audio files
- Playlist management
- Waveform visualizer
- Shuffle / repeat

### Video Player
Video playback.
- Drag & drop video files
- Full controls
- Picture-in-picture

### Image Viewer
Browse and view images.
- Slideshow mode
- Zoom in/out
- EXIF data display

### Photo Editor
Basic image editing.
- Brightness, contrast, saturation
- Crop and rotate
- Filters
- Export

### Voice Recorder
Browser microphone recording.
- Record audio (requires mic permission)
- Playback recordings
- Download as WebM

### Screen Recorder
Screen capture.
- Record screen (requires permission)
- Download recording

### Media Converter
Format conversion (simulated).
- Shows conversion steps
- Supports common formats

---

## 🎮 Games (11 apps)

| Game | Controls |
|------|---------|
| **Minesweeper** | Left-click reveal, right-click flag. 3 difficulty levels. |
| **Snake** | Arrow keys or WASD. 3 speeds. |
| **Tetris** | Arrow keys, Space to drop, Z/X to rotate. |
| **Tic-Tac-Toe** | Click cell. vs AI or 2-player. |
| **2048** | Arrow keys. Combine tiles to reach 2048. |
| **Sudoku** | Click cell + type number. Hint button. |
| **Chess** | Click piece + click target. vs AI (3 levels). |
| **Memory Game** | Click cards to find matching pairs. |
| **Pong** | W/S keys for left paddle. vs AI. |
| **Solitaire** | Click + drag cards. Standard Klondike rules. |
| **Flappy Bird** | Space / click to flap. |

---

## 🛠️ DevTools (8 apps)

### Code Editor
Full syntax-highlighted editor.
- Multi-file tab system
- Language detection from file extension
- Theme: dark/light
- Find & replace

### JSON Formatter
- Format / minify JSON
- Validate JSON
- Tree view
- Diff two JSON objects

### Regex Tester
- Live regex matching
- Group highlighting
- Common regex library
- Flags: g, i, m, s

### Markdown Preview
- Side-by-side editor + preview
- GitHub Flavored Markdown
- Export to HTML

### Git Client
- Visualize branch graph
- Stage / unstage files
- Commit history

### API Tester
Postman-like REST client.
- GET, POST, PUT, DELETE, PATCH
- Headers editor
- Body: JSON / form / raw
- Response: formatted JSON

### Base64 Tool
- Encode / decode Base64
- URL encode / decode
- Unicode utilities

### Color Palette
- Generate color schemes
- Complementary / triadic / analogous
- Export as CSS variables

---

## 🎨 Creative (4 apps)

### Drawing
Canvas-based paint app.
- Brush, eraser, shapes
- Color picker
- Layer support
- Export as PNG

### Color Picker
Pick any color.
- HEX / RGB / HSL
- Click-to-copy
- Palette swatch

### Image Gallery
Browse uploaded images.
- Grid view
- Lightbox zoom
- Organize in folders

### ASCII Art
Text-to-ASCII converter.
- Multiple fonts
- Live preview
- Export as text
