// src/hooks/useTicketGame.ts

import { useEffect, useRef, useCallback } from 'react'
import { useSocketStore } from '../stores/socketStore'
import { sendTap } from '../api/ticket.api'

export type GamePhase =
  | 'waiting'      // joined room, waiting for opponent
  | 'countdown'    // ticket_game_start received, counting 3-2-1
  | 'tap'          // ticket_game_signal received — tap now!
  | 'tapped'       // user already tapped, waiting for result
  | 'result'       // ticket_game_result received

export interface GameStartPayload {
  sessionId: string
  role: 'player1' | 'player2'
  opponent: { id: string; username: string; tier: string }
  prizeDetails: { name: string; coins: number; description?: string }
  serverTimestamp: number
}

export interface GameResultPayload {
  winnerId: string
  tiebreakUsed: boolean
  player1TapMs: number
  player2TapMs: number
}

/**
 * useTicketGame
 * Manages the full PvP ticket game socket lifecycle.
 * Call once per TicketGamePage mount. Cleans up on unmount.
 *
 * Usage:
 *   const { handleTap, hasTapped } = useTicketGame(
 *     sessionId,
 *     onPhaseChange,
 *     onStart,
 *     onSignal,
 *     onResult
 *   )
 */
export function useTicketGame(
  sessionId: string,
  onPhaseChange: (phase: GamePhase) => void,
  onStart: (payload: GameStartPayload) => void,
  onSignal: (serverTimestamp: number) => void,
  onResult: (payload: GameResultPayload) => void
) {
  const { socket } = useSocketStore()
  const phaseRef = useRef<GamePhase>('waiting')
  const hasTappedRef = useRef(false)

  const setPhase = useCallback(
    (p: GamePhase) => {
      phaseRef.current = p
      onPhaseChange(p)
    },
    [onPhaseChange]
  )

  useEffect(() => {
    if (!socket) return

    const handleQueued = () => {
      setPhase('waiting')
    }

    const handleStart = (payload: GameStartPayload) => {
      hasTappedRef.current = false
      setPhase('countdown')
      onStart(payload)
    }

    const handleSignal = (payload: { serverTimestamp: number }) => {
      // Ignore signal if countdown hasn't started (safety guard)
      if (phaseRef.current !== 'countdown') return
      setPhase('tap')
      onSignal(payload.serverTimestamp)
    }

    const handleResult = (payload: GameResultPayload) => {
      setPhase('result')
      onResult(payload)
    }

    socket.on('ticket_game_queued', handleQueued)
    socket.on('ticket_game_start', handleStart)
    socket.on('ticket_game_signal', handleSignal)
    socket.on('ticket_game_result', handleResult)

    return () => {
      socket.off('ticket_game_queued', handleQueued)
      socket.off('ticket_game_start', handleStart)
      socket.off('ticket_game_signal', handleSignal)
      socket.off('ticket_game_result', handleResult)
    }
  }, [socket, sessionId, setPhase, onStart, onSignal, onResult])

  const handleTap = useCallback(async () => {
    // Anti-cheat: button must not be tappable until signal fires
    if (phaseRef.current !== 'tap') return
    // Block double-tap at ref level — faster than state
    if (hasTappedRef.current) return
    hasTappedRef.current = true

    const clientTimestamp = Date.now()
    setPhase('tapped')

    // Emit socket AND POST simultaneously — server uses whichever arrives first
    if (socket) {
      socket.emit('tg:tap', { sessionId })
    }

    try {
      await sendTap(sessionId, clientTimestamp)
    } catch {
      // Non-fatal: server resolves from socket event if POST fails
    }
  }, [socket, sessionId, setPhase])

  return {
    handleTap,
    hasTapped: hasTappedRef.current,
  }
}
