import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * PKCE code-exchange handler.
 *
 * Called by Supabase verification + recovery emails. The link contains a one-time
 * `code` plus an optional `type` discriminator (we use `type=recovery` for password
 * reset; signup verification carries no `type`).
 *
 * Routing contract:
 *   - signup verification (no type)        → /onboarding (D-07)
 *   - password recovery  (type=recovery)   → /reset-password/update
 *   - exchange failure / missing code      → /login?error=verification_failed
 *
 * Open-redirect safety (T-02-02-10): the destination is built from the
 * server-controlled `NEXT_PUBLIC_SITE_URL` plus a hard-coded path; user-supplied
 * query strings cannot influence the destination beyond the `type` discriminator.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (!code) {
    console.error('[auth/callback] no code in querystring')
    return NextResponse.redirect(`${SITE_URL}/login?error=verification_failed&reason=no_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    // Surface the real Supabase error to Vercel logs + a sanitized hint to the URL.
    // Most common: missing code_verifier cookie (signup happened in a different
    // browser/profile than the one that clicked the email link).
    console.error('[auth/callback] exchangeCodeForSession failed:', {
      status: error.status,
      name: error.name,
      message: error.message,
    })
    const reason = encodeURIComponent(error.message ?? 'exchange_failed').slice(0, 120)
    return NextResponse.redirect(`${SITE_URL}/login?error=verification_failed&reason=${reason}`)
  }

  const destination =
    type === 'recovery'
      ? `${SITE_URL}/reset-password/update`
      : `${SITE_URL}/onboarding`
  return NextResponse.redirect(destination)
}
