import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/axios';
import { useSocketStore } from '../stores/socketStore';

export type GamePhase = 'waiting' | 'countdown' | 'tap' | 'tapped' | 'result';

export interface GameStartPayload {
  sessionId: string;
  role: 'player1' | 'player2';
  opponent: {
    id: string;
    username: string;
    tier: string;
  };
  prizeDetails: {
    id: string;
    name: string;
    coins: number;
  };
  serverTimestamp: number;
}

export interface GameResultPayload {
  winnerId: string;
  tiebreakUsed: boolean;
  player1TapMs: number;
  player2TapMs: number;
}

export function useTicketGame(sessionId: string) {
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [gameStart, setGameStart] = useState<GameStartPayload | null>(null);
  const [result, setResult] = useState<GameResultPayload | null>(null);
  const [hasTapped, setHasTapped] = useState(false);
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    const onGameStart = (payload: GameStartPayload) => {
      setGameStart(payload);
      setPhase('countdown');
    };

    const onGameSignal = () => {
      if (phase === 'countdown') setPhase('tap');
    };

    const onGameResult = (payload: GameResultPayload) => {
      setResult(payload);
      setPhase('result');
    };

    socket.on('ticket_game_start', onGameStart);
    socket.on('ticket_game_signal', onGameSignal);
    socket.on('ticket_game_result', onGameResult);

    return () => {
      socket.off('ticket_game_start', onGameStart);
      socket.off('ticket_game_signal', onGameSignal);
      socket.off('ticket_game_result', onGameResult);
    };
  }, [socket, phase]);

  const tap = useCallback(async () => {
    if (phase !== 'tap' || hasTapped) return;
    setHasTapped(true);
    setPhase('tapped');
    await api.post(`/tickets/game/${sessionId}/tap`, { clientTimestamp: Date.now() });
  }, [phase, hasTapped, sessionId]);

  return { phase, gameStart, result, hasTapped, tap };
}