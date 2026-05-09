import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

/**
 * !!! SERVICE-ROLE CLIENT -- BYPASSES ROW LEVEL SECURITY !!!
 *
 * This factory uses SUPABASE_SERVICE_ROLE_KEY which has full database access
 * regardless of RLS policies. Do NOT import from any file outside the
 * `app/(admin)/**` route group OR the file `lib/supabase/admin.ts` itself.
 *
 * The ESLint `no-restricted-imports` rule in `eslint.config.mjs` enforces
 * this boundary at lint time (PITFALLS Pitfall 7). If you have a non-admin
 * use case that requires bypassing RLS, the right answer is almost certainly
 * a more permissive RLS policy or a SECURITY DEFINER Postgres function in a
 * restricted schema -- NOT importing this client.
 *
 * Phase 1 builds this file; Phase 3 (`/admin` route group) is the first
 * caller. Phase 2 coordinator features must use `lib/supabase/server.ts`
 * (RLS-respecting).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'createAdminClient: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
    )
  }
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
