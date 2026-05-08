# BipHub

The free, open-source database for Erasmus+ Blended Intensive Programs.

> Phase 1 / Plan 01 — walking skeleton. The homepage is intentionally minimal at
> this stage; Plan 01-05 ships the visual translation of `biphub-homepage.html`.

## Local development

Prerequisites:
- Node.js 20+
- Docker Desktop (for Supabase local stack)

```bash
# 1. Install deps
npm install

# 2. Start Supabase local stack (Postgres + Auth + Studio at localhost:54323)
npm run db:start

# 3. Apply migrations + seed
npm run db:reset

# 4. Copy local secrets -- see `npx supabase status` for live values
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY

# 5. Run Next.js
npm run dev
```

Open http://localhost:3000 -- you should see the canary homepage with
"Approved BIPs in database: 1".

## Project guide

See `CLAUDE.md` for the locked stack, never-do list, and visual constraints.
See `.planning/` for the full roadmap, requirements, research, and per-phase plans.

---

*Independent project -- not affiliated with the European Commission.*
