'use server'

/**
 * BIP draft Server Action (SUBM-02 / SUBM-06).
 *
 * Contract:
 *   - `'use server'` is file-level.
 *   - JWT validation uses `getClaims()` ONLY (CLAUDE.md never-do compliance).
 *   - On the very first auto-save (no `bipId` yet), we INSERT with a generated
 *     draft slug so the `bips.slug` NOT NULL constraint is satisfied (Pitfall 3).
 *     The slug is finalized at submission time by Plan 02-07's `submitBipAction`.
 *   - On subsequent saves, we UPDATE with optimistic locking via
 *     `.eq('updated_at', lastKnownUpdatedAt)`. When 0 rows match,
 *     `.maybeSingle()` returns `{ data: null }` and we surface
 *     `{ error: 'conflict' }` so the wizard can show the two-tab dialog.
 *   - `partner_universities` is intentionally stripped from the persistable
 *     payload — partners live in the `bip_partner_universities` table and
 *     require a finalized `bip_id`; Plan 02-07 writes them at submit time.
 *   - Slug is generated only on first INSERT; subsequent updates do NOT touch
 *     it. Status is hard-coded to `'draft'` on insert and never set on update
 *     — the RLS policy `bips_update_own_draft_or_pending` (migration 00006)
 *     forbids self-promotion to `approved`/`rejected`.
 */

import { createClient } from '@/lib/supabase/server'
import { generateDraftSlug } from '@/lib/utils/slug'
import type { BipDraftData } from '@/lib/store/bip-draft'

export type SaveDraftResult =
  | { success: true; bipId: string; updatedAt: string }
  | { error: 'conflict' }
  | { error: 'auth' }
  | { error: 'unknown'; message: string }

export async function saveDraftAction(
  stepData: Partial<BipDraftData>,
  bipId: string | null,
  lastKnownUpdatedAt: string | null,
): Promise<SaveDraftResult> {
  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()
  if (authError || !claimsData?.claims?.sub) {
    return { error: 'auth' }
  }
  const userId = claimsData.claims.sub

  // Strip step-level shape that does not map to bips columns directly.
  // partner_universities is a separate table written at submit time; if we
  // also receive it here on auto-save, we drop it silently.
  const { partner_universities: _ignored, ...persistable } = stepData
  void _ignored

  if (bipId && lastKnownUpdatedAt) {
    // UPDATE with optimistic locking — only succeeds if updated_at matches.
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('bips')
      .update({ ...persistable, updated_at: now })
      .eq('id', bipId)
      .eq('created_by', userId)
      .eq('updated_at', lastKnownUpdatedAt)
      .select('id, updated_at')
      .maybeSingle()

    if (error) return { error: 'unknown', message: error.message }
    // 0 rows matched the lock → another tab beat us to the update.
    if (!data) return { error: 'conflict' }

    return { success: true, bipId: data.id, updatedAt: data.updated_at }
  }

  // First INSERT — generate a draft slug to satisfy bips.slug NOT NULL.
  const draftSlug = generateDraftSlug(stepData.title ?? 'untitled')
  const { data, error } = await supabase
    .from('bips')
    .insert({
      ...persistable,
      created_by: userId,
      status: 'draft',
      slug: draftSlug,
      title: stepData.title ?? 'Untitled BIP',
    })
    .select('id, updated_at')
    .single()

  if (error) return { error: 'unknown', message: error.message }
  return { success: true, bipId: data.id, updatedAt: data.updated_at }
}
