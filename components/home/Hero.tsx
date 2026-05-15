'use client'

/**
 * Hero — dark variant with cursor-reactive dot field.
 *
 * Layered painting (bottom → top):
 *   1. Deep ink base (#0a1735)
 *   2. Soft static blue halo at top + gold halo at bottom-right
 *   3. Sparse gold "dot field" (~28 dots) at fixed positions; each dot
 *      repels away from the pointer when within ~140px and brightens.
 *      Idle: slow staggered twinkle.
 *   4. Existing drifting blue/gold blobs for slow ambient motion
 *
 * All text + outline-button colors are inverted for the dark surface.
 *
 * Motion: LazyMotion + domAnimation per Pitfall 12. The h1 still only
 * translates (never animates opacity) so LCP is unaffected.
 *
 * Accessibility: prefers-reduced-motion freezes the dots at their base
 * positions (no repulsion, no twinkle) and disables the floating blobs.
 *
 * Performance: pointer pos is stored in a ref + flushed to state via
 * requestAnimationFrame, so we re-render the dot field at most once
 * per frame regardless of pointer event rate.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
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

// Repulsion params.
const INFLUENCE_RADIUS = 140 // px — distance within which a dot reacts
const MAX_PUSH = 24 // px — how far a dot can be pushed at zero distance

// Fixed dot positions (percent of the section box). Sized so big dots
// read at the edges and small ones don't crowd the headline.
type Dot = { x: number; y: number; size: number; delay: number }
const DOTS: ReadonlyArray<Dot> = [
  { x: 5,  y: 12, size: 4, delay: 0.0 },
  { x: 9,  y: 38, size: 2, delay: 1.4 },
  { x: 12, y: 70, size: 3, delay: 2.2 },
  { x: 16, y: 22, size: 2, delay: 0.6 },
  { x: 20, y: 88, size: 4, delay: 1.0 },
  { x: 24, y: 54, size: 3, delay: 2.8 },
  { x: 30, y: 16, size: 2, delay: 0.3 },
  { x: 33, y: 78, size: 3, delay: 1.7 },
  { x: 38, y: 40, size: 2, delay: 2.4 },
  { x: 42, y: 92, size: 2, delay: 0.9 },
  { x: 48, y: 6,  size: 3, delay: 1.5 },
  { x: 52, y: 84, size: 2, delay: 2.0 },
  { x: 58, y: 14, size: 4, delay: 0.5 },
  { x: 62, y: 50, size: 2, delay: 2.6 },
  { x: 66, y: 90, size: 3, delay: 1.1 },
  { x: 70, y: 26, size: 2, delay: 2.3 },
  { x: 75, y: 70, size: 4, delay: 0.7 },
  { x: 78, y: 40, size: 2, delay: 1.9 },
  { x: 82, y: 18, size: 3, delay: 0.2 },
  { x: 85, y: 82, size: 2, delay: 2.7 },
  { x: 88, y: 50, size: 4, delay: 1.3 },
  { x: 92, y: 30, size: 2, delay: 2.5 },
  { x: 94, y: 74, size: 3, delay: 0.4 },
  { x: 96, y: 10, size: 2, delay: 1.8 },
  { x: 36, y: 60, size: 2, delay: 3.0 },
  { x: 64, y: 8,  size: 2, delay: 0.8 },
  { x: 14, y: 50, size: 3, delay: 2.1 },
  { x: 86, y: 64, size: 2, delay: 1.2 },
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

  // Pointer pos is stored in a ref (mutated freely by every event), then
  // flushed to state at most once per frame via requestAnimationFrame to
  // keep re-renders capped at framerate.
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false })

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = sectionRef.current
    if (!el) return

    let rafId: number | null = null
    const flush = () => {
      rafId = null
      setPointer({ ...pointerRef.current })
    }
    const schedule = () => {
      if (rafId == null) rafId = requestAnimationFrame(flush)
    }

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pointerRef.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        active: true,
      }
      schedule()
    }
    const leave = () => {
      pointerRef.current = { ...pointerRef.current, active: false }
      schedule()
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border pt-24 pb-20"
      style={{
        backgroundColor: '#0a1735',
        backgroundImage: [
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0, 51, 153, 0.55) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 92% 100%, rgba(255, 204, 0, 0.18) 0%, transparent 60%)',
        ].join(', '),
      }}
    >
      {/* Cursor-reactive dot field */}
      <DotField pointer={pointer} sectionRef={sectionRef} />

      {/* Existing drifting blue blob */}
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
      {/* Existing drifting gold blob */}
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
        {/* Pill tag with pulsing "New" badge */}
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

interface DotFieldProps {
  pointer: { x: number; y: number; active: boolean }
  sectionRef: React.RefObject<HTMLElement | null>
}

function DotField({ pointer, sectionRef }: DotFieldProps) {
  // Convert each dot's percentage anchor into absolute px each render, so the
  // repulsion math runs in the same coordinate space as the pointer event.
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setBox({ w: r.width, h: r.height })
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [sectionRef])

  const placed = useMemo(() => {
    if (!box) return [] as Array<Dot & { px: number; py: number }>
    return DOTS.map((d) => ({
      ...d,
      px: (d.x / 100) * box.w,
      py: (d.y / 100) * box.h,
    }))
  }, [box])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {placed.map((d, i) => {
        const dx = d.px - pointer.x
        const dy = d.py - pointer.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const inRange = pointer.active && dist < INFLUENCE_RADIUS

        // Push intensity: 1 at distance=0, 0 at the edge of the radius.
        const intensity = inRange ? 1 - dist / INFLUENCE_RADIUS : 0
        // Normalised direction away from pointer, scaled by intensity + max push.
        const norm = dist > 0 ? 1 / dist : 0
        const pushX = inRange ? dx * norm * intensity * MAX_PUSH : 0
        const pushY = inRange ? dy * norm * intensity * MAX_PUSH : 0
        const scale = 1 + intensity * 1.2
        const opacity = inRange ? 0.95 : 0.55

        return (
          <m.span
            key={i}
            className="absolute rounded-full bg-eu-gold"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              transform: `translate(${pushX}px, ${pushY}px) scale(${scale})`,
              opacity,
              boxShadow: inRange
                ? '0 0 14px rgba(255, 204, 0, 0.85)'
                : '0 0 6px rgba(255, 204, 0, 0.5)',
              transition:
                'transform 200ms ease-out, opacity 200ms ease-out, box-shadow 200ms ease-out',
            }}
            // Subtle idle twinkle while the dot is NOT being pushed.
            animate={
              inRange ? undefined : { opacity: [0.4, 0.7, 0.4] }
            }
            transition={
              inRange
                ? undefined
                : {
                    duration: 3.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: d.delay,
                  }
            }
          />
        )
      })}
    </div>
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
