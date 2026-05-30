import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { startGameSession, completeGameSession, type GameSession, type GameResult } from '../../api/game.api';
import { useGameStore } from '../../stores/gameStore';
import { useCoinStore } from '../../stores/coinStore';
import { cn } from '../../lib/utils';
import Spinner from '../../components/ui/Spinner';

interface HangmanGameProps {
  celebritySlug: string;
  onComplete: () => void;
}

const FALLBACK_WORDS = [
  'ALBUM', 'CONCERT', 'STADIUM', 'PLATINUM', 'BILLBOARD',
  'GRAMMY', 'TOURING', 'FANCLUB', 'HEADLINE', 'FESTIVAL',
];

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const HANGMAN_STAGES = [
  `  +---+
  |   |
      |
      |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
];

export default function HangmanGame({ celebritySlug, onComplete }: HangmanGameProps) {
  const { setLastResult, incrementGamesPlayed } = useGameStore();
  const { balance, setBalance } = useCoinStore();

  const [starting, setStarting] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [word, setWord] = useState<string[]>([]);
  const [hint, setHint] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);

  const startMutation = useMutation({
    mutationFn: () => startGameSession({ gameType: 'hangman', celebrityId: celebritySlug }),
    onSuccess: (data: any) => {
      const id = data.session?.id || data.sessionId;
      setSessionId(id);
      const w: string = data.config?.scrambled ?? FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
      setWord(w.toUpperCase().split(''));
      setHint(data.config?.hint ?? 'Celebrity related term');
      setStarting(false);
    },
    onError: (err) => {
      console.error('Start hangman error:', err);
      onComplete();
    },
  });

  useEffect(() => {
    startMutation.mutate();
  }, []);

  const completeMutation = useMutation({
    mutationFn: ({ wrongLetters }: { wrongLetters: string[] }) =>
      completeGameSession(sessionId!, { word: word.join(''), wrongLetters }),
    onSuccess: (data: GameResult) => {
      setLastResult(data);
      incrementGamesPlayed();
      const earned = data.coinsEarned + (data.consolationCoins ?? 0);
      setBalance(balance + earned);
      onComplete();
    },
    onError: (err) => {
      console.error('Complete hangman error:', err);
      onComplete();
    },
  });

  const wrongGuesses = [...guessed].filter(l => !word.includes(l));
  const wrongCount = wrongGuesses.length;
  const isWon = word.length > 0 && word.every(l => guessed.has(l));
  const isLost = wrongCount >= MAX_WRONG;

  const handleGuess = useCallback(
    (letter: string) => {
      if (gameOver || guessed.has(letter)) return;
      const next = new Set(guessed).add(letter);
      setGuessed(next);

      const nextWrong = [...next].filter(l => !word.includes(l));
      const nextWon = word.every(l => next.has(l));
      const nextLost = nextWrong.length >= MAX_WRONG;

      if (nextWon || nextLost) {
        setGameOver(true);
        completeMutation.mutate({ wrongLetters: nextWrong });
      }
    },
    [gameOver, guessed, word, completeMutation],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const l = e.key.toUpperCase();
      if (ALPHABET.includes(l)) handleGuess(l);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleGuess]);

  if (starting) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p className="text-sm text-gray-400">Picking a word…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-sm mx-auto">
      <div className="card p-3 flex justify-center">
        <pre className={cn('text-xs font-mono leading-tight', isLost ? 'text-loss' : 'text-gray-400')}>
          {HANGMAN_STAGES[Math.min(wrongCount, MAX_WRONG)]}
        </pre>
      </div>

      <p className="text-center text-xs text-gray-500">
        Hint: <span className="text-gray-300">{hint}</span>
      </p>

      <div className="flex justify-center gap-2 flex-wrap">
        {word.map((letter, i) => (
          <div key={i} className="w-9 h-9 border-b-2 border-sw-border flex items-center justify-center">
            <AnimatePresence>
              {guessed.has(letter) && (
                <motion.span
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('font-heading font-bold text-lg', isWon ? 'text-win' : 'text-white')}
                >
                  {letter}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {wrongGuesses.length > 0 && (
        <p className="text-center text-xs text-loss">Wrong: {wrongGuesses.join('  ')}</p>
      )}

      {!gameOver && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {ALPHABET.map(l => {
            const isGuessed = guessed.has(l);
            const isWrong = isGuessed && !word.includes(l);
            return (
              <button
                key={l}
                onClick={() => handleGuess(l)}
                disabled={isGuessed}
                className={cn(
                  'w-9 h-9 rounded-lg text-sm font-bold transition-all',
                  !isGuessed && 'border border-sw-border bg-sw-card hover:border-gold hover:text-gold text-white',
                  isWrong && 'bg-loss/10 border border-loss/30 text-loss/50 cursor-not-allowed',
                  isGuessed && !isWrong && 'bg-win/10 border border-win/30 text-win cursor-not-allowed',
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}

      {isLost && !completeMutation.isPending && (
        <div className="card p-4 text-center border-loss/30 space-y-1">
          <p className="text-loss font-bold">Hanged! 💀</p>
          <p className="text-sm text-gray-400">
            The word was <span className="text-white font-bold">{word.join('')}</span>
          </p>
        </div>
      )}

      {gameOver && completeMutation.isPending && (
        <div className="flex justify-center py-4"><Spinner /></div>
      )}
    </div>
  );
}