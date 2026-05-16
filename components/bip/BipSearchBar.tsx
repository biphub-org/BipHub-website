'use client'

import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconSearch, IconX } from '@tabler/icons-react'

type Variant = 'inline' | 'hero'

interface BipSearchBarProps {
  initialQ: string
  /** Visual variant. `hero` is the pill-shaped, larger input designed to sit
   *  on a dark hero band as the page's centerpiece. Defaults to `inline`. */
  variant?: Variant
}

export function BipSearchBar({ initialQ, variant = 'inline' }: BipSearchBarProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(initialQ)
  const isHero = variant === 'hero'

  const commit = useDebouncedCallback((next: string) => {
    const p = new URLSearchParams(params)
    if (next.trim() === '') p.delete('q')
    else p.set('q', next.trim())
    p.delete('page')
    router.push(p.toString() ? `/bips?${p}` : '/bips')
  }, 300)

  useEffect(() => {
    setValue(initialQ)
  }, [initialQ])

  return (
    <div className="relative w-full">
      <label htmlFor="bip-search" className="sr-only">
        Search BIPs
      </label>
      <IconSearch
        size={isHero ? 18 : 18}
        className={
          isHero
            ? 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-eu-blue'
            : 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted'
        }
        aria-hidden="true"
      />
      <input
        id="bip-search"
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          commit(e.target.value)
        }}
        placeholder={
          isHero
            ? 'Search by topic, university, or city'
            : 'Search by title, university, or keyword'
        }
        className={
          isHero
            ? 'w-full rounded-full border-2 border-eu-blue-100 bg-white py-3 pl-11 pr-11 text-[15px] font-medium text-ink shadow-[0_4px_20px_rgba(10,23,53,0.12)] placeholder:text-muted focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-gold'
            : 'w-full rounded-md border border-border bg-white py-3 pl-10 pr-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue'
        }
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            commit('')
          }}
          aria-label="Clear search"
          className={
            isHero
              ? 'absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink'
              : 'absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink'
          }
        >
          <IconX size={isHero ? 18 : 18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
