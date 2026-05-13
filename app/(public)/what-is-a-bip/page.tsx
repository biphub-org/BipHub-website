/**
 * /what-is-a-bip — static explainer page (RSC).
 *
 * Implements INFO-01 (BIP explainer covering KA131, virtual component, ECTS,
 * eligibility), INFO-02 (FAQ section with 8 items per Phase 4 D-06), and
 * INFO-04 (outbound link to the official EC Erasmus+ programme guide).
 *
 * Per Phase 4 D-04 + D-05 + D-06 in 04-CONTEXT.md:
 *  - Pure RSC (no 'use client'), `force-static` revalidation.
 *  - 5 content sections (anchored ids match the desktop jump-link nav).
 *  - 8 locked FAQ items in an accordion (uses @base-ui/react Accordion via
 *    the shadcn wrapper — `multiple` prop, NOT `type='multiple'`).
 *  - Outbound EC link with rel="noopener noreferrer", text restricted to
 *    "Read the official Erasmus+ programme guide entry on BIPs" — no claim
 *    of EC affiliation (CLAUDE.md never-do).
 *
 * The footer link at /what-is-a-bip was forward-declared in Plan 01-04;
 * this page is the destination.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow } from '@/components/home/Eyebrow'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'What is a BIP? · BipHub',
  description:
    'An Erasmus+ Blended Intensive Programme (BIP) is a short, intensive course combining a 5–10 day in-person mobility with a virtual component, worth 3–6 ECTS credits. Here is what to know before applying.',
  alternates: { canonical: 'https://biphub.eu/what-is-a-bip' },
}

const SECTIONS = [
  { id: 'what', label: 'What is a BIP?' },
  { id: 'virtual-physical', label: 'Virtual + physical components' },
  { id: 'ects', label: 'ECTS, eligibility, language' },
  { id: 'find', label: 'How to find one on BipHub' },
  { id: 'faq', label: 'Frequently asked questions' },
] as const

export default function WhatIsABipPage() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 lg:px-6 py-16 lg:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[200px_1fr]">
        {/* Desktop-only jump-link sidebar */}
        <aside className="hidden lg:block">
          <nav
            aria-label="Page sections"
            className="sticky top-24 flex flex-col gap-2 text-sm"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              On this page
            </p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-ink-2 transition-colors hover:text-eu-blue"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content column */}
        <article className="min-w-0">
          {/* Page header */}
          <header className="mb-12">
            <Eyebrow className="mb-3">Student guide</Eyebrow>
            <h1
              className="font-bold text-ink"
              style={{
                fontSize: 'clamp(34px, 5vw, 52px)',
                lineHeight: '1.1',
                letterSpacing: '-1.5px',
              }}
            >
              What is a Blended Intensive Programme?
            </h1>
            <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-muted">
              A short, fully-funded Erasmus+ format that combines a 5&ndash;10 day
              in-person mobility with an online learning component. Here is what
              to know before you apply.
            </p>
          </header>

          {/* Section 1 — What is a BIP? */}
          <section id="what" className="mb-16 scroll-mt-24">
            <Eyebrow className="mb-3">Definition</Eyebrow>
            <h2 className="text-[clamp(28px,3.5vw,40px)] font-bold tracking-tight text-ink">
              What is a BIP?
            </h2>
            <div className="mt-4 max-w-none text-ink-2 leading-relaxed space-y-4">
              <p>
                A BIP is a Blended Intensive Programme — a short, mixed-format
                course funded under the European Union&apos;s flagship higher-
                education mobility scheme, Erasmus+ Key Action 131 (KA131). It is
                organised by a group of European universities, with one host and
                several partner institutions, and is open to students enrolled at
                any of them.
              </p>
              <p>
                The &ldquo;intensive&rdquo; part is literal: the in-person
                component runs for just 5 to 10 days. Students travel to the host
                university for an immersive week of seminars, labs, group work, or
                field trips on a defined topic — sustainable cities, AI ethics,
                European business law, you name it.
              </p>
              <p>
                The &ldquo;blended&rdquo; part is what distinguishes BIPs from a
                conventional short exchange. Every BIP includes a mandatory
                virtual learning component delivered before, during, or after the
                physical week. Together, the two halves earn participants 3 to 6
                ECTS credits that count toward their home degree.
              </p>
              <p>
                BIPs were introduced in the 2021&ndash;2027 Erasmus+ programme
                cycle as a way to broaden access to international study for
                students who cannot commit to a full semester abroad — working
                students, parents, students on tight degree timelines, or anyone
                hesitant about a long-form exchange.
              </p>
            </div>
          </section>

          {/* Section 2 — Virtual + physical components */}
          <section id="virtual-physical" className="mb-16 scroll-mt-24">
            <Eyebrow className="mb-3">Format</Eyebrow>
            <h2 className="text-[clamp(28px,3.5vw,40px)] font-bold tracking-tight text-ink">
              Virtual + physical components
            </h2>
            <div className="mt-4 max-w-none text-ink-2 leading-relaxed space-y-4">
              <p>
                The physical mobility lasts 5 to 10 days and is held at the host
                university. This is the core of the programme: in-person
                teaching, group work, cultural activities, and direct contact
                with faculty and students from across Europe. Travel and
                accommodation arrangements are usually coordinated through the
                host&apos;s international office, with funding flowing back from
                your home institution.
              </p>
              <p>
                The virtual component is mandatory — it is not an optional add-on.
                It typically takes the form of online lectures, group projects,
                pre-reading, recorded materials, or moderated discussion threads,
                running for several weeks around the in-person dates. Without
                this online layer, the programme would not qualify as &ldquo;
                blended&rdquo; under the Erasmus+ rules.
              </p>
              <p>
                In practice, the proportion varies. Some BIPs front-load the
                online component to prepare students for an intense week on site;
                others use the virtual phase afterwards for group projects and
                assessment. The BIP listing on BipHub describes the structure for
                each programme.
              </p>
            </div>
          </section>

          {/* Section 3 — ECTS, eligibility, language */}
          <section id="ects" className="mb-16 scroll-mt-24">
            <Eyebrow className="mb-3">Eligibility</Eyebrow>
            <h2 className="text-[clamp(28px,3.5vw,40px)] font-bold tracking-tight text-ink">
              ECTS, eligibility, language
            </h2>
            <div className="mt-4 max-w-none text-ink-2 leading-relaxed space-y-4">
              <p>
                Most BIPs award between 3 and 6 ECTS credits on successful
                completion. The credits transfer to your home degree via the
                standard Erasmus+ learning agreement, signed by your home
                university&apos;s Erasmus office before you travel. Confirm the
                ECTS value early — it varies by programme and affects how the BIP
                fits into your degree plan.
              </p>
              <p>
                Eligibility is straightforward: you must be an enrolled higher-
                education student — Bachelor, Master, or PhD — at an institution
                that participates in Erasmus+. Most host BIPs additionally limit
                the programme to students from a specified group of partner
                universities, listed on each BIP page. Some programmes have
                further requirements, like a particular field of study or year
                group.
              </p>
              <p>
                Language varies. The majority of BIPs are taught in English with
                a CEFR B2 minimum, but you will also find programmes delivered in
                German, French, Spanish, or Italian. Always check the language
                and language-level fields on the BIP listing before applying.
              </p>
            </div>
          </section>

          {/* Section 4 — How to find one on BipHub */}
          <section id="find" className="mb-16 scroll-mt-24">
            <Eyebrow className="mb-3">Discovery</Eyebrow>
            <h2 className="text-[clamp(28px,3.5vw,40px)] font-bold tracking-tight text-ink">
              How to find one on BipHub
            </h2>
            <div className="mt-4 max-w-none text-ink-2 leading-relaxed space-y-4">
              <p>
                Open{' '}
                <Link href="/bips" className="text-eu-blue underline">
                  Browse all BIPs
                </Link>{' '}
                and use the filters in the sidebar to narrow the catalogue by
                country, field of study, language, mobility dates, ECTS credits,
                application status, and study level. Any combination of filters
                is shareable — the URL updates as you refine, so you can bookmark
                or send a link that reproduces the same view. From there, click
                into any listing for the full description, host and partner
                universities, deadlines, and how to apply through your home
                Erasmus office.
              </p>
            </div>
          </section>

          {/* Section 5 — FAQ */}
          <section id="faq" className="mb-12 scroll-mt-24">
            <Eyebrow className="mb-3">FAQ</Eyebrow>
            <h2 className="text-[clamp(28px,3.5vw,40px)] font-bold tracking-tight text-ink">
              Frequently asked questions
            </h2>
            <div className="mt-6">
              <Accordion multiple>
                <AccordionItem value="faq-1">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    Who can apply to a BIP?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      Enrolled higher-education students at an Erasmus+-
                      participating institution — Bachelor, Master, or PhD level.
                      Specifics depend on each host BIP&apos;s eligibility notes,
                      which sometimes restrict the programme to a particular
                      faculty, year group, or partner-university cohort.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    How long does a BIP last?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      Between 5 and 10 days of in-person physical mobility at the
                      host university, plus an asynchronous virtual component that
                      typically spans several weeks before, during, or after the
                      on-site week. The virtual part is what makes the programme
                      &ldquo;blended&rdquo; rather than a normal short exchange.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    Do I get ECTS credits?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      Yes — most BIPs award 3 to 6 ECTS credits depending on
                      workload. The credits transfer to your home degree through
                      the standard Erasmus+ learning-agreement process, signed by
                      your home university before you travel. Confirm the exact
                      ECTS value on the BIP listing and with your Erasmus office
                      before applying.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    What language is the BIP in?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      Most BIPs run in English with a CEFR B2 minimum, but BipHub
                      also lists programmes in German, French, Spanish, and
                      Italian. Use the language filter on{' '}
                      <Link href="/bips" className="text-eu-blue">
                        /bips
                      </Link>{' '}
                      to narrow the catalogue to languages you are comfortable
                      studying in.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    Are travel costs covered?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      Erasmus+ funds a daily living allowance — currently around
                      €79 per day — plus a travel grant calculated by distance
                      band. The funding is disbursed by your home university, not
                      the host. BipHub is a directory only; we do not handle
                      money or paperwork.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    Can I join from outside the EU?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      Key Action 131 funding is available to students enrolled at
                      Erasmus+-participating institutions, most of which are in
                      EU member states or programme-associated countries.
                      Students at non-participating institutions are not eligible
                      for the Erasmus+ grant, though some host universities
                      accept self-funded participants on a case-by-case basis.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-7">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    How are BIPs different from regular Erasmus exchange?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      A full Erasmus+ semester or year places you at a host
                      university for 3 to 12 months. A BIP is a short, intensive
                      format — 5 to 10 days physical plus an asynchronous virtual
                      component — designed for students who cannot commit to a
                      full semester abroad. Both award ECTS and are funded by
                      Erasmus+, but the time commitment and intensity differ
                      sharply.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-8">
                  <AccordionTrigger className="text-[16px] font-semibold text-ink">
                    How do I apply through my home university?
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                    <p>
                      Contact your home university&apos;s Erasmus or international
                      office. They handle the application, the learning
                      agreement, and the grant disbursement. Applications are
                      submitted to your home institution — not through BipHub.
                      Use the contact details on each BIP listing only after
                      confirming with your home Erasmus office that the
                      programme is eligible for your degree.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Outbound EC link — INFO-04 */}
          <section aria-label="Official Erasmus+ resources">
            <p className="mt-12 text-sm text-muted">
              <a
                href="https://erasmus-plus.ec.europa.eu/programme-guide/part-b/ka1/short-term-mobility-projects/blended-intensive-programmes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-eu-blue underline"
              >
                Read the official Erasmus+ programme guide entry on BIPs
              </a>
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
