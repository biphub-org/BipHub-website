'use client'

/**
 * Hero section — UI-SPEC lines 198-207 + 325.
 *
 * Motion: LazyMotion + domAnimation per Pitfall 12. MotionConfig with
 * reducedMotion="user" disables entrance + loop animations for users who
 * request reduced motion (settled by the platform, not us).
 *
 * LCP-safe: the h1 NEVER animates opacity — only transform — so the largest
 * contentful paint timestamp is unaffected.
 */

import Link from 'next/link'
import { IconCheck } from '@tabler/icons-react'
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  type Transition,
  type Variants,
} from 'motion/react'
import { cn } from '@/lib/utils/cn'
import { HeroSearchBar } from './HeroSearchBar'

const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1]

// Entrance for non-LCP elements: small lift + fade.
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// LCP-safe entrance — h1 is always visible from first paint, only translates.
const liftOnly: Variants = {
  hidden: { y: 12 },
  visible: { y: 0 },
}

export function Hero() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <section className="relative overflow-hidden bg-bg-hero border-b border-border pt-24 pb-20">
          {/* Floating radial accent — top blue blob */}
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-200px] h-[1000px] w-[1000px] -translate-x-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(0, 51, 153, 0.06) 0%, transparent 60%)',
            }}
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Floating radial accent — bottom-right gold blob */}
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 204, 0, 0.08) 0%, transparent 70%)',
            }}
            animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative mx-auto max-w-[820px] px-4 text-center md:px-6">
            {/* Pill tag with pulsing "New" badge */}
            <m.div
              className="mb-7 inline-flex items-center gap-2.5 rounded-pill border border-border-strong bg-white px-4 py-1.5 shadow-sm"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <m.span
                className="rounded-pill bg-eu-blue px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3px] text-white"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(0, 51, 153, 0.35)',
                    '0 0 0 8px rgba(0, 51, 153, 0)',
                    '0 0 0 0 rgba(0, 51, 153, 0)',
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              >
                New
              </m.span>
              <span className="text-[13px] font-medium text-ink-2">
                Free, open-source database for Erasmus+ BIPs
              </span>
            </m.div>

            {/* H1 — LCP-safe: opacity stays 1, only translates */}
            <m.h1
              className="mb-6 font-bold text-ink"
              style={{
                fontSize: 'clamp(40px, 6vw, 68px)',
                lineHeight: '1.05',
                letterSpacing: '-1.5px',
              }}
              variants={liftOnly}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
            >
              Find your next
              <br />
              <span className="text-eu-blue">international experience</span>
            </m.h1>

            {/* Lede */}
            <m.p
              className="mx-auto mb-9 max-w-[600px] text-[19px] leading-[1.55] text-muted"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.25 }}
            >
              Discover Blended Intensive Programs across Europe — short, focused, fully Erasmus+
              funded experiences combining online learning with study abroad.
            </m.p>

            {/* CTA cluster */}
            <m.div
              className="mb-14 flex flex-wrap items-center justify-center gap-3"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.35 }}
            >
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
                href="/register"
                className={cn(
                  'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-7 text-base font-semibold whitespace-nowrap',
                  'bg-transparent text-ink border border-border transition-all duration-200 ease-out',
                  'hover:border-ink hover:bg-bg-soft hover:-translate-y-px',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
                )}
              >
                List your BIP
              </Link>
            </m.div>

            {/* Trust row */}
            <m.div
              className="flex flex-wrap items-center justify-center gap-8 text-[13px] text-muted"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.45 }}
            >
              <TrustItem label="33 programme countries" />
              <TrustItem label="Fully funded by Erasmus+" />
              <TrustItem label="Open source" />
            </m.div>

            {/* Hero search bar */}
            <m.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.55 }}
            >
              <HeroSearchBar />
            </m.div>
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
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
