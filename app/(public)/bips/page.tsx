import { Suspense } from 'react'
import type { Metadata } from 'next'
import { parseSearchParams, PAGE_SIZE } from '@/lib/filters/parseSearchParams'
import { getBips } from '@/lib/queries/bips'
import { BipFiltersSidebar } from '@/components/bip/BipFiltersSidebar'
import { BipFiltersSidebarSkeleton } from '@/components/bip/BipFiltersSidebarSkeleton'
import { BipFiltersDrawer } from '@/components/bip/BipFiltersDrawer'
import { BipSearchBar } from '@/components/bip/BipSearchBar'
import { BipSearchBarSkeleton } from '@/components/bip/BipSearchBarSkeleton'
import { BipSortControl } from '@/components/bip/BipSortControl'
import { BipSortControlSkeleton } from '@/components/bip/BipSortControlSkeleton'
import { BipGrid } from '@/components/bip/BipGrid'
import { BipPagination } from '@/components/bip/BipPagination'
import { BipPaginationSkeleton } from '@/components/bip/BipPaginationSkeleton'
import { BipsEmptyState } from '@/components/bip/BipsEmptyState'
import { BipFilterChips } from '@/components/bip/BipFilterChips'

// PITFALLS Pitfall 14 — canonical points to /bips REGARDLESS of query params
// to prevent duplicate-content indexing of every filter combination.
//
// Plan 04-03 (D-17): static OG image at /public/og-bips.png. /bip/[slug]
// keeps its dynamic opengraph-image.tsx; static pages get hand-rendered
// PNGs so / and /bips have zero runtime OG cost.
//
// metadataBase resolves relative /og-bips.png into an absolute URL.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Browse all BIPs · BipHub',
    description:
      'Browse Erasmus+ Blended Intensive Programs across Europe. Filter by country, field of study, language, dates, ECTS credits, and study level.',
    alternates: { canonical: 'https://biphub.eu/bips' },
    openGraph: {
      title: 'Browse all BIPs · BipHub',
      description:
        'Browse Erasmus+ Blended Intensive Programmes across Europe. Filter by country, field of study, language, dates, ECTS credits, and study level.',
      url: '/bips',
      siteName: 'BipHub',
      images: [
        {
          url: '/og-bips.png',
          width: 1200,
          height: 630,
          alt: 'Browse all BIPs on BipHub',
        },
      ],
      type: 'website',
    },
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
          {/* D-18: Suspense around useSearchParams consumer; stationary skeleton avoids CLS */}
          <Suspense fallback={<BipFiltersSidebarSkeleton />}>
            <BipFiltersSidebar filters={filters} />
          </Suspense>
        </aside>

        <div>
          <div className="flex flex-col gap-4 mb-6">
            <Suspense fallback={<BipSearchBarSkeleton />}>
              <BipSearchBar initialQ={filters.q ?? ''} />
            </Suspense>
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
                  {/* Drawer renders BipFiltersSidebar internally; reuse the sidebar skeleton */}
                  <Suspense fallback={<BipFiltersSidebarSkeleton />}>
                    <BipFiltersDrawer filters={filters} totalResults={total} />
                  </Suspense>
                </div>
                <Suspense fallback={<BipSortControlSkeleton />}>
                  <BipSortControl initialSort={filters.sort} />
                </Suspense>
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
                  <Suspense fallback={<BipPaginationSkeleton />}>
                    <BipPagination currentPage={filters.page} totalPages={totalPages} />
                  </Suspense>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
