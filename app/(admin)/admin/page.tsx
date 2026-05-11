import { Inbox } from 'lucide-react'
import { getAdminPendingBips } from '@/lib/queries/adminBips'
import { AdminBipCard } from '@/components/admin/AdminBipCard'

/**
 * Admin pending queue (/admin) — ADMN-02 / 03-UI-SPEC.md Pending Queue Contract.
 *
 * RSC. Renders the FIFO-ordered list of BIPs in status='pending' via
 * `getAdminPendingBips()` (server query). The (admin)/layout.tsx already
 * gates this route on `app_metadata.role === 'admin'`, so reaching this
 * page implies an admin JWT — the empty-array fall-through in the query
 * is defensive only.
 *
 * Empty-state copy + Inbox icon per UI-SPEC. Review links go to
 * /admin/bips/[id]/review (404 stub until Plan 03-03 lands the review
 * page; vertical-slice seam noted in the plan objective).
 *
 * No `dynamic = 'force-dynamic'` needed — the layout's getClaims() call
 * already marks the segment dynamic.
 */
export default async function AdminQueuePage() {
  const bips = await getAdminPendingBips()
  const count = bips.length

  return (
    <div>
      <div className="bg-white border-b border-border px-6 py-5">
        <h1 className="text-[22px] font-semibold text-ink">Pending review</h1>
        <p className="text-sm text-muted">
          {count === 0
            ? "You're all caught up"
            : `${count} BIP${count === 1 ? '' : 's'} awaiting review`}
        </p>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-bg-soft mb-6">
            <Inbox className="w-12 h-12 text-muted" aria-hidden />
          </div>
          <h2 className="text-[22px] font-semibold text-ink">No pending BIPs</h2>
          <p className="mt-2 text-base text-muted max-w-md text-center">
            You&apos;re all caught up. New submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col gap-4">
          {bips.map((bip) => (
            <AdminBipCard key={bip.id} bip={bip} />
          ))}
        </div>
      )}
    </div>
  )
}
