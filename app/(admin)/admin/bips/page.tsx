import { SearchX } from 'lucide-react'
import {
  getAdminBips,
  type AdminBipsFilter,
} from '@/lib/queries/adminBips'
import { AdminBipRow } from '@/components/admin/AdminBipRow'
import { AdminBipsFilters } from '@/components/admin/AdminBipsFilters'

/**
 * /admin/bips — all-listings page (D-19 / ADMN-06).
 *
 * Server component. Reads `?status=...&q=...` from URL searchParams,
 * validates against the 5-value status enum, then calls getAdminBips.
 * The client-side AdminBipsFilters component steers navigation but
 * never holds the canonical data — refreshes hit the same query.
 *
 * `dynamic = 'force-dynamic'` because the query depends on the admin
 * JWT (`getClaims()`) which is per-request. ISR would cache the wrong
 * scope.
 */
export const dynamic = 'force-dynamic'

const VALID_STATUSES = new Set<NonNullable<AdminBipsFilter['status']>>([
  'all',
  'draft',
  'pending',
  'approved',
  'rejected',
])

type StatusValue = NonNullable<AdminBipsFilter['status']>

function parseStatus(raw: string | undefined): StatusValue {
  if (raw && (VALID_STATUSES as Set<string>).has(raw)) {
    return raw as StatusValue
  }
  return 'all'
}

export default async function AdminBipsPage(props: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const sp = await props.searchParams
  const status = parseStatus(sp.status)
  const q = sp.q ?? ''

  const bips = await getAdminBips({ status, q })
  const count = bips.length

  return (
    <div>
      <div className="border-b border-border bg-white px-6 py-5">
        <h1 className="text-[22px] font-semibold text-ink">All BIPs</h1>
        <p className="text-sm text-muted">
          {count} BIP{count === 1 ? '' : 's'}{' '}
          {status !== 'all'
            ? `with status ${status}`
            : 'across all statuses'}
          {q ? ` matching "${q}"` : ''}
        </p>
      </div>

      <AdminBipsFilters initialStatus={status} initialQ={q} />

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-16">
          <SearchX className="mb-3 text-muted" size={32} aria-hidden />
          <h2 className="text-base font-semibold text-ink">
            No BIPs match these filters
          </h2>
          <p className="mt-1 text-sm text-muted">
            Try clearing the search or switching to a different status.
          </p>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-6">
          {bips.map((bip) => (
            <AdminBipRow key={bip.id} bip={bip} />
          ))}
        </div>
      )}
    </div>
  )
}
