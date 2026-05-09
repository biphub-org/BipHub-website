'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  // Show: 1, ..., current-1, current, current+1, ..., total
  // Compress when there are >7 pages
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const result: (number | 'ellipsis')[] = [1]
  if (current > 3) result.push('ellipsis')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    result.push(p)
  }
  if (current < total - 2) result.push('ellipsis')
  result.push(total)
  return result
}

export function BipPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const params = useSearchParams()

  const hrefForPage = (page: number) => {
    const next = new URLSearchParams(params)
    if (page === 1) next.delete('page')
    else next.set('page', String(page))
    const qs = next.toString()
    return qs ? `/bips?${qs}` : '/bips'
  }

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={hrefForPage(currentPage - 1)}
          className="px-3 py-1.5 text-sm text-ink hover:text-eu-blue"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-muted">← Previous</span>
      )}
      <ul className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`e-${i}`} className="px-2 text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={hrefForPage(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  p === currentPage
                    ? 'bg-eu-blue text-white font-semibold'
                    : 'text-ink hover:bg-bg-soft',
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>
      {currentPage < totalPages ? (
        <Link
          href={hrefForPage(currentPage + 1)}
          className="px-3 py-1.5 text-sm text-ink hover:text-eu-blue"
        >
          Next →
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-muted">Next →</span>
      )}
    </nav>
  )
}
