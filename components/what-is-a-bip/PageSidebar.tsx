'use client'

/**
 * PageSidebar — "On this page" rail for /what-is-a-bip.
 *
 * Uses IntersectionObserver to highlight whichever section is currently
 * inside the top-30%-of-viewport trigger zone. Active item shows a gold
 * left-bar; the rest of the rail is a faint gray border.
 *
 * Anchor links + native scroll handling — `scroll-mt-24` on each section
 * provides the top offset for the sticky nav.
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface Section {
  id: string
  label: string
}

interface PageSidebarProps {
  sections: readonly Section[]
}

export function PageSidebar({ sections }: PageSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (els.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the top-most intersecting section so the active item walks
        // forward smoothly as the user scrolls down.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          )
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        // Trigger zone = top 30% of viewport. A section becomes "active"
        // once its top crosses 10% from the top and stays so until it
        // exits at 70% from the top.
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      },
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav aria-label="Page sections" className="sticky top-24">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        On this page
      </p>
      <ul className="relative flex flex-col border-l border-eu-blue-100">
        {sections.map((s) => {
          const active = s.id === activeId
          return (
            <li key={s.id} className="relative">
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -left-px top-1 bottom-1 w-[2px] rounded-full bg-eu-gold"
                />
              )}
              <a
                href={`#${s.id}`}
                aria-current={active ? 'location' : undefined}
                className={cn(
                  'block py-2 pl-4 pr-2 text-[13.5px] leading-snug transition-colors',
                  active
                    ? 'font-semibold text-ink'
                    : 'text-muted hover:text-eu-blue',
                )}
              >
                {s.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
