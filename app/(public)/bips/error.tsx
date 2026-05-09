'use client'

import { Button } from '@/components/ui/button'

export default function BipsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="container mx-auto max-w-[600px] px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-ink mb-2">
        Something went wrong loading BIPs.
      </h1>
      <p className="text-muted mb-6">Try refreshing.</p>
      <Button onClick={reset}>Reload</Button>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 text-xs text-left text-red-600 whitespace-pre-wrap">
          {error.message}
        </pre>
      )}
    </main>
  )
}
