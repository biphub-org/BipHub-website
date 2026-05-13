'use client'

/**
 * BipGrowthChart — sparkline showing BIPs added per month.
 *
 * MOCK DATA: replace MOCK_GROWTH with a real time-series query in a future phase
 * (e.g. SELECT date_trunc('month', created_at), count(*) FROM bips GROUP BY 1).
 *
 * Lives inside StatsSection — assumes a parent <LazyMotion features={domAnimation}>
 * boundary, so only the `m` namespace is used here.
 */

import { useRef } from 'react'
import { m, useInView } from 'motion/react'

// Mock — 12 months ending May 2026. Swap with real series in Phase 4+.
const MOCK_GROWTH = [3, 5, 4, 8, 11, 14, 18, 21, 27, 31, 36, 42]
const MONTH_LABELS = [
  'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov',
  'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
]

const W = 800
const H = 200
const PAD = { L: 12, R: 12, T: 24, B: 36 }
const innerW = W - PAD.L - PAD.R
const innerH = H - PAD.T - PAD.B

export function BipGrowthChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  const maxV = Math.max(...MOCK_GROWTH)
  const points = MOCK_GROWTH.map((v, i) => {
    const x = PAD.L + (i / (MOCK_GROWTH.length - 1)) * innerW
    const y = PAD.T + innerH - (v / maxV) * innerH
    return { x, y, v }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
  const last = points[points.length - 1]!
  const first = points[0]!
  const baseY = PAD.T + innerH
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${baseY} L ${first.x.toFixed(2)} ${baseY} Z`

  const totalAdded = MOCK_GROWTH.reduce((a, b) => a + b, 0)

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-lg border border-white/12 bg-white/6 p-6 backdrop-blur md:p-7"
    >
      {/* Header row */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-eu-gold">
            Last 12 months
          </p>
          <h3 className="mt-1 text-[18px] font-semibold text-white">
            BIPs added per month
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold text-white">{totalAdded}</span>
            <span className="text-[12px] text-white/60">total added</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-white/70">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eu-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-eu-gold" />
            </span>
            Live
          </div>
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Mock BIP growth — ${totalAdded} BIPs added over the last 12 months`}
      >
        <defs>
          <linearGradient id="bip-growth-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFCC00" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFCC00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal guide lines (4 ticks) — static */}
        {[0, 0.25, 0.5, 0.75].map((frac) => {
          const y = PAD.T + innerH - frac * innerH
          return (
            <line
              key={frac}
              x1={PAD.L}
              x2={W - PAD.R}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          )
        })}

        {/* Area fill */}
        <m.path
          d={areaPath}
          fill="url(#bip-growth-fill)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
        />

        {/* Line — draws in left to right */}
        <m.path
          d={linePath}
          fill="none"
          stroke="#FFCC00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Data points — stagger pop-in */}
        {points.map((p, i) => {
          const isLast = i === points.length - 1
          return (
            <m.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isLast ? 4.5 : 3}
              fill="#FFCC00"
              stroke={isLast ? '#0a1735' : 'none'}
              strokeWidth={isLast ? 2 : 0}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.4 + (i / points.length) * 1.2,
                ease: 'easeOut',
              }}
            />
          )
        })}

        {/* Pulsing ring on the latest data point */}
        <m.circle
          cx={last.x}
          cy={last.y}
          r={6}
          fill="none"
          stroke="#FFCC00"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 1 }}
          animate={
            inView
              ? { opacity: [0, 0.6, 0], scale: [1, 2.5, 2.5] }
              : { opacity: 0 }
          }
          transition={{
            duration: 2,
            delay: 1.8,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* Month labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={baseY + 22}
            textAnchor="middle"
            fill="rgba(255,255,255,0.55)"
            fontSize="11"
            fontWeight="500"
          >
            {MONTH_LABELS[i]}
          </text>
        ))}
      </svg>
    </div>
  )
}
