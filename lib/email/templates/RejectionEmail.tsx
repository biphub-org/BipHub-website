/**
 * RejectionEmail — coordinator notification when a BIP is rejected (ADMN-10 / D-14).
 *
 * Reason is rendered verbatim inside a gold left-border callout per
 * 03-UI-SPEC.md. `whiteSpace: 'pre-wrap'` preserves admin formatting
 * without HTML injection — JSX escapes by default (T-03-06 mitigation).
 *
 * EC disclaimer in footer is MANDATORY (CLAUDE.md never-do compliance).
 *
 * Source: 03-CONTEXT.md D-14; 03-UI-SPEC.md Email Template Visual Contract.
 */
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Preview,
} from '@react-email/components'
import { EMAIL_TOKENS as T } from '../tokens'

export interface RejectionEmailProps {
  bipTitle: string
  bipId: string
  reason: string
  coordinatorName: string
  /** Overrideable for tests; defaults to https://biphub.eu */
  siteOrigin?: string
}

export function RejectionEmail({
  bipTitle,
  bipId,
  reason,
  coordinatorName,
  siteOrigin = 'https://biphub.eu',
}: RejectionEmailProps) {
  const editUrl = `${siteOrigin}/dashboard/bips/${bipId}/edit`
  const dashboardUrl = `${siteOrigin}/dashboard`

  return (
    <Html>
      <Head />
      <Preview>Update needed on your BIP submission</Preview>
      <Body
        style={{
          backgroundColor: T.bgSoft,
          fontFamily: T.fontFamily,
          margin: 0,
          padding: '32px 16px',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.borderRadius,
            padding: '32px',
          }}
        >
          {/* Header */}
          <Text style={{ fontSize: '22px', fontWeight: 700, color: T.euBlue, margin: 0 }}>
            BipHub
          </Text>
          <Text
            style={{
              fontSize: '11px',
              color: T.euBlue,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '4px',
            }}
          >
            BIP UPDATE
          </Text>

          <div style={{ height: T.gap }} />

          {/* H1 */}
          <Heading
            as="h1"
            style={{
              fontSize: T.headingSize,
              fontWeight: T.headingWeight,
              color: T.ink,
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            Update needed on your BIP submission
          </Heading>

          <div style={{ height: T.gap }} />

          {/* Body */}
          <Text style={{ fontSize: T.bodySize, color: T.ink, lineHeight: T.bodyLineHeight, margin: 0 }}>
            Hi {coordinatorName || 'there'},
          </Text>
          <Text
            style={{
              fontSize: T.bodySize,
              color: T.ink,
              lineHeight: T.bodyLineHeight,
              marginTop: T.smallGap,
            }}
          >
            Your submission <strong>&ldquo;{bipTitle}&rdquo;</strong> needs changes before it can go live.
          </Text>

          {/* Reason callout — gold left border per UI-SPEC */}
          <Section
            style={{
              borderLeft: `4px solid ${T.euGold}`,
              paddingLeft: '12px',
              margin: `${T.gap} 0`,
              backgroundColor: T.bgSoft,
              padding: '12px 16px',
              borderRadius: '0 6px 6px 0',
            }}
          >
            <Text
              style={{
                fontSize: T.smallSize,
                fontWeight: T.semiboldWeight,
                color: T.ink2,
                margin: 0,
              }}
            >
              Reviewer feedback
            </Text>
            <Text
              style={{
                fontSize: T.bodySize,
                color: T.ink,
                lineHeight: T.bodyLineHeight,
                marginTop: '4px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {reason}
            </Text>
          </Section>

          <Text
            style={{
              fontSize: T.bodySize,
              color: T.ink,
              lineHeight: T.bodyLineHeight,
            }}
          >
            You can revise and resubmit at any time.
          </Text>

          <div style={{ height: '24px' }} />

          {/* Primary CTA */}
          <Button
            href={editUrl}
            style={{
              backgroundColor: T.euBlue,
              color: T.white,
              padding: '12px 24px',
              borderRadius: T.pillRadius,
              fontSize: T.smallSize,
              fontWeight: T.semiboldWeight,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Edit and resubmit →
          </Button>

          <div style={{ height: T.gap }} />

          <Text style={{ fontSize: T.smallSize, color: T.muted, lineHeight: T.smallLineHeight }}>
            Or open your{' '}
            <a href={dashboardUrl} style={{ color: T.euBlue, textDecoration: 'underline' }}>
              BipHub dashboard
            </a>{' '}
            to see all your submissions.
          </Text>

          <Hr style={{ borderTop: `1px solid ${T.border}`, margin: '32px 0 16px 0' }} />

          {/* EC disclaimer — MANDATORY per CLAUDE.md */}
          <Text style={{ fontSize: '12px', color: T.muted, margin: 0 }}>
            Independent project — not affiliated with the European Commission
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
