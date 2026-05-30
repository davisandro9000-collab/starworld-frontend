import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { startGameSession, completeGameSession, type GameSession, type GameResult } from '../../api/game.api';
import { useGameStore } from '../../stores/gameStore';
import { useCoinStore } from '../../stores/coinStore';
import { cn } from '../../lib/utils';
import Spinner from '../../components/ui/Spinner';

interface WordScrambleProps {
  celebritySlug: string;
  onComplete: () => void;
}

const FALLBACK_PAIRS: { word: string; hint: string }[] = [
  { word: 'CONCERT', hint: 'Live performance event' },
  { word: 'PLATINUM', hint: 'Highest tier membership' },
  { word: 'AUTOGRAPH', hint: 'Signed by the celebrity' },
  { word: 'FANBASE', hint: 'Loyal followers' },
  { word: 'BACKSTAGE', hint: 'Behind the scenes area' },
];

const ROUND_COUNT = 5;
const SECONDS_PER_ROUND = 20;

function scramble(word: string): string {
  const arr = word.split('');
  let result = arr.slice();
  let attempts = 0;
  do {
    result.sort(() => Math.random() - 0.5);
    attempts++;
  } while (result.join('') === word && attempts < 20);
  return result.join('');
}

export default function WordScramble({ celebritySlug, onComplete }: WordScrambleProps) {
  const { setLastResult, incrementGamesPlayed } = useGameStore();
  const { balance, setBalance } = useCoinStore();

  const [starting, setStarting] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rounds, setRounds] = useState<{ word: string; hint: string }[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_ROUND);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);

  const startMutation = useMutation({
    mutationFn: () => startGameSession({ gameType: 'word_scramble', celebrityId: celebritySlug }),
    onSuccess: (data: GameSession) => {
      setSessionId(data.sessionId);
      const wordList: { word: string; hint: string }[] =
        (data.config as any)?.words ?? FALLBACK_PAIRS.sort(() => Math.random() - 0.5).slice(0, ROUND_COUNT);
      setRounds(wordList);
      setScrambled(scramble(wordList[0].word));
      setStarting(false);
    },
  });

  useEffect(() => {
    startMutation.mutate();
  }, []);

  const completeMutation = useMutation({
    mutationFn: (finalScore: number) => completeGameSession(sessionId!, { answers: [finalScore] }),
    onSuccess: (data: GameResult) => {
      setLastResult(data);
      incrementGamesPlayed();
      const earned = data.coinsEarned + (data.consolationCoins ?? 0);
      setBalance(balance + earned);
      onComplete();
    },
  });

  const advanceRound = useCallback(
    (correct: boolean) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const newScore = correct ? scoreRef.current + 1 : scoreRef.current;
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback(correct ? 'correct' : 'wrong');
      setInput('');

      setTimeout(() => {
        setFeedback(null);
        const next = roundIdx + 1;
        if (next >= ROUND_COUNT) {
          setGameOver(true);
          completeMutation.mutate(newScore);
        } else {
          setRoundIdx(next);
          setScrambled(scramble(rounds[next].word));
          setTimeLeft(SECONDS_PER_ROUND);
        }
      }, 800);
    },
    [roundIdx, rounds]
  );

  useEffect(() => {
    if (starting || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          advanceRound(false);
          return SECONDS_PER_ROUND;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [starting, gameOver, roundIdx, advanceRound]);

  function handleSubmit() {
    if (!rounds[roundIdx]) return;
    advanceRound(input.trim().toUpperCase() === rounds[roundIdx].word);
  }

  if (starting) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p className="text-sm text-gray-400">Mixing letters…</p>
      </div>
    );
  }

  const current = rounds[roundIdx];

  return (
    <div className="space-y-5 max-w-sm mx-auto">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Round{' '}
          <span className="text-white font-bold">
            {roundIdx + 1}/{ROUND_COUNT}
          </span>
        </span>
        <span className="text-gray-400">
          Score <span className="text-gold font-bold">{score}</span>
        </span>
      </div>

      <div className="progress-track h-1">
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors',
            timeLeft > 10 ? 'bg-gold' : timeLeft > 5 ? 'bg-amber-400' : 'bg-loss'
          )}
          animate={{ width: `${(timeLeft / SECONDS_PER_ROUND) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-right text-xs text-gray-500 -mt-3">{timeLeft}s</p>

      <div className="card p-5 text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={scrambled}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="font-heading font-bold text-3xl tracking-[0.25em] text-gold"
          >
            {scrambled}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-gray-500">Hint: {current?.hint}</p>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'text-center text-sm font-bold py-2 rounded-lg',
              feedback === 'correct' ? 'text-win bg-win/10' : 'text-loss bg-loss/10'
            )}
          >
            {feedback === 'correct' ? `✓ Correct! +1 point` : `✗ The answer was "${current?.word}"`}
          </motion.div>
        )}
      </AnimatePresence>

      {!gameOver && !feedback && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Type your answer…"
            className="input-sw flex-1 uppercase tracking-widest text-center font-bold"
            maxLength={20}
          />
          <button onClick={handleSubmit} className="btn-gold px-5">
            Go
          </button>
        </div>
      )}

      {gameOver && !completeMutation.isPending && (
        <div className="card card-gold p-5 text-center space-y-1">
          <p className="font-heading font-bold text-xl text-white">
            {score}/{ROUND_COUNT} correct
          </p>
          <p className="text-sm text-gray-400">Calculating your result…</p>
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