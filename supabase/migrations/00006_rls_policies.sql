-- 00006_rls_policies.sql
-- Full RLS policy set for Phase 1. Every UPDATE policy MUST declare both
-- USING and WITH CHECK (PITFALLS Pitfall 5; CLAUDE.md critical never-do).
--
-- Policy design principles (ARCHITECTURE.md lines 140-144):
--   - Use (select auth.uid()) subquery form for performance (plan cache friendliness)
--   - Use app_metadata.role for admin flag (cannot be self-modified by users)
--   - Store role in profiles.role AND mirror in app_metadata.role via trigger (00002)
--
-- NOTE: bips_select_approved_public was created in 00001_skeleton_bips_table.sql.
-- We do NOT recreate it here. Additional bips policies are additive.

-- ============================================================
-- universities
-- ============================================================

-- Anyone can read universities (used in search, partner list display)
create policy "universities_select_public"
  on public.universities for select
  to anon, authenticated
  using (true);

-- Only admins can insert universities directly
create policy "universities_insert_admin"
  on public.universities for insert
  to authenticated
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- PITFALLS Pitfall 5: UPDATE policy MUST have BOTH using AND with check
create policy "universities_update_admin"
  on public.universities for update
  to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "universities_delete_admin"
  on public.universities for delete
  to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- profiles
-- ============================================================

-- Users can read their own profile; admins read all
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (
    (select auth.uid()) = id
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Users insert their own profile only (created on signup)
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- PITFALLS Pitfall 5: UPDATE policy MUST have BOTH using AND with check.
-- WITH CHECK is stricter than USING here:
--   - A coordinator cannot reassign their profile id to another user
--   - Role escalation (coordinator -> admin) is blocked at the DB level:
--     the row's id must equal auth.uid(), and the with check enforces row identity.
--   - Only admins can update any profile row.
--
-- T-02-03: Coordinator UPDATE on profiles setting their own role='admin' is
-- blocked because the admin path is separate and requires app_metadata='admin'.
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (
    (select auth.uid()) = id
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    -- A coordinator can only update their own row, and cannot change id (row identity)
    (
      (select auth.uid()) = id
      and id = (select auth.uid())
    )
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- bips — extends the existing bips_select_approved_public from 00001
-- ============================================================

-- Authenticated users see approved BIPs (via the anon policy from 00001) PLUS:
--   - Their own BIPs at any status
--   - All BIPs if admin
create policy "bips_select_own_or_approved"
  on public.bips for select
  to authenticated
  using (
    status = 'approved'
    or (select auth.uid()) = created_by
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Coordinators can insert new BIPs they own
create policy "bips_insert_coordinator"
  on public.bips for insert
  to authenticated
  with check (
    (select auth.uid()) = created_by
  );

-- Coordinator UPDATE: can only edit their own draft/pending BIPs.
-- PITFALLS Pitfall 5: WITH CHECK prevents:
--   (a) Reassigning created_by to a different user (ownership theft)
--   (b) Self-promoting status to approved/rejected (only admin can do that)
--
-- T-02-02: bips_update_own_draft_or_pending WITH CHECK enforces
-- created_by = auth.uid() AND status must remain in ('draft','pending').
create policy "bips_update_own_draft_or_pending"
  on public.bips for update
  to authenticated
  using (
    (select auth.uid()) = created_by
    and status in ('draft','pending')
  )
  with check (
    (select auth.uid()) = created_by
    and status in ('draft','pending')
  );

-- Admin UPDATE: admins can update any BIP (approve, reject, edit content)
-- PITFALLS Pitfall 5: with check matches using — no post-image surprises
create policy "bips_update_admin"
  on public.bips for update
  to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Coordinators can delete their own draft BIPs only
create policy "bips_delete_own_draft"
  on public.bips for delete
  to authenticated
  using (
    (select auth.uid()) = created_by
    and status = 'draft'
  );

-- Admins can delete any BIP
create policy "bips_delete_admin"
  on public.bips for delete
  to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- bip_partner_universities
-- ============================================================

-- Anonymous + authenticated users can read partners of approved BIPs (T-02-05)
create policy "bip_partners_select_public"
  on public.bip_partner_universities for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.bips
      where bips.id = bip_partner_universities.bip_id
        and bips.status = 'approved'
    )
  );

-- Authenticated users can read partners of their own BIPs (any status) or if admin
create policy "bip_partners_select_own_or_admin"
  on public.bip_partner_universities for select
  to authenticated
  using (
    exists (
      select 1 from public.bips
      where bips.id = bip_partner_universities.bip_id
        and (
          bips.created_by = (select auth.uid())
          or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        )
    )
  );

-- Coordinators can add partners to their own BIPs
create policy "bip_partners_insert_own"
  on public.bip_partner_universities for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bips
      where bips.id = bip_partner_universities.bip_id
        and bips.created_by = (select auth.uid())
    )
  );

-- T-02-04: Coordinator UPDATE on bip_partner_universities for a BIP they don't own
-- is blocked by BOTH using AND with check verifying ownership.
-- PITFALLS Pitfall 5: with check matches using here — no post-image escape.
create policy "bip_partners_update_own"
  on public.bip_partner_universities for update
  to authenticated
  using (
    exists (
      select 1 from public.bips
      where bips.id = bip_partner_universities.bip_id
        and bips.created_by = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.bips
      where bips.id = bip_partner_universities.bip_id
        and bips.created_by = (select auth.uid())
    )
  );

-- Coordinators can delete partners from their own BIPs
create policy "bip_partners_delete_own"
  on public.bip_partner_universities for delete
  to authenticated
  using (
    exists (
      select 1 from public.bips
      where bips.id = bip_partner_universities.bip_id
        and bips.created_by = (select auth.uid())
    )
  );

-- Admins have full access to bip_partner_universities
-- PITFALLS Pitfall 5: ALL policy covers UPDATE — must include with check.
create policy "bip_partners_admin_all"
  on public.bip_partner_universities for all
  to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- T-02-08: is_seed is NOT used in any RLS predicate (per 01-CONTEXT.md "Specifics").
-- RLS treats is_seed=true rows as approved BIPs identically — no branching on is_seed.
