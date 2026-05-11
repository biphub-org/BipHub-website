/**
 * Transactional email send wrapper (Phase 3 ADMN-09 / ADMN-10).
 *
 * Resend SDK in prod (RESEND_API_KEY set) or D-15 console fallback in dev.
 *
 * This module is server-only — it imports `Resend` (which reads
 * `RESEND_API_KEY` from process.env). It does NOT carry the
 * `'use server'` directive: the Server Actions that call it carry
 * `'use server'` themselves; this is a plain utility module.
 *
 * D-11 fire-and-forget contract: this function may throw on Resend
 * failure. Callers (Server Actions) MUST wrap in try/catch and NOT
 * re-throw — a Resend outage must not reverse a committed DB transaction.
 *
 * Source: 03-RESEARCH.md Pattern 5; 03-CONTEXT.md D-11, D-13, D-15.
 */
import * as React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { ApprovalEmail, type ApprovalEmailProps } from './templates/ApprovalEmail'
import { RejectionEmail, type RejectionEmailProps } from './templates/RejectionEmail'
// AdminNotificationEmail import deferred to Plan 03-05.

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export type EmailPayload =
  | { template: 'approval'; props: ApprovalEmailProps }
  | { template: 'rejection'; props: RejectionEmailProps }
  // | { template: 'admin-notification'; props: AdminNotificationEmailProps }  // Plan 03-05

const SUBJECTS = {
  approval: 'Your BIP is live on BipHub',
  rejection: 'Update needed on your BIP submission',
  // 'admin-notification': /* dynamic per-call */ '',                    // Plan 03-05
} as const

/**
 * Send a transactional email via Resend.
 *
 * D-15 local-dev fallback: when RESEND_API_KEY is unset, log the rendered
 * HTML + recipient + subject to console instead of calling Resend.
 */
export async function sendEmail(to: string, payload: EmailPayload): Promise<void> {
  let element: React.ReactElement
  let subject: string
  switch (payload.template) {
    case 'approval':
      element = React.createElement(ApprovalEmail, payload.props)
      subject = SUBJECTS.approval
      break
    case 'rejection':
      element = React.createElement(RejectionEmail, payload.props)
      subject = SUBJECTS.rejection
      break
    default: {
      const _exhaustive: never = payload
      throw new Error(
        `Unknown email template: ${String((_exhaustive as { template: string }).template)}`,
      )
    }
  }
  const html = await render(element)

  if (!resend) {
    // D-15: dev fallback — never call Resend without API key
    console.log('[EMAIL DEV]', {
      to,
      subject,
      html: html.slice(0, 400) + (html.length > 400 ? '…' : ''),
    })
    return
  }

  const replyTo = process.env.ADMIN_REPLY_TO_EMAIL || 'noreply@biphub.eu'

  await resend.emails.send({
    from: 'BipHub <noreply@biphub.eu>', // D-13 verified sender
    to,
    replyTo,
    subject,
    html,
  })
}
