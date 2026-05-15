'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { ISCED_FIELDS } from '@/lib/isced'
import { ERASMUS_COUNTRIES } from '@/lib/countries'
import {
  STATUS_FILTER_OPTIONS,
  STUDY_LEVELS,
  type BipFilterState,
} from '@/lib/filters/parseSearchParams'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'sv', label: 'Swedish' },
] as const

export function BipFiltersSidebar({ filters }: { filters: BipFilterState }) {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const update = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value === undefined || value === '') next.delete(key)
    else next.set(key, value)
    next.delete('page') // reset to page 1 on any filter change
    startTransition(() => {
      router.push(next.toString() ? `/bips?${next}` : '/bips')
    })
  }

  const toggleArray = (key: string, value: string, current: string[] | undefined) => {
    const set = new Set(current ?? [])
    if (set.has(value)) set.delete(value)
    else set.add(value)
    update(key, set.size === 0 ? undefined : Array.from(set).join(','))
  }

  const hasActive = Boolean(
    filters.country?.length ||
      filters.field?.length ||
      filters.lang?.length ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.ectsMin !== undefined ||
      filters.ectsMax !== undefined ||
      (filters.status && filters.status !== 'any') ||
      filters.level?.length,
  )

  return (
    <section
      role="region"
      aria-label="Filters"
      className="sticky top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Filters</h2>
        {hasActive && (
          <button
            onClick={() => router.push('/bips')}
            className="text-xs text-muted hover:text-ink underline"
          >
            Clear all
          </button>
        )}
      </div>

      <Accordion multiple>
        <AccordionItem value="country">
          <AccordionTrigger>Country</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {[...ERASMUS_COUNTRIES]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <li key={c.code}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          filters.country?.includes(c.code.toLowerCase()) ?? false
                        }
                        onChange={() =>
                          toggleArray(
                            'country',
                            c.code.toLowerCase(),
                            filters.country,
                          )
                        }
                        className="w-4 h-4 accent-eu-blue"
                      />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  </li>
                ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="field">
          <AccordionTrigger>Field of study</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {ISCED_FIELDS.map((f) => (
                <li key={f.id}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.field?.includes(f.id) ?? false}
                      onChange={() => toggleArray('field', f.id, filters.field)}
                      className="w-4 h-4 accent-eu-blue"
                    />
                    <span className="text-sm">{f.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="language">
          <AccordionTrigger>Language</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {LANGS.map((l) => (
                <li key={l.code}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.lang?.includes(l.code) ?? false}
                      onChange={() => toggleArray('lang', l.code, filters.lang)}
                      className="w-4 h-4 accent-eu-blue"
                    />
                    <span className="text-sm">{l.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dates">
          <AccordionTrigger>Mobility dates</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateFrom ?? ''}
                  onChange={(e) => update('dateFrom', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus-visible:ring-2 focus-visible:ring-eu-blue outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateTo ?? ''}
                  onChange={(e) => update('dateTo', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus-visible:ring-2 focus-visible:ring-eu-blue outline-none"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ects">
          <AccordionTrigger>ECTS credits</AccordionTrigger>
          <AccordionContent>
            <Slider
              min={1}
              max={30}
              step={1}
              value={[filters.ectsMin ?? 1, filters.ectsMax ?? 30]}
              onValueChange={(v) => {
                const arr = Array.isArray(v) ? (v as number[]) : [v as number]
                update('ectsMin', arr[0] === 1 ? undefined : String(arr[0]))
                update('ectsMax', (arr[1] ?? 30) === 30 ? undefined : String(arr[1]))
              }}
            />
            <p className="text-xs text-muted mt-2">
              {filters.ectsMin ?? 1}–{filters.ectsMax ?? 30} ECTS
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="status">
          <AccordionTrigger>Application status</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {STATUS_FILTER_OPTIONS.map((s) => (
                <li key={s}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={(filters.status ?? 'any') === s}
                      onChange={() => update('status', s === 'any' ? undefined : s)}
                      className="w-4 h-4 accent-eu-blue"
                    />
                    <span className="text-sm capitalize">{s}</span>
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="level">
          <AccordionTrigger>Study level</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {STUDY_LEVELS.map((l) => (
                <li key={l}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.level?.includes(l) ?? false}
                      onChange={() => toggleArray('level', l, filters.level)}
                      className="w-4 h-4 accent-eu-blue"
                    />
                    <span className="text-sm capitalize">{l}</span>
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
