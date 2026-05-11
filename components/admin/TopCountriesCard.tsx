/**
 * TopCountriesCard — Top 5 host countries variant of the analytics
 * stat card (D-20 / ADMN-07 / 03-UI-SPEC.md Analytics Contract).
 *
 * RSC-compatible. Renders "No BIPs yet" gracefully when entries is
 * empty (covers the brand-new database / launch-day case).
 */

import { Globe } from 'lucide-react'

interface CountryEntry {
  country: string
  code: string
  flag: string | null
  count: number
}

interface Props {
  entries: CountryEntry[]
  description: string
}

export function TopCountriesCard({ entries, description }: Props) {
  return (
    <article className="rounded-md border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-eu-gold-soft">
        <Globe className="text-eu-gold-dark" width={20} height={20} aria-hidden />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider text-ink-2">
        Top 5 countries
      </p>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No BIPs yet</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-2">
          {entries.map((entry, idx) => (
            <li
              key={entry.code}
              className="flex items-center justify-between text-sm"
            >
              <span className="truncate font-semibold text-ink">
                {idx + 1}. {entry.flag ? `${entry.flag} ` : ''}
                {entry.country}
              </span>
              <span className="text-muted">
                {entry.count} BIP{entry.count === 1 ? '' : 's'}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-sm text-muted">{description}</p>
    </article>
  )
}
