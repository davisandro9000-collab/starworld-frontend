import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import TierBadge from '../../components/ui/TierBadge'
import type { GamePhase, GameStartPayload, GameResultPayload } from '../../hooks/useTicketGame'

interface TicketGameUIProps {
  phase: GamePhase
  gameStart: GameStartPayload | null
  result: GameResultPayload | null
  currentUserId: string
  onTap: () => void
  hasTapped: boolean
}

/** Counts down from 3 to 0 and calls onDone */
function useCountdown(active: boolean, onDone: () => void) {
  const [count, setCount] = useState(3)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!active) {
      setCount(3)
      doneRef.current = false
      return
    }

    doneRef.current = false
    setCount(3)

    const id = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          if (!doneRef.current) {
            doneRef.current = true
            onDone()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [active, onDone])

  return count
}

export default function TicketGameUI({
  phase,
  gameStart,
  result,
  currentUserId,
  onTap,
  hasTapped,
}: TicketGameUIProps) {
  const isCountdown = phase === 'countdown'
  const isTap = phase === 'tap'
  const isTapped = phase === 'tapped'
  const isResult = phase === 'result'

  // Countdown ticks on its own — just visual; actual signal comes from server
  const countdown = useCountdown(isCountdown, () => {})

  const isWinner = isResult && result?.winnerId === currentUserId
  const playerLabel = gameStart?.role === 'player1' ? 'You' : 'You'
  const opponentName = gameStart?.opponent?.username ?? 'Opponent'
  const opponentTier = (gameStart?.opponent?.tier ?? 'bronze') as 'bronze' | 'silver' | 'platinum'
  const prizeName = gameStart?.prizeDetails?.name ?? 'Prize Ticket'
  const prizeCoins = gameStart?.prizeDetails?.coins ?? 0

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-sw-bg overflow-hidden bg-dark-grid">
      {/* ── Phase: Waiting ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full border-4 border-gold border-t-transparent animate-spin" />
            <p className="font-heading text-2xl font-bold text-white">Finding opponent…</p>
            <p className="text-white/40 font-body text-sm">Matchmaking in progress</p>
          </motion.div>
        )}

        {/* ── Phase: Countdown + Tap + Tapped ─────────────── */}
        {(isCountdown || isTap || isTapped) && gameStart && (
          <motion.div
            key="arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl px-4 flex flex-col items-center gap-8"
          >
            {/* Prize banner */}
            <div className="card card-gold px-6 py-3 flex items-center gap-3">
              <span className="text-gold text-xl">🎟</span>
              <div className="text-center">
                <p className="font-heading font-bold text-white text-sm">{prizeName}</p>
                <p className="text-white/40 font-body text-xs">
                  Winner takes{' '}
                  <span className="text-gold font-semibold">
                    {prizeCoins.toLocaleString()} coins
                  </span>
                </p>
              </div>
            </div>

            {/* Split ticket arena */}
            <div className="w-full flex rounded-xl overflow-hidden border border-sw-border-2 h-52 md:h-64 relative">
              {/* Player half — left */}
              <motion.div
                animate={
                  isTap
                    ? { backgroundColor: 'rgba(0,229,255,0.08)' }
                    : { backgroundColor: 'rgba(19,23,43,1)' }
                }
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center gap-2 border-r border-sw-border-2"
              >
                <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center text-cyan font-heading font-black text-lg">
                  Y
                </div>
                <p className="font-heading font-bold text-white text-sm">{playerLabel}</p>
                <TierBadge tier="bronze" />
                {(isTap || isTapped) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'mt-1 text-xs font-body px-2 py-0.5 rounded-full',
                      isTapped
                        ? 'bg-win/20 text-win'
                        : 'bg-cyan/20 text-cyan animate-pulse'
                    )}
                  >
                    {isTapped ? '✓ Tapped' : 'TAP NOW'}
                  </motion.div>
                )}
              </motion.div>

              {/* VS divider */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-sw-bg border border-sw-border-2 flex items-center justify-center">
                <span className="text-white/40 font-heading font-black text-xs">VS</span>
              </div>

              {/* Opponent half — right */}
              <motion.div
                className="flex-1 flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(19,23,43,1)' }}
              >
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-heading font-black text-lg">
                  {opponentName.charAt(0).toUpperCase()}
                </div>
                <p className="font-heading font-bold text-white text-sm">{opponentName}</p>
                <TierBadge tier={opponentTier} />
              </motion.div>
            </div>

            {/* Countdown / tap flash */}
            <AnimatePresence mode="wait">
              {isCountdown && (
                <motion.div
                  key={`count-${countdown}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="font-heading font-black text-8xl text-gold-gradient select-none"
                >
                  {countdown === 0 ? 'GO!' : countdown}
                </motion.div>
              )}

              {isTap && !hasTapped && (
                <motion.button
                  key="tap-btn"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTap}
                  className="btn-cyan text-2xl font-heading font-black px-16 py-6 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.4)]"
                >
                  TAP!
                </motion.button>
              )}

              {isTapped && (
                <motion.div
                  key="tapped-wait"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full border-4 border-cyan border-t-transparent animate-spin" />
                  <p className="text-white/50 font-body text-sm">Waiting for result…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Phase: Result ────────────────────────────────── */}
        {isResult && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="flex flex-col items-center gap-6 text-center px-4"
          >
            {/* Win / Loss icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center text-5xl',
                isWinner
                  ? 'bg-gold/20 shadow-[0_0_60px_rgba(255,215,0,0.5)]'
                  : 'bg-loss/10'
              )}
            >
              {isWinner ? '🏆' : '💔'}
            </motion.div>

            <div>
              <h2
                className={cn(
                  'font-heading font-black text-4xl',
                  isWinner ? 'text-gold-gradient' : 'text-white/70'
                )}
              >
                {isWinner ? 'You Won!' : 'You Lost'}
              </h2>
              <p className="text-white/50 font-body text-sm mt-2">
                {result.tiebreakUsed
                  ? 'Too close — tier advantage decided it'
                  : isWinner
                  ? `Your tap: ${result.player1TapMs}ms`
                  : 'Better luck next time'}
              </p>
            </div>

            {isWinner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card card-gold px-8 py-4"
              >
                <p className="text-white/60 font-body text-xs mb-1">You won</p>
                <p className="font-heading font-bold text-gold text-xl">
                  🎟 {prizeName}
                </p>
                <p className="text-white/40 font-body text-xs mt-1">
                  +{prizeCoins.toLocaleString()} coins awarded
                </p>
              </motion.div>
            )}

            {!isWinner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card px-8 py-4"
              >
                <p className="text-white/50 font-body text-sm">
                  Your wager coins have been returned to your balance.
                </p>
              </motion.div>
            )}

            <motion.a
              href="/dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="btn-gold mt-2"
            >
              Back to Dashboard
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
