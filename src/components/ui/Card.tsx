import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'gold' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          variant === 'hover'    && 'card-hover',
          variant === 'gold'     && 'card-gold',
          variant === 'elevated' && 'bg-sw-card-2 border-sw-border-2',
          padding === 'none' && 'p-0',
          padding === 'sm'   && 'p-3',
          padding === 'md'   && 'p-4',
          padding === 'lg'   && 'p-6',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
export default Card
