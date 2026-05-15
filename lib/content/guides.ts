/**
 * Static registry of /guides articles.
 *
 * Each entry maps to a static page under app/(public)/guides/<slug>/page.tsx.
 * The slug array drives the /guides hub index — when you add a new guide,
 * create the page file AND add a row here.
 */

export type GuideAudience = 'students' | 'coordinators'

export interface Guide {
  slug: string
  title: string
  summary: string
  audience: GuideAudience
  readingTime: string
}

export const GUIDES: ReadonlyArray<Guide> = [
  {
    slug: 'how-to-choose-a-bip',
    title: 'How to choose the right BIP',
    summary:
      'Topic, dates, language, ECTS, location, cost — the six factors that should drive your shortlist, in the order that matters.',
    audience: 'students',
    readingTime: '5 min read',
  },
  {
    slug: 'how-to-apply',
    title: 'How to apply for a BIP',
    summary:
      'A step-by-step walkthrough of the application process — from your home Erasmus office to the learning agreement and the grant payment.',
    audience: 'students',
    readingTime: '6 min read',
  },
  {
    slug: 'for-coordinators',
    title: 'Listing your BIP on BipHub',
    summary:
      'A practical guide for university coordinators: account setup, the five-step submission wizard, what reviewers look for, and how to keep listings fresh.',
    audience: 'coordinators',
    readingTime: '7 min read',
  },
] as const

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug)
