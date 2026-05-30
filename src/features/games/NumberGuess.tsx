import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { startGameSession, completeGameSession, type GameSession, type GameResult } from '../../api/game.api';
import { useGameStore } from '../../stores/gameStore';
import { useCoinStore } from '../../stores/coinStore';
import { cn } from '../../lib/utils';
import Spinner from '../../components/ui/Spinner';

interface NumberGuessProps {
  celebritySlug: string;
  onComplete: () => void;
}

const MAX_RANGE = 100;
const MAX_GUESSES = 7;

function getHint(guess: number, target: number): 'too-low' | 'too-high' | 'correct' {
  if (guess === target) return 'correct';
  return guess < target ? 'too-low' : 'too-high';
}

export default function NumberGuess({ celebritySlug, onComplete }: NumberGuessProps) {
  const { setLastResult, incrementGamesPlayed } = useGameStore();
  const { balance, setBalance } = useCoinStore();

  const [starting, setStarting] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [target] = useState(() => Math.floor(Math.random() * MAX_RANGE) + 1);
  const [input, setInput] = useState('');
  const [guesses, setGuesses] = useState<{ value: number; hint: ReturnType<typeof getHint> }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const attemptsRef = { current: 0 };

  const startMutation = useMutation({
    mutationFn: () => startGameSession({ gameType: 'number_guess', celebrityId: celebritySlug }),
    onSuccess: (data: GameSession) => {
      setSessionId(data.sessionId);
      setStarting(false);
    },
  });

  useEffect(() => {
    startMutation.mutate();
  }, []);

  const completeMutation = useMutation({
    mutationFn: ({ isWon, attemptCount }: { isWon: boolean; attemptCount: number }) =>
      completeGameSession(sessionId!, { attempts: attemptCount, guess: target }),
    onSuccess: (data: GameResult) => {
      setLastResult(data);
      incrementGamesPlayed();
      const earned = data.coinsEarned + (data.consolationCoins ?? 0);
      setBalance(balance + earned);
      onComplete();
    },
  });

  function handleGuess() {
    const val = parseInt(input, 10);
    if (isNaN(val) || val < 1 || val > MAX_RANGE || gameOver) return;
    setInput('');

    const hint = getHint(val, target);
    const next = [...guesses, { value: val, hint }];
    setGuesses(next);
    attemptsRef.current = next.length;

    const isWon = hint === 'correct';
    const isLost = !isWon && next.length >= MAX_GUESSES;

    if (isWon || isLost) {
      setGameOver(true);
      setWon(isWon);
      completeMutation.mutate({ isWon, attemptCount: next.length });
    }
  }

  const remaining = MAX_GUESSES - guesses.length;
  const lo = guesses.filter((g) => g.hint === 'too-low').reduce((m, g) => Math.max(m, g.value), 0);
  const hi = guesses.filter((g) => g.hint === 'too-high').reduce((m, g) => Math.min(m, g.value), MAX_RANGE + 1);

  if (starting) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p className="text-sm text-gray-400">Loading game…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-sm mx-auto">
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-400">
          Guess a number between <span className="text-white">1 – {MAX_RANGE}</span>
        </p>
        <p className="text-xs text-gray-500">
          {remaining} guess{remaining !== 1 ? 'es' : ''} remaining
        </p>
      </div>

      <div className="card p-3 space-y-2">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest">Known range</p>
        <div className="relative h-2 bg-sw-bg rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-gold/60 rounded-full"
            animate={{
              left: `${(lo / MAX_RANGE) * 100}%`,
              right: `${((MAX_RANGE - hi + 1) / MAX_RANGE) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-600">
          <span>{lo > 0 ? `>${lo}` : '1'}</span>
          <span>{hi <= MAX_RANGE ? `<${hi}` : MAX_RANGE}</span>
        </div>
      </div>

      <div className="space-y-1 min-h-[80px]">
        <AnimatePresence>
          {guesses.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm card border',
                g.hint === 'correct' && 'border-win/30 bg-win/10'
              )}
            >
              <span className="font-bold text-white">{g.value}</span>
              <span
                className={cn(
                  'text-xs',
                  g.hint === 'correct' && 'text-win',
                  g.hint === 'too-low' && 'text-amber-400',
                  g.hint === 'too-high' && 'text-sky-400'
                )}
              >
                {g.hint === 'correct' && '✓ Correct!'}
                {g.hint === 'too-low' && '↑ Too low'}
                {g.hint === 'too-high' && '↓ Too high'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!gameOver && (
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={MAX_RANGE}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
            placeholder={`1 – ${MAX_RANGE}`}
            className="input-sw flex-1 text-center text-lg font-bold"
          />
          <button onClick={handleGuess} className="btn-gold px-5">
            Guess
          </button>
        </div>
      )}

      {gameOver && !won && !completeMutation.isPending && (
        <div className="card p-4 text-center space-y-1 border-loss/30">
          <p className="text-loss font-bold">Out of guesses!</p>
          <p className="text-sm text-gray-400">
            The number was <span className="text-white font-bold">{target}</span>
          </p>
        </div>
      )}

      {gameOver && completeMutation.isPending && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
    </div>
  );
}