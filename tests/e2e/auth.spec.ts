/**
 * Auth golden-path spec — Plan 04-07 Task 4 (D-14 auth scope + FOUN-07 verify).
 *
 * Covers:
 *   1. Register through the UI → auto-confirm via Supabase admin API → login → /onboarding
 *   2. Invalid credentials show an inline error
 *   3. Logout from /dashboard via the sign-out form
 *   4. Password reset request shows the "check your email" confirmation
 *   5. Account deletion via /dashboard/settings (destructively consumes
 *      e2e-coordinator-fresh@biphub.test)
 *
 * Selectors use the semantic Playwright API (getByLabel / getByRole /
 * getByText) — no className targeting — so the suite is resilient to
 * Tailwind refactors.
 *
 * RESEND_API_KEY is intentionally blank in playwright.config.ts; the
 * reset-password test asserts the UI confirmation page only (real link
 * extraction deferred to v1.1 per EDGE-CASES-DEFERRED.md).
 */
import { test, expect } from '@playwright/test'

test.describe('auth flow', () => {
  const NEW_USER = {
    email: `e2e-throwaway-${Date.now()}@biphub.test`,
    password: 'Throwaway!Test1',
  }

  test('register → auto-confirm via admin API → login → /onboarding', async ({
    page,
    request,
  }) => {
    // 1. Register through the UI.
    await page.goto('/register')
    await page.getByLabel(/^email$/i).fill(NEW_USER.email)
    await page.getByLabel(/^password$/i).fill(NEW_USER.password)
    await page.getByLabel(/confirm password/i).fill(NEW_USER.password)
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL(/verify-email/, { timeout: 10_000 })

    // 2. Auto-confirm via Supabase admin API.
    // Service-role key is exposed to the dev/CI process via env; tests read
    // the same values the Next.js dev server reads.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — ' +
          'ensure .env.local is populated (`supabase status` after `supabase start`).',
      )
    }

    const userListResp = await request.get(
      `${supabaseUrl}/auth/v1/admin/users?filter=email eq.${NEW_USER.email}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    )
    expect(userListResp.ok()).toBeTruthy()
    const userList = (await userListResp.json()) as { users?: Array<{ id: string }> }
    const userId = userList.users?.[0]?.id
    expect(userId).toBeTruthy()
    const confirmResp = await request.put(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        data: { email_confirm: true },
      },
    )
    expect(confirmResp.ok()).toBeTruthy()

    // 3. Login. Freshly confirmed user has no profile → /onboarding.
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(NEW_USER.email)
    await page.getByLabel(/password/i).fill(NEW_USER.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/onboarding/, { timeout: 10_000 })
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('not-a-real-user@biphub.test')
    await page.getByLabel(/password/i).fill('Wrong!Password1')
    await page.getByRole('button', { name: /sign in/i }).click()
    // signInAction maps Supabase 'invalid login' → "Email or password is incorrect."
    await expect(page.getByText(/incorrect|invalid/i)).toBeVisible({
      timeout: 5_000,
    })
  })

  test('logout from /dashboard', async ({ page }) => {
    // Login as the fixture coordinator.
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('e2e-coordinator@biphub.test')
    await page.getByLabel(/password/i).fill('Coordinator!Test1')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 })

    // DashboardNav renders a <form action={signOutAction}> with a "Sign out" button.
    await page.getByRole('button', { name: /sign out/i }).click()
    // signOutAction redirects to /login.
    await page.waitForURL(/\/login/, { timeout: 10_000 })
  })

  test('password reset request shows confirmation', async ({ page }) => {
    await page.goto('/reset-password')
    await page.getByLabel(/email/i).fill('e2e-coordinator@biphub.test')
    await page.getByRole('button', { name: /send reset link/i }).click()
    // Form replaced with "Check your email" card; success regardless of
    // whether the email exists (T-02-02-05 no-enumeration).
    await expect(page.getByText(/check your email/i)).toBeVisible({
      timeout: 5_000,
    })
    // D-15 console-log fallback fires server-side; real link extraction
    // deferred (see tests/e2e/EDGE-CASES-DEFERRED.md).
  })

  test('account deletion via /dashboard/settings', async ({ page }) => {
    // Uses e2e-coordinator-fresh@biphub.test — a dedicated, destructively-
    // consumed fixture user. NO other spec depends on this account; its
    // deletion is the explicit purpose of this test. (See seed.e2e.sql.)
    const accountEmail = 'e2e-coordinator-fresh@biphub.test'

    // Sign in. The fresh user has no profile row → lands on /onboarding.
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(accountEmail)
    await page.getByLabel(/password/i).fill('Fresh!Test1')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10_000 })

    // Settings page requires a profile-complete coordinator — the fresh
    // user hits the (dashboard) layout's profile-complete gate which
    // bounces back to /onboarding. Complete the onboarding form first.
    if (/\/onboarding/.test(page.url())) {
      await page.getByLabel(/full name/i).fill('E2E Fresh Coordinator')
      // UniversityCombobox: open and pick the first option.
      await page.getByLabel(/university/i).click()
      // Wait for the combobox panel and pick TUM (always present from seed.sql).
      await page.getByRole('option').first().click()
      // Erasmus code is optional in some shapes; fill if visible.
      const erasmusInput = page.getByLabel(/erasmus.*code/i)
      if (await erasmusInput.isVisible().catch(() => false)) {
        await erasmusInput.fill('TEST FRESH01')
      }
      await page.getByRole('button', { name: /save|continue|finish/i }).click()
      await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
    }

    await page.goto('/dashboard/settings')
    await expect(
      page.getByRole('heading', { name: /danger zone/i }),
    ).toBeVisible()

    // Open the Delete-account modal via the trigger button.
    await page.getByRole('button', { name: /^delete account$/i }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/this action is irreversible/i)).toBeVisible()

    // Confirm button (inside dialog) is the LAST one matching /^Delete account$/.
    const confirm = page
      .getByRole('button', { name: /^delete account$/i })
      .last()
    await expect(confirm).toBeDisabled()

    // Typed-email confirmation: wrong → disabled; correct → enabled.
    const typedField = page.getByLabel(/type.*account email/i, { exact: false }).or(
      page.locator('#typedEmail'),
    )
    await typedField.fill('wrong@example.com')
    await expect(confirm).toBeDisabled()
    await typedField.fill(accountEmail)
    await expect(confirm).toBeEnabled()

    await confirm.click()

    // Server Action redirects to /?deleted=1 and signs out.
    await page.waitForURL(/\/\?deleted=1/, { timeout: 15_000 })
    await expect(page.getByText(/your account.*deleted|deleted/i)).toBeVisible()

    // Verify deletion: logging back in with the deleted credentials fails.
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(accountEmail)
    await page.getByLabel(/password/i).fill('Fresh!Test1')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/incorrect|invalid/i)).toBeVisible({
      timeout: 5_000,
    })
  })
})
