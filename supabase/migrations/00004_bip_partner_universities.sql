-- 00004_bip_partner_universities.sql
-- Junction table for BIP partner universities.
-- Per FEATURES.md OQ-1: supports BOTH a registered FK and free-text
-- "not yet registered" partners.
--
-- A BIP requires a minimum of 3 HEIs from 3 different countries.
-- A coordinator listing their BIP cannot be blocked by whether partner
-- universities have registered on BipHub yet.
--
-- PITFALLS Pitfall 4: enable RLS immediately after creation.

create table public.bip_partner_universities (
  id              uuid primary key default gen_random_uuid(),
  bip_id          uuid not null references public.bips(id) on delete cascade,
  university_id   uuid references public.universities(id) on delete set null,

  -- Free-text fallback when partner is not (yet) a registered university
  partner_name_raw         text,
  partner_erasmus_code_raw text,
  partner_country_raw      text,                                 -- ISO 3166-1 alpha-2

  created_at timestamptz not null default now(),

  -- Either FK or raw name must be present — constraint enforces this
  constraint partner_identifies_someone
    check (university_id is not null or partner_name_raw is not null)
);

-- PITFALLS Pitfall 4: enable RLS immediately
alter table public.bip_partner_universities enable row level security;

-- FK index — required for PITFALLS Pitfall 21 (avoid sequential scan on join)
create index bip_partners_bip_id_idx
  on public.bip_partner_universities(bip_id);
