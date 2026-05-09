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
 *
 * Perf: the 1.2 MB EuropeMap chunk (d3-geo + react-simple-maps) is deferred
 * until the section enters the viewport, keeping it out of the Lighthouse
 * measurement window on mobile where the map is below the fold.
 */

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
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
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {inView ? <EuropeMap countsByCountry={countsByCountry} /> : <MapSkeleton />}
    </div>
  )
}
