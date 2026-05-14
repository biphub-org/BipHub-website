/**
 * Regression — Phase 01 UAT Test 6 (01-HUMAN-UAT.md gap).
 *
 * Two distinct horizontal-overflow bugs were found on mobile viewports and fixed:
 *  - Homepage: StatsSection's w-[420px] decoration blob escaped a section that
 *    lacked `overflow-hidden` (Hero clips the identical pattern — StatsSection did not).
 *  - /bips: the results-bar controls row (results count + Filters drawer button +
 *    fixed w-[180px] sort control) did not wrap, so it pushed past the viewport.
 *
 * This guards both: no page in the public route group may scroll horizontally
 * at a common mobile viewport width.
 */
import { test, expect } from '@playwright/test'

const MOBILE = { width: 390, height: 844 } // iPhone 14-class viewport

for (const path of ['/', '/bips']) {
  test(`no horizontal overflow on ${path} at ${MOBILE.width}px`, async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto(path, { waitUntil: 'networkidle' })

    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))

    expect(
      scrollW,
      `${path}: document scrollWidth (${scrollW}) must not exceed viewport (${clientW})`,
    ).toBeLessThanOrEqual(clientW + 1)
  })
}
