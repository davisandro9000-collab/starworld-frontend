import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  startGameSession,
  completeGameSession,
  type GameResult,
  type TriviaQuestion,
} from '../../api/game.api';
import { useAuthStore } from '../../stores/authStore';
import { useSocketStore } from '../../stores/socketStore';
import PrizeModal from './PrizeModal';
import WinOfferModal, { type TicketGameOffer } from './WinOfferModal';

interface TriviaGameProps {
  celebrityId?: string;
  onResult?: (result: GameResult) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function ProgressDots({ total, current, correct }: { total: number; current: number; correct: number[] }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            'w-2 h-2 rounded-full transition-all duration-300',
            i < current
              ? correct.includes(i)
                ? 'bg-win'
                : 'bg-loss'
              : i === current
              ? 'bg-gold scale-125'
              : 'bg-[#1E2440]',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

type Phase = 'idle' | 'loading' | 'playing' | 'reviewing' | 'done';

export default function TriviaGame({ celebrityId, onResult }: TriviaGameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [prizeResult, setPrizeResult] = useState<GameResult | null>(null);
  const [showPrize, setShowPrize] = useState(false);
  const [ticketOffer, setTicketOffer] = useState<TicketGameOffer | null>(null);
  const [showTicketOffer, setShowTicketOffer] = useState(false);
  const { user, setUser } = useAuthStore();
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;
    const handler = (offer: TicketGameOffer) => {
      setTicketOffer(offer);
      setShowTicketOffer(true);
    };
    socket.on('ticket_game_offer', handler);
    return () => {
      socket.off('ticket_game_offer', handler);
    };
  }, [socket]);

  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, selected]);

  const startMutation = useMutation({
    mutationFn: () => startGameSession({ gameType: 'trivia', celebrityId }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, ans }: { id: string; ans: number[] }) =>
      completeGameSession(id, { answers: ans }),
  });

  async function handleStart() {
    setPhase('loading');
    try {
      const session = await startMutation.mutateAsync();
      setSessionId(session.sessionId);
      setQuestions(session.config.questions ?? []);
      setAnswers([]);
      setQIndex(0);
      setTimeLeft(15);
      setSelected(null);
      setPhase('playing');
    } catch {
      setPhase('idle');
    }
  }

  function handleAnswer(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);

    const newAnswers = [...answers, optionIndex];
    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setAnswers(newAnswers);
        setQIndex((i) => i + 1);
        setSelected(null);
        setTimeLeft(15);
      } else {
        setPhase('reviewing');
        handleComplete(newAnswers);
      }
    }, 1200);
  }

  async function handleComplete(finalAnswers: number[]) {
    if (!sessionId) return;
    try {
      const result = await completeMutation.mutateAsync({ id: sessionId, ans: finalAnswers });
      if (user) {
        const earned = result.coinsEarned + (result.consolationCoins ?? 0);
        setUser({ ...user, coinBalance: user.coinBalance + earned });
      }
      setPrizeResult(result);
      setPhase('done');
      setShowPrize(true);
      onResult?.(result);
    } catch {
      setPhase('idle');
    }
  }

  function handlePlayAgain() {
    setPhase('idle');
    setSessionId(null);
    setAnswers([]);
    setCorrectAnswers([]);
    setQIndex(0);
    setPrizeResult(null);
  }

  const q = questions[qIndex];
  const timerColor = timeLeft > 8 ? 'bg-win' : timeLeft > 4 ? 'bg-gold' : 'bg-loss';

  if (phase === 'idle') {
    return (
      <div className="card p-6 text-center max-w-md mx-auto">
        <div className="text-4xl mb-3">🧠</div>
        <h3 className="font-heading font-bold text-xl text-white mb-2">Celebrity Trivia</h3>
        <p className="text-white/50 text-sm mb-6">
          Answer questions about your star. More right answers = higher win chance.
        </p>
        <button className="btn-gold w-full" onClick={handleStart}>
          Start Trivia
        </button>
        {startMutation.isError && (
          <p className="text-loss text-xs mt-2">Couldn't load questions. Try again.</p>
        )}
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="card p-6 text-center max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-white/50">
          <span className="inline-block w-4 h-4 border-2 border-t-gold border-[#1E2440] rounded-full animate-spin" />
          Loading questions…
        </div>
      </div>
    );
  }

  if (phase === 'playing' && q) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <ProgressDots total={questions.length} current={qIndex} correct={correctAnswers} />

        <div className="progress-track">
          <div
            className={`progress-fill ${timerColor}`}
            style={{ width: `${(timeLeft / 15) * 100}%`, transition: 'width 1s linear' }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40">
          <span>
            Q{qIndex + 1} of {questions.length}
          </span>
          <span className={timeLeft <= 4 ? 'text-loss font-bold' : ''}>{timeLeft}s</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="card p-5"
          >
            <p className="font-heading font-semibold text-white text-base leading-snug mb-5">
              {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                return (
                  <button
                    key={i}
                    className={[
                      'text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200',
                      isSelected
                        ? 'border-gold bg-gold/10 text-gold'
                        : selected !== null
                        ? 'border-[#1E2440] text-white/30 cursor-default'
                        : 'border-[#1E2440] text-white hover:border-gold/50 hover:bg-[#1A1F35] cursor-pointer',
                    ].join(' ')}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                  >
                    <span className="text-gold/60 font-bold mr-2">{OPTION_LETTERS[i]}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6 text-center">
        <p className="text-white/50 text-sm">Checking your answers…</p>
      </div>

      <PrizeModal
        open={showPrize}
        result={prizeResult}
        hasTicketOffer={showTicketOffer}
        onClose={() => {
          setShowPrize(false);
          handlePlayAgain();
        }}
        onWagerForTicket={() => {
          setShowPrize(false);
          setShowTicketOffer(true);
        }}
      />
      <WinOfferModal
        open={showTicketOffer && !showPrize}
        offer={ticketOffer}
        onClose={() => {
          setShowTicketOffer(false);
          setTicketOffer(null);
        }}
      />
    </div>
  );
}