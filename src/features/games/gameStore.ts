// src/features/games/gameStore.ts
import { create } from 'zustand'
import type { GameResult } from '../../api/game.api'

interface GameStore {
  // Last completed game result — used to show recap on dashboard
  lastResult: GameResult | null
  setLastResult: (r: GameResult | null) => void
  // Track games played this session (for UI counters)
  gamesPlayedToday: number
  incrementGamesPlayed: () => void
  resetSession: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  lastResult: null,
  setLastResult: (r) => set({ lastResult: r }),
  gamesPlayedToday: 0,
  incrementGamesPlayed: () => set(s => ({ gamesPlayedToday: s.gamesPlayedToday + 1 })),
  resetSession: () => set({ lastResult: null, gamesPlayedToday: 0 }),
}))
