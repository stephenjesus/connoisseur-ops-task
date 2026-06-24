# Connoisseur Ops

Garment production tracker for **Connoisseur Fashions** — operator mobile app for floor scans, manager web dashboard for WIP and stock, shared Postgres backend.

## Live demo

| Surface | URL |
|---------|-----|
| Web (manager) | _Deploy to Vercel — see below_ |
| Mobile (operator) | Expo Go — scan QR from `pnpm mobile` |

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | `manager@demo.com` | `password123` |
| Operator | `operator@demo.com` | `password123` |

## Stack

- **Monorepo:** Turborepo + pnpm
- **Web:** Next.js 16, Tailwind, TanStack Query
- **Mobile:** Expo 56, expo-camera, expo-secure-store
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
# → http://localhost:3000

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

I used **Cursor** with Claude for scaffolding the monorepo, Prisma schema, and service layer. AI generated the initial API routes, dashboard UI, and Expo screens; I reviewed business rules (stage order, stock on complete, idempotency) and adjusted the data model. Deployment steps and `DECISIONS.md` offline-sync design were written with AI assistance and manually verified against the assignment brief.

## Assignment artifacts

- `DECISIONS.md` — architecture, trade-offs, offline sync approach
- Seed data — demo users, styles, bundles, stock pre-loaded
- Screen recording — walk through operator scan → dashboard update (record locally)
