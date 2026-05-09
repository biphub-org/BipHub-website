/**
 * Deadline state computation for BIP detail page (Plan 01-07).
 *
 * State branches (UI-SPEC line 358):
 *   - null deadline        -> 'rolling'  (Rolling deadline)
 *   - past deadline        -> 'closed'   (Applications closed)
 *   - 0 < days <= 14       -> 'urgent'   (gold chip)
 *   - days > 14            -> 'info'     (blue chip)
 *
 * Date math: normalize both deadline and now to UTC midnight (no TZ jitter).
 * NEVER use getTime() difference — hour offsets near midnight can flip the sign.
 */

export type DeadlineState = 'urgent' | 'info' | 'closed' | 'rolling'

export interface DeadlineResult {
  state: DeadlineState
  daysLeft: number | null
  label: string
}

/**
 * Compute the visual state for a BIP's application deadline.
 *
 * @param deadline  ISO date string (YYYY-MM-DD) or null
 * @param now       Optional override of "today" for testing (ISO string or Date)
 */
export function computeDeadlineState(
  deadline: string | null | undefined,
  now?: string | Date,
): DeadlineResult {
  if (!deadline) {
    return { state: 'rolling', daysLeft: null, label: 'Rolling deadline' }
  }

  // Normalize both dates to UTC midnight to avoid TZ jitter
  const nowDate = now ? new Date(now) : new Date()
  const todayUTC = Date.UTC(
    nowDate.getUTCFullYear(),
    nowDate.getUTCMonth(),
    nowDate.getUTCDate(),
  )

  const deadlineParts = deadline.split('-').map(Number)
  const deadlineUTC = Date.UTC(deadlineParts[0], deadlineParts[1] - 1, deadlineParts[2])

  const daysLeft = Math.round((deadlineUTC - todayUTC) / 86_400_000)

  if (daysLeft < 0) {
    return { state: 'closed', daysLeft, label: 'Applications closed' }
  }

  if (daysLeft <= 14) {
    return { state: 'urgent', daysLeft, label: `⏱ ${daysLeft}d left` }
  }

  return { state: 'info', daysLeft, label: `⏱ ${daysLeft}d left` }
}

/**
 * Format the remaining time for display in countdown text components.
 * Returns a human-readable label based on daysLeft.
 */
export function formatRemaining(daysLeft: number | null): string {
  if (daysLeft === null) return 'Rolling deadline'
  if (daysLeft < 0) return 'Applications closed'
  if (daysLeft === 0) return 'Deadline today'
  if (daysLeft === 1) return '1 day left'
  return `${daysLeft} days left`
}
