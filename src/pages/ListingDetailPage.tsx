// src/pages/ListingDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getExchangeListing,
  buyFixedPrice as buyListing,
  cancelListing,
  type ExchangeListing
} from '../api/ticket.api'
import { useTicketStore } from '../features/tickets/ticketStore'
import AuctionTimer from '../features/tickets/AuctionTimer'
import BidModal from '../features/tickets/BidModal'
import Spinner from '../components/ui/Spinner'
import { useAuthStore } from '../stores/authStore'
import { useCoinStore } from '../stores/coinStore'
import { useSocketStore } from '../stores/socketStore'

function CoinAmount({ coins }: { coins: number }) {
  return (
    <span className="coin-chip text-base" title={`≈ $${(coins / 3).toFixed(2)} USD`}>
      <span className="coin-dot" />
      {coins.toLocaleString()}
    </span>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { balance } = useCoinStore()
  const { socket } = useSocketStore()
  const { setActiveListing, setActiveBids, activeListing, activeBids, updateActiveBid } = useTicketStore()
  const [bidOpen, setBidOpen] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [buySuccess, setBuySuccess] = useState(false)
  const [auctionExpired, setAuctionExpired] = useState(false)

  // Fetch listing (includes auctionBids)
  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getExchangeListing(id!),
    staleTime: 15_000,
    enabled: !!id,
  })

  // Set listing and bids in store when data arrives
  useEffect(() => {
    if (listing) {
      setActiveListing(listing)
      if (listing.auctionBids) {
        setActiveBids(listing.auctionBids)
      }
    }
  }, [listing, setActiveListing, setActiveBids])

  // Socket: live bid updates
  useEffect(() => {
    if (!socket || !id) return
    socket.emit('join_auction', { exchangeId: id })
    const handler = (data: { exchangeId: string; currentBid: number; bid: any }) => {
      if (data.exchangeId === id) {
        updateActiveBid(data.bid)
        if (activeListing) {
          setActiveListing({ ...activeListing, currentBid: data.currentBid })
        }
      }
    }
    socket.on('auction_update', handler)
    return () => {
      socket.off('auction_update', handler)
      socket.emit('leave_auction', { exchangeId: id })
    }
  }, [socket, id, activeListing, updateActiveBid, setActiveListing])

  // Buy mutation
  const buyMutation = useMutation({
    mutationFn: () => buyListing(id!),
    onSuccess: () => {
      setBuySuccess(true)
      qc.invalidateQueries({ queryKey: ['listing', id] })
    },
    onError: (err: any) => {
      setBuyError(err?.response?.data?.message ?? 'Purchase failed.')
    },
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: () => cancelListing(id!),
    onSuccess: () => navigate('/marketplace'),
  })

  const l = activeListing ?? listing

  if (isLoading) return (
    <div className="page-content flex justify-center py-20"><Spinner size="lg" /></div>
  )
  if (isError || !l) return (
    <div className="page-content text-center py-20">
      <p className="text-white/40 mb-4">Listing not found.</p>
      <Link to="/marketplace" className="btn-outline">← Back to Marketplace</Link>
    </div>
  )

  const isOwner      = user?.id === l.sellerId
  const isAuction    = l.listingType === 'auction'
  const isSold       = l.status === 'sold'
  const isActive     = l.status === 'active' && !auctionExpired
  const canBuy       = !isOwner && isActive && !isAuction && balance >= (l.askingPriceCoins ?? 0)
  const canBid       = !isOwner && isActive && isAuction
  const winningBid   = activeBids?.find(b => b.isWinning)
  const myBid        = activeBids?.find(b => b.bidderId === user?.id)

  return (
    <div className="page-content max-w-3xl mx-auto space-y-6">

      {/* Back link */}
      <Link to="/marketplace" className="text-white/40 hover:text-white text-sm flex items-center gap-1">
        ← Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Left: ticket image */}
        <div className="rounded-2xl overflow-hidden bg-sw-card-2 border border-sw-border aspect-[3/4] flex items-center justify-center relative">
          {l.ticketImageUrl ? (
            <img src={l.ticketImageUrl} alt={l.eventName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl opacity-20">🎫</span>
          )}
          {isSold && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="font-heading font-black text-white text-3xl tracking-widest rotate-[-15deg]">SOLD</span>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="space-y-4">
          {/* Type pill */}
          <div className="flex items-center gap-2">
            {isAuction
              ? <span className="badge-live text-xs">AUCTION</span>
              : <span className="bg-sw-card-2 border border-sw-border text-white/50 text-xs px-2 py-0.5 rounded-full">FIXED PRICE</span>
            }
            {l.quantity > 1 && (
              <span className="bg-sw-card-2 border border-sw-border text-white/50 text-xs px-2 py-0.5 rounded-full">
                ×{l.quantity} tickets
              </span>
            )}
          </div>

          {/* Event */}
          <h1 className="font-heading font-bold text-xl text-white leading-tight">{l.eventName}</h1>

          {l.seatInfo && <p className="text-white/50 text-sm">{l.seatInfo}</p>}
          {l.eventDate && (
            <p className="text-white/40 text-sm">
              📅 {new Date(l.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {l.description && (
            <p className="text-white/60 text-sm leading-relaxed border-t border-sw-border pt-3">{l.description}</p>
          )}

          {/* Price / bid section */}
          <div className="card p-4 space-y-3">
            {isAuction ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/40 text-xs">Current bid</p>
                    {l.currentBid
                      ? <CoinAmount coins={l.currentBid} />
                      : <p className="text-white/50 text-sm font-semibold">No bids yet</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs">Ends in</p>
                    {l.auctionEndsAt && !auctionExpired
                      ? <AuctionTimer exchangeId={l.id} endsAt={l.auctionEndsAt} onExpire={() => setAuctionExpired(true)} />
                      : <span className="text-loss text-sm font-bold">Ended</span>}
                  </div>
                </div>
                <p className="text-white/30 text-xs">
                  {l.bidCount ?? 0} bid{(l.bidCount ?? 0) !== 1 ? 's' : ''} placed
                </p>
                {myBid && (
                  <p className={`text-xs font-semibold ${myBid.isWinning ? 'text-win' : 'text-loss'}`}>
                    {myBid.isWinning ? '✅ You are the highest bidder' : '⚠️ You have been outbid'}
                  </p>
                )}
              </>
            ) : (
              <div>
                <p className="text-white/40 text-xs mb-1">Price</p>
                {l.askingPriceCoins && <CoinAmount coins={l.askingPriceCoins} />}
                <p className="text-white/30 text-xs mt-1">Your balance: {balance.toLocaleString()} coins</p>
              </div>
            )}

            {/* CTA */}
            {!isSold && isActive && !isOwner && (
              <>
                {buySuccess ? (
                  <div className="bg-win/10 border border-win/30 rounded-xl p-3 text-center">
                    <p className="text-win font-semibold text-sm">🎉 Purchase successful!</p>
                    <p className="text-white/40 text-xs mt-1">Check your notifications for ticket details.</p>
                  </div>
                ) : isAuction ? (
                  <button
                    className="btn-gold w-full"
                    onClick={() => setBidOpen(true)}
                    disabled={!canBid}
                  >
                    Place Bid
                  </button>
                ) : (
                  <>
                    {buyError && <p className="text-loss text-xs">{buyError}</p>}
                    <button
                      className="btn-gold w-full disabled:opacity-50"
                      disabled={!canBuy || buyMutation.isPending}
                      onClick={() => buyMutation.mutate()}
                    >
                      {buyMutation.isPending ? 'Buying…' : `Buy for ${l.askingPriceCoins?.toLocaleString()} coins`}
                    </button>
                    {!canBuy && !isSold && balance < (l.askingPriceCoins ?? 0) && (
                      <p className="text-white/30 text-xs text-center">
                        You need {((l.askingPriceCoins ?? 0) - balance).toLocaleString()} more coins
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {isSold && (
              <div className="bg-sw-card-2 rounded-xl p-3 text-center text-white/40 text-sm">
                This listing has been sold.
              </div>
            )}

            {isOwner && isActive && (
              <button
                className="btn-outline w-full text-loss border-loss/30 hover:bg-loss/10"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Listing'}
              </button>
            )}
          </div>

          {/* Seller */}
          <p className="text-white/30 text-xs">
            Listed by <span className="text-white/50 font-medium">{l.sellerUsername}</span>
          </p>
        </div>
      </div>

      {/* Bid history (auction) */}
      {isAuction && activeBids && activeBids.length > 0 && (
        <div className="space-y-3">
          <h2 className="section-title">Bid History</h2>
          <div className="card divide-y divide-sw-border">
            {activeBids.map((bid) => (
              <div key={bid.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-sw-card-2 border border-sw-border flex items-center justify-center text-xs text-white/50">
                    {bid.bidderUsername?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-white/70 text-sm">{bid.bidderUsername}</span>
                  {bid.isWinning && (
                    <span className="text-win text-xs font-semibold">● winning</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="coin-chip text-sm">
                    <span className="coin-dot" />
                    {bid.bidCoins.toLocaleString()}
                  </span>
                  <p className="text-white/30 text-xs mt-0.5">
                    {new Date(bid.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bid modal */}
      <BidModal
        open={bidOpen}
        onClose={() => setBidOpen(false)}
        exchangeId={l.id}
        currentBid={l.currentBid}
        eventName={l.eventName}
      />
    </div>
  )
}