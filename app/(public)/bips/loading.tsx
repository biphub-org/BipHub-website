import { Skeleton } from '@/components/ui/skeleton'

export default function BipsLoading() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 lg:px-6 py-12 lg:py-16">
      <Skeleton className="h-10 w-64 mb-3" />
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden lg:block space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </aside>
        <div>
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border">
                <Skeleton className="h-[140px] w-full" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
