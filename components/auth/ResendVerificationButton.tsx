'use client'

import { useState, useTransition } from 'react'
import { resendVerificationAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

interface Props {
  email: string
}

/**
 * Inline "Resend verification" button shown on /verify-email.
 *
 * Disables itself for 30 seconds after a successful send so users can't
 * hammer the (rate-limited) Supabase mailer. The disabled state also
 * doubles as the visible success indicator — no toast required.
 */
export function ResendVerificationButton({ email }: Props) {
  const [isPending, startTransition] = useTransition()
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  function send() {
    if (cooldown > 0 || isPending) return
    setMessage(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('email', email)
      const res = await resendVerificationAction(fd)
      if (res.error) {
        setMessage(res.error)
        return
      }
      setMessage('Sent. Check your inbox (and spam folder).')
      setCooldown(30)
      const tick = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(tick)
            return 0
          }
          return c - 1
        })
      }, 1000)
    })
  }

  const disabled = isPending || cooldown > 0 || !email

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={send}
        disabled={disabled}
      >
        {isPending
          ? 'Sending…'
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Resend verification'}
      </Button>
      {message && (
        <p className="mt-2 text-xs text-muted">{message}</p>
      )}
    </>
  )
}
