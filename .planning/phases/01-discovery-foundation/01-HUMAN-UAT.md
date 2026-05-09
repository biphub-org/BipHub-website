---
status: partial
phase: 01-discovery-foundation
source: [01-VERIFICATION.md]
started: 2026-05-09T02:35:00Z
updated: 2026-05-09T02:35:00Z
---

## Current Test

[awaiting human testing — items 1, 2, 3, 4, 6 below]

## Tests

### 1. Visual homepage fidelity (DISC-01..07)
expected: Open http://localhost:3000 after `supabase start && npm run dev` (or `npm start` after `npm run build`). Confirm all 7 sections render against the biphub-homepage.html mockup: Hero with gold underline, EU palette (#003399 blue / #FFCC00 gold / #0a1735 ink), 96 px section padding, pill CTAs, StickyNav at 68 px, Inter typography, 11-star LogoMark visible, then EuropeMap → CategoriesBar → StatsSection (3 count-up stats with real numbers) → RecentBips (≥3 BipCards because 20 ≥ 6) → HowItWorks → UniversityCTA. Footer disclaimer present exactly once at the bottom.
result: [pending]

### 2. Interactive EuropeMap (DISC-02)
expected: Same dev server. The 29-country choropleth should render. Germany should appear at a higher intensity tier than single-BIP countries. Hovering a country shows a tooltip with the count. Clicking a country navigates to `/bips?country=XX`. Tier-0 countries (no BIPs) appear pale gray. The MapLegend shows 5 swatches (tier 0 omitted from the legend). The keyboard `<select>` fallback is reachable via Tab and functional.
result: [pending]

### 3. Lighthouse > 90 + LCP < 1.5 s on 4G (FOUN-02)
expected: Lighthouse Performance / Accessibility / SEO ≥ 90 on `/` and `/bips`. LCP under 1.5 s on simulated 4G. Run from Chrome DevTools Lighthouse panel against the production build (`npm run build && npm start`), not dev.
result: [pending]

### 4. WCAG AA keyboard navigation (FOUN-03)
expected: All filter inputs, sort dropdown, pagination, EuropeMap `<select>` fallback, BipCard heart, ShareButton, and Apply CTA reachable via Tab in logical order with visible focus rings. ARIA labels on every interactive element. Skip-link reaches the main content.
result: [pending]

### 5. Per-BIP OG image (DETL-10)
expected: GET `/bip/<slug>/opengraph-image-<hash>?<query>` returns a 1200×630 PNG with BIP title, university name, city/country, ECTS gold chip, and BipHub wordmark using bundled Inter (no fonts.googleapis.com network request).
result: passed
notes: Auto-verified by orchestrator on 2026-05-09T02:30:00Z against `npm run build && npm start` on port 3098. Curl returned `200 ct=image/png size=89752`; `file` reports `PNG image data, 1200 x 630, 8-bit/color RGBA, non-interlaced`. The Satori `display: flex` regression on the ECTS chip was discovered and fixed in commit 9aeb554 before this verification.

### 6. Mobile responsive layout
expected: At <1024 px viewport on `/bips`, the desktop sidebar hides and a "Filters" button reveals a Vaul bottom drawer with the same filter widgets and a sticky "Show N results" footer. On `/bip/[slug]` at <1024 px, the sticky bottom Apply bar shows the deadline label + CTA. At ≥1024 px, the desktop 2-col layout with the 340 px sticky sidebar is visible.
result: [pending]

## Summary

total: 6
passed: 1
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
