'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils/cn'

export function HeroSearchBar() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/bips?q=${encodeURIComponent(q)}` : '/bips')
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="mt-14 mx-auto flex w-full max-w-[560px] items-center gap-2 rounded-pill border border-border-strong bg-white p-1.5 shadow-[0_4px_16px_rgba(10,23,53,0.06)] focus-within:border-eu-blue focus-within:shadow-[0_6px_20px_rgba(0,51,153,0.12)] transition-all"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search BIPs
      </label>
      <IconSearch
        size={20}
        className="ml-4 text-muted shrink-0"
        aria-hidden="true"
      />
      <input
        id="hero-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title, university, or keyword"
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink placeholder:text-muted-2 focus:outline-none"
      />
      <button
        type="submit"
        className={cn(
          'inline-flex h-10 shrink-0 items-center justify-center rounded-pill px-5 text-sm font-semibold',
          'bg-eu-blue text-white transition-all duration-200 ease-out',
          'hover:bg-eu-blue-dark',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
        )}
      >
        Search
      </button>
    </form>
  )
}
