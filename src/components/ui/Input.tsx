// src/components/ui/Input.tsx

import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

/**
 * Input
 * Themed form input wrapping the `.input-sw` design-system class.
 * Forwards ref so React Hook Form can register it directly.
 *
 * Usage:
 *   <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body text-white/70 text-sm font-medium"
          >
            {label}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={cn(
            'input-sw',
            error && 'border-loss focus:ring-loss/40',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {hint && !error && (
          <p id={`${inputId}-hint`} className="font-body text-white/35 text-xs">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="font-body text-loss text-xs"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
