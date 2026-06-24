# DECISIONS.md — Connoisseur Ops

## Architecture

**Monorepo (Turborepo)** with three deployable surfaces sharing one database:

```
Operator Mobile (Expo) ──┐
                         ├── Next.js API Routes ── Service Layer ── Prisma ── PostgreSQL
Manager Web (Next.js) ───┘
```

- **Thin API routes** parse input with Zod and delegate to services in `packages/db`.
- **Shared package** holds stage order, validation schemas, and error types — used by API, web, and mobile.
- **Typed API client** avoids duplicated fetch logic between web hooks and mobile screens.

### Why this stack

| Choice | Reason |
|--------|--------|
| Next.js for web + API | Single deploy on Vercel; manager UI and REST API share auth |
| Expo for mobile | Fast barcode scanning, Expo Go link for reviewers, no APK build needed |
| PostgreSQL + Prisma | Transactions for atomic stage transitions and stock updates |
| JWT auth | Simple operator/manager RBAC without vendor lock-in |

## Data model

```
Style (SKU, name)
  └── Bundle (id, quantity, currentStage)
        └── StageTransition (audit log)

Style
  └── StockBalance (location, quantity)   ← FACTORY_STORE | DISPATCH
```

**Stage flow:** `CUTTING → STITCHING → FINISHING → PACKING → COMPLETED`

When a bundle transitions `PACKING → COMPLETED`, stock increments at **Factory Store** in the same database transaction.

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Online-first mobile | Faster to ship; offline sync designed but not built (see below) |
| JWT in httpOnly cookie (web) + SecureStore (mobile) | Simple; no refresh-token rotation in v1 |
| Stock lands in Factory Store on complete | Manager can transfer to Dispatch later; avoids asking operator for location on floor |
| Idempotency-Key on transitions | Small API addition; enables safe offline replay later |
| No separate Express server | Fewer moving parts; API colocated with Next.js |

## Deliberately left out (next iteration)

- Offline sync UI (designed, not built)
- Stock transfer manager UI (service exists, no screen)
- Push notifications, multi-factory, native APK
- Refresh tokens, password reset, user management

---

## Offline sync approach (factory wifi)

### Problem

Operators scan bundles at the cutting table, stitching line, and packing bench. Garment units often have **intermittent or congested wifi**. If every scan requires network, operators revert to paper when connectivity drops.

### Principles

| Principle | Decision |
|-----------|----------|
| Offline scope | Operator stage transitions only |
| Source of truth | Server always wins on conflict |
| Local state | Queue of **intent**, not authoritative inventory |

### Architecture

1. **Bundle cache (SQLite)** — store last-known `bundleId`, style, stage, quantity from successful fetches.
2. **Pending queue (SQLite)** — on offline transition tap, insert `{ idempotencyKey, bundleId, fromStage, toStage, clientTimestamp, status }`.
3. **Optimistic UI** — show success immediately with “Pending sync” badge.
4. **Sync worker** — on reconnect (`@react-native-community/netinfo`), drain queue **FIFO**.
5. **POST** `/api/bundles/:id/transition` with `Idempotency-Key` header (already supported in v1 API).
6. **Conflict** — server returns `409` with `currentStage`; app prompts operator to rescan.

### Conflict example

Operator scans `BND-0003` offline (cached: Stitching). Another line already moved it to Finishing. On sync, server rejects; app shows: *“Bundle is already in Finishing — rescan to continue.”*

### Why not built in v1

Offline sync needs SQLite persistence, NetInfo listener, queue UI, conflict screens, and retry testing — roughly 30–40% of mobile effort. The assignment states **clear reasoning matters more than shipping offline under the clock**. v1 ships online-first with idempotency-ready API.

### v2 implementation checklist

- [ ] `expo-sqlite` tables: `bundle_cache`, `pending_transitions`
- [ ] NetInfo banner: online / offline / N pending
- [ ] Background sync on reconnect with exponential backoff
- [ ] Failed item UI with Retry / Rescan actions

---

## What I would build next

1. Offline queue + sync worker on mobile
2. Stock transfer screen for managers (Factory Store → Dispatch)
3. Barcode label PDF export for new bundles
4. Production Neon + Vercel deploy with CI seed on preview branches
