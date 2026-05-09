import Link from 'next/link'
import { IconSearchOff } from '@tabler/icons-react'
import { ClearFiltersButton } from '@/components/bip/BipFilterChips'
import { cn } from '@/lib/utils/cn'

export function BipsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-bg-soft border border-border rounded-lg max-w-md mx-auto px-8 py-16">
      <IconSearchOff
        size={48}
        className="text-muted mb-4"
        aria-hidden="true"
      />
      <h2 className="text-xl font-bold text-ink mb-2">
        No BIPs match your filters
      </h2>
      <p className="text-muted mb-6">
        Try removing a filter, or browse the full catalog.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <ClearFiltersButton />
        <Link
          href="/bips"
          className={cn(
            'inline-flex items-center justify-center font-semibold whitespace-nowrap rounded-pill',
            'h-11 px-5 text-sm transition-all duration-200 ease-out',
            'bg-transparent text-ink border border-border',
            'hover:border-ink hover:bg-bg-soft',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
          )}
        >
          Browse all BIPs →
        </Link>
      </div>
    </div>
  )
}
