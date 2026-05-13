'use client'

/**
 * Delete-account confirmation modal (FOUN-07 / D-08).
 *
 * The submit button stays disabled until the typed input matches the
 * coordinator's account email verbatim (case-insensitive, trimmed). This
 * is UX friction for an irreversible PII operation. The Server Action
 * re-validates server-side so a DevTools bypass cannot succeed.
 *
 * Calls `deleteAccountAction` inside `useTransition`. On success the
 * action redirects (never returns); on failure it throws with the
 * Postgres error message, which we surface via Sonner.
 */

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { deleteAccountAction } from '@/lib/actions/account'

interface DeleteAccountDialogProps {
  /** The signed-in user's email — matched verbatim (case-insensitive) for confirmation. */
  accountEmail: string
}

export function DeleteAccountDialog({ accountEmail }: DeleteAccountDialogProps) {
  const [typed, setTyped] = useState('')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isMatch =
    typed.trim().toLowerCase() === accountEmail.trim().toLowerCase() &&
    accountEmail.length > 0

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await deleteAccountAction(formData)
        // deleteAccountAction redirects on success; this line is unreachable.
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Account deletion failed.',
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">Delete account</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account</DialogTitle>
          <DialogDescription>
            This action is irreversible. Read the consequences below carefully.
          </DialogDescription>
        </DialogHeader>

        <ul className="my-4 list-disc pl-5 text-sm text-ink-2 space-y-1">
          <li>Draft, pending, and rejected BIP submissions will be deleted.</li>
          <li>
            Approved BIPs you submitted remain published, anonymized — your name
            and contact email are removed.
          </li>
          <li>Your account email and profile are permanently forgotten.</li>
          <li>This action cannot be undone. There is no grace period.</li>
        </ul>

        <form onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="typedEmail" className="text-sm">
              Type <span className="font-semibold">{accountEmail}</span> to
              confirm:
            </Label>
            <Input
              id="typedEmail"
              name="typedEmail"
              type="email"
              autoComplete="off"
              required
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={accountEmail}
              disabled={isPending}
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isMatch || isPending}
            >
              {isPending ? 'Deleting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
