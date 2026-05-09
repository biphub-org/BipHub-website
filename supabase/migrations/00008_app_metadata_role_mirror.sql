-- 00008_app_metadata_role_mirror.sql
-- Complements the sync_role_to_app_metadata() trigger installed in migration
-- 00002_universities_profiles.sql. That trigger already fires AFTER INSERT OR
-- UPDATE OF role on public.profiles for each row, mirroring the role into
-- auth.users.raw_app_meta_data.role.
--
-- Plan 01-08 adds two things that 00002 did not include:
--   1. Security hardening: REVOKE EXECUTE on the trigger function from public,
--      anon, and authenticated roles so the function can only be called within
--      the trigger context, not directly by client code (PITFALLS Pitfall 7 /
--      T-08-04 threat mitigation).
--   2. Backfill: apply the role mirror to any existing profile rows (e.g. the
--      20 seed BIPs inserted in Plan 01-03) so their auth.users.raw_app_meta_data
--      is consistent before Phase 2 ships real sessions. Without the backfill,
--      profiles created before this migration have no app_metadata.role claim and
--      admin RLS policies that read `auth.jwt() -> 'app_metadata' ->> 'role'`
--      would evaluate to null (false) for any user whose profile predates 00008.
--
-- ARCHITECTURE.md lines 333-355: "Store role in profiles.role AND mirror it in
-- app_metadata.role via a Postgres trigger so RLS can read it from the JWT".
-- Plan 01-02 ships the RLS policies that read the claim; this migration closes
-- the security-hardening and backfill gaps.
--
-- NOTE: The trigger function `public.sync_role_to_app_metadata()` was created
-- in 00002 with `security definer` and `set search_path = public`. The `auth`
-- schema is accessible because SECURITY DEFINER functions run with the
-- function owner's privileges (postgres superuser in local dev; supabase_admin
-- in managed Supabase), which can write to auth.users regardless of the
-- search_path. The function is correct and is NOT recreated here.

-- 1. Security hardening: prevent direct invocation from application code.
--    Only the trigger context (which runs as the table owner) can call this
--    function. This satisfies T-08-04 in the threat model.
revoke execute on function public.sync_role_to_app_metadata() from public, anon, authenticated;

-- 2. Backfill: mirror the role of any existing profile rows into auth.users.
--    This is a one-time operation; after 00008 runs, the trigger keeps them
--    in sync on every subsequent INSERT or UPDATE OF role on profiles.
--    Uses the same jsonb merge logic as the trigger function.
update auth.users u
set raw_app_meta_data =
  coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', p.role)
from public.profiles p
where u.id = p.id;
