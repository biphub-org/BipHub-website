/**
 * Email template render tests — Phase 3 ADMN-09 (approval) conditional note
 * block per D-14.
 *
 * Threat: T-03-06 — PII exposure in emails / missing EC disclaimer.
 * Mitigation: every template renders the EC disclaimer footer verbatim;
 * note block only renders when prop is set.
 *
 * Source: 03-CONTEXT.md D-14 (locked email content); 03-UI-SPEC.md Email
 * Template Visual Contract.
 *
 * Stubs filled in by Plan 03-03 (ApprovalEmail) and Plan 03-04 (RejectionEmail).
 */
import { describe, it } from 'vitest'

describe('ApprovalEmail', () => {
  it.todo('renders BIP title verbatim in heading')
  it.todo('renders public /bip/[slug] CTA href')
  it.todo('renders "Note from the BipHub team" block when note prop is set')
  it.todo('omits note block when note prop is undefined')
  it.todo('renders EC disclaimer footer "Independent project — not affiliated…"')
})

describe('RejectionEmail', () => {
  it.todo('renders reason verbatim in callout block')
  it.todo('renders /dashboard/bips/[id]/edit CTA href')
  it.todo('renders gold left-border on reason callout (per UI-SPEC)')
  it.todo('renders EC disclaimer footer')
})

describe('AdminNotificationEmail', () => {
  it.todo('renders coordinator name + university in body')
  it.todo('renders /admin/bips/[id]/review CTA href')
  it.todo('renders EC disclaimer footer')
})
