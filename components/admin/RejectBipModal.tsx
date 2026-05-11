'use client'

/**
 * RejectBipModal — admin rejection confirmation modal (ADMN-04 / 03-UI-SPEC.md).
 *
 * - Shows the BIP title verbatim in a red-bordered callout block.
 * - Required reason textarea: min 10, max 1000 (RejectBipSchema enforced
 *   client-side via RHF + zodResolver AND server-side via safeParse).
 * - Confirm Button is disabled until form is valid (`!form.formState.isValid`).
 * - Calls `rejectBipAction` inside `useTransition`. On success the action
 *   redirects to the next pending BIP (or /admin) so reaching the
 *   "toast.success + onOpenChange(false)" line implies redirect was queued
 *   but not yet flushed — the toast still appears on the destination page.
 * - On `{ error }`, surfaces a destructive Alert inside the modal.
 *
 * Important Next.js semantics: `rejectBipAction` calls `redirect()` on
 * success, which throws a `NEXT_REDIRECT` Error. React's useTransition
 * catches it silently and performs the navigation. Do NOT wrap the call
 * in a try/catch — that would swallow the redirect.
 */

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RejectBipSchema, type RejectBipInput } from '@/lib/schemas/admin-bips'
import { rejectBipAction } from '@/lib/actions/admin-bips'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  bipId: string
  bipTitle: string
  coordinatorName: string
}

export function RejectBipModal({
  open,
  onOpenChange,
  bipId,
  bipTitle,
  coordinatorName,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RejectBipInput>({
    resolver: zodResolver(RejectBipSchema),
    mode: 'onChange',
    defaultValues: { bipId, reason: '' },
  })
  const reasonValue = form.watch('reason') ?? ''
  const reasonError = form.formState.errors.reason?.message

  function handleConfirm(data: RejectBipInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await rejectBipAction(data.bipId, data.reason)
      // rejectBipAction redirects on success; we only reach here on { error }.
      if (result?.error) {
        setServerError(result.error)
        return
      }
      // Success branch — only reachable if action ever changes to return success
      // without redirect; currently unreachable in normal flow.
      toast.success(
        `BIP rejected. Email sent to ${coordinatorName || 'the coordinator'}.`,
      )
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-semibold text-ink">
            Reject BIP
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            You&apos;re about to reject:
          </DialogDescription>
        </DialogHeader>

        <div className="bg-bg-soft border-l-4 border-status-rejected rounded-r px-4 py-3 mb-4">
          <p className="text-base font-semibold text-ink">
            {bipTitle || 'Untitled BIP'}
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(handleConfirm)}
          className="flex flex-col gap-2"
        >
          <Label
            htmlFor="reject-reason"
            className="text-sm font-semibold text-ink"
          >
            Reason (required, shown to the coordinator)
          </Label>
          <Textarea
            id="reject-reason"
            rows={4}
            maxLength={1000}
            {...form.register('reason')}
            placeholder="Explain what needs to change before this BIP can be approved. Be specific — the coordinator will see this verbatim and use it to revise their submission."
            aria-invalid={!!reasonError}
          />
          <p className="text-xs text-muted text-right">
            {reasonValue.length}/1000 characters
          </p>
          {reasonError ? (
            <p className="text-sm text-status-rejected" role="alert">
              {reasonError}
            </p>
          ) : null}
          <p className="text-sm text-muted">
            This reason will be included in the rejection email and shown on
            the coordinator&apos;s dashboard.
          </p>

          {serverError ? (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="mt-4 flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
              className="bg-status-rejected text-white hover:bg-red-700 rounded-pill px-5 py-2 font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Rejecting…
                </>
              ) : (
                'Reject BIP'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
