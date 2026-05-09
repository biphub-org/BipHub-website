-- 00005_full_text_search.sql
-- Postgres native full-text search with unaccent normalization (BROW-09).
-- "Munchen" must match "München"; "Lodz" must match "Łódź".
--
-- Per STACK.md lines 178-196 — the unaccent recipe.
-- Locked decision: Postgres native FTS + unaccent (no external search service below 500 BIPs).

create extension if not exists unaccent;

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
    setweight(to_tsvector('simple', unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(description, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(host_city, ''))), 'C')
  ) stored;

-- GIN index for fast full-text search (PITFALLS Pitfall 21 — avoid full-table scan)
create index bips_search_idx on public.bips using gin(search_vector);
