// src/hooks/useCoinBalance.ts

import { useEffect } from 'react'
import { useSocketStore } from '../stores/socketStore'
import { useCoinStore } from '../stores/coinStore'
import { useAuthStore } from '../stores/authStore'

/**
 * useCoinBalance
 * Subscribes to the 'coin_update' Socket.IO event and keeps
 * useCoinStore in sync with the server's authoritative balance.
 *
 * Also syncs the user object in authStore so CoinBalance.tsx
 * and any component reading user.coinBalance stay consistent.
 *
 * Mount once — called inside AppLayout so it is always active
 * for authenticated sessions.
 */
export function useCoinBalance() {
  const { socket } = useSocketStore()
  const { setBalance } = useCoinStore()
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    if (!socket) return

    const handleCoinUpdate = (payload: { newBalance: number }) => {
      // Update the flat coin store
      setBalance(payload.newBalance)

      // Keep authStore user object consistent
      if (user) {
        setUser({ ...user, coinBalance: payload.newBalance })
      }
    }

    socket.on('coin_update', handleCoinUpdate)
    return () => {
      socket.off('coin_update', handleCoinUpdate)
    }
  }, [socket, setBalance, user, setUser])
}
