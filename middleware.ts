import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

/**
 * Edge middleware for BipHub (Phase 2).
 *
 * Responsibilities:
 *   1. Refresh the Supabase session cookie on every matched request via getClaims()
 *      -- getClaims validates the JWT signature locally (PITFALLS Pitfall 1).
 *   2. Inject `x-pathname` response header so RSC layouts (notably the
 *      (dashboard) layout's profile-complete gate) can read the current path
 *      without parsing referer (Pitfall 2 prevention).
 *   3. Phase 2 redirects:
 *        - !claims && pathname.startsWith('/dashboard' | '/onboarding') -> /login
 *        - claims && pathname === '/login' | '/register' -> /dashboard
 *
 * Phase 3 will add an admin role guard on /admin paths.
 *
 * NEVER use the unvalidated session reader -- it does not validate JWT signatures.
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // CRITICAL: getClaims() validates the JWT signature on every request.
  // `data` itself is null when no session exists; destructure carefully.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims ?? null

  const { pathname } = request.nextUrl

  // (2) Inject pathname header for downstream RSC layouts (Pitfall 2 fix).
  response.headers.set('x-pathname', pathname)

  // (3a) Auth-required: dashboard + onboarding.
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
    if (!claims) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // (3b) Admin-required: admin route group.
  // Phase 3 addition: triple-layer guard layer 1 (per 03-RESEARCH.md Pattern 1).
  // - Unauthenticated → /login?next=/admin
  // - Authenticated but role !== 'admin' → / (avoid redirect loop into /login)
  if (pathname.startsWith('/admin')) {
    if (!claims) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', '/admin')
      return NextResponse.redirect(loginUrl)
    }
    const role = (claims as { app_metadata?: { role?: string } }).app_metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // (3c) Already-authenticated: bounce off the auth pages.
  // Note: matcher excludes /login and /register from middleware execution by default
  // (existing config), so this branch only fires if the matcher is later expanded.
  // Kept here for defense-in-depth and clarity if matcher changes in Phase 3+.
  if (claims && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Matcher set in Plan 01-01. DO NOT modify.
export const config = {
  matcher: [
    // Run middleware on every path EXCEPT:
    //   - Next.js internals (_next/static, _next/image)
    //   - favicon
    //   - static asset extensions (svg/png/jpg/jpeg/gif/webp/json -- last one excludes
    //     /eu-countries.json fetched at runtime by <EuropeMap> in Plan 01-05)
    //   - auth routes (login, register, auth/callback) -- Phase 2 routes; excluding
    //     them now prevents the "infinite redirect after login" classic bug
    '/((?!_next/static|_next/image|favicon.ico|login|register|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
}
