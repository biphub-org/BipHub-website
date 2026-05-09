'use client'

/**
 * EuropeMapWrapper — thin client component that hosts the dynamic() ssr:false import.
 *
 * Next.js 15 requires dynamic({ ssr: false }) to be declared inside a 'use client'
 * boundary. This wrapper is the minimal client component needed to satisfy that
 * constraint while keeping the data fetching in the RSC parent (page.tsx).
 *
 * The RSC page.tsx imports EuropeMapWrapper (which is a client component),
 * passes countsByCountry as a prop, and EuropeMapWrapper dynamically loads
 * the actual EuropeMap component with ssr: false.
 *
 * Rule 1 auto-fix: Next.js 15.5 rejects `ssr: false` in Server Components.
 */

import dynamic from 'next/dynamic'
import { MapSkeleton } from './MapSkeleton'

// PITFALLS Pitfall 11: ssr: false prevents TopoJSON from being bundled.
// EuropeMap fetches /eu-countries.json at runtime via fetch() — NOT import().
const EuropeMap = dynamic(
  () => import('./EuropeMap').then((m) => ({ default: m.EuropeMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
)

interface EuropeMapWrapperProps {
  countsByCountry: Record<string, number>
}

export function EuropeMapWrapper({ countsByCountry }: EuropeMapWrapperProps) {
  return <EuropeMap countsByCountry={countsByCountry} />
}
