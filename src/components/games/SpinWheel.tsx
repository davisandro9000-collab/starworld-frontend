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
  const addNotification = useNotifStore((s) => s.addNotification);
  const { balance, setBalance } = useCoinStore();

  const start = useMutation({
    mutationFn: () => startGameSession({ gameType: 'spin', celebrityId }),
    onSuccess: (data) => {
      console.log('[Spin] start success, sessionId:', data.sessionId);
      setSessionId(data.sessionId);
    },
    onError: (err: any) => {
      console.error('[Spin] start error:', err);
      addNotification({
        id: crypto.randomUUID(),
        type: 'error',
        title: 'Error',
        body: err?.response?.data?.message || 'Failed to start spin.',
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
      onClose();
    },
  });

  const spin = useMutation({
    mutationFn: () => {
      console.log('[Spin] completing with sessionId:', sessionId);
      return completeGameSession(sessionId!, {});
    },
    onSuccess: (data: GameResult) => {
      setResult(data);
      const earned = data.coinsEarned || data.consolationCoins || 0;
      setBalance(balance + earned);
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
    onError: (err: any) => {
      console.error('[Spin] complete error:', err);
      addNotification({
        id: crypto.randomUUID(),
        type: 'error',
        title: 'Error',
        body: err?.response?.data?.message || 'Failed to complete spin.',
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
      onClose();
    },
  });

  if (result) {
    return (
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold text-gold">
          {result.won ? `🎉 You won ${result.coinsEarned} coins!` : `😢 You got ${result.consolationCoins} consolation coins.`}
        </p>
        {result.prize && <p className="text-white">🏆 Prize: {result.prize.label}</p>}
        <button onClick={onClose} className="btn-gold w-full">Close</button>
      </div>
    );
  }

  if (start.isPending) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /><p className="ml-2">Setting up wheel...</p></div>;
  }

  if (!sessionId) {
    return (
      <div className="text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-gold">🎡 Spin Wheel</h2>
        <p className="text-white/50 text-sm">Spin to win coins and amazing prizes!</p>
        <button onClick={() => start.mutate()} className="btn-gold w-full py-3 text-lg">
          Start Game
        </button>
        <button onClick={onClose} className="btn-outline w-full">Cancel</button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="relative w-48 h-48 mx-auto">
        <div className="w-full h-full rounded-full border-4 border-gold flex items-center justify-center bg-sw-card-2">
          <span className="text-6xl">🎡</span>
        </div>
      </div>
      <p className="text-white font-medium">Ready to spin?</p>
      <button
        onClick={() => spin.mutate()}
        disabled={spin.isPending}
        className="btn-gold w-full py-3 text-lg disabled:opacity-50"
      >
        {spin.isPending ? 'Spinning...' : 'SPIN!'}
      </button>
      <button onClick={onClose} className="btn-outline w-full">Cancel</button>
    </div>
  );
}