/**
 * The 8 field-of-study categories shown on the homepage CategoriesBar
 * (DISC-03) and used as the BROW-03 filter facet.
 *
 * `id` is the URL-safe identifier used in `/bips?field=engineering`.
 * `isced` is the ISCED-F 2013 broad-field code (used for SEO + DB query
 * via bips.subject_area = id).
 *
 * Source: STACK.md lines 156-169 (locked — do not rename ids without
 * updating /bips URL contract and seed data).
 */
export const ISCED_FIELDS = [
  { id: 'engineering',     label: 'Engineering',      isced: '07' },
  { id: 'business',        label: 'Business',         isced: '04' },
  { id: 'sciences',        label: 'Natural Sciences', isced: '05' },
  { id: 'arts',            label: 'Arts & Design',    isced: '02' },
  { id: 'health',          label: 'Health',           isced: '09' },
  { id: 'social-sciences', label: 'Social Sciences',  isced: '03' },
  { id: 'environment',     label: 'Environment',      isced: '08' },
  { id: 'humanities',      label: 'Humanities',       isced: '02' },
] as const

export type IscedField = (typeof ISCED_FIELDS)[number]
export type IscedFieldId = IscedField['id']

/**
 * Lookup map from id to field object.
 * Used by CategoriesBar and /bips field-of-study filter to avoid array searches.
 */
export const ISCED_FIELD_BY_ID: Readonly<Record<IscedFieldId, IscedField>> =
  Object.fromEntries(ISCED_FIELDS.map((f) => [f.id, f])) as never
