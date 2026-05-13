/**
 * Builds public/eu-countries.json from the official Eurostat GISCO NUTS 2024 dataset.
 * Run once: npm run build:topojson
 *
 * Source: https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_20M_2024_4326_LEVL_0.geojson
 * Filter: 32 visible Erasmus+ programme countries (EU-27 + IS + NO + MK + RS + TR).
 *   Excluded: LI (too small at 20M scale to render meaningfully).
 *
 * Code normalization: Eurostat uses 'EL' for Greece and 'UK' for the United Kingdom.
 * We map EL → GR so the choropleth keys match ISO 3166-1 alpha-2 used everywhere else
 * in the app. UK is not an Erasmus+ programme country so we don't include it.
 *
 * Output: TopoJSON ~60-100KB, properties.name = country name, feature.id = ISO alpha-2.
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { topology } from 'topojson-server'

const GISCO_URL =
  'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_20M_2024_4326_LEVL_0.geojson'

/**
 * Visible-on-map Erasmus+ countries (32). LI is too small at 20M scale to render
 * meaningfully — show via tooltip only if needed later.
 *
 * Set contains ISO codes AND the Eurostat aliases (EL for Greece) so the filter
 * accepts source rows; the normalize step below rewrites the feature id back to
 * the ISO code that the rest of the app uses.
 */
const VISIBLE_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'EL', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'NO',
  'MK', 'RS', 'TR',
])

/**
 * Eurostat → ISO 3166-1 alpha-2 normalization. The Eurostat NUTS dataset uses
 * non-ISO codes for two members; rest of the app uses ISO alpha-2 keys.
 */
const ISO_ALIAS: Record<string, string> = {
  EL: 'GR', // Greece
  UK: 'GB', // United Kingdom (not Erasmus+, kept for safety)
}

interface GeoFeature {
  type: 'Feature'
  id: string
  properties: {
    CNTR_CODE?: string
    NUTS_ID?: string
    NAME_LATN?: string
    [key: string]: unknown
  }
  geometry: unknown
}

interface GeoFeatureCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

async function main() {
  console.log(`Fetching Eurostat GISCO NUTS 2024 LEVL_0 GeoJSON from:\n  ${GISCO_URL}`)
  const res = await fetch(GISCO_URL)
  if (!res.ok) {
    throw new Error(
      `GISCO fetch failed: HTTP ${res.status} ${res.statusText}\n` +
      `If you are offline, ensure public/eu-countries.json already exists and is ≤100KB.\n` +
      `DO NOT substitute a stub — the choropleth must use real EU country borders.`,
    )
  }

  const geojson = (await res.json()) as GeoFeatureCollection

  const filtered: GeoFeatureCollection = {
    type: 'FeatureCollection',
    features: geojson.features
      .filter((f) => {
        const code = f.properties.CNTR_CODE ?? f.id
        return VISIBLE_COUNTRIES.has(code)
      })
      .map((f) => {
        const sourceCode = f.properties.CNTR_CODE ?? f.id
        const isoCode = ISO_ALIAS[sourceCode] ?? sourceCode
        return {
          ...f,
          // Normalize id to ISO alpha-2 (EL → GR, UK → GB) for downstream lookup keying
          id: isoCode,
          properties: { name: f.properties.NAME_LATN ?? isoCode },
        }
      }),
  }

  console.log(`Filtered to ${filtered.features.length} countries (expected 32)`)

  if (filtered.features.length < 28) {
    throw new Error(
      `Unexpectedly few countries (${filtered.features.length}) — check GISCO data format.\n` +
      `Expected ~32 visible Erasmus+ countries. Aborting to avoid writing bad TopoJSON.`,
    )
  }

  // topojson-server topology() quantizes geometry for compression
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topo = topology({ countries: filtered as any }, 1e5)

  const outputPath = join(process.cwd(), 'public', 'eu-countries.json')
  const json = JSON.stringify(topo)
  writeFileSync(outputPath, json, 'utf8')

  const kb = Math.round(json.length / 1024)
  console.log(`Wrote ${filtered.features.length} countries to public/eu-countries.json (${kb}KB)`)

  if (json.length < 30_000) {
    console.warn(`WARNING: file is only ${kb}KB — unusually small. Check the GISCO URL or scale parameter.`)
  }
  if (json.length > 100_000) {
    console.warn(`WARNING: file is ${kb}KB — larger than expected (≤100KB target).`)
    console.warn(`This may be because the 03M scale was used instead of the 20M scale.`)
    console.warn(`Expected URL uses NUTS_RG_20M_2024 (20M = medium resolution, suitable for homepage).`)
  }
}

void main().catch((err: unknown) => {
  console.error('build:topojson FAILED:', err)
  process.exit(1)
})
