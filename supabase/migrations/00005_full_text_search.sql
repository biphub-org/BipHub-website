-- 00005_full_text_search.sql
-- Postgres native full-text search with unaccent normalization (BROW-09).
-- "Munchen" must match "München"; "Lodz" must match "Łódź".
--
-- Per STACK.md lines 178-196 — the unaccent recipe.
-- Locked decision: Postgres native FTS + unaccent (no external search service below 500 BIPs).
--
-- Deviation note: unaccent() is not IMMUTABLE by default in Postgres, which means
-- it cannot be used directly in a GENERATED ALWAYS AS ... STORED expression
-- (Postgres requires all functions in generated column expressions to be immutable).
-- Fix: create an IMMUTABLE wrapper function around unaccent — standard practice
-- documented by Postgres community and referenced in STACK.md examples.

create extension if not exists unaccent;

-- Immutable wrapper required for GENERATED ALWAYS AS ... STORED expression.
-- unaccent() itself is STABLE (not IMMUTABLE) by default; the wrapper is safe
-- because unaccent only does text normalization with no side effects or
-- environment-sensitive behavior.
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
returns null on null input
as $$
  select unaccent($1);
$$;

-- 'simple' dictionary preserves all words (no English stemming) which is
-- correct for multilingual EU content. unaccent is the language-agnostic
-- accent stripper.
--
-- Weighted fields:
--   A = title (highest relevance)
--   B = description
--   C = host_city
--
-- The column is GENERATED ALWAYS AS ... STORED so it is automatically kept in sync
-- whenever the source columns (title, description, host_city) are updated.
alter table public.bips
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(description, ''))), 'B') ||
    setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(host_city, ''))), 'C')
  ) stored;

-- GIN index for fast full-text search (PITFALLS Pitfall 21 — avoid full-table scan)
create index bips_search_idx on public.bips using gin(search_vector);
