import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

// Plan 04-06 D-19: bundle analyzer gated behind ANALYZE=true.
// Strict-equality check — NOT `!!process.env.ANALYZE` (which would enable
// on any non-empty value including the literal string "false").
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default withBundleAnalyzer(nextConfig)
