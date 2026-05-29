// src/features/games/PrizeModal.tsx
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameResult } from '../../api/game.api'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

interface PrizeModalProps {
  open: boolean
  result: GameResult | null
  onClose: () => void
  onWagerForTicket?: () => void   // called when user accepts ticket game offer
  hasTicketOffer?: boolean        // true when server emitted 'ticket_game_offer' alongside this win
}

// ─── Particle burst ───────────────────────────────────────────────────────────
function Particles() {
  const COLORS = ['#FFD700', '#FFA500', '#00E5FF', '#22C55E', '#ffffff']
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    angle: (i / 24) * 360,
    distance: 80 + Math.random() * 60,
    size: 4 + Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            top: '50%',
            left: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
        />
      ))}
    </div>
  )
}

// ─── Loss state ───────────────────────────────────────────────────────────────
function LossContent({ consolation, onClose }: { consolation: number; onClose: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-3">😔</div>
      <h2 className="font-heading font-bold text-xl text-white mb-1">Not this time</h2>
      <p className="text-white/50 text-sm mb-4">Better luck on your next spin</p>
      {consolation > 0 && (
        <div className="inline-flex items-center gap-2 bg-[#1A1F35] border border-[#1E2440] rounded-full px-4 py-2 mb-6">
          <span className="coin-dot" />
          <span className="text-gold font-heading font-bold">+{consolation}</span>
          <span className="text-white/50 text-xs">consolation coins</span>
        </div>
      )}
      <Button variant="outline" onClick={onClose} className="w-full">
        Try Again
      </Button>
    </div>
  )
}

// ─── Win state ────────────────────────────────────────────────────────────────
function WinContent({
  result,
  onClose,
  hasTicketOffer,
  onWagerForTicket,
}: {
  result: GameResult
  onClose: () => void
  hasTicketOffer?: boolean
  onWagerForTicket?: () => void
}) {
  const prizeTypeIcon: Record<string, string> = {
    cash: '💵',
    merch: '👕',
    ticket: '🎟️',
    coupon: '🎫',
    coins: '🪙',
  }

  const icon = result.prize ? prizeTypeIcon[result.prize.type] ?? '🎁' : '🪙'

  return (
    <div className="text-center py-4 relative">
      <Particles />

      <motion.div
        className="text-6xl mb-3"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        {icon}
      </motion.div>

      <motion.h2
        className="font-heading font-bold text-2xl text-gold-gradient mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        You Won!
      </motion.h2>

      {result.prize && (
        <motion.p
          className="text-white font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {result.prize.label}
        </motion.p>
      )}

      <motion.div
        className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-5 py-2 mb-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
      >
        <span className="coin-dot" />
        <span className="text-gold font-heading font-bold text-xl">
          +{result.coinsEarned.toLocaleString()}
        </span>
        <span className="text-white/50 text-xs">
          ≈ ${(result.coinsEarned / 3).toFixed(2)}
        </span>
      </motion.div>

      {result.prize?.code && (
        <motion.div
          className="mx-auto mt-3 mb-4 max-w-xs bg-[#0B0F1E] border border-[#1E2440] rounded-lg px-4 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-white/40 text-xs mb-1 uppercase tracking-widest">Prize Code</p>
          <p className="font-mono text-gold text-lg tracking-widest select-all">
            {result.prize.code}
          </p>
          <p className="text-white/30 text-xs mt-1">Screenshot this — check your prizes tab to redeem</p>
        </motion.div>
      )}

      <motion.div
        className="flex flex-col gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {hasTicketOffer && onWagerForTicket && (
          <Button
            variant="cyan"
            onClick={() => { onClose(); onWagerForTicket() }}
            className="w-full"
          >
            🎟️ Wager for a Concert Ticket
          </Button>
        )}
        <Button variant={hasTicketOffer ? 'outline' : 'gold'} onClick={onClose} className="w-full">
          {hasTicketOffer ? 'Keep My Coins' : 'Awesome!'}
        </Button>
      </motion.div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PrizeModal({
  open,
  result,
  onClose,
  onWagerForTicket,
  hasTicketOffer = false,
}: PrizeModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      hideTitle
      className={result?.won ? 'border-gold/30' : 'border-[#1E2440]'}
    >
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.won ? 'win' : 'loss'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {result.won ? (
              <WinContent
                result={result}
                onClose={onClose}
                hasTicketOffer={hasTicketOffer}
                onWagerForTicket={onWagerForTicket}
              />
            ) : (
              <LossContent
                consolation={result.consolationCoins ?? 0}
                onClose={onClose}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
