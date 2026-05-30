// src/pages/TicketGamePage.tsx
import { useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useTicketGame } from '../hooks/useTicketGame'
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

  // The hook manages all state internally via socket events
  const { phase, gameStart, result, hasTapped, tap } = useTicketGame(sessionId ?? '')

  // Guard: must have a session ID
  if (!sessionId) return <Navigate to="/dashboard" replace />

  return (
    <TicketGameUI
      phase={phase}
      gameStart={gameStart}
      result={result}
      currentUserId={user?.id ?? ''}
      onTap={tap}
      hasTapped={hasTapped}
    />
  )
}