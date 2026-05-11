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
import { describe, it, expect } from 'vitest'
import { render } from '@react-email/components'
import { ApprovalEmail, type ApprovalEmailProps } from '@/lib/email/templates/ApprovalEmail'

async function renderApproval(props: ApprovalEmailProps): Promise<string> {
  return render(<ApprovalEmail {...props} />)
}

describe('ApprovalEmail', () => {
  it('renders BIP title verbatim in heading', async () => {
    const html = await renderApproval({
      bipTitle: 'Sustainable Cities BIP',
      bipSlug: 'sustainable-cities',
      coordinatorName: 'Alice',
    })
    expect(html).toContain('Sustainable Cities BIP')
  })

  it('renders public /bip/[slug] CTA href', async () => {
    const html = await renderApproval({
      bipTitle: 'X',
      bipSlug: 'unique-slug-abc',
      coordinatorName: 'A',
    })
    expect(html).toContain('https://biphub.eu/bip/unique-slug-abc')
  })

  it('renders "Note from the BipHub team" block when note prop is set', async () => {
    const html = await renderApproval({
      bipTitle: 'X',
      bipSlug: 'x',
      coordinatorName: 'A',
      note: 'Great work on the partner list!',
    })
    expect(html).toContain('Note from the BipHub team')
    expect(html).toContain('Great work on the partner list!')
  })

  it('omits note block when note prop is undefined', async () => {
    const html = await renderApproval({
      bipTitle: 'X',
      bipSlug: 'x',
      coordinatorName: 'A',
    })
    expect(html).not.toContain('Note from the BipHub team')
  })

  it('renders EC disclaimer footer "Independent project — not affiliated…"', async () => {
    const html = await renderApproval({
      bipTitle: 'X',
      bipSlug: 'x',
      coordinatorName: 'A',
    })
    expect(html).toContain('Independent project')
    expect(html).toContain('not affiliated with the European Commission')
  })
})

// RejectionEmail block — preserved from Plan 03-00 (filled in Plan 03-04)
describe('RejectionEmail', () => {
  it.todo('renders reason verbatim in callout block')
  it.todo('renders /dashboard/bips/[id]/edit CTA href')
  it.todo('renders gold left-border on reason callout (per UI-SPEC)')
  it.todo('renders EC disclaimer footer')
})

// AdminNotificationEmail block — preserved from Plan 03-00 (filled in Plan 03-05)
describe('AdminNotificationEmail', () => {
  it.todo('renders coordinator name + university in body')
  it.todo('renders /admin/bips/[id]/review CTA href')
  it.todo('renders EC disclaimer footer')
})
