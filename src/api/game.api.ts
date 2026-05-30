// src/api/game.api.ts
import { api } from './axios';

export type GameType = 'spin' | 'trivia' | 'memory' | 'number_guess' | 'word_scramble' | 'hangman';

export interface GameSession {
  sessionId: string;
  gameType: GameType;
  config: {
    winRate: number;
    multiplier: number;
    // Optional fields for specific games
    questions?: TriviaQuestion[];
    gridSize?: number;
    pairs?: string[];
    min?: number;
    max?: number;
    maxAttempts?: number;
    scrambled?: string;
    hint?: string;
    maxWrong?: number;
    segments?: SpinSegment[];
  };
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SpinSegment {
  label: string;
  color: string;
  weight: number;
}

export interface GameResult {
  won: boolean;
  coinsEarned: number;
  consolationCoins?: number;
  prize?: {
    id: string;
    label: string;
    type: 'cash' | 'merch' | 'ticket' | 'coupon' | 'coins';
    code?: string;
  };
}

export interface StartSessionPayload {
  gameType: GameType;
  celebrityId?: string;
}

export interface CompleteSessionPayload {
  answers?: number[];
  completionTimeMs?: number;
  guess?: number;
  attempts?: number;
  word?: string;
  wrongLetters?: string[];
}

export async function startGameSession(payload: StartSessionPayload): Promise<GameSession> {
  const { data } = await api.post('/games/session/start', payload);
  return data;
}

export async function completeGameSession(
  sessionId: string,
  payload: CompleteSessionPayload
): Promise<GameResult> {
  // Generate idempotency key using crypto.randomUUID()
  const idempotencyKey = crypto.randomUUID();
  const { data } = await api.post(`/games/session/${sessionId}/complete`, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}

export async function getLeaderboard() {
  const { data } = await api.get('/games/leaderboard');
  return data;
}