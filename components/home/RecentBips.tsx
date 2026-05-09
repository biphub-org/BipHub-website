/**
 * RecentBips — DISC-05, UI-SPEC line 330.
 *
 * Server-side threshold gate: if totalApprovedCount < 6, renders RecentBipsTeaser.
 * Otherwise: renders 3-card grid with section header + "View all →" ghost link.
 *
 * The threshold logic MUST be in the RSC (this file) so no client-side fetching
 * or conditional loading is needed.
 */

import Link from 'next/link'
import type { BipWithRelations } from '@/lib/types/bip'
import { BipCard } from '@/components/bip/BipCard'
import { RecentBipsTeaser } from './RecentBipsTeaser'
import { Eyebrow } from './Eyebrow'
import { cn } from '@/lib/utils/cn'

interface RecentBipsProps {
  totalApprovedCount: number
  bips: BipWithRelations[]
}

export function RecentBips({ totalApprovedCount, bips }: RecentBipsProps) {
  // DISC-05 threshold: render teaser when fewer than 6 approved BIPs
  if (totalApprovedCount < 6) {
    return <RecentBipsTeaser />
  }

  return (
    <section className="py-24 bg-white border-t border-border">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Section header */}
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3 justify-center">Recently added</Eyebrow>
          <h2
            className="font-bold text-ink"
            style={{
              fontSize: 'clamp(30px, 4vw, 44px)',
              lineHeight: '1.15',
              letterSpacing: '-1px',
            }}
          >
            Fresh opportunities
          </h2>
          <p className="mt-3 text-[17px] text-muted">
            New BIPs added in the past two weeks. Apply early — popular ones fill quickly.
          </p>
          <Link
            href="/bips"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-eu-blue hover:text-eu-blue-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2 rounded-sm"
          >
            View all →
          </Link>
        </div>

        {/* 3-card grid — 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {bips.map((bip) => (
            <BipCard key={bip.id} bip={bip} />
          ))}
        </div>

        {/* Bottom CTA — live count */}
        <div className="mt-14 text-center">
          <Link
            href="/bips"
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-pill px-6 text-sm font-semibold',
              'bg-transparent text-eu-blue border border-eu-blue transition-all duration-200 ease-out',
              'hover:bg-eu-blue hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
            )}
          >
            Browse all {totalApprovedCount} BIPs →
          </Link>
        </div>
      </div>
    </section>
  )
}
