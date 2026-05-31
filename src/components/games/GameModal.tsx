import { Suspense } from 'react';
import Spinner from '../ui/Spinner';
import SpinWheel from '../../features/games/SpinWheel';
import TriviaGame from '../../features/games/TriviaGame';
import MemoryGame from '../../features/games/MemoryGame';
import NumberGuess from '../../features/games/NumberGuess';
import WordScramble from '../../features/games/WordScramble';
import HangmanGame from '../../features/games/HangmanGame';

// Map UI game type strings to the actual component keys
const gameTypeMap: Record<string, string> = {
  spin: 'spin',
  trivia: 'trivia',
  memory: 'memory',
  number: 'number_guess',   // UI uses 'number'
  word: 'word_scramble',    // UI uses 'word'
  hangman: 'hangman',
};

const components: Record<string, React.ComponentType<any>> = {
  spin: SpinWheel,
  trivia: TriviaGame,
  memory: MemoryGame,
  number_guess: NumberGuess,
  word_scramble: WordScramble,
  hangman: HangmanGame,
};

interface GameModalProps {
  gameType: string;  // e.g., 'number', 'word', etc.
  celebrityId?: string;
  onClose: () => void;
}

export default function GameModal({ gameType, celebrityId, onClose }: GameModalProps) {
  const mappedType = gameTypeMap[gameType];
  const GameComponent = mappedType ? components[mappedType] : null;

  if (!GameComponent) {
    console.error(`Unknown game type: ${gameType}`);
    // DO NOT call onClose here – it causes setState during render.
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative max-w-md w-full mx-4 bg-sw-card rounded-2xl shadow-gold overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-white/50 hover:text-white text-xl p-1"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="p-6">
          <Suspense fallback={<div className="flex justify-center py-10"><Spinner size="lg" /></div>}>
            <GameComponent
              celebrityId={celebrityId}
              onClose={onClose}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}