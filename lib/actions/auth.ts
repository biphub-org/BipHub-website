'use server'

/**
 * Auth Server Actions for Phase 2 (AUTH-01..AUTH-06).
 *
 * Contract:
 *   - `'use server'` is file-level (top of file). Every export is a Server Action.
 *   - Each action accepts FormData so RHF can `formData.set` and call them directly.
 *   - JWT validation uses `getClaims()` ONLY — never the unvalidated session getter
 *     (CLAUDE.md never-do; PITFALLS Pitfall 1).
 *   - `await createClient()` on every call (factory awaits `cookies()` internally —
 *     PITFALLS Pitfall 3 / Next.js 15 async cookies).
 *   - Success-with-redirect actions throw via `next/navigation`'s `redirect()` and
 *     therefore never return; failure paths return `{ error }` for inline display.
 */

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  passwordResetSchema,
  passwordUpdateSchema,
} from '@/lib/schemas/auth'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// AUTH-03: sign in with email + password. Validates server-side then signs in.
// On success, redirects to /dashboard (or /onboarding when the profile is
// incomplete, or /admin when the role is admin) — Next.js redirect throws,
// never returns. Routing decision is made here so the browser doesn't bounce
// through /dashboard's layout before being re-redirected, which previously
// caused a visible white screen between server navigations (Plan 02-02 D-05).
export async function signInAction(formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    const msg = error.message.toLowerCase()
    // Map known Supabase error substrings to UI-SPEC error copy. Unknown errors fall through
    // to a generic message so we never leak internal account state (T-02-02-06).
    if (msg.includes('invalid login') || msg.includes('invalid_credentials')) {
      return { error: 'Email or password is incorrect.' }
    }
    if (msg.includes('email not confirmed')) {
      return {
        error:
          'Please verify your email before signing in. Check your inbox or resend the verification email.',
      }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  // Pick the final destination here so we skip the /dashboard → /onboarding
  // redirect bounce, which previously left the browser blank between two
  // server navigations. Mirrors the same profile-complete check that
  // (dashboard)/layout.tsx runs.
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims

  if (claims?.sub) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, university_id, contact_email, erasmus_code')
      .eq('id', claims.sub)
      .maybeSingle()

    const isComplete = Boolean(
      profile?.full_name &&
        profile?.university_id &&
        profile?.contact_email &&
        profile?.erasmus_code,
    )
    redirect(isComplete ? '/dashboard' : '/onboarding')
  }

  redirect('/dashboard')
}

// AUTH-01 + AUTH-02: register + dispatch verification email via Supabase mailer.
// emailRedirectTo points at /auth/callback so the PKCE code returns to our route handler.
export async function signUpAction(formData: FormData): Promise<{ error?: string }> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  })
  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('user already')) {
      return { error: 'An account with this email already exists. Sign in instead?' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }
  redirect('/verify-email?email=' + encodeURIComponent(parsed.data.email))
}

// AUTH-04: sign out from any page. revalidatePath('/', 'layout') busts the
// (public) layout's getClaims cache so the next render reflects the signed-out state.
export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// AUTH-05a: send the password-reset email. redirectTo includes type=recovery so
// /auth/callback knows to route to /reset-password/update.
//
// T-02-02-05: do NOT leak email existence. Return success regardless of Supabase error
// to avoid user-enumeration; log internally for ops visibility.
export async function requestPasswordResetAction(
  formData: FormData,
): Promise<{ error?: string; success?: true }> {
  const parsed = passwordResetSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid email.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/callback?type=recovery`,
  })
  if (error) {
    console.error('[requestPasswordResetAction] supabase error:', error.message)
  }
  return { success: true }
}

// AUTH-05b: update the password after the recovery callback set the session cookie.
// getClaims() validates we still have a valid recovery session before updating.
export async function updatePasswordAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = passwordUpdateSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password.' }
  }

  const supabase = await createClient()
  const { data, error: authError } = await supabase.auth.getClaims()
  if (authError || !data?.claims) {
    return { error: 'Your reset link has expired. Please request a new one.' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    return { error: 'Failed to update password. Please try again.' }
  }
  redirect('/dashboard')
}
