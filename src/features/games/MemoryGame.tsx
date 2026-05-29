import { useState, useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { startGameSession, completeGameSession, type GameSession, type GameResult } from '../../api/game.api'
import { useGameStore } from './gameStore'
import { useCoinStore } from '../../stores/index'
import { cn } from '../../lib/utils'
import Spinner from '../../components/ui/Spinner'

interface Card {
  id: number
  emoji: string
  matched: boolean
  flipped: boolean
}

interface MemoryGameProps {
  celebritySlug: string
  onComplete: () => void
}

const EMOJI_POOLS = [
  ['🌟','🎵','🎬','🏆','💎','🎤','🎸','🎭'],
  ['🦋','🌙','⚡','🔥','💫','🎯','🎪','🎠'],
  ['🐉','🌺','🍀','🎰','🏅','🎲','🎡','🌈'],
]

function buildCards(pool: string[]): Card[] {
  return [...pool, ...pool]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, matched: false, flipped: false }))
}

export default function MemoryGame({ celebritySlug, onComplete }: MemoryGameProps) {
  const { setLastResult, incrementGamesPlayed } = useGameStore()
  const { setBalance } = useCoinStore()

  const [cards, setCards]         = useState<Card[]>([])
  const [flipped, setFlipped]     = useState<number[]>([])
  const [moves, setMoves]         = useState(0)
  const [locked, setLocked]       = useState(false)
  const [gameOver, setGameOver]   = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [starting, setStarting]   = useState(true)
  const startedAt                 = { current: Date.now() }

  const startMutation = useMutation({
    mutationFn: () => startGameSession({ gameType: 'memory', celebrityId: celebritySlug }),
    onSuccess: (data: GameSession) => {
      setSessionId(data.sessionId)
      const pool = EMOJI_POOLS[Math.floor(Math.random() * EMOJI_POOLS.length)]
      setCards(buildCards(pool))
      startedAt.current = Date.now()
      setStarting(false)
    },
  })

  useEffect(() => { startMutation.mutate() }, []) // eslint-disable-line

  const completeMutation = useMutation({
    mutationFn: (timeMs: number) =>
      completeGameSession(sessionId!, { completionTimeMs: timeMs }),
    onSuccess: (data: GameResult) => {
      setLastResult(data)
      incrementGamesPlayed()
      if ((data as any).newBalance != null) setBalance((data as any).newBalance)
      onComplete()
    },
  })

  const handleFlip = useCallback(
    (id: number) => {
      if (locked || gameOver) return
      const card = cards.find(c => c.id === id)
      if (!card || card.flipped || card.matched) return

      const newFlipped = [...flipped, id]
      setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c))
      setFlipped(newFlipped)

      if (newFlipped.length === 2) {
        setLocked(true)
        setMoves(m => m + 1)
        const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!)
        const isMatch = a.emoji === b.emoji

        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              newFlipped.includes(c.id) ? { ...c, matched: isMatch, flipped: isMatch } : c,
            ),
          )
          setFlipped([])
          setLocked(false)
        }, isMatch ? 300 : 900)
      }
    },
    [locked, gameOver, flipped, cards],
  )

  // Check win after cards update
  useEffect(() => {
    if (cards.length === 0 || gameOver) return
    if (cards.every(c => c.matched)) {
      setGameOver(true)
      completeMutation.mutate(Date.now() - startedAt.current)
    }
  }, [cards]) // eslint-disable-line

  if (starting) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p className="text-sm text-gray-400">Shuffling cards…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Moves: <span className="text-white font-bold">{moves}</span></span>
        <span className="text-gray-400">
          Pairs: <span className="text-white font-bold">{cards.filter(c => c.matched).length / 2} / {cards.length / 2}</span>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            whileTap={{ scale: 0.93 }}
            disabled={card.matched || card.flipped || locked}
            className={cn(
              'aspect-square rounded-xl border text-2xl flex items-center justify-center transition-all duration-200 select-none',
              card.matched  && 'border-win/40 bg-win/10 cursor-default',
              card.flipped  && !card.matched && 'border-gold/40 bg-gold/10',
              !card.flipped && !card.matched && 'border-sw-border bg-sw-card hover:border-sw-border-2 hover:bg-sw-card-2 cursor-pointer',
            )}
          >
            <AnimatePresence mode="wait">
              {card.flipped || card.matched ? (
                <motion.span key="face" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.15 }}>
                  {card.emoji}
                </motion.span>
              ) : (
                <motion.span key="back" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.15 }} className="text-gold/40 text-lg">
                  ★
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {gameOver && completeMutation.isPending && (
        <div className="flex justify-center py-4"><Spinner /></div>
      )}
    </div>
  )
}
