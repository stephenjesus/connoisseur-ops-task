# Submission checklist — Connoisseur Ops

Use this when sending the assignment. Fill in **your live URLs** after deploying.

---

## 1. Live links

| Surface | URL | Notes |
|---------|-----|-------|
| **Web (manager)** | `https://YOUR-APP.vercel.app` | Login → dashboard, masters |
| **Mobile (operator)** | `https://YOUR-APP.vercel.app/operator` | Mobile-responsive browser UI; same API as native app |

**Deploy (one-time):**

```bash
# Neon: create Postgres DB, copy DATABASE_URL
npx vercel login
cd apps/web && npx vercel --prod
# Vercel dashboard → Environment Variables:
#   DATABASE_URL, JWT_SECRET (32+ chars), NEXT_PUBLIC_APP_URL=https://YOUR-APP.vercel.app
pnpm db:push && pnpm db:seed   # against production DATABASE_URL
```

**Demo logins:** `manager@demo.com` / `operator@demo.com` — password `password123`

Native Expo (optional for reviewers): point `EXPO_PUBLIC_API_URL` at your Vercel URL and run `pnpm mobile`.

---

## 2. GitHub repository

- **Repo:** https://github.com/stephenjesus/connoisseur-ops-task
- **README:** run steps, env vars, deploy, credentials
- **Commits:** logical history (`first commit` → feature/fix commits)

---

## 3. DECISIONS.md

Located at repo root. Covers:

- Architecture (monorepo, layers)
- Data model sketch
- Trade-offs
- Offline-sync approach (designed, not built)
- Deliberately left out + next steps

---

## 4. AI workflow note

See **`AI_WORKFLOW.md`** (3–4 sentences). Also summarized in README.

---

## 5. Screen recording (3–5 minutes)

**Current automated demo:** `demo/connoisseur-ops-demo.mp4` (~35s) — good for app flow only.

**Reviewers want app + code.** Record a longer walkthrough (Loom / QuickTime):

| Time | What to show |
|------|----------------|
| 0:00–0:30 | Intro; open live manager URL, login |
| 0:30–1:30 | Dashboard WIP + stock; Masters (styles/bundles) |
| 1:30–2:30 | Operator `/operator` — login, `BND-0001`, complete a stage |
| 2:30–3:00 | Refresh manager dashboard — show bundle moved |
| 3:00–4:30 | **Code:** `packages/db/prisma/schema.prisma`, `bundle.service.ts`, `apps/web/src/app/api`, `DECISIONS.md` offline section |
| 4:30–5:00 | Wrap; mention deploy + repo link |

Re-record app segments anytime: `pnpm web` then `pnpm record-demo`.

Upload recording to Google Drive / Loom / attach to submission email — include the link in your cover note.

---

## Quick copy-paste for cover email

```
Web:     https://YOUR-APP.vercel.app
Mobile:  https://YOUR-APP.vercel.app/operator
Repo:    https://github.com/stephenjesus/connoisseur-ops-task
Video:   [YOUR_LOOM_OR_DRIVE_LINK]
AI note: see AI_WORKFLOW.md in repo
```
