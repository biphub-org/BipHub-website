-- 00001_skeleton_bips_table.sql
-- Walking-skeleton bips table. Plan 01-02 extends this with the full Erasmus+ schema.
-- RLS is enabled; one SELECT policy lets anon read approved rows. This is the minimum
-- to prove the RSC -> Supabase -> RLS -> render round-trip end-to-end.

create extension if not exists "pgcrypto";

create table public.bips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected')),
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);

-- PITFALLS Pitfall 4: every table MUST enable RLS. No exceptions.
alter table public.bips enable row level security;

-- PITFALLS Pitfall 5 reminder: this is a SELECT policy, no WITH CHECK needed.
-- UPDATE policies in later migrations MUST include both USING and WITH CHECK.
create policy "bips_select_approved_public"
  on public.bips
  for select
  to anon, authenticated
  using (status = 'approved');
