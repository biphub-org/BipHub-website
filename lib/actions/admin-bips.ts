'use server'

/**
 * Admin BIP Server Actions (Phase 3).
 *
 *   - approveBipAction(bipId, note?)  — pending → approved (Plan 03-03, this file)
 *   - rejectBipAction(bipId, reason)  — pending|approved → rejected (Plan 03-04)
 *   - adminUpdateBipAction(...)       — admin edit (Plan 03-07)
 *
 * Sequence (D-11):
 *   1. getClaims() + role check
 *   2. Zod-validate input
 *   3. Read existing row (defense-in-depth)
 *   4. validateTransition() (state machine guard — T-03-03)
 *   5. UPDATE bips
 *   6. INSERT bip_status_history (action_kind = 'approve' or 'reject')
 *   7. revalidatePath('/bips') AND revalidatePath('/bip/[slug]')
 *   8. await sendEmail(...) wrapped in try/catch (fire-and-forget per D-11)
 *   9. redirect to next pending (or /admin)
 *
 * Auth: getClaims() — NEVER getSession (CLAUDE.md never-do).
 * Client: createClient (anon-key + admin JWT) — NEVER createAdminClient
 *   outside app/(admin)/** (CLAUDE.md never-do; eslint-enforced).
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApproveBipSchema } from '@/lib/schemas/admin-bips'
import { validateTransition } from '@/lib/utils/status-transitions'
import { getNextPendingBip } from '@/lib/queries/adminBips'
import { sendEmail } from '@/lib/email/send'
import type { BipStatus } from '@/lib/utils/status'

export type ActionResult = { error?: string; success?: true }

/**
 * Approve a pending BIP (ADMN-03, ADMN-08, ADMN-09).
 *
 * On success this function calls `redirect(...)` (NEVER returns normally).
 * On failure it returns `{ error: string }` so the modal can surface the
 * message to the admin. Per Next.js semantics, `redirect` throws a
 * NEXT_REDIRECT control flow error — DO NOT wrap the entire body in a
 * try/catch that swallows it.
 */
export async function approveBipAction(
  bipId: string,
  note?: string,
): Promise<ActionResult> {
  // 1. Auth + role guard
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const claims = authData?.claims ?? null
  if (authError || !claims?.sub) {
    return { error: 'Your session has expired. Please sign in again.' }
  }
  const role = (claims as { app_metadata?: { role?: string } }).app_metadata?.role
  if (role !== 'admin') return { error: 'Forbidden.' }

  // 2. Zod validate (server-side re-validation per D-11)
  const parsed = ApproveBipSchema.safeParse({ bipId, note })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  // 3. Read existing row (defense-in-depth — also needed for slug, title,
  // and coordinator email; T-03-05 forces the recipient to come from the DB,
  // not the request body)
  const { data: existing, error: readError } = await supabase
    .from('bips')
    .select(
      'id, slug, title, status, created_by, profiles:created_by ( contact_email, full_name )',
    )
    .eq('id', parsed.data.bipId)
    .maybeSingle()
  if (readError || !existing) return { error: 'BIP not found.' }

  // 4. State machine guard (T-03-03)
  try {
    validateTransition(existing.status as BipStatus, 'approved', 'admin')
  } catch {
    return { error: `Cannot approve from status ${existing.status}.` }
  }

  // 5. UPDATE bips
  const { error: updateError } = await supabase
    .from('bips')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', parsed.data.bipId)
  if (updateError) {
    console.error('[approveBipAction] update error:', updateError.message)
    return { error: 'Failed to approve. Please try again.' }
  }

  // 6. Audit log
  // NOTE: the migration 00010 trigger ONLY logs coordinator-initiated transitions
  // (draft→pending, pending→draft, rejected→draft). Admin transitions are
  // logged explicitly here so the `note` field can be populated.
  const { error: auditError } = await supabase
    .from('bip_status_history')
    .insert({
      bip_id: parsed.data.bipId,
      from_status: existing.status,
      to_status: 'approved',
      actor_id: claims.sub,
      note: parsed.data.note ?? null,
      action_kind: 'approve',
    })
  if (auditError) {
    // Continue — the DB write already succeeded. The trigger does not fire
    // for admin transitions, so this is the canonical audit row; surface
    // the error in logs but do NOT roll back the approve.
    console.error('[approveBipAction] audit insert failed:', auditError.message)
  }

  // 7. ISR cache bust
  revalidatePath('/bips')
  revalidatePath(`/bip/${existing.slug}`)
  revalidatePath('/admin')

  // 8. Email send (fire-and-forget per D-11)
  // PostgREST may return embedded relations as an object or a single-element array.
  const profilesRaw = (existing as { profiles?: unknown }).profiles
  const profiles = Array.isArray(profilesRaw)
    ? (profilesRaw[0] as { contact_email?: string | null; full_name?: string | null } | undefined)
    : (profilesRaw as { contact_email?: string | null; full_name?: string | null } | undefined)
  const coordinatorEmail = profiles?.contact_email ?? null
  if (coordinatorEmail) {
    try {
      await sendEmail(coordinatorEmail, {
        template: 'approval',
        props: {
          bipTitle: existing.title,
          bipSlug: existing.slug,
          coordinatorName: profiles?.full_name ?? '',
          note: parsed.data.note,
        },
      })
    } catch (err) {
      // D-11: Resend outage must NOT roll back the DB writes.
      console.error('[approveBipAction] email send failed (non-blocking):', err)
    }
  } else {
    console.warn(
      '[approveBipAction] coordinator has no contact_email on profile; skipping email.',
    )
  }

  // 9. Auto-advance (D-05)
  const next = await getNextPendingBip(parsed.data.bipId)
  if (next) {
    redirect(`/admin/bips/${next.id}/review`)
  }
  redirect('/admin')
}
