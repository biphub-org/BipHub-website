// Diagnostic — checks a deployed URL for horizontal overflow at a mobile viewport
// and prints any elements whose box extends past the viewport edge.
// Needs no local dev server or Supabase — hits the deployed site directly.
// Run: node scripts/diagnose-overflow.mjs [baseUrl]
//   default baseUrl: https://biphub-website.vercel.app
import { chromium } from 'playwright'

const BASE =
  process.argv[2] || process.env.DIAGNOSE_BASE || 'https://biphub-website.vercel.app'
const VIEWPORT = { width: 390, height: 844 } // iPhone 14-ish

const detect = () => {
  const docW = document.documentElement.clientWidth
  const offenders = []
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue
    if (r.right > docW + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 120),
        w: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
      })
    }
  }
  return {
    docW,
    scrollW: document.documentElement.scrollWidth,
    bodyScrollW: document.body.scrollWidth,
    offenders,
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: VIEWPORT })

// discover a real BIP detail slug
await page.goto(`${BASE}/bips`, { waitUntil: 'networkidle' })
const detailHref = await page
  .locator('a[href^="/bip/"]')
  .first()
  .getAttribute('href')
  .catch(() => null)

const routes = ['/', '/bips', detailHref].filter(Boolean)

for (const route of routes) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const res = await page.evaluate(detect)
  console.log(`\n=== ${route} ===`)
  console.log(`viewport docW=${res.docW}  documentElement.scrollWidth=${res.scrollW}  body.scrollWidth=${res.bodyScrollW}`)
  if (res.scrollW <= res.docW + 1) {
    console.log('  no horizontal overflow detected')
  } else {
    console.log(`  OVERFLOW: scrollWidth exceeds viewport by ${res.scrollW - res.docW}px`)
  }
  if (res.offenders.length === 0) {
    console.log('  (no individual elements past the edge)')
  } else {
    for (const o of res.offenders) {
      console.log(`  <${o.tag}> w=${o.w} left=${o.left} right=${o.right}  .${o.cls}`)
    }
  }
}

await browser.close()
