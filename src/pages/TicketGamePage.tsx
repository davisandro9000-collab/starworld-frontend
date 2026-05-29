import { useCallback, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useTicketGame, type GamePhase, type GameStartPayload, type GameResultPayload } from '../hooks/useTicketGame'
import TicketGameUI from '../features/games/TicketGameUI'

/**
 * TicketGamePage
 * Route: /ticket-game/:sessionId
 *
 * Lifecycle:
 *  1. Mount → show waiting state
 *  2. ticket_game_start   → countdown
 *  3. ticket_game_signal  → TAP button unlocks
 *  4. User taps           → POST + socket emit
 *  5. ticket_game_result  → winner / loser screen
 */
export default function TicketGamePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuthStore()

  const [phase, setPhase] = useState<GamePhase>('waiting')
  const [gameStart, setGameStart] = useState<GameStartPayload | null>(null)
  const [result, setResult] = useState<GameResultPayload | null>(null)

  const handlePhaseChange = useCallback((p: GamePhase) => setPhase(p), [])
  const handleStart = useCallback((payload: GameStartPayload) => setGameStart(payload), [])
  const handleSignal = useCallback((_ts: number) => {
    // Phase already set to 'tap' by the hook — nothing extra needed here
  }, [])
  const handleResult = useCallback((payload: GameResultPayload) => setResult(payload), [])

  const { handleTap, hasTapped } = useTicketGame(
    sessionId ?? '',
    handlePhaseChange,
    handleStart,
    handleSignal,
    handleResult
  )

  // Guard: must have a session ID
  if (!sessionId) return <Navigate to="/dashboard" replace />

  return (
    <TicketGameUI
      phase={phase}
      gameStart={gameStart}
      result={result}
      currentUserId={user?.id ?? ''}
      onTap={handleTap}
      hasTapped={hasTapped}
    />
  )
}
