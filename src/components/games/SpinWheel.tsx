import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { startGameSession, completeGameSession } from '../../api/game.api';
import { useNotifStore } from '../../stores/notifStore';
import Spinner from '../ui/Spinner';
import { GameResult } from '../../api/game.api';

export default function SpinWheel({ celebrityId, onClose }: { celebrityId?: string; onClose: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const addNotification = useNotifStore((state) => state.addNotification);

  const start = useMutation({
    mutationFn: () => startGameSession({ gameType: 'spin', celebrityId }),
    onSuccess: (session: any) => setSessionId(session.sessionId),
  });

  const complete = useMutation({
    mutationFn: () => completeGameSession(sessionId!, {}),
    onSuccess: (data: GameResult) => {
      setResult(data);
      addNotification({
        id: Date.now().toString(),
        type: 'game_result',
        title: data.won ? 'You won!' : 'Better luck next time',
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
        <div className="bg-sw-card rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-2xl font-bold text-gold mb-2">
            {result.won ? `You won ${result.coinsEarned} coins!` : `You got ${result.consolationCoins} consolation coins.`}
          </p>
          {result.prize && <p className="text-white">Prize: {result.prize.label}</p>}
          <button onClick={onClose} className="btn-gold w-full mt-4">Close</button>
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
        <div className="bg-sw-card rounded-2xl p-6 max-w-md w-full">
          <h2 className="font-heading font-bold text-xl text-white mb-4">Spin Wheel</h2>
          <button onClick={() => start.mutate()} className="btn-gold w-full py-3">Spin Now</button>
          <button onClick={onClose} className="btn-outline w-full mt-2">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-sw-card rounded-2xl p-6 max-w-md w-full text-center">
        <p className="text-white mb-4">Spin the wheel...</p>
        <button onClick={() => complete.mutate()} className="btn-gold w-full">Finish Spin</button>
        <button onClick={onClose} className="btn-outline w-full mt-2">Cancel</button>
      </div>
    </div>
  );
}