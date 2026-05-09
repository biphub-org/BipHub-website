/**
 * Homepage — DISC-01 through DISC-07.
 *
 * Async RSC that fetches all homepage data server-side, then passes typed props
 * to each section component. Client islands (EuropeMap, CategoriesBar, StatsSection,
 * BookmarkHeartIsland) receive pre-fetched data as props.
 *
 * Architecture: Pattern 1 from ARCHITECTURE.md — RSC data fetcher + client island props.
 *
 * revalidate = 3600: Next.js ISR — homepage data refreshes hourly without full rebuild.
 *
 * PITFALLS:
 *   Pitfall 11: EuropeMap loaded via dynamic({ ssr: false }) — never imported statically.
 *   Pitfall 12: StatsSection animation via LazyMotion (wrapped inside StatsSection).
 *   Pitfall 13: Choropleth tier fill classes are full string literals in lib/map/bins.ts.
 */

import { createClient } from '@/lib/supabase/server'
import {
  getApprovedBipCount,
  getBipCountsByCountry,
  getBipCountsByField,
  getRecentBips,
  getStatsSnapshot,
} from '@/lib/queries/homepage'
import { Hero } from '@/components/home/Hero'
import { CategoriesBar } from '@/components/home/CategoriesBar'
import { StatsSection } from '@/components/home/StatsSection'
import { RecentBips } from '@/components/home/RecentBips'
import { HowItWorks } from '@/components/home/HowItWorks'
import { UniversityCTA } from '@/components/home/UniversityCTA'
// EuropeMapWrapper is a 'use client' component that hosts the dynamic({ ssr: false }) import.
// Next.js 15 requires ssr:false dynamic() to live in a client component boundary.
import { EuropeMapWrapper } from '@/components/home/EuropeMapWrapper'

// 1-hour ISR: homepage data refreshes hourly without a full rebuild.
// Coordinate submits (Plan 02+) revalidatePath('/') explicitly.
export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()

  // Parallel data fetching — all queries run concurrently via Promise.all
  const [count, countsByCountry, countsByField, recentBips, stats] = await Promise.all([
    getApprovedBipCount(supabase),
    getBipCountsByCountry(supabase),
    getBipCountsByField(supabase),
    getRecentBips(supabase, 3),
    getStatsSnapshot(supabase),
  ])

  // First seed slug for UniversityCTA "See sample listing" CTA.
  // Use the most-recent approved BIP slug as a stable choice.
  const firstSampleSlug = recentBips[0]?.slug ?? 'sustainable-cities-munich-2026'

  return (
    <>
      {/* DISC-01: Hero with gold underline accent */}
      <Hero />

      {/* DISC-02: Interactive Europe choropleth map (ssr:false via EuropeMapWrapper client boundary) */}
      <section id="by-country" className="bg-bg-soft py-16 border-t border-b border-border md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <EuropeMapWrapper countsByCountry={countsByCountry} />
        </div>
      </section>

      {/* DISC-03: 8-category field-of-study bar */}
      <CategoriesBar countsByField={countsByField} />

      {/* DISC-04: Live stats with count-up animation (LazyMotion inside StatsSection) */}
      <StatsSection stats={stats} />

      {/* DISC-05: Recent BIPs with ≥6 threshold gate */}
      <RecentBips totalApprovedCount={count} bips={recentBips} />

      {/* DISC-06: How it works — 3 steps */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* DISC-07: Dark navy university CTA */}
      <UniversityCTA sampleSlug={firstSampleSlug} />
    </>
  )
}
