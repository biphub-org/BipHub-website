/**
 * Hero section — UI-SPEC lines 198-207 + 325.
 *
 * Full-bleed bg-hero with radial gradient pseudo-elements (rendered as absolute divs).
 * Pill tag + h1 with gold underline accent + lede + 2 CTAs + trust row + scroll indicator.
 *
 * Scroll indicator uses CSS @keyframes (defined in globals.css) — no motion lib needed.
 */

import Link from 'next/link'
import { IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils/cn'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg-hero border-b border-border pt-24 pb-20">
      {/* Radial gradient accents — rendered as absolute divs (no CSS pseudo-elements in Tailwind) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-200px] h-[1000px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 51, 153, 0.06) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 204, 0, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Hero inner — centered, max-w 820px */}
      <div className="relative mx-auto max-w-[820px] px-4 text-center md:px-6">

        {/* Pill tag */}
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-pill border border-border-strong bg-white px-4 py-1.5 shadow-sm">
          <span className="rounded-pill bg-eu-blue px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3px] text-white">
            New
          </span>
          <span className="text-[13px] font-medium text-ink-2">
            Free, open-source database for Erasmus+ BIPs
          </span>
        </div>

        {/* H1 with gold underline accent on "international experience" */}
        <h1
          className="mb-6 font-bold text-ink"
          style={{
            fontSize: 'clamp(40px, 6vw, 68px)',
            lineHeight: '1.05',
            letterSpacing: '-1.5px',
          }}
        >
          Find your next
          <br />
          <span className="relative inline-block text-eu-blue">
            international experience
            {/* Gold underline bar behind the accent text */}
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-0 right-0 -z-10 h-2 rounded-sm bg-eu-gold/85"
            />
          </span>
        </h1>

        {/* Lede */}
        <p className="mx-auto mb-9 max-w-[600px] text-[19px] leading-[1.55] text-muted">
          Discover Blended Intensive Programs across Europe — short, focused, fully Erasmus+
          funded experiences combining online learning with study abroad.
        </p>

        {/* CTA cluster */}
        <div className="mb-14 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/bips"
            className={cn(
              'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-7 text-base font-semibold whitespace-nowrap',
              'bg-eu-blue text-white border border-eu-blue transition-all duration-200 ease-out',
              'hover:bg-eu-blue-dark hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,51,153,0.25)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
            )}
          >
            Browse all BIPs
          </Link>
          <Link
            href="/login"
            className={cn(
              'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-7 text-base font-semibold whitespace-nowrap',
              'bg-transparent text-ink border border-border transition-all duration-200 ease-out',
              'hover:border-ink hover:bg-bg-soft',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
            )}
          >
            List your BIP
          </Link>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-[13px] text-muted">
          <TrustItem label="Erasmus+ verified" />
          <TrustItem label="Fully funded" />
          <TrustItem label="Open source" />
        </div>

        {/* Scroll indicator */}
        <ScrollIndicator />
      </div>
    </section>
  )
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <IconCheck size={16} className="text-eu-blue" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

function ScrollIndicator() {
  return (
    <div className="mt-16 flex items-center justify-center gap-4 text-[12px] font-medium uppercase tracking-[0.5px] text-muted-2">
      <div className="h-px w-20 bg-border-strong" aria-hidden="true" />
      {/* Mouse outline with bouncing scroll dot — CSS @keyframes scroll-bounce */}
      <div
        className="relative h-[34px] w-[22px] rounded-xl border-[1.5px] border-muted-2"
        aria-hidden="true"
        style={{}}
      >
        <style>{`
          @keyframes scroll-bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
            50% { transform: translateX(-50%) translateY(8px); opacity: 0.4; }
          }
          .scroll-dot {
            animation: scroll-bounce 2s ease infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .scroll-dot { animation: none; }
          }
        `}</style>
        <span
          className="scroll-dot absolute left-1/2 top-[6px] h-[6px] w-[3px] -translate-x-1/2 rounded-[2px] bg-muted-2"
        />
      </div>
      <span>Scroll to explore</span>
      <div className="h-px w-20 bg-border-strong" aria-hidden="true" />
    </div>
  )
}
