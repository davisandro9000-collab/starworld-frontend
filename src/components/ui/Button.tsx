import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ButtonVariant = 'gold' | 'outline' | 'ghost' | 'cyan' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// ─── Variant styles (mirrors index.css but as inline Tailwind for SSR safety) ─

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  gold:    'btn-gold',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  cyan:    'btn-cyan',
  danger:  'btn-danger',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2.5',
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant  = 'ghost',
      size     = 'md',
      loading  = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base shape — sizing overrides the class defaults
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
          'disabled:opacity-50 disabled:pointer-events-none',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin flex-shrink-0" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}

        {children}

        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

// Default export so both import styles work:
//   import Button from '...'          → works
//   import { Button } from '...'      → works (named export above)
export default Button
