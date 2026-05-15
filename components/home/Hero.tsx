'use client'

/**
 * Hero — dark, interactive variant.
 *
 * Layered painting (bottom → top):
 *   1. Deep ink base (#0a1735)
 *   2. Soft static gold halo at bottom-right + blue halo at top-center
 *   3. 28px dot grid in white/4 for texture
 *   4. Cursor-following gold spotlight (state + mousemove)
 *   5. Sparse gold "stars" with a slow twinkle
 *   6. Existing animated blue/gold drift blobs
 *
 * All text + outline-button colors are inverted for the dark surface.
 *
 * Motion: LazyMotion + domAnimation per Pitfall 12. The h1 still only
 * translates (never animates opacity) so LCP is unaffected.
 *
 * Accessibility: prefers-reduced-motion disables the cursor spotlight,
 * the star twinkle, and the floating blobs via MotionConfig — only the
 * static gradient base remains.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconCheck } from '@tabler/icons-react'
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'motion/react'
import { cn } from '@/lib/utils/cn'
import { HeroSearchBar } from './HeroSearchBar'

const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const liftOnly: Variants = {
  hidden: { y: 12 },
  visible: { y: 0 },
}

// Fixed positions so the stars don't reshuffle on every render. Coordinates
// are percentages of the section box, chosen to avoid the central content.
const STARS = [
  { left: '6%', top: '18%', size: 3, delay: 0 },
  { left: '14%', top: '62%', size: 2, delay: 1.2 },
  { left: '22%', top: '32%', size: 4, delay: 0.4 },
  { left: '34%', top: '80%', size: 2, delay: 2.1 },
  { left: '78%', top: '20%', size: 3, delay: 0.8 },
  { left: '88%', top: '46%', size: 4, delay: 1.6 },
  { left: '92%', top: '70%', size: 2, delay: 2.6 },
  { left: '68%', top: '12%', size: 2, delay: 3.0 },
  { left: '58%', top: '88%', size: 3, delay: 0.2 },
  { left: '46%', top: '8%', size: 2, delay: 2.4 },
] as const

export function Hero() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <HeroInner />
      </MotionConfig>
    </LazyMotion>
  )
}

function HeroInner() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [cursor, setCursor] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = sectionRef.current
    if (!el) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      setCursor({ x: e.clientX - r.left, y: e.clientY - r.top, active: true })
    }
    const leave = () => setCursor((c) => ({ ...c, active: false }))
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border pt-24 pb-20"
      style={{
        // Layered background: ink base + soft halos + dot grid.
        backgroundColor: '#0a1735',
        backgroundImage: [
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0, 51, 153, 0.55) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 92% 100%, rgba(255, 204, 0, 0.18) 0%, transparent 60%)',
          'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: 'auto, auto, 28px 28px',
      }}
    >
      {/* Cursor-following gold spotlight — fades in once the pointer enters the
          section so it never flashes from (0,0) on first paint. Hidden when
          prefers-reduced-motion is set (cursor.active stays false). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: cursor.active ? 1 : 0,
          background: `radial-gradient(360px circle at ${cursor.x}px ${cursor.y}px, rgba(255, 204, 0, 0.18), transparent 70%)`,
        }}
      />

      {/* Sparse gold stars — slow twinkle */}
      {STARS.map((s, i) => (
        <m.span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-eu-gold"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: '0 0 6px rgba(255, 204, 0, 0.7)',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}

      {/* Existing drifting blue blob — punched up for the dark surface */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[1000px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(26, 77, 171, 0.35) 0%, transparent 60%)',
        }}
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Existing drifting gold blob — bottom-right */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-100px] right-[-100px] h-[420px] w-[420px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 204, 0, 0.18) 0%, transparent 70%)',
        }}
        animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-[820px] px-4 text-center md:px-6">
        {/* Pill tag with pulsing "New" badge — kept on a translucent dark surface */}
        <m.div
          className="mb-7 inline-flex items-center gap-2.5 rounded-pill border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <m.span
            className="rounded-pill bg-eu-gold px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3px] text-ink"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255, 204, 0, 0.45)',
                '0 0 0 8px rgba(255, 204, 0, 0)',
                '0 0 0 0 rgba(255, 204, 0, 0)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          >
            New
          </m.span>
          <span className="text-[13px] font-medium text-white/80">
            Free, open-source database for Erasmus+ BIPs
          </span>
        </m.div>

        {/* H1 — LCP-safe: opacity stays 1, only translates */}
        <m.h1
          className="mb-6 font-bold text-white"
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
          <span className="text-eu-gold">international experience</span>
        </m.h1>

        {/* Lede */}
        <m.p
          className="mx-auto mb-9 max-w-[600px] text-[19px] leading-[1.55] text-white/75"
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
              'bg-eu-gold text-ink border border-eu-gold transition-all duration-200 ease-out',
              'hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(255,204,0,0.35)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
            )}
          >
            Browse all BIPs
          </Link>
          <Link
            href="/register"
            className={cn(
              'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-7 text-base font-semibold whitespace-nowrap',
              'bg-white/5 text-white border border-white/25 transition-all duration-200 ease-out',
              'hover:bg-white/10 hover:border-white/40 hover:-translate-y-px',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
            )}
          >
            List your BIP
          </Link>
        </m.div>

        {/* Trust row */}
        <m.div
          className="flex flex-wrap items-center justify-center gap-8 text-[13px] text-white/70"
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
  )
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <IconCheck size={16} className="text-eu-gold" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
