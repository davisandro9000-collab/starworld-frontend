import { useEffect, useState } from 'react'
import { useSocketStore } from '../../stores/socketStore'

interface AuctionTimerProps {
  exchangeId: string
  endsAt: string          // ISO string
  onExpire?: () => void
  className?: string
}

function msToDisplay(ms: number) {
  if (ms <= 0) return { label: 'Ended', urgent: true }
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const urgent = ms < 60_000  // under 1 minute
  if (h > 0) return { label: `${h}h ${m}m`, urgent }
  if (m > 0) return { label: `${m}m ${s.toString().padStart(2,'0')}s`, urgent }
  return { label: `${s}s`, urgent: true }
}

export default function AuctionTimer({ exchangeId, endsAt, onExpire, className = '' }: AuctionTimerProps) {
  const [msLeft, setMsLeft] = useState(() => new Date(endsAt).getTime() - Date.now())
  const { socket } = useSocketStore()

  // Local countdown tick
  useEffect(() => {
    if (msLeft <= 0) { onExpire?.(); return }
    const id = setInterval(() => {
      setMsLeft(prev => {
        const next = prev - 1000
        if (next <= 0) { clearInterval(id); onExpire?.(); return 0 }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])                      // intentionally run once — interval handles updates

  // Socket sync — server may push updated timeRemaining on new bids
  useEffect(() => {
    if (!socket) return
    const handler = (data: { exchangeId: string; timeRemaining: number }) => {
      if (data.exchangeId === exchangeId) {
        setMsLeft(data.timeRemaining)
      }
    }
    socket.on('auction_update', handler)
    return () => { socket.off('auction_update', handler) }
  }, [socket, exchangeId])

  const { label, urgent } = msToDisplay(msLeft)

  return (
    <span
      className={`font-heading font-bold tabular-nums ${
        urgent ? 'text-loss animate-pulse' : 'text-gold'
      } ${className}`}
    >
      {label}
    </span>
  )
}
