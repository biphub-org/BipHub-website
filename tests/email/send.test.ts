/**
 * Email send wrapper tests — Phase 3 ADMN-09 (approval), ADMN-10 (rejection),
 * D-15 local-dev console fallback.
 *
 * Threat: T-03-05 — service-role key leakage / API key exposed to client.
 * Mitigation: `lib/email/send.ts` is server-only; D-15 fallback uses
 * console.log (no network) when RESEND_API_KEY is unset.
 *
 * Source: 03-CONTEXT.md D-15; 03-RESEARCH.md Pattern 5.
 *
 * Stubs filled in by Plan 03-03 when `lib/email/send.ts` is created.
 */
import { describe, it } from 'vitest'

describe('sendEmail (D-15 fallback)', () => {
  it.todo('logs rendered HTML + recipient + subject to console when RESEND_API_KEY unset')
  it.todo('calls resend.emails.send with from=BipHub <noreply@biphub.eu> when key set')
  it.todo('uses ADMIN_REPLY_TO_EMAIL env var as replyTo when set')
  it.todo('defaults replyTo to noreply@biphub.eu when ADMIN_REPLY_TO_EMAIL unset')
  it.todo('does not throw when resend.emails.send rejects (fire-and-forget contract D-11)')
})
