'use client'

/**
 * BipHub sticky navigation — client component (uses usePathname for active links).
 *
 * Desktop (≥960px / md:): logo + wordmark + 4 nav links + right-side block.
 * Mobile (<960px): logo + primary CTA + hamburger triggering a Sheet drawer with full nav.
 *
 * Phase 2 (D-15): right-side block + Sheet bottom CTAs branch on `hasClaims`.
 *   - Logged-out: Sign in (ghost) + List your BIP (primary)
 *   - Logged-in:  Dashboard link + initials avatar
 * Props are derived in (public)/layout.tsx via getClaims() and a profile fetch,
 * passed in as plain serializable props (no client-side flash).
 *
 * FOUN-03: Sheet is keyboard-accessible by default (focus trap, Escape to close,
 * focus return to trigger). WCAG AA for <960px viewports.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark } from './LogoMark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { href: '/bips', label: 'Browse BIPs' },
  { href: '/#by-country', label: 'By country' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/what-is-a-bip', label: 'What is a BIP?' },
] as const

interface StickyNavProps {
  hasClaims?: boolean
  initials?: string | null
}

export function StickyNav({ hasClaims = false, initials = null }: StickyNavProps) {
  const pathname = usePathname()
  return (
    <header
      className="sticky top-0 z-50 h-[68px] w-full border-b border-border bg-white/85 backdrop-blur-md backdrop-saturate-150"
      role="navigation"
      aria-label="Primary"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink">
          <LogoMark />
          <span className="text-base">BipHub</span>
        </Link>

        {/* Desktop nav links — hidden below 960px (md = 60rem per @theme override) */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href.startsWith('/#')
                ? false
                : pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    active ? 'text-eu-blue' : 'text-ink-2 hover:text-ink',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          {hasClaims ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:inline text-sm font-semibold text-ink hover:text-eu-blue"
              >
                Dashboard
              </Link>
              <span
                aria-label="Coordinator profile"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-eu-blue/10 text-eu-blue text-sm font-semibold"
              >
                {initials ?? '··'}
              </span>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:inline-flex">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">List your BIP</Button>
              </Link>
            </>
          )}

          {/* Mobile nav menu — Sheet drawer for <960px viewports.
              Owned end-to-end by Plan 01-04. NOT deferred to downstream plans.
              Keyboard-accessible: focus trap, Escape closes, focus returns to trigger. */}
          <Sheet>
            <SheetTrigger
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-border text-ink-2 hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue"
              aria-label="Open navigation menu"
            >
              <span aria-hidden="true" className="text-base leading-none">☰</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile primary">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="block px-2 py-3 text-base font-medium text-ink hover:text-eu-blue rounded-md hover:bg-bg-soft"
                      >
                        {link.label}
                      </Link>
                    }
                  />
                ))}
                <div className="mt-2 border-t border-border pt-4 flex flex-col gap-2">
                  {hasClaims ? (
                    <SheetClose
                      render={
                        <Link href="/dashboard" className="inline-flex">
                          <Button variant="primary" className="w-full">Dashboard</Button>
                        </Link>
                      }
                    />
                  ) : (
                    <>
                      <SheetClose
                        render={
                          <Link href="/login" className="inline-flex">
                            <Button variant="ghost" className="w-full">Sign in</Button>
                          </Link>
                        }
                      />
                      <SheetClose
                        render={
                          <Link href="/register" className="inline-flex">
                            <Button variant="primary" className="w-full">List your BIP</Button>
                          </Link>
                        }
                      />
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
