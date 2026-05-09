import Link from 'next/link'
import { IconSearchOff } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

/**
 * BipNotFound — rendered by app/(public)/bip/[slug]/not-found.tsx
 * when getBipBySlug returns null (slug doesn't exist or BIP not approved).
 *
 * UI-SPEC line 297: h1 "BIP not found", body copy, "Browse all BIPs →" CTA.
 */
export function BipNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-soft">
            <IconSearchOff size={48} className="text-muted" aria-hidden="true" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-ink tracking-tight">
          BIP not found
        </h1>
        <p className="mb-8 text-base text-muted leading-relaxed">
          This program may have been removed or never existed.
        </p>
        <Button asChild>
          <Link href="/bips">Browse all BIPs →</Link>
        </Button>
      </div>
    </main>
  )
}
