# WebLinuxOS — Deployment Guide

## Vercel (Recommended)

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: WebLinuxOS v4.0 — taskbar, light mode fixes, pioneer redesign"
git push origin main
```

### 2. Import on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your `weblinuxos` repository
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** (will fail until env vars are set)

### 3. Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Your Google AI Studio key |
| `GOOGLE_CLIENT_ID` | (optional) |
| `GOOGLE_CLIENT_SECRET` | (optional) |
| `RESEND_API_KEY` | (optional) |

### 4. Setup Database
```bash
# Point DATABASE_URL to your Neon connection string in .env.local
npx prisma db push
```

### 5. Redeploy
In Vercel dashboard → Deployments → Redeploy (or `git push` again).

---

## Neon Database Setup

1. Sign up at [neon.tech](https://neon.tech) (free tier: 512MB)
2. Create a project → copy the **Connection String**
3. Paste it as `DATABASE_URL` in Vercel env vars
4. Run `npx prisma db push` to create tables

---

## Google OAuth Setup (Optional)

1. [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add `https://your-app.vercel.app/api/auth/callback/google` as authorized redirect URI
5. Copy Client ID + Secret to Vercel env vars

---

## Zero-Downtime Workflow (Nova's workflow)

```bash
# Make changes locally
# Zip the project folder
# Extract zip → overwrite GitHub repo files
git add .
git commit -m "feat: description of change"
git push  # → Vercel auto-deploys
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails: Prisma error | Run `npx prisma generate` before build |
| Auth not working | Check `NEXTAUTH_URL` matches your Vercel domain exactly |
| AI chat not responding | Verify `GEMINI_API_KEY` is correct in Vercel env |
| Notifications not showing | Clear `localStorage` and reload — corrupted state |
| Light mode menus invisible | Fixed in v4 — update to latest code |
| Tabs showing at top | Fixed in v4 — moved to Taskbar at bottom |
