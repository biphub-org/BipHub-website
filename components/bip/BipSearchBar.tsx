'use client'

import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconSearch, IconX } from '@tabler/icons-react'

export function BipSearchBar({ initialQ }: { initialQ: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(initialQ)

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
    <div className="relative">
      <label htmlFor="bip-search" className="sr-only">
        Search BIPs
      </label>
      <IconSearch
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
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
        placeholder="Search by title, university, or keyword"
        className="w-full pl-10 pr-10 py-3 text-base border border-border rounded-md bg-white focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:outline-none"
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            commit('')
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
        >
          <IconX size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
