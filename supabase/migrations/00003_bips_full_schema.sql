-- 00003_bips_full_schema.sql
-- Extends the walking-skeleton bips table (Plan 01-01) with the full Phase 1 schema.
-- 12 added Erasmus+ fields per .planning/research/FEATURES.md lines 244-273.
-- DO NOT recreate the table — it exists from 00001_skeleton_bips_table.sql.
--
-- Skeleton columns already present from 00001:
--   id, slug, title, status, is_seed, created_at

alter table public.bips
  -- Virtual component fields
  add column description                  text,
  add column learning_outcomes            text,
  add column virtual_component_description text,
  add column virtual_timing               text
    check (virtual_timing in ('before','during','after','before_and_after','mixed')),
  add column virtual_sessions_count       integer,
  add column virtual_duration_notes       text,

  -- Physical mobility dates
  add column physical_start_date          date,
  add column physical_end_date            date,
  add column application_deadline         date,
  add column host_city                    text,

  -- Academic requirements
  add column ects_credits                 integer check (ects_credits >= 3),
  add column max_participants             integer check (max_participants between 1 and 30),

  -- Language requirements
  add column language_of_instruction      text,                              -- ISO 639-1 e.g. 'en'
  add column language_level_min           text                               -- CEFR
    check (language_level_min in ('A1','A2','B1','B2','C1','C2')),

  -- Field of study
  add column subject_area                 text,                              -- ISCED group id from lib/isced.ts
  add column isced_f_code                 text,                              -- 4-digit ISCED-F 2013

  -- Participation flags (all 12 Erasmus+ added fields from FEATURES.md)
  add column study_levels                 text[] not null default '{}',      -- {'bachelor','master','phd'}
  add column partner_institutions_only    boolean not null default false,
  add column green_travel                 boolean not null default false,
  add column inclusion_support            boolean not null default false,
  add column accommodation_notes          text,

  -- Eligibility
  add column eligibility_notes            text,

  -- Contact details (separate from how-to-apply — FEATURES.md)
  add column contact_name                 text,
  add column contact_email                text,

  -- Application method: URL or direct contact
  add column how_to_apply_type            text
    check (how_to_apply_type in ('url','contact')),
  add column how_to_apply_value           text,

  -- Relations and audit
  add column host_university_id           uuid references public.universities(id) on delete restrict,
  add column created_by                   uuid references auth.users(id) on delete set null,
  add column published_at                 timestamptz,
  add column updated_at                   timestamptz not null default now();

-- Constrain study_levels values via a CHECK on every element
-- (Postgres array containment operator <@ checks all elements are in the allowed set)
alter table public.bips
  add constraint bips_study_levels_valid
  check (study_levels <@ array['bachelor','master','phd']::text[]);

-- updated_at trigger — used by Phase 2's optimistic locking (PITFALLS Pitfall 17)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger bips_touch_updated_at
  before update on public.bips
  for each row execute function public.touch_updated_at();
