// PATCH: src/components/ui/Modal.tsx
// Add `hideTitle?: boolean` to the props interface and conditionally render the title.
// Full replacement of the title section inside the modal header:

// Change the ModalProps interface to include:
//   hideTitle?: boolean

// Change the header rendering to:
//   {!hideTitle && title && (
//     <div className="flex items-center justify-between p-4 border-b border-sw-border">
//       <h2 className="font-heading font-bold text-white">{title}</h2>
//       <button onClick={onClose} ...>✕</button>
//     </div>
//   )}
//   {hideTitle && (
//     <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white z-10">✕</button>
//   )}

// This is a minimal patch — the rest of Modal.tsx stays the same.
// The close button must still render even when hideTitle=true (shown as absolute-positioned X).

// ─── FULL MINIMAL MODAL (replace entire file if Modal.tsx is simple) ──────────
// src/components/ui/Modal.tsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  hideTitle?: boolean
  children: React.ReactNode
  className?: string
  maxWidth?: string
}

export default function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  className,
  maxWidth = 'max-w-md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className={cn(
              'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'glass rounded-2xl border w-[90vw] shadow-2xl',
              maxWidth, className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            {!hideTitle && title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2440]">
                <h2 className="font-heading font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Close button when no header */}
            {hideTitle && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors z-10 text-lg leading-none"
              >
                ✕
              </button>
            )}

            {/* Content */}
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
