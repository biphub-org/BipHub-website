import { StickyNav } from '@/components/home/StickyNav'
import { Footer } from '@/components/home/Footer'
import { Toaster } from '@/components/ui/sonner'

/**
 * Public route-group layout — wraps all pages in the (public) group
 * with the StickyNav and Footer chrome.
 *
 * Routes in scope: /, /bips, /bip/[slug]
 *
 * The skip-link provides keyboard users a shortcut past the nav (FOUN-03).
 * INFO-03 compliance: Footer renders the mandatory EC disclaimer on every page.
 *
 * Toaster (Plan 01-07): single Sonner instance for the entire public route group.
 * Used by ShareButton's clipboard-fallback confirmation toast.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <StickyNav />
      <main id="main" className="min-h-[calc(100vh-68px)]">
        {children}
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        richColors={false}
        closeButton
      />
    </>
  )
}
