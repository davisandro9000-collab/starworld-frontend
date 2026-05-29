import { lazy, Suspense } from 'react';
import Spinner from '../ui/Spinner';

const SpinWheel = lazy(() => import('./SpinWheel'));
const TriviaGame = lazy(() => import('./TriviaGame'));
const MemoryGame = lazy(() => import('./MemoryGame'));
const NumberGuessGame = lazy(() => import('./NumberGuessGame'));
const WordScrambleGame = lazy(() => import('./WordScrambleGame'));
const HangmanGame = lazy(() => import('./HangmanGame'));

const components = {
  spin: SpinWheel,
  trivia: TriviaGame,
  memory: MemoryGame,
  number_guess: NumberGuessGame,
  word_scramble: WordScrambleGame,
  hangman: HangmanGame,
};

export default function GameModal({ gameType, celebrityId, onClose }: { gameType: keyof typeof components; celebrityId?: string; onClose: () => void }) {
  const GameComponent = components[gameType];
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black/80 flex items-center justify-center"><Spinner size="lg" /></div>}>
      <GameComponent celebrityId={celebrityId} onClose={onClose} />
    </Suspense>
  );
}