/**
 * Web Share API with silent clipboard fallback (D-11 / UI-SPEC line 285).
 *
 * Behavior:
 *   1. If navigator.share AND navigator.canShare?.({ url, title }) → use native share
 *   2. Else if navigator.clipboard.writeText → copy URL to clipboard
 *   3. Else → { shared: false, fallback: 'unsupported' }
 *
 * Returns: { shared: boolean, fallback?: 'clipboard' | 'unsupported' }
 *
 * The caller (ShareButton) is responsible for showing the appropriate Sonner toast.
 * Navigator feature-detection happens at call time (runtime, not module load) to
 * support SSR. This function must only be called from 'use client' components.
 */
export async function shareBip({
  title,
  url,
}: {
  title: string
  url: string
}): Promise<{ shared: boolean; fallback?: 'clipboard' | 'unsupported' }> {
  const data = { title, url }

  // 1. Try Web Share API (mobile browsers, Safari desktop, some Chrome versions)
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    const canShare =
      'canShare' in navigator && typeof navigator.canShare === 'function'
        ? navigator.canShare(data)
        : true
    if (canShare) {
      try {
        await navigator.share(data)
        return { shared: true }
      } catch {
        // User cancelled (AbortError) OR share failed — fall through to clipboard
      }
    }
  }

  // 2. Clipboard fallback — silent copy, caller shows toast
  if (
    typeof navigator !== 'undefined' &&
    'clipboard' in navigator &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(url)
      return { shared: true, fallback: 'clipboard' }
    } catch {
      // Clipboard write failed (no permission, iframe, etc.) — fall through
    }
  }

  // 3. Both unsupported — silent no-op; caller may log or show fallback
  return { shared: false, fallback: 'unsupported' }
}
