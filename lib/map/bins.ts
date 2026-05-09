/**
 * Choropleth tier classification for the homepage EuropeMap (D-05 / D-06).
 *
 * !!! PITFALLS Pitfall 13 — Tailwind v4 dynamic class purging:
 * The fillClass strings below MUST be FULL LITERALS. NEVER concatenate them
 * with template literals (e.g. `fill-bip-tier-${n}`) — Tailwind's static
 * scanner cannot resolve those, and the classes get purged in production.
 *
 * Tier semantics are stable across the dataset's lifetime; rebinning is a
 * single edit here per 01-CONTEXT.md "Specifics".
 *
 * Safelist anchor: all 6 fill-class literals appear in TIER_FILL_CLASSES and
 * TIERS[].fillClass so the Tailwind v4 static scanner discovers them.
 */

export type TierIndex = 0 | 1 | 2 | 3 | 4 | 5

export type Tier = {
  index: TierIndex
  min: number
  max: number          // inclusive; Infinity for tier 5
  fillClass: string    // FULL Tailwind class literal — no concatenation
  label: string        // legend label (UI-SPEC line 211)
}

export const TIERS: ReadonlyArray<Tier> = [
  { index: 0, min: 0,  max: 0,        fillClass: 'fill-bip-tier-0', label: '0' },
  { index: 1, min: 1,  max: 1,        fillClass: 'fill-bip-tier-1', label: '1' },
  { index: 2, min: 2,  max: 3,        fillClass: 'fill-bip-tier-2', label: '2-3' },
  { index: 3, min: 4,  max: 6,        fillClass: 'fill-bip-tier-3', label: '4-6' },
  { index: 4, min: 7,  max: 10,       fillClass: 'fill-bip-tier-4', label: '7-10' },
  { index: 5, min: 11, max: Infinity, fillClass: 'fill-bip-tier-5', label: '11+' },
] as const

/**
 * Tailwind safelist anchor — these literals must appear in source so the
 * static scanner sees them. Plan 01-04's `app/globals.css` declares the
 * `--color-bip-tier-N` tokens; Tailwind v4 auto-generates `fill-bip-tier-N`
 * utilities when the literal class string appears anywhere in the codebase.
 */
export const TIER_FILL_CLASSES: ReadonlyArray<string> = [
  'fill-bip-tier-0',
  'fill-bip-tier-1',
  'fill-bip-tier-2',
  'fill-bip-tier-3',
  'fill-bip-tier-4',
  'fill-bip-tier-5',
] as const

/**
 * Returns the Tier for the given BIP count using fixed-bin classification.
 *
 * Used by EuropeMap to determine which fill class to apply to each country.
 * The fillClass from the returned Tier is a FULL Tailwind class literal that
 * can be applied directly to SVG <path> elements.
 *
 * @param n - number of approved BIPs for a given country
 */
export function getTierForCount(n: number): Tier {
  for (const tier of TIERS) {
    if (n >= tier.min && n <= tier.max) return tier
  }
  // Fallback — unreachable for valid non-negative input
  return TIERS[0]
}
