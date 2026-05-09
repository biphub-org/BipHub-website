import type { Database } from '@/lib/supabase/database.types'

export type Bip = Database['public']['Tables']['bips']['Row']
export type BipInsert = Database['public']['Tables']['bips']['Insert']
export type BipUpdate = Database['public']['Tables']['bips']['Update']

export type University = Database['public']['Tables']['universities']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BipPartner = Database['public']['Tables']['bip_partner_universities']['Row']

/**
 * Bip joined with host university and partner list — the shape all Phase 1
 * RSC pages query for via PostgREST relational embedding (PITFALLS Pitfall 21).
 *
 * Consumed by: Plan 01-05 (homepage recent BIPs), Plan 01-06 (/bips listing),
 * Plan 01-07 (/bip/[slug] detail page).
 */
export type BipWithRelations = Bip & {
  host_university:
    | Pick<University, 'id' | 'name' | 'country' | 'city' | 'erasmus_code'>
    | null
  partners: Array<{
    university_id: string | null
    university: Pick<University, 'name' | 'country'> | null
    partner_name_raw: string | null
    partner_country_raw: string | null
  }>
}

export type BipStatus = 'draft' | 'pending' | 'approved' | 'rejected'
export type StudyLevel = 'bachelor' | 'master' | 'phd'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type VirtualTiming =
  | 'before' | 'during' | 'after' | 'before_and_after' | 'mixed'
export type HowToApplyType = 'url' | 'contact'
