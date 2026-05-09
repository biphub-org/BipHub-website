'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type SortOption } from '@/lib/filters/parseSearchParams'

const LABELS: Record<SortOption, string> = {
  'deadline-soonest': 'Deadline soonest',
  newest: 'Newest',
  alphabetical: 'Alphabetical',
}

export function BipSortControl({ initialSort }: { initialSort: SortOption }) {
  const router = useRouter()
  const params = useSearchParams()

  const onChange = (next: SortOption) => {
    const p = new URLSearchParams(params)
    // Default sort is deadline-soonest — omit from URL when default for clean shareable links
    if (next === 'deadline-soonest') p.delete('sort')
    else p.set('sort', next)
    p.delete('page')
    router.push(p.toString() ? `/bips?${p}` : '/bips')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">Sort:</span>
      <Select value={initialSort} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger className="w-[180px]" aria-label="Sort BIPs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="deadline-soonest">{LABELS['deadline-soonest']}</SelectItem>
          <SelectItem value="newest">{LABELS.newest}</SelectItem>
          <SelectItem value="alphabetical">{LABELS.alphabetical}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
