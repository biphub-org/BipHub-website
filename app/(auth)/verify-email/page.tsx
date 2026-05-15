import Link from 'next/link'
import { LogoMark } from '@/components/home/LogoMark'
import { ResendVerificationButton } from '@/components/auth/ResendVerificationButton'

/**
 * D-13 verify-email confirmation card. Reads `email` from searchParams and
 * falls back to "your inbox" if missing. Includes a real Resend button that
 * calls supabase.auth.resend({ type: 'signup' }) and self-disables for 30s
 * after success to respect the upstream rate limit.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const sp = await searchParams
  const email = sp.email ?? ''
  const target = email || 'your inbox'

  return (
    <section className="bg-white rounded-md shadow-md p-10">
      <header className="flex flex-col items-center gap-3 mb-6">
        <LogoMark />
        <h1 className="text-[22px] font-semibold tracking-[-0.3px] text-ink">
          Check your email
        </h1>
      </header>
      <p className="text-center text-sm text-ink-2 leading-relaxed">
        We&apos;ve sent a verification link to{' '}
        <span className="font-semibold text-ink">{target}</span>. Click the link to
        activate your account and complete your profile.
      </p>

      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-muted">Didn&apos;t receive it?</p>
        {email ? (
          <ResendVerificationButton email={email} />
        ) : (
          <Link
            href="/register"
            className="text-eu-blue font-semibold text-sm hover:underline"
          >
            Re-enter your email
          </Link>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Wrong email?{' '}
        <Link href="/login" className="text-eu-blue font-semibold hover:underline">
          Sign in with a different account
        </Link>
      </p>
    </section>
  )
}
