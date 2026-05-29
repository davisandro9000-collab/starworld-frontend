// src/stores/notifStore.ts
import { create } from 'zustand'

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string                          // always string — useNotifs guarantees this
  priority: 'high' | 'normal' | 'low'  // required — PopupQueue routes on this
  ctaLabel?: string
  ctaUrl?: string
  accentColor?: string                  // tier accent border colour for toasts
  read: boolean
  createdAt: string
}

interface NotifStore {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (notif: AppNotification) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clear: () => void
}

export const useNotifStore = create<NotifStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notif) =>
    set((s) => ({
      // newest first — NotificationsPage renders top-down
      notifications: [notif, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}))
