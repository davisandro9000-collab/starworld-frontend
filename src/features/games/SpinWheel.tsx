import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { startGameSession, completeGameSession, GameResult } from '../../api/game.api';
import { useCoinStore } from '../../stores/coinStore';
import { useNotifStore } from '../../stores/notifStore';
import Spinner from '../../components/ui/Spinner';

interface SpinWheelProps {
  celebrityId?: string;
  onClose: () => void;
}

export default function SpinWheel({ celebrityId, onClose }: SpinWheelProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const { balance, setBalance } = useCoinStore();
  const addNotification = useNotifStore((s) => s.addNotification);

  const startMutation = useMutation({
    mutationFn: () => startGameSession({ gameType: 'spin', celebrityId }),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
    },
    onError: (err) => {
      console.error('Start spin error:', err);
      addNotification({
        id: crypto.randomUUID(),
        type: 'error',
        title: 'Error',
        body: 'Failed to start spin. Please try again.',
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
      onClose();
    },
  });

  const spinMutation = useMutation({
    mutationFn: () => completeGameSession(sessionId!, {}),
    onSuccess: (data) => {
      setResult(data);
      const earnedCoins = data.coinsEarned || data.consolationCoins || 0;
      setBalance(balance + earnedCoins);
      addNotification({
        id: crypto.randomUUID(),
        type: 'game_result',
        title: data.won ? '🎉 You won!' : 'Better luck next time',
        body: data.won
          ? `You won ${data.coinsEarned} coins!${data.prize ? ` Plus a ${data.prize.label}!` : ''}`
          : `You got ${data.consolationCoins} consolation coins.`,
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
    },
    onError: (err) => {
      console.error('Spin complete error:', err);
      addNotification({
        id: crypto.randomUUID(),
        type: 'error',
        title: 'Error',
        body: 'Failed to complete spin. Please try again.',
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
      onClose();
    },
  });

  const handleStart = () => {
    startMutation.mutate();
  };

  const handleSpin = () => {
    spinMutation.mutate();
  };

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-sw-card rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-2xl font-bold text-gold mb-2">
            {result.won ? `🎉 You won ${result.coinsEarned} coins!` : `😢 You got ${result.consolationCoins} consolation coins.`}
          </p>
          {result.prize && <p className="text-white">🏆 Prize: {result.prize.label}</p>}
          <button onClick={onClose} className="btn-gold w-full mt-4">Close</button>
        </div>
      </div>
    );
  }

  if (startMutation.isPending) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-white mt-4">Setting up the wheel...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-sw-card rounded-2xl p-6 max-w-md w-full text-center">
          <h2 className="font-heading font-bold text-2xl text-gold mb-2">🎡 Spin Wheel</h2>
          <p className="text-white/50 text-sm mb-6">Spin to win coins and amazing prizes!</p>
          <button onClick={handleStart} className="btn-gold w-full py-3 text-lg">Start Game</button>
          <button onClick={onClose} className="btn-outline w-full mt-3">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-sw-card rounded-2xl p-6 max-w-md w-full text-center">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="w-full h-full rounded-full border-4 border-gold flex items-center justify-center bg-sw-card-2">
            <span className="text-6xl">🎡</span>
          </div>
        </div>
        <p className="text-white mb-4 font-medium">Ready to spin?</p>
        <button
          onClick={handleSpin}
          disabled={spinMutation.isPending}
          className="btn-gold w-full py-3 text-lg disabled:opacity-50"
        >
          {spinMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Spinning...
            </span>
          ) : (
            'SPIN!'
          )}
        </button>
        <button onClick={onClose} className="btn-outline w-full mt-3">Cancel</button>
      </div>
    </div>
  );
}