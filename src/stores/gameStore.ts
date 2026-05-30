import { create } from 'zustand';
import { GameResult } from '../api/game.api';

interface GameState {
  lastResult: GameResult | null;
  gamesPlayed: number;
  setLastResult: (result: GameResult) => void;
  incrementGamesPlayed: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  lastResult: null,
  gamesPlayed: 0,
  setLastResult: (result) => set({ lastResult: result }),
  incrementGamesPlayed: () => set((state) => ({ gamesPlayed: state.gamesPlayed + 1 })),
  reset: () => set({ lastResult: null, gamesPlayed: 0 }),
}));