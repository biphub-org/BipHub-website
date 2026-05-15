/**
 * /guides — static hub indexing every entry in lib/content/guides.ts.
 *
 * Grouped by audience (students / coordinators) so visitors can scan to the
 * section relevant to them. Cards link to /guides/<slug>.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow } from '@/components/home/Eyebrow'
import { GUIDES, type Guide } from '@/lib/content/guides'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Guides · BipHub',
  description:
    'Practical guides for Erasmus+ BIPs — how to choose a programme, how to apply, and how universities can list their own BIPs.',
  alternates: { canonical: 'https://biphub.eu/guides' },
}

const STUDENT_GUIDES = GUIDES.filter((g) => g.audience === 'students')
const COORDINATOR_GUIDES = GUIDES.filter((g) => g.audience === 'coordinators')

export default function GuidesHubPage() {
  return (
    <div className="container mx-auto max-w-[1100px] px-4 lg:px-6 py-16 lg:py-24">
      <header className="mb-12 max-w-[60ch]">
        <Eyebrow className="mb-3">Guides</Eyebrow>
        <h1
          className="font-bold text-ink"
          style={{
            fontSize: 'clamp(34px, 5vw, 52px)',
            lineHeight: '1.1',
            letterSpacing: '-1.5px',
          }}
        >
          Practical guides to Erasmus+ BIPs.
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-muted">
          Short, opinionated reads — written for the people who actually need
          them, not for search engines. Updated as the programme rules and the
          directory evolve.
        </p>
      </header>

      <section className="mb-16">
        <Eyebrow className="mb-3">For students</Eyebrow>
        <h2 className="mb-6 text-[clamp(24px,3vw,32px)] font-bold tracking-tight text-ink">
          Find and apply
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {STUDENT_GUIDES.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      </section>

      <section>
        <Eyebrow className="mb-3">For coordinators</Eyebrow>
        <h2 className="mb-6 text-[clamp(24px,3vw,32px)] font-bold tracking-tight text-ink">
          List and maintain
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {COORDINATOR_GUIDES.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      </section>
    </div>
  )
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group relative flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-px hover:border-eu-blue hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-eu-blue">
        {guide.readingTime}
      </p>
      <h3 className="mt-2 text-[20px] font-bold leading-snug text-ink group-hover:text-eu-blue">
        {guide.title}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
        {guide.summary}
      </p>
      <span
        aria-hidden="true"
        className="mt-5 inline-flex items-center text-sm font-semibold text-eu-blue"
      >
        Read guide →
      </span>
    </Link>
  )
}
