import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  accent?: 'gold' | 'cyan' | 'win' | 'loss' | 'none'
  className?: string
}

const ACCENT_CLASSES = {
  gold: 'text-gold',
  cyan: 'text-cyan',
  win:  'text-win',
  loss: 'text-loss',
  none: 'text-white',
}

export default function StatCard({ label, value, sub, icon, accent = 'none', className }: StatCardProps) {
  return (
    <div className={cn('stat-card card p-4 space-y-1', className)}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <p className="text-[11px] text-gray-500 uppercase tracking-widest">{label}</p>
      <p className={cn('font-heading font-bold text-2xl', ACCENT_CLASSES[accent])}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}
