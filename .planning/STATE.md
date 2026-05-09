---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Plan 01-02 complete — proceeding to Plan 01-03 (seed catalog, 20 synthetic BIPs)
last_updated: "2026-05-09T01:00:00Z"
last_activity: 2026-05-09 -- Plan 01-02 complete; full schema live in local Supabase; all RLS UPDATE policies have USING+WITH CHECK; FTS smoke test passed; domain types generated
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 8
  completed_plans: 2
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-08)

**Core value:** Students can reliably discover Erasmus+ BIPs by country, field of study, and dates, and universities can self-service list their BIPs through a fast, professional submission flow with admin review.
**Current focus:** Phase 1 — Discovery Foundation

## Current Position

Phase: 1 (Discovery Foundation) — EXECUTING
Plan: 2 of 8 complete (Wave 2 done) — Wave 3 next (Plan 01-03 seed catalog)
Status: Executing Phase 1
Last activity: 2026-05-09 -- Plan 01-02 complete; full schema live in local Supabase; all RLS UPDATE policies have USING+WITH CHECK; FTS smoke test passed; domain types generated

Progress: [██░░░░░░░░] 25%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: Use `motion` (not `framer-motion`), Zod v3 (not v4), `@vnedyalk0v/react19-simple-maps` (not original), Next.js 15.5.x LTS (not 16)
- Plan 01-01: @supabase/ssr pinned to exact 0.5.2 (no ^ prefix) per STATE.md blocker; `slugify` pinned exact 1.6.9
- Plan 01-01: `CookieOptions` type imported from @supabase/ssr to satisfy strict TS in setAll signature
- Plan 01-01: `eslint.config.mjs` flat config required for ESLint 9 + Next.js 15.5 (`next lint` needs flat config)
- Plan 01-01: shadcn@latest init requires Tailwind v4 pre-installed via npm before running init
- Plan 01-01: EC disclaimer added to canary homepage per CLAUDE.md requirement (every page must show disclaimer)
- Plan 01-01 (post-verify): Supabase CLI 2.98.x emits the new key system (`sb_publishable_*` / `sb_secret_*`) and the legacy `eyJ…iss=supabase-demo` JWTs no longer authenticate against PostgREST. `.env.local` must be populated from `npx supabase status` after each `supabase start`. README needs a "Local development" note in Plan 01-04 (chrome) or 01-08 (auth).
- Init: GeoJSON served from `/public` at runtime via `dynamic()` — never imported into JS bundle
- Init: `getClaims()` everywhere in server code — never `getSession()`; `await cookies()` in all client factories
- Init: Seed-first Phase 1 — 20 SQL-seeded approved BIPs unblock student discovery before coordinator pipeline exists
- Init: Logo star count must be verified ≠ 12 before Phase 1 homepage build
- Phase 1: `/bips` uses left sidebar (desktop) + bottom drawer (mobile), numbered pagination 24/page, default sort = deadline soonest
- Phase 1: Map choropleth uses fixed small bins (0 / 1 / 2–3 / 4–6 / 7–10 / 11+), NOT the mockup's 50/100/200 thresholds
- Phase 1: `/bip/[slug]` is 2-column desktop with sticky sidebar (deadline + Apply CTA + key facts); single column with sticky bottom Apply on mobile/tablet
- Phase 1: Bookmarks via heart icon + `localStorage["biphub:bookmarks"]` JSON array; no `/bookmarks` page in v1
- Phase 1: Seed catalog = 20 plausible synthetic BIPs marked `is_seed = true`; no scraping until ToS reviewed
- Plan 01-02: immutable_unaccent() wrapper required — unaccent() is STABLE not IMMUTABLE; GENERATED ALWAYS AS STORED requires IMMUTABLE; wrapper is safe (text normalization only, no side effects)
- Plan 01-02: coordinator UPDATE on bips restricted to draft/pending — WITH CHECK prevents self-promotion to approved/rejected (PITFALLS Pitfall 5 implementation)
- Plan 01-02: lib/countries.ts canonical property is `code` (not iso2) — locked contract for downstream plans 01-05, 01-06, 01-07

### Pending Todos

None yet.

### Blockers/Concerns

- Logo star ring: verify star count ≠ 12 before Phase 1 homepage component is built; document in CONTRIBUTING.md
- erasmusbip.org ToS: review before any seed scraping script is written; fallback is coordinator-outreach seed strategy
- `@supabase/ssr` is `^0.x` beta — pin exact minor version; monitor changelog before upgrading
- Zod v4 / `@hookform/resolvers` compatibility — recheck before Phase 2 starts

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-05-09
Stopped at: Plan 01-02 complete — all tasks done, SUMMARY.md committed
Resume file: .planning/phases/01-discovery-foundation/01-03-PLAN.md
Resume instructions: Run `npx supabase status` to verify local stack is running, then execute Plan 01-03 (seed catalog — 20 synthetic BIPs)
