import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number           // 0–100
  label?: string
  showPercent?: boolean
  variant?: 'gold' | 'cyan' | 'win'
  size?: 'sm' | 'md'
  animated?: boolean
  className?: string
}

const FILL_CLASSES = {
  gold: 'bg-gradient-to-r from-gold to-gold-dim',
  cyan: 'bg-cyan',
  win:  'bg-win',
}

export default function ProgressBar({
  value,
  label,
  showPercent = false,
  variant = 'gold',
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showPercent && <span className="text-xs text-gray-500">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={cn('progress-track', size === 'sm' && 'h-1')}>
        {animated ? (
          <motion.div
            className={cn('h-full rounded-full', FILL_CLASSES[variant])}
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <div
            className={cn('h-full rounded-full', FILL_CLASSES[variant])}
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>
    </div>
  )
}
