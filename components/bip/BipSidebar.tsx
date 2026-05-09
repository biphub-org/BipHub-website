'use client'

import type { BipDetail } from '@/lib/queries/bipDetail'
import { DeadlineBadge } from '@/components/bip/DeadlineBadge'
import { BipApplyCta } from '@/components/bip/BipApplyCta'
import { ShareButton } from '@/components/bip/ShareButton'
import { BookmarkHeartIsland } from '@/components/bip/BookmarkHeartIsland'

/**
 * BipSidebar — sticky 340px right column at lg+ (D-09 / UI-SPEC line 357).
 *
 * Renders:
 *   - Deadline countdown chip (DeadlineBadge)
 *   - Apply CTA button (full sidebar width, BipApplyCta)
 *   - Key facts list (ECTS / Dates / Language / CEFR / City) — DETL-05
 *   - Action row: ShareButton + BookmarkHeartIsland
 *
 * Sticky offset: top-[88px] accounts for 68px StickyNav + 20px breathing room.
 * Hidden on mobile (hidden lg:block) — mobile uses BipMobileApplyBar.
 */
export function BipSidebar({ bip }: { bip: BipDetail }) {
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/bip/${bip.slug}`
      : `https://biphub.eu/bip/${bip.slug}`

  const host = bip.host_university
  const datesLine =
    bip.physical_start_date && bip.physical_end_date
      ? `${bip.physical_start_date} → ${bip.physical_end_date}`
      : (bip.physical_start_date ?? 'TBC')

  return (
    <aside
      aria-label="Key facts"
      className="hidden lg:block sticky top-[88px] self-start"
    >
      <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
        {/* Deadline chip */}
        <DeadlineBadge deadline={bip.application_deadline} />

        {/* Apply CTA — full sidebar width */}
        <div className="mt-4">
          <BipApplyCta bip={bip} fullWidth />
        </div>

        {/* Key facts list */}
        <div className="mt-6 pt-6 border-t border-border">
          <h2 className="text-sm font-bold text-ink mb-3">Key facts</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">ECTS</dt>
              <dd className="text-ink font-semibold">{bip.ects_credits ?? '–'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Dates</dt>
              <dd className="text-ink text-right">{datesLine}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Language</dt>
              <dd className="text-ink font-semibold">
                {bip.language_of_instruction ?? '–'}
              </dd>
            </div>
            {/* DETL-05 CEFR language level */}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Min level</dt>
              <dd className="text-ink font-semibold">
                {bip.language_level_min ?? '–'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">City</dt>
              <dd className="text-ink text-right">
                {bip.host_city ?? host?.city ?? '–'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Action row: Share + Bookmark */}
        <div className="mt-6 pt-6 border-t border-border flex items-center gap-2">
          <ShareButton title={bip.title} url={url} />
          <BookmarkHeartIsland slug={bip.slug} />
        </div>
      </div>
    </aside>
  )
}
