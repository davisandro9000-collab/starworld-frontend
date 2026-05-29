// src/features/notifications/PopupQueue.tsx
import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNotifStore } from '../../stores/notifStore'
import { useNotifs } from '../../hooks/useNotifs'
import { useCoinBalance } from '../../hooks/useCoinBalance'
import Toast, { type ToastData } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'

const MAX_TOASTS = 3

interface HighPriorityNotif {
  id: string
  title: string
  body: string          // always string — notifStore guarantees body: string
  ctaLabel?: string
  ctaUrl?: string
  accentColor?: string
}

/**
 * PopupQueue
 * Mounts ONCE in App.tsx outside <Outlet>.
 * Drives the full notification popup system:
 *
 *   priority 'high'   → Modal overlay (blocks UI — prize wins, ticket game invites)
 *   priority 'normal' → Toast from top-right, max 3 simultaneous, FIFO, 8s auto-dismiss
 *   priority 'low'    → Silent — only the bell badge increments (handled in notifStore)
 *
 * Hooks called here:
 *   useNotifs()      — starts 'notification' socket listener, populates notifStore
 *   useCoinBalance() — starts 'coin_update' socket listener, syncs coinStore
 */
export default function PopupQueue() {
  // Start both socket listeners once, at app root level
  useNotifs()
  useCoinBalance()

  const { notifications } = useNotifStore()

  const [toastQueue, setToastQueue]               = useState<ToastData[]>([])
  const [highPriorityQueue, setHighPriorityQueue] = useState<HighPriorityNotif[]>([])
  const [modalOpen, setModalOpen]                 = useState(false)
  const [activeModal, setActiveModal]             = useState<HighPriorityNotif | null>(null)

  // IDs already routed to a toast or modal — prevents double-display on re-render
  const [seen, setSeen] = useState<Set<string>>(new Set())

  // ── Route new notifications ────────────────────────────────────────────────
  useEffect(() => {
    notifications.forEach((notif) => {
      if (seen.has(notif.id)) return
      // Mark seen immediately — state update batched with the routing update below
      setSeen((prev) => new Set(prev).add(notif.id))

      if (notif.priority === 'high') {
        setHighPriorityQueue((prev): HighPriorityNotif[] => [
          ...prev,
          {
            id:          notif.id,
            title:       notif.title,
            body:        notif.body ?? '',   // body is string in AppNotification, ?? '' is defensive
            ctaLabel:    notif.ctaLabel,
            ctaUrl:      notif.ctaUrl,
            accentColor: notif.accentColor,
          },
        ])
      } else if (notif.priority === 'normal') {
        setToastQueue((prev): ToastData[] => {
          const next: ToastData[] = [
            ...prev,
            {
              id:          notif.id,
              title:       notif.title,
              body:        notif.body ?? '',
              ctaLabel:    notif.ctaLabel,
              ctaUrl:      notif.ctaUrl,
              accentColor: notif.accentColor,
            },
          ]
          // FIFO cap: drop the oldest when over the limit
          return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next
        })
      }
      // priority 'low' → no UI action; unreadCount incremented in notifStore.addNotification
    })
  }, [notifications, seen])

  // ── Drain high-priority queue one modal at a time ─────────────────────────
  useEffect(() => {
    if (!modalOpen && highPriorityQueue.length > 0) {
      const [next, ...rest] = highPriorityQueue
      setActiveModal(next)
      setModalOpen(true)
      setHighPriorityQueue(rest)
    }
  }, [modalOpen, highPriorityQueue])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setToastQueue((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    // Small delay so exit animation completes before clearing activeModal
    setTimeout(() => setActiveModal(null), 200)
  }, [])

  return (
    <>
      {/* ── Normal priority: toast stack ──────────────────────────────── */}
      {/*
        Positioned below navbar (top-[56px] matches the 56px navbar height
        defined in the design system). z-50 keeps toasts above page content
        but below any Modal overlay (z-[60]).
      */}
      <div
        className="fixed top-[56px] right-4 z-50 flex flex-col gap-3 items-end pt-3 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="sync">
          {toastQueue.map((toast) => (
            // pointer-events-auto re-enables interaction on each toast card
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── High priority: modal overlay ──────────────────────────────── */}
      {activeModal && (
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={activeModal.title}
        >
          <div className="flex flex-col gap-4">
            {/* Accent stripe at top if accentColor provided */}
            {activeModal.accentColor && (
              <div
                className="h-1 rounded-full -mt-2 mb-1"
                style={{ backgroundColor: activeModal.accentColor }}
              />
            )}

            <p className="font-body text-white/60 text-sm leading-relaxed">
              {activeModal.body}
            </p>

            {activeModal.ctaLabel && activeModal.ctaUrl && (
              <a
                href={activeModal.ctaUrl}
                onClick={closeModal}
                className="btn-gold text-center"
              >
                {activeModal.ctaLabel}
              </a>
            )}

            <button onClick={closeModal} className="btn-ghost text-sm">
              Dismiss
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
