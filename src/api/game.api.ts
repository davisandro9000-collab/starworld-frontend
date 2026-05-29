// src/api/game.api.ts
import { api } from './axios'

export type GameType = 'spin' | 'trivia' | 'memory' | 'number_guess' | 'word_scramble' | 'hangman'

export interface GameSession {
  sessionId: string
  gameType: GameType
  config: {
    winRate: number        // snapshot — display only, server enforces
    multiplier: number
    // trivia
    questions?: TriviaQuestion[]
    // memory
    gridSize?: number
    pairs?: string[]
    // number_guess
    min?: number
    max?: number
    maxAttempts?: number
    // word_scramble / hangman
    scrambled?: string
    hint?: string
    maxWrong?: number
    // spin
    segments?: SpinSegment[]
  }
}

export interface TriviaQuestion {
  id: string
  question: string
  options: string[]        // always 4
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface SpinSegment {
  label: string
  color: string
  weight: number           // relative probability (UI only — server decides actual outcome)
}

export interface GameResult {
  won: boolean
  coinsEarned: number
  consolationCoins?: number
  prize?: {
    id: string
    label: string
    type: 'cash' | 'merch' | 'ticket' | 'coupon' | 'coins'
    code?: string
  }
  // If prize.type === 'cash', server also emits 'ticket_game_offer' via Socket.IO
}

export interface StartSessionPayload {
  gameType: GameType
  celebrityId?: string
}

export interface CompleteSessionPayload {
  // Trivia
  answers?: number[]         // index of selected option per question
  // Memory
  completionTimeMs?: number
  // Number guess
  guess?: number
  attempts?: number
  // Word scramble / Hangman
  word?: string
  wrongLetters?: string[]
  // Spin — no payload needed, server picks outcome
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatarUrl?: string
  tier: 'bronze' | 'silver' | 'platinum'
  totalCoins: number
  gamesWon: number
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function startGameSession(payload: StartSessionPayload): Promise<GameSession> {
  const { data } = await api.post<GameSession>('/games/session/start', payload)
  return data
}

export async function completeGameSession(
  sessionId: string,
  payload: CompleteSessionPayload
): Promise<GameResult> {
  const { data } = await api.post<GameResult>(`/games/session/${sessionId}/complete`, payload)
  return data
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>('/games/leaderboard')
  return data
}
