/**
 * /dashboard/bips/[id]/edit — Edit BIP entry route (DASH-03 / DASH-04).
 *
 * Async RSC that:
 *   1. Awaits the dynamic `id` param (Next.js 15 turns route params async).
 *   2. Calls `getCoordinatorBipById(id)` which already enforces ownership
 *      (`eq('created_by', claims.sub)`) and the draft/pending status whitelist.
 *      Approved / rejected / non-existent / non-owned records all return null.
 *   3. 404s on null so non-editable BIPs surface as a clean "not found"
 *      rather than a stale wizard.
 *   4. Mounts `<BipSubmissionWizard>` with `initialBip` so the wizard's
 *      `hydrateFromServer` path pre-populates the Zustand store from the DB
 *      (skipping localStorage hydration), then plugs in Plan 02-07's
 *      render-prop slots for Step 5 + ConflictDialog.
 *
 * Auth + RLS layers are owned by `getCoordinatorBipById` — see its docstring.
 */
import { notFound } from 'next/navigation'
import { searchUniversitiesAction } from '@/lib/actions/universities'
import { getCoordinatorBipById } from '@/lib/queries/coordinatorBipById'
import { BipSubmissionWizard } from '@/components/forms/BipSubmissionWizard'
import { WizardStep5Preview } from '@/components/forms/steps/WizardStep5Preview'
import { TwoTabConflictDialog } from '@/components/forms/TwoTabConflictDialog'

export default async function EditBipPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const record = await getCoordinatorBipById(id)
  if (!record || !record.hostUniversity) notFound()

  const initialUniversities = await searchUniversitiesAction('')
  const host = record.hostUniversity

  return (
    <section className="py-6">
      <BipSubmissionWizard
        initialBip={{
          id: record.id,
          data: record.data,
          updatedAt: record.updatedAt,
        }}
        hostUniversity={host}
        initialUniversities={initialUniversities}
        renderPreviewStep={() => <WizardStep5Preview hostUniversity={host} />}
        renderConflictDialog={(props) => <TwoTabConflictDialog {...props} />}
      />
    </section>
  )
}
