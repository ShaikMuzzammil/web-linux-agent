# WebLinuxOS v2.0 — Deploy Guide

## ⚡ Quick Deploy to Vercel

### 1. Push to GitHub
```bash
git add -A
git commit -m "feat: WebLinuxOS v2.0 - clean auth, premium boot, Ubuntu UI"
git push origin main
```

### 2. Vercel Environment Variables
In your Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon pooled connection string |
| `DIRECT_URL` | Your Neon direct connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g. `https://web-linux-os.vercel.app`) |

### 3. Build Command (auto-set in vercel.json)
```
prisma db push --accept-data-loss && prisma generate && next build
```
This automatically creates all database tables on every deploy.

### 4. Done!
- Vercel detects Next.js automatically
- `prisma db push` creates tables in Neon on build
- No manual migration needed

---

## 🔧 Local Development

```bash
cp .env.example .env.local
# Fill in your Neon DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET

npm install
npm run db:push    # creates tables
npm run dev        # http://localhost:3000
```
