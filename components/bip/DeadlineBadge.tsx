import { computeDeadlineState } from '@/lib/utils/deadline'
import { cn } from '@/lib/utils/cn'

/**
 * DeadlineBadge — displays the application deadline as a colored chip.
 *
 * State branches (UI-SPEC line 358):
 *   - 'urgent'  (0-14 days left) → gold chip (bg-eu-gold text-ink)
 *   - 'info'    (>14 days left)  → blue chip (bg-eu-blue-50 text-eu-blue)
 *   - 'closed'  (past deadline)  → gray chip (bg-border text-muted) — "Applications closed"
 *   - 'rolling' (null deadline)  → blue chip — "Rolling deadline"
 */
export function DeadlineBadge({
  deadline,
  className,
}: {
  deadline: string | null | undefined
  className?: string
}) {
  const { state, label } = computeDeadlineState(deadline)

  const stateClass = {
    urgent: 'bg-eu-gold text-ink',
    info: 'bg-eu-blue-50 text-eu-blue',
    closed: 'bg-border text-muted',
    rolling: 'bg-eu-blue-50 text-eu-blue',
  }[state]

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1.5 rounded-pill text-sm font-semibold',
        stateClass,
        className,
      )}
    >
      {label}
    </span>
  )
}
