/**
 * Downloads Inter Bold + SemiBold TTF binaries from rsms/inter (OFL 1.1) into
 * public/fonts/. These are read by app/(public)/bip/[slug]/opengraph-image.tsx
 * at request time and passed to Satori's `fonts` option.
 *
 * Why bundled and not fetched at runtime:
 *   PITFALLS Pitfall 15 — Vercel's serverless OG runtime cannot fetch from
 *   fonts.googleapis.com (cross-origin / GDPR concerns + adds 200-500ms latency
 *   to every OG image request). System fonts are not available. Bundling binaries
 *   under public/ is the correct approach.
 *
 * License: Inter is OFL 1.1 — redistribution explicitly permitted.
 * See: https://github.com/rsms/inter/blob/master/LICENSE.txt
 *
 * Run once: npm run fonts:fetch
 * Idempotent: skips download if file already exists and is large enough.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'

const FONTS = [
  {
    name: 'inter-semibold.ttf',
    // inter-font npm package (OFL 1.1) — mirrors rsms/inter TTF binaries
    url: 'https://unpkg.com/inter-font@3.19.0/ttf/Inter-SemiBold.ttf',
  },
  {
    name: 'inter-bold.ttf',
    url: 'https://unpkg.com/inter-font@3.19.0/ttf/Inter-Bold.ttf',
  },
] as const

const MIN_SIZE_BYTES = 100_000 // Each Inter weight is ~280KB

async function main() {
  const dir = 'public/fonts'
  mkdirSync(dir, { recursive: true })

  for (const f of FONTS) {
    const destPath = `${dir}/${f.name}`

    // Skip if already exists and large enough (idempotent)
    if (existsSync(destPath) && statSync(destPath).size >= MIN_SIZE_BYTES) {
      // eslint-disable-next-line no-console
      console.log(`Skipping ${f.name} — already exists (${statSync(destPath).size} bytes)`)
      continue
    }

    // eslint-disable-next-line no-console
    console.log(`Downloading ${f.name} from ${f.url}...`)
    const res = await fetch(f.url)
    if (!res.ok) {
      throw new Error(`Failed to fetch ${f.name}: HTTP ${res.status} ${res.statusText}`)
    }
    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(destPath, buf)
    // eslint-disable-next-line no-console
    console.log(`✓ Wrote ${destPath} (${buf.length} bytes)`)
  }

  // eslint-disable-next-line no-console
  console.log('Done. Commit public/fonts/inter-*.ttf to source control.')
}

void main().catch((err) => {
  console.error('fonts:fetch failed:', err)
  process.exit(1)
})
