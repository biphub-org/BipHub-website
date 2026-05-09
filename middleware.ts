import { type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

/**
 * Edge middleware for BipHub.
 *
 * Phase 1 (this implementation): refresh the Supabase session cookie on every
 * matched request, validate the JWT via getClaims(), but do NOT redirect
 * anywhere. Phase 1 has no auth UI -- redirecting to /login would create the
 * infinite-redirect loop described in PITFALLS Pitfall 2 (target route does
 * not exist; matcher would still hit it; loop).
 *
 * Phase 2 will add the redirect branches:
 *   - if !claims && pathname.startsWith('/dashboard') -> redirect('/login')
 *   - if claims && (pathname === '/login' || pathname === '/register') -> redirect('/dashboard')
 * Phase 3 will add the role guard:
 *   - if pathname.startsWith('/admin') && claims?.app_metadata?.role !== 'admin' -> redirect('/')
 *
 * The matcher (below the function) was set in Plan 01-01 to exclude /login,
 * /register, /auth/callback, and static assets so Phase 2's redirects can be
 * added without re-editing the config -- preventing Pitfall 2.
 *
 * Pattern from ARCHITECTURE.md lines 388-457 (modified for Phase 1: no
 * redirects yet).
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // CRITICAL: getClaims() validates the JWT signature on every request.
  // NEVER use getSession() in server code (PITFALLS Pitfall 1).
  // The result is intentionally unused in Phase 1 -- the side effect is the
  // session cookie refresh that createMiddlewareClient triggers via setAll().
  // Phase 2 will branch on the result for redirects.
  await supabase.auth.getClaims()

  return response
}

// Matcher set in Plan 01-01 -- DO NOT modify here. Adding redirect logic in
// Phase 2 requires no matcher change because /login, /register, /auth/callback
// are already excluded.
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
