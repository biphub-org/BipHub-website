'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

/**
 * Account-deletion landing toast (FOUN-07 / Specifics).
 *
 * Renders nothing. On mount, if the URL has `?deleted=1`, fires a Sonner
 * success toast with the post-deletion confirmation copy and strips the
 * param from the address bar via `router.replace` (history is replaced,
 * not pushed). The strip prevents a refresh / back-nav from re-firing.
 *
 * Wired by `lib/actions/account.ts` which redirects to '/?deleted=1'
 * after the `delete_my_account` RPC completes.
 *
 * `useSearchParams` requires a `<Suspense>` boundary in Next.js 15 — the
 * caller (app/(public)/page.tsx) provides one.
 */
export function AccountDeletedToastIsland() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (params.get('deleted') !== '1') return

    toast.success(
      'Your account and personal data have been deleted. Approved BIPs you submitted remain published, anonymized, as part of the public Erasmus+ directory.',
      { duration: 8000 },
    )

    // Strip the param so a refresh / back nav does not re-fire the toast.
    router.replace(pathname, { scroll: false })
  }, [params, router, pathname])

  return null
}
