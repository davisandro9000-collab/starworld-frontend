import { create } from 'zustand'
import type { Socket } from 'socket.io-client'

// ─── Coin store ─────────────────────────────────────────────────────────────
interface CoinState {
  balance: number
  setBalance: (n: number) => void
  addCoins: (n: number) => void
}

export const useCoinStore = create<CoinState>()((set) => ({
  balance: 0,
  setBalance: (n) => set({ balance: n }),
  addCoins:  (n) => set((s) => ({ balance: s.balance + n })),
}))

// ─── Notification store ──────────────────────────────────────────────────────
export interface AppNotification {
  id: string
  type: string
  title: string
  body?: string
  ctaLabel?: string
  ctaUrl?: string
  isRead: boolean
  createdAt: string
}

interface NotifState {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: AppNotification) => void
  markRead: (id: string | 'all') => void
}

export const useNotifStore = create<NotifState>()((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 100),
      unreadCount: s.unreadCount + (n.isRead ? 0 : 1),
    })),

  markRead: (id) =>
    set((s) => {
      if (id === 'all') {
        return {
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }
      }
      const updated = s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      }
    }),
}))

// ─── Socket store ────────────────────────────────────────────────────────────
interface SocketState {
  socket: Socket | null
  connected: boolean
  setSocket: (s: Socket | null) => void
  setConnected: (v: boolean) => void
}

export const useSocketStore = create<SocketState>()((set) => ({
  socket: null,
  connected: false,
  setSocket: (s) => set({ socket: s }),
  setConnected: (v) => set({ connected: v }),
}))
