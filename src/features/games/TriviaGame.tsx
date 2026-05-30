import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { startGameSession, completeGameSession, GameResult } from '../../api/game.api';
import { useCoinStore } from '../../stores/coinStore';
import { useNotifStore } from '../../stores/notifStore';
import Spinner from '../../components/ui/Spinner';

const QUESTIONS = [
  { question: 'What is 2+2?', options: ['3', '4', '5', '6'] },
  { question: 'Which planet is known as the Red Planet?', options: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
];

export default function TriviaGame({ celebrityId, onClose }: { celebrityId?: string; onClose: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<GameResult | null>(null);
  const addNotification = useNotifStore((state) => state.addNotification);
  const { balance, setBalance } = useCoinStore();

  const start = useMutation({
    mutationFn: () => startGameSession({ gameType: 'trivia', celebrityId }),
    onSuccess: (data: any) => {
      const id = data.session?.id || data.sessionId;
      setSessionId(id);
    },
    onError: (err) => {
      console.error('Start trivia error:', err);
      addNotification({
        id: crypto.randomUUID(),
        type: 'error',
        title: 'Error',
        body: 'Failed to start trivia. Please try again.',
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
      onClose();
    },
  });

  const complete = useMutation({
    mutationFn: () => completeGameSession(sessionId!, { answers }),
    onSuccess: (data: GameResult) => {
      setResult(data);
      const earned = data.coinsEarned || data.consolationCoins || 0;
      setBalance(balance + earned);
      addNotification({
        id: crypto.randomUUID(),
        type: 'game_result',
        title: data.won ? '🎉 Correct! You won!' : '😢 Better luck next time',
        body: data.won
          ? `You won ${data.coinsEarned} coins!${data.prize ? ` Prize: ${data.prize.label}` : ''}`
          : `You got ${data.consolationCoins} consolation coins.`,
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
    },
    onError: (err) => {
      console.error('Complete trivia error:', err);
      addNotification({
        id: crypto.randomUUID(),
        type: 'error',
        title: 'Error',
        body: 'Failed to submit answers. Please try again.',
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
      });
      onClose();
    },
  });

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (newAnswers.length === QUESTIONS.length) {
      complete.mutate();
    } else {
      setCurrent(current + 1);
    }
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

  if (start.isPending) {
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
          <h2 className="font-heading font-bold text-xl text-white mb-4">🧠 Trivia Challenge</h2>
          <button onClick={() => start.mutate()} className="btn-gold w-full">Start Game</button>
          <button onClick={onClose} className="btn-outline w-full mt-2">Cancel</button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[current];
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-sw-card rounded-2xl p-6 max-w-md w-full">
        <h2 className="font-heading font-bold text-xl text-white mb-2">Question {current+1}/{QUESTIONS.length}</h2>
        <p className="text-white mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(idx)} className="btn-outline w-full text-left px-4 py-2">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}