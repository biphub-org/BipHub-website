/**
 * BipHub logo mark — 32×32 navy square with a gold star ring.
 *
 * !!! LEGAL CONSTRAINT — DO NOT MODIFY WITHOUT READING:
 *   - .planning/research/PITFALLS.md Pitfall 8 (EU emblem restriction)
 *   - .planning/phases/01-discovery-foundation/01-UI-SPEC.md line 122
 *   - .planning/STATE.md (open blocker: star count must not equal twelve)
 *   - CLAUDE.md "never-do" list: "Never use the official EU twelve-star emblem"
 *
 * The EC visual identity rules restrict circular arrangements of exactly
 * twelve stars. We use EXACTLY 11 stars — visually distinct from the EU emblem.
 * Plan 01-04 enforces this at source level; CONTRIBUTING.md note ships Phase 4.
 */

// STAR_COUNT = 11 — EC visual identity rules restrict the ring of stars used in
// the EU emblem; we use 11 to be visually distinct. See file header.
const STAR_COUNT = 11 // NEVER change to the restricted count — see legal constraint above.

export function LogoMark({ className }: { className?: string }) {
  const radius = 13
  const center = 16
  const dotRadius = 1.25
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
    const angle = (2 * Math.PI * i) / STAR_COUNT - Math.PI / 2
    return {
      cx: center + radius * Math.cos(angle),
      cy: center + radius * Math.sin(angle),
    }
  })

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      width={32}
      height={32}
      aria-hidden="true"
      role="presentation"
    >
      <rect x={0} y={0} width={32} height={32} rx={8} className="fill-eu-blue" />
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={dotRadius}
          className="fill-eu-gold"
        />
      ))}
      <text
        x={16}
        y={20}
        textAnchor="middle"
        className="fill-white font-bold"
        style={{ fontSize: 12 }}
      >
        B
      </text>
    </svg>
  )
}
