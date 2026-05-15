import Link from 'next/link'
import { IconSearchOff } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Page not found · BipHub',
  description: 'The page you were looking for does not exist.',
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-soft px-4">
      <div className="w-full max-w-md text-center">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 transition-colors hover:text-eu-blue"
        >
          ← BipHub
        </Link>
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
            <IconSearchOff size={36} className="text-eu-blue" aria-hidden="true" />
          </div>
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[1px] text-eu-blue">
          <span aria-hidden="true" className="mr-2 text-eu-gold">—</span>
          404
        </p>
        <h1
          className="mb-4 font-bold text-ink"
          style={{
            fontSize: 'clamp(30px, 4vw, 44px)',
            lineHeight: '1.15',
            letterSpacing: '-1px',
          }}
        >
          Page not found
        </h1>
        <p className="mb-8 text-[17px] leading-relaxed text-muted">
          We could not find what you were looking for. The page may have been
          moved, or the link you followed may be wrong.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary">
            <Link href="/bips">Browse all BIPs</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
