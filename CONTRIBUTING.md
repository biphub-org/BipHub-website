# Contributing to BipHub

Thanks for your interest. BipHub is the free, open-source database for Erasmus+
Blended Intensive Programs. Contributions of all sizes are welcome — bug
reports, schema fixes, accessibility audits, translations, seed data, docs.

## Development setup

```bash
git clone https://github.com/<your-fork>/biphub
cd biphub
npm install
docker --version          # Docker Desktop must be running
npx supabase start        # spins up the local Postgres + Studio stack
npx supabase status       # copy the printed publishable + secret keys into .env.local
npx supabase db reset     # applies migrations 00001..00008 + seed.sql
npm run dev               # http://localhost:3000
```

The local Supabase stack publishes new keys on every `supabase start`. The
`.env.local` template lives in `.env.example`; populate it from
`npx supabase status` after each restart.

## Project conventions (read before opening a PR)

- **Stack is locked.** Do not bump major versions of `next`, `@supabase/ssr`,
  `zod`, or `motion` without a discussion. See `CLAUDE.md` for the locked
  table and the rationale.
- **Server code uses `getClaims()`, never `getSession()`.** `getClaims()`
  validates the JWT signature; `getSession()` trusts cookies blindly.
- **Every Supabase server client factory uses `await cookies()`.** Next.js 15
  made `next/headers cookies()` async; sync use compiles silently and breaks
  auth.
- **Every table has Row Level Security enabled.** Every UPDATE policy
  declares both `USING` and `WITH CHECK`. Tables created without RLS are
  publicly readable through the anon key.
- **No EU 12-star emblem.** The palette is fine; the 12-star ring
  arrangement is restricted under EC visual identity rules. The `LogoMark`
  uses `STAR_COUNT = 11`.
- **Every page renders the disclaimer:**
  *"Independent project — not affiliated with the European Commission."*
  It lives in `components/home/Footer.tsx` and is inherited via
  `app/(public)/layout.tsx`.
- **No dynamic Tailwind class names.** Tailwind v4's static scanner cannot
  resolve template literals. Use complete class strings in lookup objects.

## Commit + PR conventions

- Conventional commits scoped to the plan or area:
  `feat(01-05): ...`, `fix(seed): ...`, `docs: ...`, `chore(deps): ...`.
- One concern per commit; no bundled refactors with feature work.
- Open the PR against `master`. CI runs `npm run lint`, `npm run build`, and
  `npm run verify:seed`.

## Reporting issues

Open a GitHub issue with: a short title, the page or file, what you expected
vs. what happened, and (if visual) a screenshot. Security issues — please
email the maintainers privately rather than opening a public issue.

## License

MIT. By contributing you agree your changes are released under the MIT
license in `LICENSE`.
