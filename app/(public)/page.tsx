import { createClient } from '@/lib/supabase/server'

// Walking-skeleton homepage. Plan 01-05 replaces this with the full
// Hero + EuropeMap + CategoriesBar + StatsSection + RecentBips + HowItWorks
// + UniversityCTA composition. For now, this RSC's only job is to prove that
// the Next.js -> Supabase -> RLS -> render round-trip works end-to-end.
//
// Subsequent plans MUST keep this server-side data-fetch pattern: RSC fetches
// data with the server client and passes it down as props (ARCHITECTURE Pattern
// 1 "RSC passes props to client components").

export default async function HomePage() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('bips')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  if (error) {
    // Phase 1 skeleton: surface DB errors directly so a misconfigured local
    // setup is obvious. Plan 01-05 will replace with proper error.tsx.
    return (
      <main className="min-h-screen grid place-items-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">BipHub — skeleton</h1>
          <p className="mt-4 text-red-600">
            Supabase read failed: {error.message}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Run <code>npx supabase status</code> and verify
            <code>.env.local</code> matches.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">BipHub</h1>
        <p className="mt-2 text-sm">
          Walking skeleton — Phase 1 / Plan 01.
        </p>
        <p className="mt-6 text-lg">
          Approved BIPs in database: <strong>{count ?? 0}</strong>
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Plan 01-04 wires the real homepage.
        </p>
        <p className="mt-8 text-xs text-gray-400">
          Independent project — not affiliated with the European Commission.
        </p>
      </div>
    </main>
  )
}
