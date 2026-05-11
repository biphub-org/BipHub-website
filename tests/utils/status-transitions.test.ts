/**
 * State machine tests — Phase 3 ADMN-03 (approve), ADMN-04 (reject),
 * ADMN-08 (audit log invariants).
 *
 * Threat: T-03-03 — coordinator exploiting direct `rejected → pending`.
 * Mitigation: `validateTransition()` throws on invalid (from, to, actor) tuples.
 * Source: 03-CONTEXT.md D-06 state machine table.
 *
 * These stubs are filled in by Plan 03-01 when `lib/utils/status-transitions.ts`
 * is created.
 */
import { describe, it } from 'vitest'

describe('validateTransition (D-06 state machine)', () => {
  it.todo('allows draft → pending by coordinator (initial submit)')
  it.todo('allows pending → approved by admin (approveBipAction)')
  it.todo('allows pending → rejected by admin (rejectBipAction)')
  it.todo('allows rejected → draft by coordinator (resubmit edit)')
  it.todo('allows approved → rejected by admin (un-approve, reason required)')
  it.todo('allows pending → draft by coordinator (withdraw, Phase 2 locked)')
  it.todo('throws on rejected → pending by coordinator (T-03-03 mitigation)')
  it.todo('throws on draft → approved by coordinator (privilege escalation)')
  it.todo('throws on approved → approved (idempotent re-approve — not in D-06)')
  it.todo('throws when actor mismatches actor on the transition row')
})
