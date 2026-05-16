# BipHub — Session Handoff

> Snapshot of where the project stands at end-of-session **2026-05-16**.
> Read this before reading any other doc. CLAUDE.md still holds the
> long-lived project rules; HANDOFF is what changed recently and what's
> open. When this file goes stale (after the next big push), overwrite it.

---

## Where we are

- **Live**: <https://biphub-website.vercel.app>
- **Branch model**: push to `main` → Vercel auto-deploys production. No PR workflow.
- **Database**: hosted Supabase project `zbvcpiwbopmfbjfhzprw` — **NOT Docker**. The user has stopped using `supabase start`. `.env.local` points at hosted URL + JWT keys; all 14 migrations are applied; the 20-BIP seed is already in the hosted DB. `supabase/seed.sql` is restored to its full 878-line state for local-dev re-runs but is **not** re-applied to production.
- **Admin user (created this session)**: `admin@test.com` / `admin123`.
  - Auth row exists, `email_confirmed=true`, `app_metadata.role='admin'`, matching `profiles.role='admin'`.
  - **Password is weak** — flag to user before public announcement.
- **Vercel env vars set**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://biphub-website.vercel.app`.
- **Supabase Auth URL config**: site URL + redirect-URL allowlist updated for the production domain + localhost + `biphub-website-*.vercel.app/**` previews.
- **Vercel CLI is NOT installed** on this machine and the project is not linked locally. To run `vercel env` or `vercel deploy` from a session, install + link first.

---

## Critical open items (block real launch)

1. **Custom SMTP in Supabase Auth.** The built-in mailer is throttled to ~2 emails/hour. Verification + password-reset will fail for the third concurrent user. Walk-through (incomplete) lives at `https://supabase.com/dashboard/project/zbvcpiwbopmfbjfhzprw/auth/templates → SMTP Settings`. User skipped Resend signup mid-session — the friction was domain verification (`noreply@biphub.eu` is hardcoded in `lib/email/send.ts:100` but user doesn't own that domain). **Options when this resumes**: (a) buy `biphub.eu` and verify in Resend, (b) change the sender in `lib/email/send.ts` to `noreply@hexonasystems.com` and verify that.

2. **End-to-end smoke** never run against hosted: admin approves a real coordinator submission, coordinator gets the email. Will fail at the email step until SMTP is set up; `lib/email/send.ts` falls back to `console.log` when `RESEND_API_KEY` is unset (Phase 3 D-15).

---

## Locked decisions this session

- **Demo data: keep as-is.** All 20 launch BIPs stay `is_seed=true` with the per-card + per-detail "Demo data" pill. Ages out automatically as real submissions land (real BIPs ship `is_seed=false`). Don't strip the pill and don't try to replace the 20 with real BIPs until the erasmusbip.org ToS review or coordinator outreach completes — both still open per CLAUDE.md. Tooltip parity added on `BipCard` so hover surfaces the launch-context explanation the same way `BipHeader` already does.
- **Favicon.** `app/icon.svg` matches `LogoMark` (navy `#003399` rounded square, 11-star gold ring, white "B"). Auto-served via Next.js App Router file convention; no `<link>` injection needed. `apple-icon.png` and legacy `.ico` intentionally deferred.

## Polish queue (won't block launch)

- **Lighthouse capture** — Plan 04-06 D-20. Procedure at `.planning/phases/04-polish-static-content-performance-hardening/lighthouse/README.md`. Manual; user runs from their browser.
- **axe-DevTools sweep** — Plan 04-07 D-27. 13 routes. Procedure at `.planning/phases/04-.../axe/README.md`.
- **OG image flag (parked)** — `app/(public)/bip/[slug]/opengraph-image.tsx` renders the country *name* in the right column because Satori doesn't support SVG `<img>` (verified — was throwing 500 in commit 682fe5d, reverted in 9f5c1fa). Three viable fixes: wait for Satori SVG support, rasterize SVG→PNG with `@resvg/resvg-js`, or hand-convert the 33 flags to Satori-renderable JSX primitives.
- **Hero interactivity tuning** — current values: `INFLUENCE_RADIUS=170`, `MAX_PUSH=28`, `LINK_DISTANCE=220` (constants at top of `components/home/Hero.tsx`). User preferred the milder version over the "impossible to miss" one (7386a17 was reverted in 18108ed). Don't dial it harder without asking.
- **Favicon** is still the Vercel default.

---

## What this session changed

### Map & flags
- `scripts/build-eu-topojson.ts`: added Liechtenstein → 33 countries on the choropleth.
- Removed the "Filter by country" `<select>` keyboard fallback under the map (`MapKeyboardFallback.tsx` deleted; matching e2e spec also removed). Keyboard a11y is now handled by `tabIndex={0}` + Enter/Space on `<Geography>` elements.
- New `components/ui/country-flag.tsx` — renders `public/flags/<CODE>.svg`. Replaces `getCountryFlagEmoji` everywhere visible (BipCard, EuropeMap tooltip, admin TopCountriesCard, BipHeader subtitle, partner-university chips in BipBody). OG image still uses text — see polish queue.

### New pages
- `app/not-found.tsx` (global 404), `app/error.tsx` (root error boundary).
- `app/(public)/about/`, `app/(public)/terms/`, `app/(public)/guides/` + three seed guides + `lib/content/guides.ts` registry + `components/guides/GuideShell.tsx`.
- Footer + StickyNav rewired. Nav links are now `Browse BIPs · What is a BIP? · Guides`.

### Hosted-Supabase migration (Docker → cloud)
- `.env.local` repointed at the hosted project; verified `npm run dev` renders 20 BIPs from hosted PostgREST.
- Admin user created via Auth Admin API + `profiles` insert.

### SEO / launch infrastructure
- `app/robots.ts`, `app/sitemap.ts` (uses `getAllPublishedSlugs` + the guides registry, `revalidate=3600`).
- README rewritten from a Phase-1 stub to a v1 landing.

### Auth & UX fixes
- Sign-in white-screen: `lib/actions/auth.ts::signInAction` now checks profile-complete and redirects straight to `/onboarding` or `/dashboard`, skipping the bounce. `app/(dashboard)/loading.tsx` added as a stationary skeleton for the cold-start window.
- `/auth/callback` route handler now surfaces the real Supabase error via `console.error` + `&reason=` query param instead of silently dropping to `verification_failed`.
- `/verify-email` "Resend verification" link replaced with a real button: new `resendVerificationAction` in `lib/actions/auth.ts` + `components/auth/ResendVerificationButton.tsx` (30s cooldown, user-enumeration-safe). **Untested end-to-end** because of the SMTP rate limit.
- `suppressHydrationWarning` added on `components/ui/button.tsx`, `components/ui/select.tsx`, and `components/bip/BookmarkHeartIsland.tsx` — silences the `fdprocessedid` warnings injected by the user's browser extension. Real users without that extension never see a mismatch.

### Filter sidebar polish
- Width 280px → **240px** on `/bips` (page + loading skeleton).
- Country filter no longer auto-opens (`defaultValue={['country']}` removed).
- Country list re-rendered as a **vertical alphabetised checkbox column** (was a wrapping pill grid). 320px max-height with overflow.

### Homepage aesthetic overhaul
- **Hero**: dark `#0a1735` base, layered halos (blue top + gold bottom-right), cursor-reactive **gold dot field** (28 dots, fixed positions, repel away from pointer when within `INFLUENCE_RADIUS=170`, scale + brighten), **constellation lines** between active pairs of dots within 220px of each other, **shimmering gold trail** around the "Free, open-source database for Erasmus+ BIPs" pill via a `@property --shimmer-angle` conic-gradient animation in `app/globals.css`.
- **StatsSection** repainted from `bg-eu-blue` to the same ink + halo + sparse twinkling dots pattern as the hero. Glass cards retuned to match.
- **Light sections** (map band, CategoriesBar, RecentBips) share a faint 24px `rgba(0, 51, 153, 0.05)` dot-grid background — echoes the hero's white grid in the inverse direction. CategoriesBar got promoted from a tiny `<h3>` header to the full Eyebrow + clamp-title pattern.
- Hero CTA `/login` → `/register` (was a real bug — first-time coordinators landed on a sign-in form). Trust-row copy changed from "Erasmus+ verified" (ambiguous, edged into EU-emblem territory) to "33 programme countries" + "Fully funded by Erasmus+". Stats card subtitle "+19 this month" replaced with neutral copy (the +N delta was just the total count re-rendered).

---

## Gotchas the next session will hit

- **`fdprocessedid` hydration warnings on dev** are from a browser extension on the user's machine (Bitdefender / password manager). They were silenced on three components; if they reappear on a new component, add `suppressHydrationWarning` rather than chasing it.
- **Vercel uses `NEXT_PUBLIC_SITE_URL` to build email-redirect URLs.** If you ever redeploy without that env var set, signup emails will redirect to `http://localhost:3000`.
- **Supabase emails (signup confirmation, password reset) come from Supabase's built-in mailer, NOT Resend.** The `RESEND_API_KEY` in `lib/email/send.ts` is for the app's own transactional emails (approve / reject / new-submission), which fall back to `console.log` when unset.
- **`@vnedyalk0v/react19-simple-maps`** is the locked map fork — `react-simple-maps` original is unmaintained and breaks on React 19. Don't swap it.
- **`motion`** package, never `framer-motion`. Always `import { ... } from 'motion/react'` and wrap in `LazyMotion features={domAnimation}` per Pitfall 12 in CLAUDE.md.
- **Next.js 15.5 LTS pinned**, never bump to 16 — Supabase SSR + Zod resolver compatibility issues per CLAUDE.md.
- **Hosted Supabase quirks**: every `npx supabase ...` command needs `--linked`. The Supabase CLI in dev still emits warnings about Docker not running — that's fine, no operation requires it.
- **AskUserQuestion** has been rejected by this user mid-flow twice. Memory note `feedback_delegation.md` says: when a question is a contained implementation detail, decide + explain rather than re-asking. Driver mode preferred.
- **`Screenshot*.png`** at the repo root is gitignored. Don't try to git-add it.

---

## Suggested next actions, in order

1. Resume SMTP setup (4-step walkthrough is in conversation history; pick a domain first).
2. Once SMTP works, run the admin-approve smoke test end-to-end.
3. Knock out Lighthouse + axe sweeps.

After that the v1 launch list is empty.
