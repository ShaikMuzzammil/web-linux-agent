# WebLinuxOS v4 — Vercel Deployment Guide

## Prerequisites
- GitHub account + repo (ShaikMuzzammil/weblinuxos)
- Vercel account linked to GitHub
- Neon PostgreSQL database (neon.tech)

## Step-by-Step

### 1. Environment Variables (Vercel Dashboard → Settings → Environment Variables)
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host/db?sslmode=require
NEXTAUTH_SECRET=<generate with: openssl rand -hex 32>
NEXTAUTH_URL=https://your-project.vercel.app
```

### 2. Build & Output Settings (Vercel → Settings → General)
```
Build Command:   prisma generate && prisma db push --accept-data-loss && next build
Output Directory: .next
Install Command: npm install
```

### 3. Push to GitHub (auto-deploys)
```bash
git add -A
git commit -m "feat: WebLinuxOS v4 — massive UI upgrade"
git push origin main
```

### 4. Done!
Vercel auto-deploys on every push. Check "Deployments" for build logs.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `P1001 Can't reach database` | Check DATABASE_URL & Neon connection |
| `NEXTAUTH_SECRET is missing` | Add env var in Vercel dashboard |
| `Invalid time value` | Fixed in v4 — safe date formatters used everywhere |
| `Firefox Can't Open This Page` | Blocked sites now show "Open in New Tab" overlay |
| Build fails on prisma | Ensure build command starts with `prisma generate &&` |
