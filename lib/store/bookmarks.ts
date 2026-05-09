/**
 * Zustand bookmark store — D-12, D-13, D-14.
 *
 * Stores bookmarked BIP slugs in localStorage["biphub:bookmarks"] as a JSON
 * array of strings.
 *
 * Hydration safety: the RSC renders all BipCards as un-bookmarked. After mount,
 * `hydrate()` reads localStorage and the `slugs` Set is populated. This avoids
 * SSR/client hydration mismatch because the server and client initial states
 * agree (both empty), and only after hydration does the client diverge.
 *
 * Usage in client components:
 *   const { slugs, hydrated, hydrate, toggle } = useBookmarks()
 *   useEffect(() => { hydrate() }, [hydrate])
 *   const bookmarked = hydrated && slugs.has(slug)
 */

import { create } from 'zustand'

const STORAGE_KEY = 'biphub:bookmarks'

type BookmarksState = {
  slugs: Set<string>
  hydrated: boolean
  toggle: (slug: string) => void
  hydrate: () => void
}

export const useBookmarks = create<BookmarksState>((set, get) => ({
  slugs: new Set(),
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return
    // Only hydrate once
    if (get().hydrated) return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        set({ hydrated: true })
        return
      }
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        set({
          slugs: new Set(parsed.filter((x): x is string => typeof x === 'string')),
          hydrated: true,
        })
      } else {
        // Corrupted value — reset to empty (T-05-05: accept, best-effort UX)
        set({ hydrated: true })
      }
    } catch {
      // JSON.parse error or localStorage access blocked — best-effort (D-14)
      set({ hydrated: true })
    }
  },

  toggle: (slug: string) => {
    const next = new Set(get().slugs)
    if (next.has(slug)) {
      next.delete(slug)
    } else {
      next.add(slug)
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // Quota exceeded or storage access blocked — best-effort per D-14
      }
    }
    set({ slugs: next })
  },
}))
