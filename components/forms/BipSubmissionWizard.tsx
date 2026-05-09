'use client'

/**
 * BipSubmissionWizard — multi-step wizard shell (SUBM-01..SUBM-07).
 *
 * Plan 02-06 ships steps 1-4. Step 5 Preview, the Two-Tab Conflict Dialog, and
 * the page entry routes (`/dashboard/bips/new`, `/dashboard/bips/[id]/edit`)
 * land in Plan 02-07. The wizard exposes `renderPreviewStep` and
 * `renderConflictDialog` slots so 02-07 plugs them in without re-editing this
 * file.
 *
 * Save lifecycle:
 *   1. Step component owns its RHF + step schema. On every blurred change it
 *      calls `mergeDraft` (Zustand mirror) and `onAutoSave` (debounced Server
 *      Action). The 1.5s debounce lives here.
 *   2. "Save & continue" submits the step's form, which calls `onContinue`.
 *      The wizard merges into the store and runs a synchronous `performSave`;
 *      on success it advances the step.
 *   3. `performSave` returns `{ ok: true | false }`; failure paths set
 *      `saveStatus = 'failed'` and either open the conflict dialog
 *      (`error: 'conflict'`) or persist localStorage + redirect to /login
 *      (`error: 'auth'`) or surface a Sonner toast (`error: 'unknown'`).
 *
 * Session-expiry recovery (SUBM-07):
 *   - `onAuthStateChange('SIGNED_OUT')` — primary signal — persists the draft
 *     to localStorage and redirects to /login with a toast.
 *   - `saveDraftAction` returning `{ error: 'auth' }` — belt-and-suspenders
 *     for the known issue that Server Action sign-out may not always trigger
 *     SIGNED_OUT events on the client (RESEARCH A4).
 *
 * Animations: only `motion/react` + `LazyMotion` (CLAUDE.md never-do).
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { toast } from 'sonner'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useBipDraft, type BipDraftData } from '@/lib/store/bip-draft'
import { saveDraftAction } from '@/lib/actions/bip-draft'
import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import { SaveStatusIndicator } from '@/components/forms/SaveStatusIndicator'
import { WizardStep1BasicInfo } from '@/components/forms/steps/WizardStep1BasicInfo'
import { WizardStep2ProgramDetails } from '@/components/forms/steps/WizardStep2ProgramDetails'
import { WizardStep3Partners } from '@/components/forms/steps/WizardStep3Partners'
import { WizardStep4ApplicationInfo } from '@/components/forms/steps/WizardStep4ApplicationInfo'
import type { UniversitySearchResult } from '@/lib/actions/universities'
import { cn } from '@/lib/utils/cn'

interface Props {
  /** Edit mode: pre-populated from DB by Plan 02-07's edit page. New mode: undefined. */
  initialBip?: { id: string; data: BipDraftData; updatedAt: string }
  /** Coordinator's profile-locked host university (Plan 02-04 guarantees non-null). */
  hostUniversity: { id: string; name: string; country: string }
  /** Pre-fetched university list seeded into Step 3's combobox. */
  initialUniversities: UniversitySearchResult[]
  /** Plan 02-07 plugs in Step 5 Preview here. */
  renderPreviewStep?: (props: {
    onSubmitConfirmed: () => void
    isSubmitting: boolean
  }) => React.ReactNode
  /** Plan 02-07 plugs in TwoTabConflictDialog here. */
  renderConflictDialog?: (props: {
    open: boolean
    onReload: () => void
    onOverwrite: () => void
  }) => React.ReactNode
}

const STEPS = [
  {
    id: 1,
    title: 'Basic information',
    subtitle: 'The core details that help students find and understand your BIP.',
  },
  {
    id: 2,
    title: 'Programme details',
    subtitle: 'Dates, credits, and participation requirements.',
  },
  {
    id: 3,
    title: 'Partner universities',
    subtitle: 'List the universities involved in this BIP.',
  },
  {
    id: 4,
    title: 'Application information',
    subtitle: 'How students apply and any eligibility requirements.',
  },
  {
    id: 5,
    title: 'Preview & submit',
    subtitle:
      'Review how your BIP will appear to students before submitting for review.',
  },
] as const

export function BipSubmissionWizard({
  initialBip,
  hostUniversity,
  initialUniversities,
  renderPreviewStep,
  renderConflictDialog,
}: Props) {
  const router = useRouter()
  const {
    bipId,
    currentStep,
    draft,
    lastKnownUpdatedAt,
    hydrated,
    hydrate,
    hydrateFromServer,
    setBipId,
    setCurrentStep,
    mergeDraft,
    setLastKnownUpdatedAt,
    setSaveStatus,
    persistToLocalStorage,
  } = useBipDraft()

  const [conflictOpen, setConflictOpen] = useState(false)

  // (a) Hydration: edit-mode pre-populates from DB; new mode reads localStorage.
  useEffect(() => {
    if (initialBip) hydrateFromServer(initialBip)
    else hydrate()
  }, [initialBip, hydrate, hydrateFromServer])

  // (b) Session-expiry recovery (SUBM-07).
  useEffect(() => {
    const supabase = createBrowserSupabase()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        persistToLocalStorage()
        toast.warning(
          'Your session has expired. Your draft has been saved locally — sign in again to continue.',
          { duration: 5000 },
        )
        setTimeout(() => {
          window.location.href =
            '/login?redirect=' + encodeURIComponent('/dashboard/bips/new')
        }, 1500)
      }
    })
    return () => subscription.unsubscribe()
  }, [persistToLocalStorage])

  // (c) Persist Server Action result back into the store.
  const performSave = useCallback(
    async (payload: Partial<BipDraftData>) => {
      setSaveStatus('saving')
      const result = await saveDraftAction(payload, bipId, lastKnownUpdatedAt)
      if ('error' in result) {
        if (result.error === 'conflict') {
          setSaveStatus('failed')
          setConflictOpen(true)
          return { ok: false as const }
        }
        if (result.error === 'auth') {
          // Belt-and-suspenders for the onAuthStateChange known issue.
          persistToLocalStorage()
          toast.warning(
            'Your session has expired. Your draft has been saved locally — sign in again to continue.',
            { duration: 5000 },
          )
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          return { ok: false as const }
        }
        setSaveStatus('failed')
        toast.error(
          'Failed to save draft. Your changes are preserved — tap Retry to try again.',
          { duration: 5000 },
        )
        return { ok: false as const }
      }
      setBipId(result.bipId)
      setLastKnownUpdatedAt(result.updatedAt)
      setSaveStatus('idle')
      return { ok: true as const }
    },
    [
      bipId,
      lastKnownUpdatedAt,
      setBipId,
      setLastKnownUpdatedAt,
      setSaveStatus,
      persistToLocalStorage,
    ],
  )

  // (d) 1.5s debounced auto-save on field blur (SUBM-02 / D-02).
  const debouncedAutoSave = useDebouncedCallback(
    (payload: Partial<BipDraftData>) => {
      void performSave(payload)
    },
    1500,
  )

  const handleStepChange = (next: number) => {
    setCurrentStep(next)
  }

  // (e) Save-and-continue: synchronous save then advance on success.
  const saveAndContinue = async (stepData: Partial<BipDraftData>) => {
    mergeDraft(stepData)
    const result = await performSave({ ...draft, ...stepData })
    if (result.ok) handleStepChange(Math.min(currentStep + 1, 5))
  }

  // (f) Conflict resolution handlers (Plan 02-07's dialog calls these).
  const handleReload = useCallback(() => {
    setConflictOpen(false)
    if (bipId) router.refresh()
    else window.location.reload()
  }, [bipId, router])

  const handleOverwrite = useCallback(async () => {
    setConflictOpen(false)
    if (!bipId) return
    // Read latest updated_at, then re-issue the lock-aware update.
    const supabase = createBrowserSupabase()
    const { data: latest } = await supabase
      .from('bips')
      .select('updated_at')
      .eq('id', bipId)
      .maybeSingle()
    if (latest?.updated_at) {
      setLastKnownUpdatedAt(latest.updated_at)
      await performSave(draft)
    }
  }, [bipId, draft, performSave, setLastKnownUpdatedAt])

  if (!hydrated) {
    return (
      <div className="p-12 text-center text-sm text-muted">
        Loading wizard…
      </div>
    )
  }

  const step = STEPS[currentStep - 1] ?? STEPS[0]

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-white rounded-md shadow-md w-full max-w-[760px] mx-auto my-8">
        {/* Wizard header */}
        <div className="border-b border-border px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Step {currentStep} of 5</p>
            <p className="text-sm font-semibold text-ink">{step.title}</p>
          </div>
          <div
            className="flex items-center gap-2"
            role="navigation"
            aria-label="Wizard steps"
          >
            {STEPS.map((s) => {
              const reached = s.id <= currentStep
              const isActive = s.id === currentStep
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${s.id}: ${s.title}`}
                  onClick={() => {
                    if (reached) handleStepChange(s.id)
                  }}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    isActive
                      ? 'bg-eu-blue ring-2 ring-eu-gold ring-offset-2'
                      : reached
                        ? 'bg-eu-blue'
                        : 'bg-border',
                    reached ? 'cursor-pointer' : 'cursor-not-allowed',
                  )}
                />
              )
            })}
          </div>
          <SaveStatusIndicator onRetry={() => void performSave(draft)} />
        </div>

        {/* Wizard body */}
        <div className="px-8 py-6 max-h-[calc(100vh-180px)] overflow-y-auto">
          <m.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <header className="mb-6">
              <h2 className="text-[22px] font-semibold text-ink">{step.title}</h2>
              <p className="mt-1 text-sm text-muted">{step.subtitle}</p>
            </header>

            {currentStep === 1 && (
              <WizardStep1BasicInfo
                onContinue={(values) => void saveAndContinue(values)}
                onAutoSave={(payload) => debouncedAutoSave(payload)}
              />
            )}
            {currentStep === 2 && (
              <WizardStep2ProgramDetails
                onContinue={(values) => void saveAndContinue(values)}
                onAutoSave={(payload) => debouncedAutoSave(payload)}
              />
            )}
            {currentStep === 3 && (
              <WizardStep3Partners
                hostUniversity={hostUniversity}
                initialUniversities={initialUniversities}
                onContinue={(values) => void saveAndContinue(values)}
              />
            )}
            {currentStep === 4 && (
              <WizardStep4ApplicationInfo
                onContinue={(values) => void saveAndContinue(values)}
                onAutoSave={(payload) => debouncedAutoSave(payload)}
              />
            )}
            {currentStep === 5 &&
              (renderPreviewStep ? (
                renderPreviewStep({
                  onSubmitConfirmed: () => {
                    /* Plan 02-07 wires submitBipAction */
                  },
                  isSubmitting: false,
                })
              ) : (
                <div className="rounded border border-border bg-bg-soft p-8 text-center text-sm text-muted">
                  Preview step requires Plan 02-07 integration.
                </div>
              ))}
          </m.div>
        </div>

        {/* Wizard footer */}
        <div className="border-t border-border px-8 py-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleStepChange(Math.max(currentStep - 1, 1))}
            className={cn(currentStep === 1 && 'invisible')}
          >
            ← Back
          </Button>
          {currentStep < 5 && (
            <Button
              type="submit"
              variant="primary"
              form={`wizard-step-${currentStep}-form`}
            >
              Save &amp; continue →
            </Button>
          )}
        </div>
      </div>

      {renderConflictDialog?.({
        open: conflictOpen,
        onReload: handleReload,
        onOverwrite: handleOverwrite,
      })}
    </LazyMotion>
  )
}
