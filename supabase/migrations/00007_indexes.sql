-- 00007_indexes.sql
-- Composite indexes for the seven /bips filters per BROW-02 through BROW-08.
-- Plus FK indexes per PITFALLS Pitfall 21 (avoid sequential scan on join).
--
-- All partial indexes are filtered on status='approved' — the public read path
-- never queries non-approved rows, so partial indexes are smaller and faster.

-- Filter: application status (open/closed) + deadline sort (BROW-06, D-03 default sort)
create index bips_status_deadline_idx
  on public.bips(status, application_deadline)
  where status = 'approved';

-- Filter: field of study / ISCED group (BROW-03)
create index bips_status_subject_idx
  on public.bips(status, subject_area)
  where status = 'approved';

-- Filter: host country via university join (BROW-02)
create index bips_status_country_idx
  on public.bips(status, host_university_id)
  where status = 'approved';

-- Filter: language of instruction (BROW-04)
create index bips_status_language_idx
  on public.bips(status, language_of_instruction)
  where status = 'approved';

-- Sort: newest first (created_at desc) — alternative sort option
create index bips_status_created_idx
  on public.bips(status, created_at desc)
  where status = 'approved';

-- FK index — required for PITFALLS Pitfall 21 (avoid sequential scan on join
-- when embedding host_university via PostgREST relational embedding)
create index bips_host_university_idx
  on public.bips(host_university_id);

-- Coordinator dashboard (Phase 2 will use this — declare now per ROADMAP.md)
-- Also covers RLS policy column: created_by used in bips_update_own_draft_or_pending
create index bips_created_by_status_idx
  on public.bips(created_by, status);

-- Note: slug lookup for /bip/[slug] is already indexed by the unique constraint
-- created in 00001_skeleton_bips_table.sql (unique constraint auto-creates a B-tree index).
