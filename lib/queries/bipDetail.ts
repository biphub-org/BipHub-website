/**
 * BIP detail page query layer (Plan 01-07).
 *
 * getBipBySlug: single PostgREST relational embed query — avoids N+1 (PITFALLS Pitfall 21).
 * getAllPublishedSlugs: seed-only slugs for generateStaticParams.
 *
 * RLS enforces status='approved' for the anon key; only approved BIPs are visible.
 */
import { createClient } from '@/lib/supabase/server'

/**
 * The full shape returned by getBipBySlug, used across Phase 1 detail page
 * and reused by Phase 2 coordinator preview + Phase 3 admin review.
 */
export type BipDetail = {
  id: string
  slug: string
  title: string
  description: string | null
  learning_outcomes: string | null
  virtual_component_description: string | null
  virtual_timing: string | null
  physical_start_date: string | null
  physical_end_date: string | null
  host_city: string | null
  ects_credits: number | null
  language_of_instruction: string | null
  language_level_min: string | null
  study_levels: string[]
  eligibility_notes: string | null
  how_to_apply_type: string | null
  how_to_apply_value: string | null
  contact_name: string | null
  contact_email: string | null
  application_deadline: string | null
  green_travel: boolean
  inclusion_support: boolean
  is_seed: boolean
  status: string
  created_at: string
  subject_area: string | null
  host_university: {
    id: string
    name: string
    country: string | null
    city: string | null
    erasmus_code: string | null
  } | null
  partners: Array<{
    id: string
    partner_name_raw: string | null
    partner_country_raw: string | null
    partner_erasmus_code_raw: string | null
    university_id: string | null
    university: {
      name: string
      country: string | null
    } | null
  }>
}

/**
 * Fetch a single BIP by slug with all relations embedded in ONE query.
 * Returns null if no approved BIP with the given slug exists.
 *
 * Pattern: host_university:universities!host_university_id (Pitfall 21)
 * Pattern: partners:bip_partner_universities (Pitfall 21)
 */
export async function getBipBySlug(slug: string): Promise<BipDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bips')
    .select(`
      id, slug, title, description, learning_outcomes,
      virtual_component_description, virtual_timing,
      physical_start_date, physical_end_date, host_city,
      ects_credits, language_of_instruction, language_level_min,
      study_levels, eligibility_notes,
      how_to_apply_type, how_to_apply_value,
      contact_name, contact_email, application_deadline,
      green_travel, inclusion_support, is_seed, status, created_at, subject_area,
      host_university:universities!host_university_id(id, name, country, city, erasmus_code),
      partners:bip_partner_universities(
        id, partner_name_raw, partner_country_raw, partner_erasmus_code_raw, university_id,
        university:universities(name, country)
      )
    `)
    .eq('slug', slug)
    .maybeSingle()

  // PGRST116 = "no rows" — treat as not found
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  if (!data) return null

  // Cast through unknown to handle the PostgREST embedded shape
  const raw = data as unknown as BipDetail
  return raw
}

/**
 * Returns all slugs where status='approved'.
 * Used by generateStaticParams to pre-render all published BIPs at build time.
 *
 * Note: Phase 1 seed BIPs all have status='approved'. For generateStaticParams
 * we pre-render all approved BIPs (not just is_seed=true) since build time is short.
 *
 * Returns [] gracefully if Supabase is not available (CI / build without local DB).
 * ISR fallback renders those BIPs on first request.
 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bips')
      .select('slug')
      .eq('status', 'approved')

    if (error) throw error

    return (data ?? []).map((row) => row.slug)
  } catch {
    // Build-time: no Supabase available — ISR fallback handles all slugs at runtime
    return []
  }
}
