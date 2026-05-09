import Link from 'next/link'
import { LogoMark } from '@/components/home/LogoMark'

/**
 * D-13 verify-email confirmation card. Static — no form. Reads `email` from
 * searchParams and falls back to "your inbox" if missing.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const sp = await searchParams
  const target = sp.email ? sp.email : 'your inbox'

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
      <p className="mt-6 text-center text-sm text-muted">
        Didn&apos;t receive it?{' '}
        <Link href="/register" className="text-eu-blue font-semibold hover:underline">
          Resend verification
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-muted">
        Wrong email?{' '}
        <Link href="/login" className="text-eu-blue font-semibold hover:underline">
          Sign in with a different account
        </Link>
      </p>
    </section>
  )
}
