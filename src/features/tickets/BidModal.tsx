import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import { placeBid } from '../../api/ticket.api'
import { useCoinStore } from '../../stores/coinStore'
import { useTicketStore } from './ticketStore'

interface Props {
  open: boolean
  onClose: () => void
  exchangeId: string
  currentBid?: number
  minIncrement?: number
  eventName: string
}

const MIN_INCREMENT = 5

export default function BidModal({
  open, onClose, exchangeId, currentBid, minIncrement = MIN_INCREMENT, eventName
}: Props) {
  const { balance } = useCoinStore()
  const { updateActiveBid, activeListing, setActiveListing } = useTicketStore()
  const minBid = (currentBid ?? 0) + minIncrement
  const [bidAmount, setBidAmount] = useState(minBid)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleClose() {
    setError('')
    setSuccess(false)
    setBidAmount(minBid)
    onClose()
  }

  async function handleBid() {
    setError('')
    if (bidAmount < minBid) { setError(`Minimum bid is ${minBid} coins`); return }
    if (bidAmount > balance) { setError('Insufficient coin balance'); return }
    setLoading(true)
    try {
      const bid = await placeBid(exchangeId, bidAmount)
      updateActiveBid(bid)
      // Optimistically update currentBid on activeListing
      if (activeListing) {
        setActiveListing({
          ...activeListing,
          currentBid: bidAmount,
          bidCount: (activeListing.bidCount ?? 0) + 1,
        })
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to place bid. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Place a Bid">
      {success ? (
        <div className="text-center py-4 space-y-3">
          <div className="text-4xl">🎉</div>
          <p className="font-heading font-bold text-white text-lg">Bid placed!</p>
          <p className="text-white/50 text-sm">
            Your <span className="text-gold font-semibold">{bidAmount.toLocaleString()} coins</span> are
            held in escrow. You'll get them back if outbid.
          </p>
          <button className="btn-gold w-full mt-2" onClick={handleClose}>Done</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-sw-card-2 rounded-xl p-3 border border-sw-border">
            <p className="text-white/50 text-xs">Bidding on</p>
            <p className="font-heading font-semibold text-white text-sm mt-0.5 line-clamp-2">{eventName}</p>
          </div>

          {/* Bid info row */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-sw-card-2 rounded-xl p-3 border border-sw-border">
              <p className="text-white/40 text-xs">Current highest</p>
              <p className="font-heading font-bold text-white">
                {currentBid ? `${currentBid.toLocaleString()} coins` : 'No bids'}
              </p>
            </div>
            <div className="bg-sw-card-2 rounded-xl p-3 border border-sw-border">
              <p className="text-white/40 text-xs">Your balance</p>
              <p className="font-heading font-bold text-gold">{balance.toLocaleString()} coins</p>
            </div>
          </div>

          {/* Bid input */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">
              Your bid (min {minBid.toLocaleString()} coins)
            </label>
            <input
              type="number"
              className="input-sw w-full"
              value={bidAmount}
              min={minBid}
              max={balance}
              step={minIncrement}
              onChange={e => setBidAmount(Number(e.target.value))}
            />
            <p className="text-white/30 text-xs mt-1">
              ≈ ${(bidAmount / 3).toFixed(2)} USD
            </p>
          </div>

          {/* Escrow note */}
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 text-xs text-white/60">
            💡 <strong className="text-white/80">Escrow:</strong> Your coins are reserved immediately.
            If you're outbid, they're returned instantly. Winner pays; loser gets a full refund.
          </div>

          {error && (
            <p className="text-loss text-sm bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn-gold flex-1 disabled:opacity-50"
              onClick={handleBid}
              disabled={loading || bidAmount > balance || bidAmount < minBid}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-sw-bg/40 border-t-sw-bg rounded-full animate-spin" />
                  Bidding…
                </span>
              ) : `Bid ${bidAmount.toLocaleString()} coins`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
