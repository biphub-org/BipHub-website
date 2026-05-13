import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeleteAccountDialog } from '@/components/dashboard/DeleteAccountDialog'

/**
 * /dashboard/settings (FOUN-07 / D-07).
 *
 * v1 hosts a single "Danger zone" section — account deletion. Profile
 * editing belongs to a future iteration; do not scope-creep this page.
 *
 * The (dashboard) layout already gates this route with getClaims() +
 * profile-complete check. The page-level getClaims() call is
 * defence-in-depth (Phase 2 pattern); claims.email feeds the dialog so the
 * coordinator can match it verbatim.
 */
export const metadata = {
  title: 'Settings · BipHub',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) {
    redirect('/login')
  }
  const claims = data.claims
  const accountEmail = typeof claims.email === 'string' ? claims.email : ''

  return (
    <div className="py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-2 text-muted">Manage your account.</p>
      </header>

      <section
        aria-labelledby="danger-zone-heading"
        className="rounded-lg border border-red-200 bg-red-50/50 p-6"
      >
        <h2
          id="danger-zone-heading"
          className="text-lg font-semibold text-red-900"
        >
          Danger zone
        </h2>
        <p className="mt-2 text-sm text-red-900/80">
          Deleting your account is permanent. Approved BIPs you submitted will
          remain published in the public Erasmus+ directory, but anonymized:
          your name and contact email will be removed. Drafts, pending, and
          rejected submissions are deleted entirely. There is no grace period.
        </p>
        <div className="mt-6">
          <DeleteAccountDialog accountEmail={accountEmail} />
        </div>
      </section>
    </div>
  )
}
