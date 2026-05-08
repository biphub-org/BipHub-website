import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge middleware for BipHub.
 *
 * Phase 1 (this file): pass-through skeleton. The matcher is fully expressed
 * NOW so Plan 01-08 / Phase 2 can layer auth refresh + route guards inside this
 * function without re-editing the config — matches PITFALLS Pitfall 2 prevention.
 *
 * Plan 01-08 will refresh the Supabase session here using
 * `lib/supabase/middleware.ts` and the official @supabase/ssr middleware
 * pattern (ARCHITECTURE.md lines 388-457).
 */
export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Run middleware on every path EXCEPT:
    //   - Next.js internals (_next/static, _next/image)
    //   - favicon
    //   - static asset extensions (svg/png/jpg/jpeg/gif/webp/json — last one excludes
    //     /eu-countries.json fetched at runtime by <EuropeMap> in Plan 01-05)
    //   - auth routes (login, register, auth/callback) — Phase 2 routes; excluding
    //     them now prevents the "infinite redirect after login" classic bug
    '/((?!_next/static|_next/image|favicon.ico|login|register|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
}
