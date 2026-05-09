'use client'

/**
 * BookmarkHeartIsland — D-12, D-13, D-14.
 *
 * The only 'use client' island on a BipCard. All other BipCard rendering is RSC.
 *
 * Reads from useBookmarks() Zustand store hydrated from localStorage on mount.
 * Hydration-safe: RSC always renders the outline heart (un-bookmarked state);
 * after mount, useEffect calls hydrate() which reads localStorage, then the
 * component re-renders to show the correct filled/outline state.
 *
 * Click behavior: toggle bookmark silently. No modal. No toast in Plan 01-05
 * (toasts wired in Plan 01-07 detail page). e.preventDefault() prevents BipCard
 * Link navigation.
 *
 * Touch target: 44×44px (WCAG 2.5.5) via h-11 w-11 padding around 24px icon.
 */

import { useEffect } from 'react'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { useBookmarks } from '@/lib/store/bookmarks'
import { cn } from '@/lib/utils/cn'

interface BookmarkHeartIslandProps {
  slug: string
}

export function BookmarkHeartIsland({ slug }: BookmarkHeartIslandProps) {
  const { slugs, hydrated, hydrate, toggle } = useBookmarks()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const filled = hydrated && slugs.has(slug)
  const Icon = filled ? IconHeartFilled : IconHeart

  return (
    <button
      type="button"
      aria-label={filled ? 'Remove from bookmarks' : 'Add to bookmarks'}
      aria-pressed={filled}
      onClick={(e) => {
        e.preventDefault()     // BipCard wraps in a <Link> — don't navigate
        e.stopPropagation()
        toggle(slug)
      }}
      className={cn(
        // 44×44px touch target (WCAG / FOUN-03)
        'inline-flex h-11 w-11 items-center justify-center rounded-full',
        'bg-white/90 backdrop-blur-sm shadow-sm',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2',
      )}
    >
      <Icon
        size={24}
        className={cn(
          filled ? 'text-eu-gold' : 'text-ink-2',
          'transition-colors duration-200',
        )}
        aria-hidden="true"
      />
    </button>
  )
}
