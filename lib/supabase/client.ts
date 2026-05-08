import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client factory.
 *
 * `createBrowserClient` returns a singleton internally — safe to call multiple
 * times across components. Use this in 'use client' components only. Server
 * Components MUST use `lib/supabase/server.ts` instead.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
