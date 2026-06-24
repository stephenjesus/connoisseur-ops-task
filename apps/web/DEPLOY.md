# Deploying to Vercel

**Do not run `vercel` from this folder** — it causes `apps/web/apps/web` path errors.

Deploy from the **monorepo root**:

```bash
cd /Users/stephenprakash/Desktop/task
pnpm deploy          # production
pnpm deploy:preview  # preview
```

Live app: https://connoisseur-ops-task-web.vercel.app
