/**
 * Playwright config — Plan 04-07 (FOUN-10 / D-12 / D-13 / D-14 / D-16).
 *
 * Hard-locked invariants:
 *  - retries: 0 (D-16 — no flake retries in v1; flakes must be fixed, not retried)
 *  - workers: 1 (D-16 single-shard scope)
 *  - fullyParallel: false (fixture users are shared resources; parallelism causes
 *    auth-cookie races between the coordinator-authed and admin-authed projects)
 *  - chromium-only project list (cross-browser deferred to v1.1)
 *  - webServer.env.RESEND_API_KEY: '' forces the D-15 console-log fallback in
 *    lib/email/send.ts so specs can assert email-send via page.on('console')
 */
import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /setup\.ts$/,
    },
    {
      name: 'auth-flow',
      testMatch: /auth\.spec\.ts$/,
      // auth.spec.ts exercises the real login UI — no storageState reuse.
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'coordinator-authed',
      testMatch: /submission\.spec\.ts$/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/fixtures/storageState.coordinator.json',
      },
    },
    {
      name: 'admin-authed',
      testMatch: /admin-review\.spec\.ts$/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/fixtures/storageState.admin.json',
      },
    },
    {
      name: 'public',
      testMatch: /map-filter\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
      // no storageState — public route
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // E2E mode: blank Resend key triggers console-log fallback (D-15).
      RESEND_API_KEY: '',
      ADMIN_NOTIFICATION_EMAIL: 'e2e-admin@biphub.test',
    },
  },
})
