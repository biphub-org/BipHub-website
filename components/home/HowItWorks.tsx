'use client'

/**
 * HowItWorks — DISC-06, UI-SPEC line 334.
 *
 * Self-contained card. Steps stack vertically inside the card so it can sit
 * beside UniversityCTA in a 2-column grid on lg+ (see app/(public)/page.tsx).
 * Step number: 48px circle blue with 4px gold border.
 *
 * Motion: scroll-reveal with staggered children — header, then each step row
 * slides in from the left.
 *
 * Copy from UI-SPEC Copywriting Contract lines 227-231.
 */

import { useRef } from 'react'
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useInView,
  type Transition,
  type Variants,
} from 'motion/react'
import { Eyebrow } from './Eyebrow'

const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1]

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

const stepItem: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

const STEPS = [
  {
    number: 1,
    heading: 'Find',
    body: "Filter BIPs by country, field of study, language and dates. Save your favourites and compare options that match your degree.",
  },
  {
    number: 2,
    heading: 'Apply',
    body: "Apply through your home university's Erasmus+ office using the contact info on the BIP page. We make the matchmaking easy.",
  },
  {
    number: 3,
    heading: 'Go',
    body: "Complete the virtual component online, then travel for the physical mobility — fully funded by Erasmus+ at €79/day plus travel.",
  },
]

export function HowItWorks() {
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef, { once: true, amount: 0.2 })

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div
          ref={cardRef}
          className="flex h-full flex-col rounded-lg bg-bg-soft p-10 lg:p-12"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Card header */}
          <m.div variants={fadeUpItem}>
            <Eyebrow className="mb-3">For students</Eyebrow>
          </m.div>
          <m.h2
            className="font-bold text-ink"
            style={{
              fontSize: 'clamp(26px, 2.8vw, 36px)',
              lineHeight: '1.15',
              letterSpacing: '-1px',
            }}
            variants={fadeUpItem}
          >
            How it works
          </m.h2>
          <m.p
            className="mt-3 text-[16px] leading-[1.6] text-muted"
            variants={fadeUpItem}
          >
            Three steps from finding a BIP to landing in your destination country — fully funded.
          </m.p>

          {/* Steps — stacked vertically inside the card */}
          <div className="mt-8 flex flex-col gap-6">
            {STEPS.map((step) => (
              <m.div key={step.number} variants={stepItem}>
                <Step step={step} />
              </m.div>
            ))}
          </div>
        </m.div>
      </MotionConfig>
    </LazyMotion>
  )
}

interface StepData {
  number: number
  heading: string
  body: string
}

function Step({ step }: { step: StepData }) {
  return (
    <div
      className={[
        'group relative -mx-3 flex cursor-default items-start gap-4 rounded-md p-3',
        'transition-[background-color,box-shadow,transform] duration-200 ease-out',
        'hover:bg-white hover:shadow-[0_6px_20px_rgba(10,23,53,0.06)]',
      ].join(' ')}
    >
      {/* Left accent strip — fades in on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-3 bottom-3 w-1 origin-top scale-y-0 rounded-full bg-eu-gold opacity-0 transition-all duration-200 ease-out group-hover:scale-y-100 group-hover:opacity-100"
      />

      {/* Numbered circle — 40px, blue bg, 3px gold border ring (sized down so
          the ring doesn't crowd the left accent strip on hover). */}
      <div
        className="ml-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-eu-blue text-white font-bold text-[16px] transition-transform duration-200 ease-out group-hover:scale-110"
        style={{
          outline: '3px solid #FFCC00',
          outlineOffset: '2px',
        }}
        aria-label={`Step ${step.number}`}
      >
        {step.number}
      </div>

      <div className="pt-1">
        <h4
          className="mb-1.5 text-[18px] font-semibold text-ink transition-colors duration-200 group-hover:text-eu-blue"
          style={{ letterSpacing: '-0.3px' }}
        >
          {step.heading}
        </h4>
        <p className="text-[15px] leading-[1.6] text-muted">{step.body}</p>
      </div>
    </div>
  )
}
