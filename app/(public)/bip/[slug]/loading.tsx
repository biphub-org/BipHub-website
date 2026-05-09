import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for /bip/[slug] — matches the 2-col desktop layout
 * (1fr + 340px sticky sidebar at lg:).
 *
 * On mobile: single column stacked blocks.
 * On desktop: two-column grid matching the actual page layout.
 */
export default function BipDetailLoading() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 lg:px-6 py-8 lg:py-12">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-20 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12">
        {/* Main content column */}
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-28 rounded-pill" />
              <Skeleton className="h-7 w-24 rounded-pill" />
            </div>
          </div>

          {/* Body sections */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3 pt-8 border-t border-border">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>

        {/* Sidebar skeleton — only visible at lg+ */}
        <div className="hidden lg:block">
          <div className="bg-white border border-border rounded-lg p-6 shadow-sm space-y-4">
            <Skeleton className="h-8 w-32 rounded-pill" />
            <Skeleton className="h-12 w-full rounded-pill" />
            <div className="space-y-3 pt-4 border-t border-border">
              <Skeleton className="h-5 w-24" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4 border-t border-border">
              <Skeleton className="h-11 w-11 rounded-md" />
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
