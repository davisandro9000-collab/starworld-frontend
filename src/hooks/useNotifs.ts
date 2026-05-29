// src/hooks/useNotifs.ts

import { useEffect } from 'react'
import { useSocketStore } from '../stores/socketStore'
import { useNotifStore } from '../stores/notifStore'

/**
 * useNotifs
 * Subscribes to the 'notification' Socket.IO event and routes each
 * incoming notification into the notifStore.
 *
 * - priority 'high'   → stored + signals PopupQueue to open a Modal overlay
 * - priority 'normal' → stored + added to toast queue in PopupQueue
 * - priority 'low'    → stored silently; only increments unread badge
 *
 * Mount once — called inside PopupQueue which lives outside <Outlet> in App.tsx.
 */
export function useNotifs() {
  const { socket } = useSocketStore()
  const { addNotification } = useNotifStore()

  useEffect(() => {
    if (!socket) return

    const handleNotification = (payload: {
      id: string
      type: string
      title: string
      body: string
      priority?: 'high' | 'normal' | 'low'
      ctaLabel?: string
      ctaUrl?: string
      accentColor?: string
    }) => {
      addNotification({
        id: payload.id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        priority: payload.priority ?? 'normal',
        ctaLabel: payload.ctaLabel,
        ctaUrl: payload.ctaUrl,
        accentColor: payload.accentColor,
        read: false,
        createdAt: new Date().toISOString(),
      })
    }

    socket.on('notification', handleNotification)
    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket, addNotification])
}
