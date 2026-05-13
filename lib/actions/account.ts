'use server'

/**
 * Account Server Actions (FOUN-07 / Phase 4 D-07..D-10).
 *
 * Contract:
 *   - `'use server'` at file top — every export is a Server Action.
 *   - JWT validation via `getClaims()` ONLY (CLAUDE.md never-do; PITFALLS Pitfall 1).
 *   - `await createClient()` (factory awaits `cookies()` internally; PITFALLS Pitfall 3).
 *   - No `createAdminClient` — the SECURITY DEFINER `delete_my_account` RPC is the
 *     controlled privilege escalation; the action itself runs as the coordinator.
 *   - No deletion confirmation email (D-10): the account email is destroyed by the
 *     operation; the user already typed it verbatim to confirm.
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const DeleteAccountSchema = z.object({
  typedEmail: z.string().email('Type your account email to confirm.'),
})

/**
 * Delete the calling coordinator's account.
 *
 * Flow:
 *   1. Verify the caller is authenticated and resolve `claims.email`.
 *   2. Validate the typed-email confirmation (defence-in-depth — the modal
 *      button is disabled until typed === claims.email, but a user could
 *      bypass the disabled state via DevTools).
 *   3. Collect slugs of approved BIPs we are about to anonymize (must happen
 *      BEFORE the RPC fires — after deletion, `created_by` is NULL).
 *   4. Call `delete_my_account` RPC: anonymizes approved BIPs, deletes
 *      draft/pending/rejected, deletes auth.users row (atomic).
 *   5. Sign the now-deleted session out (clears the auth cookie).
 *   6. revalidatePath('/bips') + each anonymized slug + '/'.
 *   7. redirect('/?deleted=1') — homepage toast island fires on landing.
 */
export async function deleteAccountAction(formData: FormData): Promise<never> {
  const supabase = await createClient()

  // 1. Auth check + email resolution.
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims()
  if (claimsErr || !claimsData?.claims?.sub) {
    redirect('/login')
  }
  const claims = claimsData.claims
  const sessionEmail = typeof claims.email === 'string' ? claims.email : ''
  const userId = claims.sub

  // 2. Typed-email validation (server-side defence-in-depth — T-04-17).
  const parsed = DeleteAccountSchema.safeParse({
    typedEmail: formData.get('typedEmail'),
  })
  if (!parsed.success) {
    throw new Error('Type your account email to confirm.')
  }
  if (
    parsed.data.typedEmail.toLowerCase().trim() !==
    sessionEmail.toLowerCase().trim()
  ) {
    throw new Error('Typed email does not match your account email.')
  }

  // 3. Collect slugs to revalidate AFTER the RPC fires. Once auth.users is
  //    deleted, `created_by` is NULL on the surviving anonymized rows and we
  //    cannot filter by it.
  const { data: approvedSlugs } = await supabase
    .from('bips')
    .select('slug')
    .eq('created_by', userId)
    .eq('status', 'approved')

  // 4. Fire the SECURITY DEFINER RPC. Atomic: anonymize approved →
  //    delete draft/pending/rejected → delete auth.users row.
  const { error: rpcErr } = await supabase.rpc('delete_my_account')
  if (rpcErr) {
    throw new Error(`Account deletion failed: ${rpcErr.message}`)
  }

  // 5. Sign out — clears the (now stale) auth cookie. Order matters: if the
  //    RPC threw above, we keep the user signed in so the modal can toast
  //    the error (T-04-20).
  await supabase.auth.signOut()

  // 6. Bust ISR caches for the public directory + each anonymized BIP slug.
  revalidatePath('/bips')
  for (const row of approvedSlugs ?? []) {
    if (row?.slug) revalidatePath(`/bip/${row.slug}`)
  }
  revalidatePath('/')

  // 7. Redirect to homepage with the deletion-toast trigger param.
  redirect('/?deleted=1')
}
