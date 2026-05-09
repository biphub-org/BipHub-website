import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

/**
 * Erasmus+ KA131 programme countries — ISO 3166-1 alpha-2 codes (uppercase).
 * Source: Erasmus+ Programme Guide Part A, "Eligible countries".
 *
 * 33 countries total:
 *   EU-27: AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV,
 *          LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE
 *   EEA + associated: IS (Iceland), LI (Liechtenstein), NO (Norway)
 *   Candidate countries: MK (North Macedonia), RS (Serbia), TR (Türkiye)
 *
 * Used by:
 *   - <EuropeMap> (Plan 01-05) — choropleth fills 29 visible European countries
 *   - /bips country filter (Plan 01-06) — facet list
 *   - lib/types/bip.ts validation contexts
 *
 * CANONICAL CONTRACT (locked per 01-02 plan interfaces block):
 * The property is `code`, NOT `iso2`. Downstream plans (01-05, 01-06, 01-07)
 * must use `c.code` — do not rename this property.
 */
export const ERASMUS_COUNTRIES: ReadonlyArray<{
  code: string  // ISO 3166-1 alpha-2 (uppercase per ISO standard)
  name: string
}> = (
  [
    'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
    'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
    'IS','LI','NO',
    'MK','RS','TR',
  ] as const
).map((code) => ({
  code,
  name: countries.getName(code, 'en') ?? code,
}))

export const ERASMUS_COUNTRY_CODES = ERASMUS_COUNTRIES.map((c) => c.code)
export type ErasmusCountryCode = (typeof ERASMUS_COUNTRY_CODES)[number]

/**
 * Look up the English name for any ISO 3166-1 alpha-2 code.
 * Falls back to the uppercase code if not found.
 */
export function getCountryName(code: string): string {
  return countries.getName(code.toUpperCase(), 'en') ?? code.toUpperCase()
}

/**
 * Returns true if the code is one of the 33 Erasmus+ programme countries.
 */
export function isErasmusCountry(code: string): code is ErasmusCountryCode {
  return ERASMUS_COUNTRY_CODES.includes(code.toUpperCase() as ErasmusCountryCode)
}

/**
 * ISO 3166-1 alpha-2 → regional indicator emoji pair.
 * Renders as a country flag in modern OS-rendered fonts and Satori-rendered OG images.
 * Consumed by Plan 01-07 (BipHeader meta row, opengraph-image.tsx).
 *
 * Implementation: each ASCII letter A-Z maps to its regional indicator code point at
 * U+1F1E6 + (charCode - 'A'.charCode). The two combined code points render as a flag.
 */
export function getCountryFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return ''
  const upper = code.toUpperCase()
  const A = 0x1f1e6
  return String.fromCodePoint(
    A + upper.charCodeAt(0) - 'A'.charCodeAt(0),
    A + upper.charCodeAt(1) - 'A'.charCodeAt(0),
  )
}
