/**
 * HowItWorks — DISC-06, UI-SPEC line 334.
 *
 * 3-column grid desktop, 1 column mobile.
 * Step number: 48px circle blue with 4px gold border.
 * Dashed connector between steps on desktop (pseudo-element via inline CSS).
 *
 * Copy from UI-SPEC Copywriting Contract lines 227-231.
 */

import { Eyebrow } from './Eyebrow'

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
  return (
    <section className="bg-bg-soft py-24 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <Eyebrow className="mb-3 justify-center">For students</Eyebrow>
          <h2
            className="font-bold text-ink"
            style={{
              fontSize: 'clamp(30px, 4vw, 44px)',
              lineHeight: '1.15',
              letterSpacing: '-1px',
            }}
          >
            How it works
          </h2>
          <p className="mt-3 text-[17px] text-muted">
            Three steps from finding a BIP to landing in your destination country — fully funded.
          </p>
        </div>

        {/* Steps — 3 col desktop, 1 col mobile */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, idx) => (
            <Step
              key={step.number}
              step={step}
              isLast={idx === STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface StepData {
  number: number
  heading: string
  body: string
}

function Step({ step, isLast }: { step: StepData; isLast: boolean }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Dashed connector line between steps on desktop — hidden on last step and mobile */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-[calc(50%+40px)] right-[-calc(50%-40px)] top-6 hidden h-px md:block"
          style={{
            borderTop: '2px dashed #d1d6e3',
            // Extend to the next step circle
            width: 'calc(100% + 24px)',
            left: 'calc(50% + 44px)',
          }}
        />
      )}

      {/* Numbered circle — 48px, blue bg, 4px gold border ring */}
      <div
        className="mb-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-eu-blue text-white font-bold text-[20px]"
        style={{
          outline: '4px solid #FFCC00',
          outlineOffset: '2px',
        }}
        aria-label={`Step ${step.number}`}
      >
        {step.number}
      </div>

      {/* Step heading */}
      <h4
        className="mb-3 text-[20px] font-semibold text-ink"
        style={{ letterSpacing: '-0.3px' }}
      >
        {step.heading}
      </h4>

      {/* Step body */}
      <p className="text-[16px] leading-[1.6] text-muted">{step.body}</p>
    </div>
  )
}
