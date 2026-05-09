'use client'

/**
 * MapKeyboardFallback — D-08 + UI-SPEC line 215.
 *
 * A visually shown <select> listing all 29 visible Erasmus+ countries.
 * On change, navigates to /bips?country=XX.
 *
 * This is ALWAYS rendered adjacent to the SVG, not screen-reader-only (WCAG requirement).
 * The select is the primary keyboard interaction for the map section.
 */

import { useRouter } from 'next/navigation'
import { ERASMUS_COUNTRIES } from '@/lib/countries'

// Only include the 29 countries that appear on the map
// (EU-27 + IS + NO — excludes LI, MK, RS, TR per 01-05 plan interfaces)
const MAP_COUNTRIES = ERASMUS_COUNTRIES.filter((c) =>
  [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
    'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    'IS', 'NO',
  ].includes(c.code),
)

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
