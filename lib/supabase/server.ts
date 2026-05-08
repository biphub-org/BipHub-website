import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client factory.
 *
 * CRITICAL CONTRACT:
 *   1. `await cookies()` — Next.js 15 made next/headers async; sync usage compiles
 *      silently and breaks auth (PITFALLS Pitfall 3).
 *   2. Callers that gate access MUST use `supabase.auth.getClaims()`, NEVER
 *      `getSession()` (PITFALLS Pitfall 1). `getClaims()` validates the JWT
 *      signature; `getSession()` trusts cookies blindly.
 *   3. Uses the publishable (anon) key — RLS is the authorization boundary.
 *      Service-role calls go through `lib/supabase/admin.ts` (Plan 01-08), which
 *      MUST NEVER be imported outside the (admin) route group.
 */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components cannot write cookies directly.
            // Middleware handles cookie writes on the next request.
          }
        },
      },
    },
  )
}
