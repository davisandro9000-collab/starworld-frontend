// src/components/ui/Toast.tsx

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface ToastData {
  id: string
  title: string
  body?: string
  ctaLabel?: string
  ctaUrl?: string
  accentColor?: string   // hex — defaults to gold
  autoDismissMs?: number // defaults to 8000
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

/**
 * Toast
 * Individual sliding notification card.
 * Auto-dismisses after `autoDismissMs` (default 8 s).
 * Used by PopupQueue for priority === 'normal' notifications.
 */
export default function Toast({ toast, onDismiss }: ToastProps) {
  const accent = toast.accentColor ?? '#FFD700'
  const duration = toast.autoDismissMs ?? 8000

  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast.id), duration)
    return () => clearTimeout(id)
  }, [toast.id, duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="relative w-80 card overflow-hidden"
      style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
    >
      {/* Auto-dismiss progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        style={{ backgroundColor: accent }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />

      <div className="p-4 pr-8">
        <p className="font-heading font-bold text-white text-sm leading-snug">
          {toast.title}
        </p>
        {toast.body && (
          <p className="font-body text-white/50 text-xs mt-1 leading-relaxed">
            {toast.body}
          </p>
        )}
        {toast.ctaLabel && toast.ctaUrl && (
          <a
            href={toast.ctaUrl}
            className="inline-block mt-3 text-xs font-heading font-semibold btn-outline px-3 py-1"
          >
            {toast.ctaLabel}
          </a>
        )}
      </div>

      {/* Dismiss X */}
      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'absolute top-3 right-3 text-white/30 hover:text-white/70',
          'transition-colors text-lg leading-none font-body'
        )}
        aria-label="Dismiss"
      >
        ×
      </button>
    </motion.div>
  )
}
