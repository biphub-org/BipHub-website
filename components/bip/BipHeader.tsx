import { getCountryName } from '@/lib/countries'
import type { BipDetail } from '@/lib/queries/bipDetail'
import { cn } from '@/lib/utils/cn'

/**
 * BipHeader — RSC. Renders the BIP page hero area:
 *   - h1 with BIP title
 *   - "Demo data" pill (D-16) when bip.is_seed = true
 *   - Subtitle: host university · host city, country
 *   - Badge chips: 🌱 Green travel eligible, ♿ Inclusion support (UI-SPEC line 283)
 *
 * UI-SPEC line 78: h1 text-3xl mobile / text-[44px] lg, font-bold, tracking-tight, lh 1.15
 */
export function BipHeader({ bip }: { bip: BipDetail }) {
  const host = bip.host_university
  const countryName = host?.country ? getCountryName(host.country) : ''

  const showBadges = bip.green_travel || bip.inclusion_support

  return (
    <header className="mb-8">
      {/* Title row + Demo data pill */}
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <h1
          className={cn(
            'text-3xl lg:text-[44px] font-bold text-ink tracking-tight',
            'leading-[1.15]',
          )}
        >
          {bip.title}
        </h1>
        {bip.is_seed && (
          <span
            className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold bg-eu-gold-soft text-ink-2 border border-eu-gold self-start mt-1"
            title="This BIP is sample data shown while BipHub launches. Real listings replace these as universities submit."
          >
            Demo data
          </span>
        )}
      </div>

      {/* Subtitle: host university · host city, country */}
      {host && (
        <p className="text-base text-muted mb-4">
          {host.name}
          {(bip.host_city || countryName) && (
            <>
              {' · '}
              {[bip.host_city, countryName].filter(Boolean).join(', ')}
            </>
          )}
        </p>
      )}

      {/* Attribute badge chips (DETL-06) */}
      {showBadges && (
        <ul
          aria-label="BIP attributes"
          className="flex flex-wrap gap-2 mt-2"
        >
          {bip.green_travel && (
            <li>
              <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold bg-eu-gold-soft text-ink border border-eu-gold-soft">
                🌱 Green travel eligible
              </span>
            </li>
          )}
          {bip.inclusion_support && (
            <li>
              <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold bg-eu-gold-soft text-ink border border-eu-gold-soft">
                ♿ Inclusion support
              </span>
            </li>
          )}
        </ul>
      )}
    </header>
  )
}
