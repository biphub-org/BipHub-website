/**
 * UniversityCTA — DISC-07, UI-SPEC line 335.
 *
 * Dark navy card with gold and blue radial accents.
 * Two-column layout on desktop (1.4fr 1fr), single column on mobile.
 * Primary CTA: gold "Get started — it's free" → /register
 * Secondary CTA: ghost on dark "See sample listing" → /bip/{sampleSlug}
 *
 * 3 mock feature rows in the right column.
 * Copy from UI-SPEC Copywriting Contract lines 232-236.
 */

import Link from 'next/link'
import { Eyebrow } from './Eyebrow'
import { cn } from '@/lib/utils/cn'

interface UniversityCTAProps {
  sampleSlug: string
}

const FEATURE_ROWS = [
  {
    title: '10-minute setup',
    subtitle: 'From signup to live listing',
  },
  {
    title: 'European reach',
    subtitle: 'Students from 27+ countries',
  },
  {
    title: 'Quality reviewed',
    subtitle: 'Every listing checked by our team',
  },
]

export function UniversityCTA({ sampleSlug }: UniversityCTAProps) {
  return (
    <section className="border-t border-border bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Inner dark navy card */}
        <div
          className="relative overflow-hidden rounded-lg bg-ink"
          style={{ padding: '64px 56px' }}
        >
          {/* Radial accent top-right (blue) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-[300px] w-[300px]"
            style={{
              background: 'radial-gradient(circle at top right, rgba(0, 51, 153, 0.4) 0%, transparent 70%)',
            }}
          />
          {/* Radial accent bottom-left (gold) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-[250px] w-[250px]"
            style={{
              background: 'radial-gradient(circle at bottom left, rgba(255, 204, 0, 0.15) 0%, transparent 70%)',
            }}
          />

          {/* Two-column grid on desktop */}
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
            {/* Left column */}
            <div className="flex flex-col justify-center">
              <Eyebrow className="mb-4 text-white/70 [&>span:first-child]:bg-eu-gold">
                <span className="text-white/70">For universities</span>
              </Eyebrow>
              <h2
                className="mb-4 font-bold text-white"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  lineHeight: '1.15',
                  letterSpacing: '-1px',
                }}
              >
                List your BIP and reach thousands of students
              </h2>
              <p className="mb-8 text-[17px] leading-[1.6] text-white/70">
                A free, modern platform designed by Erasmus+ coordinators, for Erasmus+ coordinators.
                Submit your BIP, manage applications, and get visibility across Europe.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className={cn(
                    'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-7 text-base font-semibold whitespace-nowrap',
                    'bg-eu-gold text-ink border border-eu-gold transition-all duration-200 ease-out',
                    'hover:bg-eu-gold-dark hover:-translate-y-px',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
                  )}
                >
                  Get started — it&apos;s free
                </Link>
                <Link
                  href={`/bip/${sampleSlug}`}
                  className={cn(
                    'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-7 text-base font-semibold whitespace-nowrap',
                    'bg-transparent text-white border border-white/30 transition-all duration-200 ease-out',
                    'hover:border-white/60 hover:bg-white/10',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
                  )}
                >
                  See sample listing
                </Link>
              </div>
            </div>

            {/* Right column — feature rows */}
            <div className="flex flex-col justify-center gap-5">
              {FEATURE_ROWS.map((row) => (
                <FeatureRow key={row.title} title={row.title} subtitle={row.subtitle} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4">
      {/* Gold icon square */}
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-eu-gold">
        <span className="text-[20px] text-ink font-bold" aria-hidden="true">✓</span>
      </div>
      <div>
        <div className="text-[15px] font-semibold text-white">{title}</div>
        <div className="mt-0.5 text-[13px] text-white/60">{subtitle}</div>
      </div>
    </div>
  )
}
