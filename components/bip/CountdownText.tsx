import { computeDeadlineState } from '@/lib/utils/deadline'
import { cn } from '@/lib/utils/cn'

/**
 * CountdownText — inline deadline label used in BipMobileApplyBar.
 *
 * RSC-only component (NO 'use client', NO hooks).
 * Renders the deadline label from computeDeadlineState in a colored span.
 * The color matches DeadlineBadge state colors.
 */
export function CountdownText({
  deadline,
  className,
}: {
  deadline: string | null | undefined
  className?: string
}) {
  const { state, label } = computeDeadlineState(deadline)

  const colorClass = {
    urgent: 'text-eu-gold-dark font-semibold',
    info: 'text-eu-blue font-medium',
    closed: 'text-muted',
    rolling: 'text-eu-blue font-medium',
  }[state]

  return (
    <span className={cn('text-sm', colorClass, className)}>
      {label}
    </span>
  )
}
