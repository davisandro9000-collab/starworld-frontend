import { ImgHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string           // fallback initials source
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  tier?: 'bronze' | 'silver' | 'platinum'
  online?: boolean
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

const TIER_RING = {
  bronze:   'ring-2 ring-bronze/60',
  silver:   'ring-2 ring-silver/60',
  platinum: 'ring-2 ring-platinum/60',
}

export default function Avatar({ name, size = 'md', tier, online, src, alt, className, ...props }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className={cn('relative inline-flex shrink-0', SIZE_CLASSES[size], className)}>
      {src ? (
        <img
          src={src}
          alt={alt ?? name ?? 'avatar'}
          className={cn(
            'rounded-full object-cover w-full h-full',
            tier && TIER_RING[tier],
          )}
          {...props}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-sw-card border border-sw-border flex items-center justify-center font-heading font-bold text-white w-full h-full',
            tier && TIER_RING[tier],
          )}
        >
          {initials}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-win border-2 border-sw-bg" />
      )}
    </div>
  )
}
