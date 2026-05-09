import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getBipBySlug } from '@/lib/queries/bipDetail'
import { getCountryFlagEmoji, getCountryName } from '@/lib/countries'

/**
 * Per-BIP OpenGraph image — 1200×630 PNG rendered by Satori (next/og).
 *
 * Inter font binaries are committed to public/fonts/ and read at request time.
 * NEVER fetch from fonts.googleapis.com — GDPR + PITFALLS Pitfall 15.
 *
 * Satori limitations (UI-SPEC line 367):
 *   - No CSS Grid (display: 'flex' only)
 *   - No calc() expressions
 *   - No CSS custom properties / variables
 *   - Absolute positioning via position: 'absolute'
 *
 * Composition:
 *   - Blue gradient background (#003399 → #1a4dab)
 *   - "BipHub" wordmark top-left
 *   - Left column: BIP title (max 90 chars) + university + city/country
 *   - Gold accent bar under city line (CONTEXT.md "Specifics" recommendation)
 *   - Right column: country flag emoji (140px)
 *   - Bottom-left: ECTS chip (gold pill)
 *   - Bottom-right: biphub.eu domain
 */

// nodejs runtime — needed for fs.readFile from public/
export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'BipHub BIP listing card'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Load Inter binaries — bundled in public/, NOT fetched from Google (Pitfall 15)
  const fontsDir = join(process.cwd(), 'public', 'fonts')
  const [interBold, interSemibold] = await Promise.all([
    readFile(join(fontsDir, 'inter-bold.ttf')),
    readFile(join(fontsDir, 'inter-semibold.ttf')),
  ])

  let bip
  try {
    bip = await getBipBySlug(slug)
  } catch {
    bip = null
  }

  // Branded fallback for missing/non-approved slugs — still returns 200 (not 404)
  if (!bip) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #003399 0%, #1a4dab 100%)',
            color: 'white',
            fontFamily: 'Inter',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          BipHub
        </div>
      ),
      {
        ...size,
        fonts: [{ name: 'Inter', data: interBold, weight: 700, style: 'normal' }],
      },
    )
  }

  const host = bip.host_university
  const flag = host?.country ? getCountryFlagEmoji(host.country) : ''
  const countryName = host?.country ? getCountryName(host.country) : ''
  const cityLine = [bip.host_city ?? host?.city, countryName].filter(Boolean).join(', ')

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #003399 0%, #1a4dab 100%)',
          color: 'white',
          fontFamily: 'Inter',
          padding: 64,
          position: 'relative',
        }}
      >
        {/* Top-left wordmark */}
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 64,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
        >
          BipHub
        </div>

        {/* Left column: title + university + city */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '60%',
            paddingRight: 32,
          }}
        >
          {/* BIP title — capped at 90 chars to fit 3 lines at 56px */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              marginBottom: 24,
            }}
          >
            {bip.title.length > 90 ? `${bip.title.slice(0, 90)}…` : bip.title}
          </div>

          {/* Host university name */}
          {host && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                marginBottom: 12,
              }}
            >
              {host.name}
            </div>
          )}

          {/* City, Country */}
          {cityLine && (
            <div
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {cityLine}
            </div>
          )}

          {/* Gold accent bar — CONTEXT.md "Specifics" recommendation */}
          <div
            style={{
              marginTop: 16,
              width: 240,
              height: 8,
              background: '#FFCC00',
              opacity: 0.6,
            }}
          />
        </div>

        {/* Right column: country flag emoji */}
        <div
          style={{
            display: 'flex',
            width: '40%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 140,
          }}
        >
          {flag}
        </div>

        {/* Bottom-left: ECTS gold chip */}
        {bip.ects_credits && (
          <div
            style={{
              position: 'absolute',
              bottom: 64,
              left: 64,
              padding: '6px 16px',
              borderRadius: 999,
              background: '#FFCC00',
              color: '#0a1735',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {bip.ects_credits} ECTS
          </div>
        )}

        {/* Bottom-right: domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            right: 64,
            fontSize: 16,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          biphub.eu
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: interSemibold, weight: 600, style: 'normal' },
      ],
    },
  )
}
