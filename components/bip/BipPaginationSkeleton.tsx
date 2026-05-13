/**
 * Stationary skeleton for BipPagination Suspense fallback (Plan 04-06 D-18).
 * Five 36px squares mirroring the numbered pagination row layout so the
 * grid's bottom edge does not shift when pagination hydrates.
 */
export function BipPaginationSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-10 items-center justify-center gap-2"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-9 w-9 rounded-md bg-border/60" />
      ))}
    </div>
  )
}
