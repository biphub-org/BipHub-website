'use client'

/**
 * AdminActionsPanel — sticky right-column panel on the admin review page
 * (Plan 03-03 + Plan 03-04 / 03-UI-SPEC.md).
 *
 * Renders two CTAs:
 *   - Approve BIP (gold pill) — opens ApproveBipModal, enabled when status=pending.
 *   - Reject BIP (red outline) — opens RejectBipModal, enabled when status is
 *     pending OR approved (D-06 allows admin un-approve via Reject).
 */

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApproveBipModal } from './ApproveBipModal'
import { RejectBipModal } from './RejectBipModal'
import type { BipStatus } from '@/lib/utils/status'

interface Props {
  bipId: string
  bipTitle: string
  coordinatorName: string
  currentStatus: BipStatus
  nextPendingId?: string | null
}

export function AdminActionsPanel({
  bipId,
  bipTitle,
  coordinatorName,
  currentStatus,
  nextPendingId,
}: Props) {
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const canApprove = currentStatus === 'pending'
  // D-06: admin may un-approve an approved BIP via Reject.
  const canReject = currentStatus === 'pending' || currentStatus === 'approved'

  return (
    <div className="bg-white border border-border rounded-md p-6 shadow-sm sticky top-20">
      <h2 className="text-[22px] font-semibold text-ink mb-4">Admin actions</h2>
      <div className="flex flex-col gap-3">
        <Button
          className="w-full bg-eu-gold text-ink hover:bg-eu-gold/90 rounded-pill"
          onClick={() => setApproveOpen(true)}
          disabled={!canApprove}
        >
          <Check size={16} className="mr-2" aria-hidden />
          Approve BIP
        </Button>
        <Button
          variant="outline"
          className="w-full border-status-rejected text-status-rejected bg-white hover:bg-red-50 rounded-pill"
          onClick={() => setRejectOpen(true)}
          disabled={!canReject}
        >
          <X size={16} className="mr-2" aria-hidden />
          Reject BIP
        </Button>
      </div>

      <div className="mt-4 bg-bg-soft rounded-sm px-3 py-2">
        <p className="text-sm text-muted">
          Approving publishes the BIP. Rejecting returns it to the coordinator
          with your feedback. Approved BIPs can be un-approved via Reject.
        </p>
      </div>

      {!canApprove && !canReject ? (
        <p className="mt-3 text-xs text-muted">
          This BIP is no longer actionable (current status:{' '}
          <strong>{currentStatus}</strong>).
        </p>
      ) : !canApprove ? (
        <p className="mt-3 text-xs text-muted">
          Current status: <strong>{currentStatus}</strong>. Approve is disabled;
          Reject acts as un-approve.
        </p>
      ) : nextPendingId ? (
        <p className="mt-3 text-xs text-muted">
          After this action you&apos;ll be taken to the next pending BIP.
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted">
          This is the last pending BIP in the queue.
        </p>
      )}

      <ApproveBipModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        bipId={bipId}
        bipTitle={bipTitle}
        coordinatorName={coordinatorName}
      />
      <RejectBipModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        bipId={bipId}
        bipTitle={bipTitle}
        coordinatorName={coordinatorName}
      />
    </div>
  )
}
