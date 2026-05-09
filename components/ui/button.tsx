/**
 * BipHub Button component — pill-shaped primary/gold/ghost variants.
 *
 * Replaces the shadcn base-ui version (Plan 01-01) with the EU-branded
 * button per UI-SPEC lines 388-394.
 *
 * Variants:
 *   primary — EU blue background, white text, lifts on hover
 *   gold    — EU gold background, ink text
 *   ghost   — transparent, border, subtle hover
 *
 * Sizes: sm / md / lg
 *
 * Uses rounded-pill (--radius-pill: 999px) for pill shape per UI-SPEC.
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'gold' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-eu-blue text-white border border-eu-blue ' +
    'hover:bg-eu-blue-dark hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,51,153,0.25)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  gold:
    'bg-eu-gold text-ink border border-eu-gold ' +
    'hover:bg-eu-gold-dark hover:-translate-y-px ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  ghost:
    'bg-transparent text-ink border border-border ' +
    'hover:border-ink hover:bg-bg-soft ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold whitespace-nowrap rounded-pill',
          'transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
