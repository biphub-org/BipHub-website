/**
 * Stationary skeleton for BipSearchBar Suspense fallback (Plan 04-06 D-18).
 * Matches the search input's height (h-10) and full-width layout so the
 * Suspense → resolved swap does not shift surrounding content.
 */
export function BipSearchBarSkeleton() {
  return (
    <div
      aria-hidden
      className="h-10 w-full rounded-md bg-border/60"
    />
  )
}
