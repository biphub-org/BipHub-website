import Link from 'next/link'
import { Eyebrow } from '@/components/home/Eyebrow'

/**
 * GuideShell — shared chrome for /guides/<slug> pages.
 *
 * Single-column max-w-[800px] reading layout (matches /privacy), with a
 * breadcrumb back to /guides, an eyebrow, title, summary line, and the
 * provided children inside a typographic block.
 */
export function GuideShell({
  eyebrow,
  title,
  summary,
  readingTime,
  children,
}: {
  eyebrow: string
  title: string
  summary: string
  readingTime: string
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto max-w-[800px] px-4 lg:px-6 py-16 lg:py-24">
      <Link
        href="/guides"
        className="mb-8 inline-flex items-center gap-1 text-sm font-semibold text-ink-2 transition-colors hover:text-eu-blue"
      >
        ← All guides
      </Link>
      <header className="mb-12">
        <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
        <h1
          className="font-bold text-ink"
          style={{
            fontSize: 'clamp(32px, 4vw, 44px)',
            lineHeight: '1.15',
            letterSpacing: '-1px',
          }}
        >
          {title}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-muted">{summary}</p>
        <p className="mt-3 text-sm text-muted">{readingTime}</p>
      </header>
      <article className="space-y-12 text-ink-2 leading-relaxed [&_h2]:text-[clamp(22px,3vw,28px)] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink [&_h2]:mt-12 [&_h2]:first:mt-0 [&_p]:text-[16px] [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-3 [&_ul]:space-y-2 [&_a]:text-eu-blue [&_a]:underline">
        {children}
      </article>
    </div>
  )
}
