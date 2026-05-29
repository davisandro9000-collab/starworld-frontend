// src/features/games/WinOfferModal.tsx
// Appears when server emits 'ticket_game_offer' after a cash prize win.
// User can wager their won coins for a PvP ticket game or keep the coins.
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/axios'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

export interface TicketGameOffer {
  offerId: string
  prizeCoins: number       // what user already won (wager amount)
  ticketName: string       // e.g. "Beyoncé — London O2, Jul 14"
  expiresAt: string        // ISO — offer is only valid for 10 minutes
}

interface WinOfferModalProps {
  open: boolean
  offer: TicketGameOffer | null
  onClose: () => void      // user declines — keep coins
}

// Countdown ring (SVG)
function Countdown({ expiresAt }: { expiresAt: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const total = 600 // 10 minutes
  const r = 18
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const progress = secondsLeft / total
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="relative inline-flex items-center justify-center w-14 h-14">
      <svg width="56" height="56" className="rotate-[-90deg]">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#1E2440" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={secondsLeft < 60 ? '#EF4444' : '#00E5FF'}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className="absolute font-mono text-xs text-white font-bold">
        {mm}:{ss}
      </span>
    </div>
  )
}

export default function WinOfferModal({ open, offer, onClose }: WinOfferModalProps) {
  const navigate = useNavigate()
  const [entering, setEntering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-close when expired
  useEffect(() => {
    if (!offer) return
    const ms = new Date(offer.expiresAt).getTime() - Date.now()
    if (ms <= 0) { onClose(); return }
    const id = setTimeout(onClose, ms)
    return () => clearTimeout(id)
  }, [offer, onClose])

  async function handleAccept() {
    if (!offer) return
    setEntering(true)
    setError(null)
    try {
      const { data } = await api.post<{ sessionId: string }>('/tickets/game/enter', {
        offerId: offer.offerId,
      })
      onClose()
      navigate(`/ticket-game/${data.sessionId}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not enter game. Try again.')
      setEntering(false)
    }
  }

  if (!offer) return null

  return (
    <Modal open={open} onClose={onClose} title="" hideTitle className="border-[#00E5FF]/30 max-w-sm">
      <div className="text-center py-2">
        {/* Countdown + ticket icon */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex-1" />
          <motion.div
            className="text-5xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14 }}
          >
            🎟️
          </motion.div>
          <div className="flex-1 flex justify-end">
            <Countdown expiresAt={offer.expiresAt} />
          </div>
        </div>

        <h2 className="font-heading font-bold text-xl text-white mb-1">
          Wager for a Ticket?
        </h2>
        <p className="text-white/50 text-sm mb-4">
          Challenge a random opponent. Fastest finger wins the ticket.
        </p>

        {/* Ticket name */}
        <div className="bg-[#0B0F1E] border border-[#1E2440] rounded-xl px-4 py-3 mb-4 text-left">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Prize Ticket</p>
          <p className="text-white font-semibold text-sm">{offer.ticketName}</p>
        </div>

        {/* Wager display */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="text-center">
            <p className="text-white/40 text-xs mb-1">Your wager</p>
            <span className="coin-chip">
              <span className="coin-dot" />
              {offer.prizeCoins.toLocaleString()}
            </span>
          </div>
          <span className="text-white/30 text-xl">→</span>
          <div className="text-center">
            <p className="text-white/40 text-xs mb-1">If you win</p>
            <span className="inline-flex items-center gap-1 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full px-3 py-1 text-cyan text-sm font-bold">
              🎟️ Concert Ticket
            </span>
          </div>
        </div>

        {error && (
          <p className="text-loss text-xs mb-3">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button variant="cyan" onClick={handleAccept} loading={entering} className="w-full">
            Accept Challenge
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={entering} className="w-full text-white/40">
            Keep My {offer.prizeCoins.toLocaleString()} Coins
          </Button>
        </div>

        <p className="text-white/20 text-xs mt-3">
          Ties within 50ms use tier win-rate as tiebreaker
        </p>
      </div>
    </Modal>
  )
}
