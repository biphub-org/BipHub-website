'use client'

/**
 * AdminBipsFilters — URL-synced filter chrome for /admin/bips
 * (D-19 / ADMN-06 / 03-UI-SPEC.md All-Listings Contract).
 *
 * Five status tabs (All / Draft / Pending / Approved / Rejected) plus
 * a free-text search input. Tab state is reflected in `?status=...`
 * (with `all` clearing the param for clean URLs). Search input is
 * debounced 300ms (matches Phase 1 BipSearchBar pattern) and reflected
 * in `?q=...`.
 *
 * Server component reads the same searchParams and re-queries via
 * getAdminBips — the client just steers navigation, never holds the
 * canonical data.
 */

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const

type StatusTabValue = (typeof STATUS_TABS)[number]['value']

interface Props {
  initialStatus: StatusTabValue
  initialQ: string
}

export function AdminBipsFilters({ initialStatus, initialQ }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(initialQ)
  const [, startTransition] = useTransition()

  // Debounced search update (300ms — matches Phase 1 BipSearchBar)
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      const trimmed = q.trim()
      if (trimmed) params.set('q', trimmed)
      else params.delete('q')
      const next = params.toString()
      startTransition(() => {
        router.push(next ? `${pathname}?${next}` : pathname)
      })
    }, 300)
    return () => clearTimeout(id)
    // We deliberately only react to the user's typed value; `searchParams`
    // is a moving target that would force-flush the debouncer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function handleStatusChange(next: string | number | null) {
    if (next === null) return
    const value = String(next)
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete('status')
    else params.set('status', value)
    const queryStr = params.toString()
    startTransition(() => {
      router.push(queryStr ? `${pathname}?${queryStr}` : pathname)
    })
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-white px-6 py-3 md:flex-row md:items-center md:gap-4">
      <Tabs value={initialStatus} onValueChange={handleStatusChange}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="relative w-full md:ml-auto md:max-w-[320px]">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={16}
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search by title, description, or university…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search BIPs"
        />
      </div>
    </div>
  )
}
