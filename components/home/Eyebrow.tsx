/**
 * Eyebrow label component — UI-SPEC line 86.
 *
 * 12px, weight 600, +1.2px tracking, uppercase, EU blue text, gold leading dash.
 * Used before every section heading to establish visual hierarchy.
 */

import { cn } from '@/lib/utils/cn'

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-[12px] font-semibold uppercase text-eu-blue tracking-[0.1em]',
        className,
      )}
    >
      <span aria-hidden="true" className="inline-block h-0.5 w-6 rounded-full bg-eu-gold" />
      {children}
    </p>
  )
}
