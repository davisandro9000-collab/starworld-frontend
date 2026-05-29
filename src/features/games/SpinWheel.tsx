// src/features/games/SpinWheel.tsx
// The wheel is pure animation — outcome comes from the server POST /games/session/:id/complete
// The wheel spins to a cosmetic position then snaps to server-confirmed segment on finish.
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import {
  startGameSession,
  completeGameSession,
  type GameResult,
  type SpinSegment,
} from '../../api/game.api'
import { useCoinStore } from '../../stores/coinStore'
import PrizeModal from './PrizeModal'
import WinOfferModal, { type TicketGameOffer } from './WinOfferModal'
import { useSocketStore } from '../../stores/socketStore'

interface SpinWheelProps {
  celebrityId?: string
  onResult?: (result: GameResult) => void
}

// Default segments — server will provide real ones in session.config.segments
const DEFAULT_SEGMENTS: SpinSegment[] = [
  { label: '50 Coins', color: '#FFD700', weight: 30 },
  { label: '20 Coins', color: '#1A1F35', weight: 40 },
  { label: '100 Coins', color: '#00E5FF', weight: 10 },
  { label: 'Try Again', color: '#13172B', weight: 35 },
  { label: 'Prize', color: '#CD7F32', weight: 5 },
  { label: '30 Coins', color: '#1A1F35', weight: 40 },
  { label: '200 Coins', color: '#FFD700', weight: 8 },
  { label: '10 Coins', color: '#13172B', weight: 50 },
]

const SPIN_DURATION_MS = 4000
const EXTRA_ROTATIONS = 8 // full extra spins for drama

function drawWheel(
  canvas: HTMLCanvasElement,
  segments: SpinSegment[],
  rotation: number
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width: W, height: H } = canvas
  const cx = W / 2
  const cy = H / 2
  const r = cx - 8

  ctx.clearRect(0, 0, W, H)

  const total = segments.reduce((s, seg) => s + seg.weight, 0)
  let startAngle = rotation

  segments.forEach((seg, i) => {
    const slice = (seg.weight / total) * 2 * Math.PI
    const end = startAngle + slice
    const mid = startAngle + slice / 2

    // Slice fill
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, startAngle, end)
    ctx.closePath()
    ctx.fillStyle = seg.color
    ctx.fill()

    // Slice border
    ctx.strokeStyle = '#0B0F1E'
    ctx.lineWidth = 2
    ctx.stroke()

    // Label
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(mid)
    ctx.textAlign = 'right'
    ctx.fillStyle = seg.color === '#FFD700' ? '#0B0F1E' : '#ffffff'
    ctx.font = `bold ${W < 300 ? 9 : 11}px Outfit, sans-serif`
    ctx.fillText(seg.label, r - 12, 4)
    ctx.restore()

    startAngle = end
  })

  // Center circle
  ctx.beginPath()
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
  grad.addColorStop(0, '#FFD700')
  grad.addColorStop(1, '#FFA500')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = '#0B0F1E'
  ctx.lineWidth = 3
  ctx.stroke()

  // Star icon in center
  ctx.fillStyle = '#0B0F1E'
  ctx.font = `bold ${W < 300 ? 10 : 13}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('★', cx, cy)
}

// easeOut cubic
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export default function SpinWheel({ celebrityId, onResult }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [segments, setSegments] = useState<SpinSegment[]>(DEFAULT_SEGMENTS)
  const [rotation, setRotation] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [prizeResult, setPrizeResult] = useState<GameResult | null>(null)
  const [showPrize, setShowPrize] = useState(false)
  const [ticketOffer, setTicketOffer] = useState<TicketGameOffer | null>(null)
  const [showTicketOffer, setShowTicketOffer] = useState(false)
  const addCoins = useCoinStore(s => s.addCoins)
  const { socket } = useSocketStore()

  // Redraw when segments or rotation changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawWheel(canvas, segments, rotation)
  }, [segments, rotation])

  // Listen for ticket_game_offer from socket
  useEffect(() => {
    if (!socket) return
    const handler = (offer: TicketGameOffer) => {
      setTicketOffer(offer)
      setShowTicketOffer(true)
    }
    socket.on('ticket_game_offer', handler)
    return () => { socket.off('ticket_game_offer', handler) }
  }, [socket])

  const startMutation = useMutation({
    mutationFn: () => startGameSession({ gameType: 'spin', celebrityId }),
    onSuccess: (session) => {
      setSessionId(session.sessionId)
      if (session.config.segments?.length) {
        setSegments(session.config.segments)
      }
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeGameSession(id, {}),
    onSuccess: (result) => {
      // Update coin balance immediately
      addCoins(result.coinsEarned + (result.consolationCoins ?? 0))
      setPrizeResult(result)
      setShowPrize(true)
      onResult?.(result)
    },
  })

  const animateSpin = useCallback(
    (targetSegmentIndex: number | null, onDone: () => void) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const total = segments.reduce((s, seg) => s + seg.weight, 0)
      const segFractions = segments.map(seg => seg.weight / total)

      // Pick cosmetic target angle — even if server hasn't told us winner yet,
      // we'll snap at the end. If we have a target, spin to land on it.
      let targetAngle = Math.random() * 2 * Math.PI
      if (targetSegmentIndex !== null) {
        let cumulative = 0
        for (let i = 0; i < targetSegmentIndex; i++) cumulative += segFractions[i]
        const sliceStart = cumulative * 2 * Math.PI
        const sliceEnd = (cumulative + segFractions[targetSegmentIndex]) * 2 * Math.PI
        targetAngle = sliceStart + (sliceEnd - sliceStart) / 2
        // Pointer is at top (rotation 0 = 12 o'clock), so we need to subtract
        targetAngle = (2 * Math.PI - targetAngle) % (2 * Math.PI)
      }

      const startRot = rotation
      const totalAngle = EXTRA_ROTATIONS * 2 * Math.PI + targetAngle
      const start = performance.now()

      function frame(now: number) {
        const elapsed = now - start
        const t = Math.min(elapsed / SPIN_DURATION_MS, 1)
        const eased = easeOut(t)
        const currentRot = startRot + totalAngle * eased

        if (canvas) drawWheel(canvas, segments, currentRot)
        setRotation(currentRot)

        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          onDone()
        }
      }

      rafRef.current = requestAnimationFrame(frame)
    },
    [rotation, segments]
  )

  async function handleSpin() {
    if (spinning || startMutation.isPending) return
    setSpinning(true)

    // 1. Start session (gets sessionId + segments config)
    let sid = sessionId
    if (!sid) {
      try {
        const session = await startMutation.mutateAsync()
        sid = session.sessionId
      } catch {
        setSpinning(false)
        return
      }
    }

    // 2. Animate spin (cosmetic, unknown winner yet)
    animateSpin(null, async () => {
      // 3. Complete session — server decides winner
      try {
        const result = await completeMutation.mutateAsync(sid!)
        setSessionId(null) // reset for next spin
      } finally {
        setSpinning(false)
      }
    })
  }

  const error = startMutation.error || completeMutation.error

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel + pointer */}
      <div className="relative">
        {/* Pointer (triangle at top) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
          style={{
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '20px solid #FFD700',
            filter: 'drop-shadow(0 2px 4px rgba(255,215,0,0.5))',
          }}
        />

        {/* Outer glow ring */}
        <div
          className="rounded-full p-1"
          style={{
            background: spinning
              ? 'conic-gradient(from 0deg, #FFD700, #FFA500, #00E5FF, #FFD700)'
              : 'linear-gradient(135deg, #FFD700 0%, #1E2440 60%)',
            boxShadow: spinning ? '0 0 24px rgba(255,215,0,0.4)' : '0 0 12px rgba(255,215,0,0.15)',
            transition: 'box-shadow 0.3s',
          }}
        >
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-full block"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        {error && (
          <p className="text-loss text-xs mb-2">
            Something went wrong. Try again.
          </p>
        )}
        <motion.button
          className="btn-gold text-lg px-10 py-3 font-heading font-bold"
          onClick={handleSpin}
          disabled={spinning}
          whileTap={{ scale: 0.96 }}
          style={{ opacity: spinning ? 0.7 : 1 }}
        >
          {spinning ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-t-transparent border-[#0B0F1E] rounded-full animate-spin" />
              Spinning…
            </span>
          ) : (
            'SPIN'
          )}
        </motion.button>
        <p className="text-white/30 text-xs mt-2">
          Win rate applies server-side based on your tier
        </p>
      </div>

      {/* Prize modal */}
      <PrizeModal
        open={showPrize}
        result={prizeResult}
        hasTicketOffer={showTicketOffer}
        onClose={() => { setShowPrize(false); setPrizeResult(null) }}
        onWagerForTicket={() => { setShowPrize(false); setShowTicketOffer(true) }}
      />

      {/* Ticket game offer modal */}
      <WinOfferModal
        open={showTicketOffer && !showPrize}
        offer={ticketOffer}
        onClose={() => { setShowTicketOffer(false); setTicketOffer(null) }}
      />
    </div>
  )
}
