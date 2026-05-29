import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { startGameSession, completeGameSession, GameResult } from '../../api/game.api';
import { useNotifStore } from '../../stores/notifStore';
import Spinner from '../ui/Spinner';

export default function MemoryGame({ celebrityId, onClose }: { celebrityId?: string; onClose: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const addNotification = useNotifStore((state) => state.addNotification);

  const start = useMutation({
    mutationFn: () => startGameSession({ gameType: 'memory', celebrityId }),
    onSuccess: (session: any) => setSessionId(session.sessionId),
  });
  const complete = useMutation({
    mutationFn: () => completeGameSession(sessionId!, { completionTimeMs: 30000 }),
    onSuccess: (data: GameResult) => {
      setResult(data);
      addNotification({
        id: Date.now().toString(),
        type: 'game_result',
        title: data.won ? 'You won!' : 'Game over',
        body: data.won ? `You won ${data.coinsEarned} coins!` : `You got ${data.consolationCoins} consolation coins.`,
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
    },
  });

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-sw-card p-6 rounded-2xl text-center">
          <p className="text-gold text-2xl">
            {result.won ? `Won ${result.coinsEarned} coins` : `Consolation ${result.consolationCoins} coins`}
          </p>
          {result.prize && <p className="text-white">Prize: {result.prize.label}</p>}
          <button onClick={onClose} className="btn-gold mt-4">Close</button>
        </div>
      </div>
    );
  }

  if (start.isPending || complete.isPending) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-sw-card p-6 rounded-2xl">
          <button onClick={() => start.mutate()} className="btn-gold">Start Memory Game</button>
          <button onClick={onClose} className="btn-outline mt-2">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <button onClick={() => complete.mutate()} className="btn-gold">Finish Game</button>
      <button onClick={onClose} className="btn-outline mt-2">Cancel</button>
    </div>
  );
}