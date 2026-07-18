# Deployment Guide — WebLinuxOS v2.0

Step-by-step instructions to deploy your own instance on Vercel + Neon.

---

## Prerequisites

- GitHub account
- Vercel account (free)
- Neon account (free) — [neon.tech](https://neon.tech)

---

## Step 1 — Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project → select region closest to you
3. Copy the **Connection string** — you need TWO variants:

**Pooled URL** (for `DATABASE_URL`):
```
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```

**Direct URL** (for `DIRECT_URL`):
```
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> In the Neon dashboard: Connection Details → "Pooled connection" toggle gives you both.

---

## Step 2 — Push Code to GitHub

```bash
# Clone or extract the project
git init
git add -A
git commit -m "feat: WebLinuxOS v2.0 initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/web-linux-os
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework**: Next.js (auto-detected)
4. **Build Command**: leave as default — `vercel.json` handles it:
   ```
   prisma generate && prisma db push --accept-data-loss && next build
   ```

---

## Step 4 — Add Environment Variables

In Vercel → Your Project → Settings → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |

> **Important**: Set all four variables in **Production**, **Preview**, and **Development** environments.

---

## Step 5 — Deploy

Click **Deploy** — Vercel will:
1. Install dependencies
2. Run `prisma generate` (generates Prisma client)
3. Run `prisma db push --accept-data-loss` (creates all DB tables in Neon)
4. Build Next.js app
5. Deploy to your `.vercel.app` domain

**Expected build time**: ~90 seconds

---

## Step 6 — First Login

1. Open your `.vercel.app` URL
2. Watch the boot sequence animate
3. Click **Register** tab
4. Enter name, email, password
5. Your cloud desktop is ready 🎉

---

## Troubleshooting

### "Table does not exist" error
The `prisma db push` didn't run. In Vercel → Project → Settings → **General** → **Build Command**, ensure it's set to:
```
prisma generate && prisma db push --accept-data-loss && next build
```

### "Invalid credentials" on login
Clear your browser cache and try registering again.

### Weather not loading
The weather app uses Open-Meteo which is free and requires no API key. If it's slow, it's the free tier geocoding API — just wait a moment.

### Browser shows "Can't Open Page"
This is expected for sites like Google that block iframe embedding. Click "Open Externally" to open the page in a real browser tab.

---

## Re-deploying After Changes

```bash
git add -A
git commit -m "fix: your change description"
git push origin main
```

Vercel auto-deploys on every push to `main`.

---

## Custom Domain

1. Vercel → Project → Settings → **Domains**
2. Add your domain (e.g. `os.yourdomain.com`)
3. Update `NEXTAUTH_URL` to `https://os.yourdomain.com`
4. Redeploy
