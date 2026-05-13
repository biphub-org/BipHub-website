/**
 * Stationary skeleton for BipSortControl Suspense fallback (Plan 04-06 D-18).
 * Matches the sort dropdown's compact pill dimensions so the row containing
 * the result-count + sort control does not reflow on hydration.
 */
export function BipSortControlSkeleton() {
  return (
    <div
      aria-hidden
      className="h-9 w-40 rounded-md bg-border/60"
    />
  )
}
