-- 00013_delete_my_account.sql
-- FOUN-07 / Phase 4 D-09: coordinator-driven account deletion (GDPR Art 17).
--
-- This RPC runs atomically (single transaction) under SECURITY DEFINER:
--   1. Anonymize approved BIPs owned by the calling user (contact_name='—',
--      contact_email=NULL). RLS would not allow this UPDATE for the
--      coordinator (bips_update_own_editable blocks status='approved');
--      DEFINER privilege is the controlled exception.
--   2. Hard-delete bips owned by the user with status IN ('draft','pending','rejected').
--   3. Delete the auth.users row. The FK cascade chain then fires:
--        - profiles.id ON DELETE CASCADE → profiles row removed
--        - remaining bips.created_by ON DELETE SET NULL → approved BIPs survive anonymized
--        - bip_status_history.actor_id ON DELETE SET NULL → audit log preserved
--
-- Security properties:
--   - SECURITY DEFINER with set search_path = public, auth, pg_temp prevents
--     search-path-injection privilege escalation (PITFALLS.md general SQL hardening).
--   - Function reads auth.uid() internally — NO user_id parameter. The caller
--     cannot delete another user's account regardless of input.
--   - Owner = postgres (the supabase admin role). EXECUTE granted to
--     'authenticated' only; revoked from public and anon.
--   - Atomic: any failure mid-flight rolls back the entire chain. There is
--     no half-deleted state.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  caller uuid;
begin
  caller := auth.uid();
  if caller is null then
    raise exception 'delete_my_account: not authenticated' using errcode = '42501';
  end if;

  -- Step 1: anonymize approved BIPs (preserve directory content; remove PII).
  update public.bips
    set contact_name  = '—',
        contact_email = null
    where created_by = caller
      and status = 'approved';

  -- Step 2: hard-delete draft/pending/rejected BIPs (cascade removes partner rows).
  delete from public.bips
    where created_by = caller
      and status in ('draft', 'pending', 'rejected');

  -- Step 3: delete the auth.users row. Cascades remove profiles row;
  -- bips.created_by / bip_status_history.actor_id are set NULL.
  delete from auth.users where id = caller;
end;
$$;

-- Lock down execution.
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Owner must be postgres (the supabase superuser role). The CLI loads
-- migrations as postgres by default, so the function is created with the
-- correct owner automatically; no explicit ALTER FUNCTION OWNER required.
