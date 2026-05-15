'use client'

/**
 * MapKeyboardFallback — D-08 + UI-SPEC line 215.
 *
 * A visually shown <select> listing all 33 Erasmus+ programme countries.
 * On change, navigates to /bips?country=XX.
 *
 * This is ALWAYS rendered adjacent to the SVG, not screen-reader-only (WCAG requirement).
 * The select is the primary keyboard interaction for the map section.
 */

import { useRouter } from 'next/navigation'
import { ERASMUS_COUNTRIES } from '@/lib/countries'

const MAP_COUNTRIES = ERASMUS_COUNTRIES

export function MapKeyboardFallback() {
  const router = useRouter()

  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-2">Filter by country</span>
      <select
        className="mt-1 w-full rounded-md border border-border bg-white p-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2"
        defaultValue=""
        onChange={(e) => {
          const code = e.target.value
          if (code) router.push(`/bips?country=${code}`)
        }}
      >
        <option value="" disabled>
          Select a country…
        </option>
        {MAP_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}
