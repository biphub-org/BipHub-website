# BipHub

## What This Is

BipHub is the free, open-source database for Erasmus+ Blended Intensive Programs (BIPs) — the EU's short-term mobility format that combines a 5-30 day physical exchange abroad with a compulsory virtual learning component. It serves students discovering BIPs, university coordinators listing them, and admins reviewing submissions. The product replaces erasmusbip.org, the only existing competitor, which is a broken WordPress site with no real search or self-service.

## Core Value

Students can reliably discover BIPs by country, field of study, and dates, and universities can self-service list their BIPs through a fast, professional submission flow with admin review.

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### Public / Student-Facing
- [ ] Homepage matching `biphub-homepage.html` mockup (sticky nav, hero, interactive Europe map, field categories, stats, recent BIPs, how-it-works, university CTA, footer)
- [ ] BIP browse/listing page (`/bips`) with card grid, country/field/language/date/ECTS filters, full-text search, URL-driven filter state
- [ ] BIP detail page (`/bip/[slug]`) with full info, host + partner universities, application info, share/bookmark
- [ ] "What is a BIP?" explainer page with FAQ

#### University / Coordinator-Facing
- [ ] Authentication via institutional email with email verification (Supabase Auth + Resend)
- [ ] Multi-step BIP submission form with auto-save drafts and preview
- [ ] Coordinator dashboard listing submitted BIPs with status (draft/pending/approved/rejected) and edit access

#### Admin-Facing
- [ ] Admin panel with review queue, approve/reject with notes, listing edit, basic analytics

### Out of Scope

- **Server-side student accounts / saved BIPs** — bookmarks via localStorage only in v1
- **University-to-university messaging** — defer to v2
- **In-platform application submission** — link out to university contact
- **BIP reviews or ratings** — quality risk, defer
- **Public API** — no external consumers in v1
- **Multilingual UI** — English only for v1, i18n deferred
- **Automated BIP import from EU sources** — manual + outreach for seed data
- **Payment processing** — not needed
- **PDF export** — defer
- **University photo uploads** — gradient placeholders for v1
- **Official EU 12-star emblem** — restricted; palette only
- **n8n / workflow-automation platform** — single external integration (Resend) doesn't justify a second deploy target; `revalidatePath()` already replaces webhooks; CLAUDE.md "one-command local dev" constraint would break. Revisit only if integration count grows to 3+ (e.g., Slack digests, AI moderation, coordinator outreach automation).

## Context

- **Domain:** Erasmus+ KA131 mobility programme. BIPs are funded at ~€79/day physical mobility, min 10 / max 20 participants, organized by groups of HEIs (one host + N partners), award ECTS credits, must include collaborative online component.
- **Competitive landscape:** Single competitor (erasmusbip.org) — WordPress + embedded Google Sheet, frequently fails to load, zero filtering, no mobile, no self-service. Domain has organic SEO since ~2020.
- **Target users:** Students (any EU/Erasmus partner HEI), university Erasmus coordinators (host or partner institutions), admins (project maintainers).
- **Visual source of truth:** `biphub-homepage.html` in repo root — locks v1 homepage layout.
- **Open project:** MIT-licensed, single-command local setup (`supabase start` + `npm run dev`), CONTRIBUTING.md required.

## Constraints

- **Tech stack — Framework:** Next.js 15 App Router with TypeScript — RSC + Supabase server client integration, modern routing primitives
- **Tech stack — Database/Auth:** Supabase (Postgres + Auth + Storage + RLS) — single managed service, native row-level security, free tier viable for launch
- **Tech stack — Styling:** Tailwind CSS v4 + shadcn/ui — design-system productivity, matches mockup component patterns
- **Tech stack — Deployment:** Vercel — first-class Next.js host, edge network, preview deploys
- **Tech stack — Email:** Resend — transactional verification + admin notifications
- **Tech stack — Forms:** React Hook Form + Zod — validation matches Supabase schema constraints
- **Tech stack — Maps:** `react-simple-maps` or D3 with EU GeoJSON — replaces hand-drawn SVG paths in mockup
- **Tech stack — Animations:** Framer Motion — count-up stats, map hover, card lift
- **Visual:** EU palette (#003399 blue, #FFCC00 gold, #0a1735 ink) — deliberately communicates EU context. Inter font. 96px section padding desktop. Pill CTAs. Gold underline accent on key headline phrases.
- **Legal:** Footer must state "Independent project — not affiliated with the European Commission". Do **not** use the official 12-star EU emblem in any form.
- **Performance:** Core Web Vitals green. BIP listing < 1.5s on 4G mobile. Lighthouse > 90 on Performance, Accessibility, SEO.
- **Accessibility:** WCAG AA. Keyboard-navigable forms and map (with country list as fallback). Proper ARIA labels.
- **Security:** Supabase RLS on every table. Coordinators edit only their own BIPs. Admin role enforced server-side. No PII in public API surface.
- **SEO:** BIP detail pages SSR'd with meta tags + OG images. Slug-based URLs (`/bip/sustainable-cities-budapest-2025`).
- **Open source:** MIT license. Clean repo. CONTRIBUTING.md. One-command local dev setup.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router (not Pages) | Modern RSC + better Supabase server client integration | — Pending |
| Supabase Auth (not NextAuth) | Native RLS integration, simpler stack | — Pending |
| Cards everywhere, no tables | Mobile-first, visually consistent with mockup, competitor's table is its key failure | — Pending |
| University self-register + admin review | Quality gate without friction, scales without manual onboarding | — Pending |
| English-only v1 | Defer i18n complexity; English is BIP lingua franca | — Pending |
| LocalStorage bookmarks (no student accounts v1) | Cuts auth scope; bookmarks are low-value-per-user | — Pending |
| Slug-based BIP URLs | SEO + shareability | — Pending |
| Interactive Europe map as core feature | Discovery UX advantage over competitor's table | — Pending |
| Multi-step submission wizard | Reduces abandonment vs single long form | — Pending |
| Footer disclaimer + no EU emblem | Legal requirement around EC affiliation | — Pending |
| `biphub-homepage.html` as v1 visual source of truth | Avoids design drift during build | — Pending |
| EU palette deliberately chosen | Communicates context immediately to target users | — Pending |
| Vertical MVP slicing | Each phase delivers shipped user capability | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-08 after initialization*
