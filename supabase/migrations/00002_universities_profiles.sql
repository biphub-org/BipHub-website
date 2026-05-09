-- 00002_universities_profiles.sql
-- Creates universities and profiles tables.
-- Both are needed in Phase 1:
--   - BIP detail page (DETL-03) shows host university via bips.host_university_id -> universities
--   - Phase 2 associates coordinator profiles with universities; the app_metadata.role trigger
--     is built here so Phase 2 has zero schema work.
--
-- PITFALLS Pitfall 4: both tables MUST enable RLS immediately after creation.
-- PITFALLS Pitfall 5 reminder: any UPDATE policy on these tables must include both
--   USING and WITH CHECK (handled in 00006_rls_policies.sql).

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,                       -- ISO 3166-1 alpha-2 e.g. 'DE'
  city text,
  erasmus_code text unique,                    -- e.g. 'D MUNCHEN02'
  website_url text,
  created_at timestamptz not null default now()
);

-- PITFALLS Pitfall 4: enable RLS immediately
alter table public.universities enable row level security;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  contact_email text,
  university_id uuid references public.universities(id) on delete set null,
  role text not null default 'coordinator'
    check (role in ('coordinator','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PITFALLS Pitfall 4: enable RLS immediately
alter table public.profiles enable row level security;

-- Mirror profiles.role into auth.users.app_metadata.role so RLS policies can
-- read it from the JWT without a DB round-trip per request.
-- ARCHITECTURE.md line 144: "Store role in profiles.role AND mirror it in
-- app_metadata.role via a Postgres trigger so RLS can read it from the JWT".
create or replace function public.sync_role_to_app_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                          || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end;
$$;

create trigger profiles_sync_role
  after insert or update of role on public.profiles
  for each row execute function public.sync_role_to_app_metadata();
