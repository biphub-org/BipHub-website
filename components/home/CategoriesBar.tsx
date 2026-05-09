'use client'

/**
 * CategoriesBar — DISC-03, UI-SPEC line 328.
 *
 * 8-column grid on desktop (md), 3-column on mobile.
 * Each card links to /bips?field={isced.id}.
 * Icon square flips from bg-eu-blue-50 to bg-eu-gold on hover.
 *
 * Receives countsByField from the RSC parent as a prop — no client-side fetching.
 */

import Link from 'next/link'
import {
  IconCpu,
  IconBriefcase,
  IconFlask,
  IconPalette,
  IconHeart,
  IconUsers,
  IconLeaf,
  IconBook,
} from '@tabler/icons-react'
import { ISCED_FIELDS } from '@/lib/isced'
import { cn } from '@/lib/utils/cn'
import type { IscedFieldId } from '@/lib/isced'

/**
 * ISCED field → Tabler icon mapping.
 * Icons chosen to semantically match each field of study.
 * Static object — no template literals (Pitfall 13).
 */
const ISCED_ICONS: Record<IscedFieldId, React.ComponentType<{ size?: number; className?: string }>> = {
  'engineering':     IconCpu,
  'business':        IconBriefcase,
  'sciences':        IconFlask,
  'arts':            IconPalette,
  'health':          IconHeart,
  'social-sciences': IconUsers,
  'environment':     IconLeaf,
  'humanities':      IconBook,
}

interface CategoriesBarProps {
  countsByField: Record<string, number>
}

export function CategoriesBar({ countsByField }: CategoriesBarProps) {
  return (
    <section className="border-b border-border bg-white py-16">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Section header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h3
            className="text-[22px] font-bold text-ink"
            style={{ letterSpacing: '-0.3px' }}
          >
            Browse by field of study
          </h3>
          <Link
            href="/bips"
            className="text-sm font-medium text-eu-blue hover:text-eu-blue-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2 rounded-sm"
          >
            All fields →
          </Link>
        </div>

        {/* 8-column grid desktop, 3-column mobile (per UI-SPEC + mockup) */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-8">
          {ISCED_FIELDS.map((field) => {
            const Icon = ISCED_ICONS[field.id]
            const count = countsByField[field.id] ?? 0
            return (
              <CategoryCard
                key={field.id}
                id={field.id}
                label={field.label}
                count={count}
                Icon={Icon}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

interface CategoryCardProps {
  id: string
  label: string
  count: number
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

function CategoryCard({ id, label, count, Icon }: CategoryCardProps) {
  return (
    <Link
      href={`/bips?field=${id}`}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-md border border-border p-4 text-center',
        'transition-all duration-200 ease',
        'hover:border-eu-blue hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
      )}
    >
      {/* Icon square — flips blue to gold on hover */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-200',
          'bg-eu-blue-50 text-eu-blue',
          'group-hover:bg-eu-gold group-hover:text-ink',
        )}
      >
        <Icon size={20} aria-hidden="true" />
      </div>

      {/* Label */}
      <span className="text-[13px] font-500 leading-tight text-ink-2 group-hover:text-ink transition-colors">
        {label}
      </span>

      {/* Count */}
      <span className="text-[12px] text-muted">{count}</span>
    </Link>
  )
}
