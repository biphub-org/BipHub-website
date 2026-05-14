'use client'

/**
 * StatsSection — DISC-04, UI-SPEC line 329.
 *
 * Full-bleed bg-eu-blue band with 4 stat cards.
 * Count-up animation uses `motion` (NOT `framer-motion`) via LazyMotion + domAnimation.
 * Wrapped in <LazyMotion features={domAnimation} strict> (PITFALLS Pitfall 12).
 * Uses m.div, m.span (NOT motion.div) to tree-shake down to ~4.6KB initial.
 *
 * Reduced-motion: if prefers-reduced-motion: reduce, renders final number immediately.
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useReducedMotion,
} from 'motion/react'
import { useInView } from 'motion/react'
import { Eyebrow } from './Eyebrow'
import { BipGrowthChart } from './BipGrowthChart'

interface Stats {
  bipsListed: number
  universities: number
  countries: number
  openApplications: number
}

interface StatsSectionProps {
  stats: Stats
}

const STAT_CONFIGS = [
  {
    key: 'bipsListed' as const,
    label: 'BIPs listed',
    delta: 'Growing fast',
  },
  {
    key: 'universities' as const,
    label: 'Universities',
    delta: (n: number) => `+${n} this month`,
  },
  {
    key: 'countries' as const,
    label: 'Countries',
    delta: 'Erasmus+ programme',
  },
  {
    key: 'openApplications' as const,
    label: 'Open applications',
    delta: 'Deadline within 60 days',
  },
]

export function StatsSection({ stats }: StatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 })
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <section
          ref={sectionRef}
          className="relative overflow-hidden bg-eu-blue py-24"
          style={{
            backgroundImage:
              'radial-gradient(circle at 90% 10%, rgba(255, 204, 0, 0.12) 0%, transparent 50%)',
          }}
        >
          {/* Slow ambient gold glow on the bottom-left of the band */}
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px]"
            style={{
              background:
                'radial-gradient(circle at bottom left, rgba(255, 204, 0, 0.10) 0%, transparent 65%)',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative mx-auto max-w-[1200px] px-4 md:px-6">
            {/* Section header */}
            <m.div
              className="mb-14 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Eyebrow className="mb-3 text-white [&>span:first-child]:bg-eu-gold">
                <span className="text-white">By the numbers</span>
              </Eyebrow>
              <h2
                className="font-bold text-white"
                style={{
                  fontSize: 'clamp(30px, 4vw, 44px)',
                  lineHeight: '1.15',
                  letterSpacing: '-1px',
                }}
              >
                A growing European network
              </h2>
              <p className="mt-3 text-[17px] text-white/70">
                Live statistics from across the platform — updated as universities and students join.
              </p>
            </m.div>

            {/* Stat cards grid: 4 col desktop, 2 col tablet, 1 col mobile */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {STAT_CONFIGS.map((cfg) => (
                <StatCard
                  key={cfg.key}
                  value={stats[cfg.key]}
                  label={cfg.label}
                  delta={
                    typeof cfg.delta === 'function'
                      ? cfg.delta(stats[cfg.key])
                      : cfg.delta
                  }
                  isInView={isInView}
                  prefersReducedMotion={prefersReducedMotion ?? false}
                />
              ))}
            </div>

            {/* Growth sparkline — MOCK data, replace with real series in Phase 4+ */}
            <m.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <BipGrowthChart />
            </m.div>
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  )
}

interface StatCardProps {
  value: number
  label: string
  delta: string
  isInView: boolean
  prefersReducedMotion: boolean
}

function StatCard({ value, label, delta, isInView, prefersReducedMotion }: StatCardProps) {
  const [displayed, setDisplayed] = useState(prefersReducedMotion ? value : 0)

  const animate = useCallback(() => {
    if (prefersReducedMotion || value === 0) {
      setDisplayed(value)
      return
    }
    const duration = 1200
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, prefersReducedMotion])

  useEffect(() => {
    if (isInView) {
      animate()
    }
  }, [isInView, animate])

  return (
    <m.div
      className="rounded-lg border border-white/12 bg-white/6 p-7 px-6 backdrop-blur"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Big number */}
      <div
        className="font-bold text-white"
        aria-live="polite"
        style={{ fontSize: '44px', lineHeight: '1.0', letterSpacing: '-1.5px' }}
      >
        {displayed.toLocaleString()}
      </div>

      {/* Stat label */}
      <div className="mt-2 text-[14px] font-medium text-white/80">{label}</div>

      {/* Delta badge */}
      <div className="mt-3 text-[12px] font-medium text-white/50">{delta}</div>
    </m.div>
  )
}
