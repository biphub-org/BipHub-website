import type { Metadata } from 'next'
import { parseSearchParams, PAGE_SIZE } from '@/lib/filters/parseSearchParams'
import { getBips } from '@/lib/queries/bips'
import { BipFiltersSidebar } from '@/components/bip/BipFiltersSidebar'
import { BipFiltersDrawer } from '@/components/bip/BipFiltersDrawer'
import { BipSearchBar } from '@/components/bip/BipSearchBar'
import { BipSortControl } from '@/components/bip/BipSortControl'
import { BipGrid } from '@/components/bip/BipGrid'
import { BipPagination } from '@/components/bip/BipPagination'
import { BipsEmptyState } from '@/components/bip/BipsEmptyState'
import { BipFilterChips } from '@/components/bip/BipFilterChips'

// PITFALLS Pitfall 14 — canonical points to /bips REGARDLESS of query params
// to prevent duplicate-content indexing of every filter combination.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Browse all BIPs · BipHub',
    description:
      'Browse Erasmus+ Blended Intensive Programs across Europe. Filter by country, field of study, language, dates, ECTS credits, and study level.',
    alternates: { canonical: 'https://biphub.eu/bips' },
  }
}

// ISR per ARCHITECTURE.md — revalidate hourly; revalidatePath() in Phase 3 admin actions
// busts the cache instantly on approve/reject.
export const revalidate = 3600

type SearchParamsRaw = { [k: string]: string | string[] | undefined }

export default async function BipsPage(props: {
  // Next.js 15: searchParams is a Promise — must await
  searchParams: Promise<SearchParamsRaw>
}) {
  const sp = await props.searchParams
  const filters = parseSearchParams(sp)
  const { rows, total, totalCountries } = await getBips(filters)

  const startIdx = (filters.page - 1) * PAGE_SIZE + 1
  const endIdx = Math.min(filters.page * PAGE_SIZE, total)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Active-filter detection for chip row + clear-all button visibility
  const hasActiveFilters = Boolean(
    filters.country?.length ||
      filters.field?.length ||
      filters.lang?.length ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.ectsMin !== undefined ||
      filters.ectsMax !== undefined ||
      (filters.status && filters.status !== 'any') ||
      filters.level?.length ||
      filters.q,
  )

  return (
    <div className="container mx-auto max-w-[1200px] px-4 lg:px-6 py-12 lg:py-16">
      <header className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-ink tracking-tight">
          Browse all BIPs
        </h1>
        <p className="mt-3 text-muted text-base">
          {total} programs across {totalCountries} countries — filter to find
          the one for you.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden lg:block">
          <BipFiltersSidebar filters={filters} />
        </aside>

        <div>
          <div className="flex flex-col gap-4 mb-6">
            <BipSearchBar initialQ={filters.q ?? ''} />
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted">
                {total === 0
                  ? '0 results'
                  : total === 1
                    ? '1 result'
                    : `Showing ${startIdx}–${endIdx} of ${total}`}
              </p>
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  <BipFiltersDrawer filters={filters} totalResults={total} />
                </div>
                <BipSortControl initialSort={filters.sort} />
              </div>
            </div>
            {hasActiveFilters && <BipFilterChips filters={filters} />}
          </div>

          {rows.length === 0 ? (
            <BipsEmptyState />
          ) : (
            <>
              <BipGrid bips={rows} />
              {totalPages > 1 && (
                <div className="mt-12">
                  <BipPagination currentPage={filters.page} totalPages={totalPages} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
