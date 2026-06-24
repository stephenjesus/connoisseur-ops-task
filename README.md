# Connoisseur Ops

Garment production tracker for **Connoisseur Fashions** — operator mobile app for floor scans, manager web dashboard for WIP and stock, shared Postgres backend.

## Live demo

| Surface | URL |
|---------|-----|
| Web (manager) | **Deploy to Vercel** — see [Deploy](#deploy-to-vercel); then `https://YOUR-APP.vercel.app` |
| Mobile (operator) | `https://YOUR-APP.vercel.app/operator` (phone browser) **or** Expo Go + `pnpm mobile` |

> After deploy, update the URLs above and in `SUBMISSION.md`.

### Quick mobile fallback (local dev)

Open on your phone browser (same Wi‑Fi as Mac):

```
http://YOUR_MAC_IP:3000/operator
```

Login: `operator@demo.com` / `password123` — enter bundle ID manually (e.g. `BND-0001`).

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | `manager@demo.com` | `password123` |
| Operator | `operator@demo.com` | `password123` |

## Stack

- **Monorepo:** Turborepo + pnpm
- **Web:** Next.js 16, Tailwind, TanStack Query
- **Mobile:** Expo SDK **54** (Expo Go 54.x), expo-camera
- **API + DB:** Next.js API routes, Prisma, PostgreSQL
- **Shared:** Zod schemas, typed API client

## Prerequisites

- Node 20+
- pnpm 10+
- PostgreSQL (local Docker on port 5433, or Neon for production)
- Expo Go on your phone (for mobile)

## Quick start

```bash
# 1. Install
pnpm install

# 2. Configure env (copy and adjust DATABASE_URL)
cp .env.example .env
cp .env.example packages/db/.env
cp apps/web/.env.local.example apps/web/.env.local  # or create manually

# 3. Database (Docker example)
# docker run --name connoisseur-pg -e POSTGRES_PASSWORD=postgres \
#   -e POSTGRES_DB=connoisseur_ops -p 5433:5432 -d postgres:16

pnpm db:push
pnpm db:seed

# 4. Run web
pnpm web
# → http://localhost:3000 (or 3001 if 3000 is busy)

# 5. Run mobile (separate terminal)
pnpm mobile
# Scan QR with Expo Go
# For physical device: set EXPO_PUBLIC_API_URL to your LAN IP, e.g. http://192.168.1.5:3000
```

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | root, `packages/db` | PostgreSQL connection string |
| `JWT_SECRET` | root, `apps/web` | Secret for auth tokens |
| `NEXT_PUBLIC_APP_URL` | `apps/web` | Web app URL |
| `EXPO_PUBLIC_API_URL` | `apps/mobile` | API base URL for mobile |

## Project structure

```
apps/web/          Manager dashboard + API
apps/mobile/       Operator Expo app
packages/db/       Prisma schema, services, seed
packages/shared/   Types, Zod schemas, constants
packages/api-client/ Typed fetch client
```

## Deploy to Vercel

1. Create a [Neon](https://neon.tech) Postgres database and copy `DATABASE_URL`.
2. `npx vercel login`
3. From `apps/web`: `npx vercel --prod`
4. Set env vars in Vercel: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`
5. Run migrations: `pnpm db:push` against production DB, then `pnpm db:seed`
6. Update `EXPO_PUBLIC_API_URL` in mobile to your Vercel URL for Expo Go

## AI workflow

See **[AI_WORKFLOW.md](./AI_WORKFLOW.md)** (required submission note).

## Assignment artifacts

| Artifact | Location |
|----------|----------|
| Architecture & trade-offs | `DECISIONS.md` |
| Submission checklist | `SUBMISSION.md` |
| AI workflow (3–4 sentences) | `AI_WORKFLOW.md` |
| Demo video (app flow) | `demo/connoisseur-ops-demo.mp4` — regenerate with `pnpm record-demo` |
| Screen recording (3–5 min) | Record manually using script in `SUBMISSION.md` §5 |
