/**
 * MapSkeleton — loading placeholder for the EuropeMap dynamic import.
 *
 * UI-SPEC line 327: aspect-[16/10] max-h-[560px] bg-bg-soft animate-pulse rounded-lg.
 * Shown while the dynamic(() => import('./EuropeMap'), { ssr: false }) chunk resolves.
 */

export function MapSkeleton() {
  return (
    <div className="relative w-full rounded-lg bg-white p-8 shadow-md border border-border">
      <div
        className="aspect-[16/10] max-h-[560px] w-full animate-pulse rounded-lg bg-bg-soft"
        role="progressbar"
        aria-label="Loading map…"
        aria-busy="true"
      />
      <p className="mt-4 text-center text-sm text-muted" aria-live="polite">
        Loading map…
      </p>
    </div>
  )
}
