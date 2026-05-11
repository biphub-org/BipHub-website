/**
 * Admin BIP queries (Phase 3 / ADMN-02).
 *
 * Auth: getClaims() validates JWT signature (CLAUDE.md compliance — the
 *   unvalidated session reader is forbidden server-side).
 *
 * Client: anon-key server client (`createClient` from lib/supabase/server).
 *   The admin RLS `bips_select_own_or_approved` admin clause returns all
 *   rows when JWT `app_metadata.role = 'admin'`, so the service-role
 *   bypass is unnecessary here AND would violate the CLAUDE.md scope rule
 *   (service-role client only inside app/(admin)/ and lib/supabase/admin.ts;
 *   this file lives in lib/queries/).
 *
 * Plan 03-03 + 03-06 + 03-07 will extend this module with
 * `getAdminBipById`, `getAdminBips` (all-listings), and analytics.
 */
import { createClient } from '@/lib/supabase/server'
import { getBipById } from '@/lib/queries/bipDetail'
import type { BipDetail } from '@/lib/queries/bipDetail'
import type { BipStatus } from '@/lib/utils/status'

export type AdminBip = {
  id: string
  slug: string
  title: string
  status: BipStatus
  host_city: string | null
  physical_start_date: string | null
  physical_end_date: string | null
  created_at: string
  updated_at: string
  host_university: { id: string; name: string; country: string } | null
  coordinator_name: string | null
  coordinator_university: string | null
}

type RawHostUniversity =
  | { id: string; name: string; country: string }
  | Array<{ id: string; name: string; country: string }>
  | null

type RawCoordinatorUniversity =
  | { name: string }
  | Array<{ name: string }>
  | null

type RawCoordinator =
  | { full_name: string | null; university: RawCoordinatorUniversity }
  | Array<{ full_name: string | null; university: RawCoordinatorUniversity }>
  | null

type RawAdminBipRow = {
  id: string
  slug: string
  title: string
  status: string
  host_city: string | null
  physical_start_date: string | null
  physical_end_date: string | null
  created_at: string
  updated_at: string
  host_university: RawHostUniversity
  coordinator: RawCoordinator
}

function normalize(row: RawAdminBipRow): AdminBip {
  const hostUniversity = Array.isArray(row.host_university)
    ? (row.host_university[0] ?? null)
    : (row.host_university ?? null)

  const coordinator = Array.isArray(row.coordinator)
    ? (row.coordinator[0] ?? null)
    : (row.coordinator ?? null)

  const coordinatorUniversity = coordinator?.university ?? null
  const coordinatorUniversityResolved = Array.isArray(coordinatorUniversity)
    ? (coordinatorUniversity[0] ?? null)
    : coordinatorUniversity

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status as BipStatus,
    host_city: row.host_city,
    physical_start_date: row.physical_start_date,
    physical_end_date: row.physical_end_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    host_university: hostUniversity,
    coordinator_name: coordinator?.full_name ?? null,
    coordinator_university: coordinatorUniversityResolved?.name ?? null,
  }
}

const ADMIN_BIP_SELECT = `
  id, slug, title, status, host_city,
  physical_start_date, physical_end_date,
  created_at, updated_at,
  host_university:host_university_id ( id, name, country ),
  coordinator:created_by ( full_name, university:university_id ( name ) )
`

/**
 * Return all pending BIPs in FIFO order (oldest first per D-02).
 *
 * Empty array on auth failure — the UI then renders the "No pending BIPs"
 * empty state, which is also the correct outcome for a non-admin who
 * somehow reached this code path (defense in depth via RLS).
 */
export async function getAdminPendingBips(): Promise<AdminBip[]> {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const claims = authData?.claims ?? null
  if (authError || !claims?.sub) return []

  const { data, error } = await supabase
    .from('bips')
    .select(ADMIN_BIP_SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true }) // FIFO per D-02

  if (error) {
    console.error('[getAdminPendingBips] supabase error:', error.message)
    return []
  }
  return (data ?? []).map((row) => normalize(row as unknown as RawAdminBipRow))
}

/**
 * Full BIP detail for admin review (Plan 03-03).
 *
 * Delegates to `getBipById` so BipBody / BipSidebar / BipHeader render
 * against the same `BipDetail` shape as the public detail page. The
 * admin RLS clause on `bips_select_own_or_approved` returns all rows
 * when the JWT carries `app_metadata.role = 'admin'`, so no service-role
 * bypass is required (CLAUDE.md never-do compliance).
 *
 * Auth: getClaims() validates the JWT signature; non-admin callers get
 * null on the role check below — defense in depth even if the route
 * group's layout guard is bypassed.
 */
export async function getAdminBipById(bipId: string): Promise<BipDetail | null> {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const claims = authData?.claims ?? null
  if (authError || !claims?.sub) return null

  // Role guard — RLS would also strip non-admin reads of pending/rejected/draft
  // rows, but make the contract explicit here so future callers can't accidentally
  // surface admin-only data on a public surface.
  const role = (claims as { app_metadata?: { role?: string } }).app_metadata?.role
  if (role !== 'admin') return null

  return getBipById(bipId)
}

/**
 * Return the next pending BIP after the just-actioned one (D-05 auto-advance).
 * Excludes `excludeId` so the immediately-actioned BIP is not returned.
 *
 * Used by Plan 03-03 (approve) and Plan 03-04 (reject) to redirect the admin
 * straight to the next item in the queue after an approve/reject action.
 */
export async function getNextPendingBip(
  excludeId: string,
): Promise<{ id: string; title: string } | null> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  if (!authData?.claims?.sub) return null

  const { data, error } = await supabase
    .from('bips')
    .select('id, title')
    .eq('status', 'pending')
    .neq('id', excludeId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[getNextPendingBip] supabase error:', error.message)
    return null
  }
  return data ?? null
}
