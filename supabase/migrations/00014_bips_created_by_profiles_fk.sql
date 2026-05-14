-- 00014_bips_created_by_profiles_fk.sql
--
-- Adds a second foreign key from bips.created_by to public.profiles(id) so
-- PostgREST can embed the coordinator profile in admin queries.
--
-- WHY: bips.created_by already references auth.users(id) (migration 00003).
-- The admin queries (getAdminPendingBips, getAdminBipById, admin-bips actions,
-- the review page) need to embed `profiles` (full_name, contact_email) through
-- created_by. PostgREST can only embed across a foreign key it can see in the
-- `public` schema — and there was none between `bips` and `profiles`. The
-- result was PGRST200 ("Could not find a relationship between 'bips' and
-- 'created_by'"), which getAdminPendingBips swallowed into an empty list — so
-- the admin pending queue rendered empty even when BIPs were awaiting review.
--
-- SAFETY: profiles.id IS auth.users.id (1:1 — migration 00002 defines
-- profiles.id references auth.users(id)). Every coordinator is gated through
-- onboarding (saveProfileAction upserts the profiles row) before they can
-- create a BIP, so every non-null created_by has a matching profiles row.
-- Seed BIPs carry created_by = NULL, which a FK permits. `on delete set null`
-- matches the existing auth.users FK behaviour.

alter table public.bips
  add constraint bips_created_by_profiles_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

-- Ensure PostgREST picks up the new relationship without waiting for the
-- next schema-cache reload cycle.
notify pgrst, 'reload schema';
