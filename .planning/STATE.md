---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: "Plan 01-07 Task 4 — human-verify checkpoint. Visit http://localhost:3011/bip/responsible-ai-business-strategy-leuven-2026 to verify detail page end-to-end (14 verification steps)."
last_updated: "2026-05-09T15:01:02.748Z"
last_activity: 2026-05-09
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 15
  completed_plans: 15
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-08)

**Core value:** Students can reliably discover Erasmus+ BIPs by country, field of study, and dates, and universities can self-service list their BIPs through a fast, professional submission flow with admin review.
**Current focus:** Phase 02 — coordinator-auth-submission

## Current Position

Phase: 3
Plan: Not started
Status: Executing Phase 02
Last activity: 2026-05-09

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 15
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 8 | - | - |
| 02 | 7 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01 P04 | 40min | 2 tasks | 9 files |
| Phase 01 P05 | 90min | 2 tasks | 21 files |
| Phase 01 P07 | 150min | 3 tasks | 22 files |

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
- Plan 01-03: delete-first idempotency chosen over ON CONFLICT DO NOTHING for seed.sql — simpler with FK chains
- Plan 01-03: verify-seed.ts uses service-role key — RLS bypass correct for local-dev audit; script is outside app/ lib/ components/ so ESLint won't pick it up
- Plan 01-03: green_travel=7 rows (target 6±1=5-7); en×16 language count (en≥10 required, passes); both within verifier range
- [Phase ?]: Plan 01-04: 11-star LogoMark — count locked at 11 to avoid EC 12-star emblem trademark issue (CLAUDE.md never-do)
- [Phase ?]: Plan 01-04: EC disclaimer migrated from app/(public)/page.tsx (temp Plan 01-01) to components/home/Footer.tsx; Footer is rendered inside (public)/layout.tsx so all 3 routes inherit it
- [Phase ?]: Plan 01-04: Tailwind md breakpoint overridden to 60rem (960px) via @theme inline per UI-SPEC line 462-468; all downstream plans (01-05, 01-06, 01-07) inherit this
- [Phase ?]: Plan 01-04: lib/utils.ts (shadcn) and lib/utils/cn.ts (plan-required) both export cn from same source — chosen to keep shadcn add commands working without rewiring
- Plan 01-08: middleware uses getClaims() only — Phase 1 has zero auth redirects (D-12, Pitfall 2)
- Plan 01-08: ESLint no-restricted-imports rule prevents lib/supabase/admin from being imported outside app/(admin)/ and the file itself; synthetic violation test confirmed rule fires
- Plan 01-08: migration 00008 is additive — adds REVOKE EXECUTE security hardening and backfill on top of 00002's existing sync_role_to_app_metadata() trigger (trigger already covers INSERT+UPDATE OF role correctly)
- Plan 01-08: CookieOptions type imported explicitly in middleware.ts setAll() — TypeScript strict mode requires explicit parameter types (Rule 1 fix)
- Plan 01-05: EuropeMap is dynamic + ssr:false in 'use client' EuropeMapWrapper; Next.js 15 rejects ssr:false in RSC — wrapper pattern is the correct fix
- Plan 01-05: motion via LazyMotion only (StatsSection count-up); no top-level motion import anywhere
- Plan 01-05: bookmark store uses Zustand with manual hydrate()/toggle() and localStorage key 'biphub:bookmarks'; mount-effect hydration guard prevents SSR mismatch
- Plan 01-05: choropleth bins lookup is a static lookup object in TIERS[].fillClass and TIER_FILL_CLASSES (no template literals); class names match @theme inline tier tokens from Plan 01-04
- Plan 01-06: text search uses .textSearch('search_vector', q, { type: 'websearch', config: 'english' }) — backed by GIN index on search_vector tsvector from 01-02; no separate RPC needed
- Plan 01-06: pagination is numbered 24/page; first page is ?page=1 (NOT 0); page=1 drops the param for clean URLs
- Plan 01-06: all filters parse via Zod BipFilterSchema.safeParse — invalid values default silently to no-filter; never throw
- Plan 01-06: BipFiltersDrawer uses vaul-based shadcn Drawer for mobile; BipFiltersSidebar is 'use client' for desktop
- Plan 01-06: shadcn accordion/slider use @base-ui/react (not @radix-ui) — Accordion needs `multiple` prop not `type='multiple'`; Slider onValueChange is (v: number | readonly number[])
- Plan 01-06: Button.tsx extended with asChild support (@radix-ui/react-slot) and shadcn compat variant/size aliases (outline, secondary, destructive, link, icon, default)
- Plan 01-07: ISR strategy revalidate=3600 + dynamicParams=true; Phase 3 admin approve/reject will call revalidatePath() to bust cache immediately
- Plan 01-07: Inter TTF fonts (inter-bold.ttf + inter-semibold.ttf) from unpkg.com/inter-font@3.19.0 committed to public/fonts (OFL 1.1); not fetched from googleapis at OG image runtime (GDPR + Pitfall 15)
- Plan 01-07: ShareButton degradation chain: navigator.share (canShare check) → navigator.clipboard.writeText (Sonner toast) → silently unsupported
- Plan 01-07: BipApplyCta branches: closed (disabled button) | type=url (Link target=_blank) | type=contact (mailto anchor)
- Plan 01-07: Partner display: registered partners show university.name (country); free-text raw partners append (unverified) suffix to partner_name_raw
- Plan 01-07: getAllPublishedSlugs uses direct REST fetch (no createClient/cookies dependency) — avoids cookies() outside request scope during generateStaticParams at build time

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
| Automation | Evaluate n8n for v2 outreach automation (coordinator seed outreach, multi-channel admin digests, AI moderation) — only if integration count grows beyond Resend | Deferred to v2 | 2026-05-11 |

## Session Continuity

Last session: 2026-05-09T02:25:06Z
Stopped at: Plan 01-07 Task 4 — human-verify checkpoint. Visit http://localhost:3011/bip/responsible-ai-business-strategy-leuven-2026 to verify detail page end-to-end (14 verification steps).
Resume file: None
Resume instructions: After human verification passes, Phase 1 is complete. Run /gsd-execute-phase 2 to begin coordinator auth + submission.
