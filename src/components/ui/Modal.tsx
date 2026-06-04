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
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Centering container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={cn(
                'glass rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] w-full',
                maxWidth,
                className
              )}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header (if not hidden) */}
              {!hideTitle && title && (
                <div className="flex items-center justify-between px-5 py-4 border-b border-sw-border shrink-0">
                  <h2 className="font-heading font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-white/30 hover:text-white transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Close button when header hidden */}
              {hideTitle && (
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors z-10 text-lg leading-none"
                >
                  ✕
                </button>
              )}

              {/* Scrollable content */}
              <div className="p-5 overflow-y-auto flex-1">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}