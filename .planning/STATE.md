---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Phase 1 plans verified (8 plans, 5 waves) — ready for `/gsd-execute-phase 1`
last_updated: "2026-05-08T23:40:17.962Z"
last_activity: 2026-05-08 -- Phase 1 execution started
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 8
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-08)

**Core value:** Students can reliably discover Erasmus+ BIPs by country, field of study, and dates, and universities can self-service list their BIPs through a fast, professional submission flow with admin review.
**Current focus:** Phase 1 — Discovery Foundation

## Current Position

Phase: 1 (Discovery Foundation) — EXECUTING
Plan: 1 of 8
Status: Executing Phase 1
Last activity: 2026-05-08 -- Phase 1 execution started

Progress: [░░░░░░░░░░] 0%

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
- Init: GeoJSON served from `/public` at runtime via `dynamic()` — never imported into JS bundle
- Init: `getClaims()` everywhere in server code — never `getSession()`; `await cookies()` in all client factories
- Init: Seed-first Phase 1 — 20 SQL-seeded approved BIPs unblock student discovery before coordinator pipeline exists
- Init: Logo star count must be verified ≠ 12 before Phase 1 homepage build
- Phase 1: `/bips` uses left sidebar (desktop) + bottom drawer (mobile), numbered pagination 24/page, default sort = deadline soonest
- Phase 1: Map choropleth uses fixed small bins (0 / 1 / 2–3 / 4–6 / 7–10 / 11+), NOT the mockup's 50/100/200 thresholds
- Phase 1: `/bip/[slug]` is 2-column desktop with sticky sidebar (deadline + Apply CTA + key facts); single column with sticky bottom Apply on mobile/tablet
- Phase 1: Bookmarks via heart icon + `localStorage["biphub:bookmarks"]` JSON array; no `/bookmarks` page in v1
- Phase 1: Seed catalog = 20 plausible synthetic BIPs marked `is_seed = true`; no scraping until ToS reviewed

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
Stopped at: Phase 1 plans verified (8 plans, 5 waves) — ready for `/gsd-execute-phase 1`
Resume file: .planning/phases/01-discovery-foundation/01-01-PLAN.md (Walking Skeleton)
