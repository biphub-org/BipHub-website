/**
 * State machine tests — Phase 3 ADMN-03 (approve), ADMN-04 (reject),
 * ADMN-08 (audit log invariants).
 *
 * Threat: T-03-03 — coordinator exploiting direct `rejected → pending`.
 * Mitigation: `validateTransition()` throws on invalid (from, to, actor) tuples.
 * Source: 03-CONTEXT.md D-06 state machine table.
 */
import { describe, it, expect } from 'vitest'
import { validateTransition } from '@/lib/utils/status-transitions'

describe('validateTransition (D-06 state machine)', () => {
  it('allows draft → pending by coordinator (initial submit)', () => {
    expect(() => validateTransition('draft', 'pending', 'coordinator')).not.toThrow()
  })
  it('allows pending → approved by admin (approveBipAction)', () => {
    expect(() => validateTransition('pending', 'approved', 'admin')).not.toThrow()
  })
  it('allows pending → rejected by admin (rejectBipAction)', () => {
    expect(() => validateTransition('pending', 'rejected', 'admin')).not.toThrow()
  })
  it('allows rejected → draft by coordinator (resubmit edit)', () => {
    expect(() => validateTransition('rejected', 'draft', 'coordinator')).not.toThrow()
  })
  it('allows approved → rejected by admin (un-approve, reason required)', () => {
    expect(() => validateTransition('approved', 'rejected', 'admin')).not.toThrow()
  })
  it('allows pending → draft by coordinator (withdraw, Phase 2 locked)', () => {
    expect(() => validateTransition('pending', 'draft', 'coordinator')).not.toThrow()
  })
  it('throws on rejected → pending by coordinator (T-03-03 mitigation)', () => {
    expect(() => validateTransition('rejected', 'pending', 'coordinator')).toThrow(/Invalid status transition/)
  })
  it('throws on draft → approved by coordinator (privilege escalation)', () => {
    expect(() => validateTransition('draft', 'approved', 'coordinator')).toThrow(/Invalid status transition/)
  })
  it('throws on approved → approved (idempotent re-approve — not in D-06)', () => {
    expect(() => validateTransition('approved', 'approved', 'admin')).toThrow(/Invalid status transition/)
  })
  it('throws when actor mismatches actor on the transition row', () => {
    expect(() => validateTransition('pending', 'approved', 'coordinator')).toThrow(/Invalid status transition/)
  })
})
