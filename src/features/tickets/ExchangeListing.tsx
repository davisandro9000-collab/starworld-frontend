import { Link } from 'react-router-dom'
import AuctionTimer from './AuctionTimer'
import { ExchangeListing } from '../../api/ticket.api'

interface Props {
  listing: ExchangeListing
  compact?: boolean
}

function CoinAmount({ coins }: { coins: number }) {
  return (
    <span
      className="coin-chip"
      title={`${coins} coins ≈ $${(coins / 3).toFixed(2)} USD`}
    >
      <span className="coin-dot" />
      {coins.toLocaleString()}
    </span>
  )
}

export default function ExchangeListingCard({ listing, compact = false }: Props) {
  const isAuction = listing.listingType === 'auction'
  const isSold    = listing.status === 'sold'
  const isExpired = listing.status === 'expired' || listing.status === 'cancelled'

  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className={`card-hover block rounded-2xl overflow-hidden transition-all ${
        isSold || isExpired ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Ticket image or placeholder */}
      <div className="relative h-32 bg-sw-card-2 flex items-center justify-center overflow-hidden">
        {listing.ticketImageUrl ? (
          <img
            src={listing.ticketImageUrl}
            alt={listing.eventName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl opacity-40">🎫</span>
        )}

        {/* Status badge */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="font-heading font-black text-white text-xl tracking-widest">SOLD</span>
          </div>
        )}

        {/* Listing type pill */}
        <div className="absolute top-2 left-2">
          {isAuction ? (
            <span className="badge-live text-xs px-2 py-0.5">AUCTION</span>
          ) : (
            <span className="bg-sw-card/80 border border-sw-border text-white/60 text-xs px-2 py-0.5 rounded-full">
              FIXED
            </span>
          )}
        </div>

        {/* Quantity */}
        {listing.quantity > 1 && (
          <div className="absolute top-2 right-2 bg-sw-card/80 border border-sw-border text-white/60 text-xs px-2 py-0.5 rounded-full">
            ×{listing.quantity}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {/* Event name */}
        <p className="font-heading font-semibold text-white text-sm leading-tight line-clamp-2">
          {listing.eventName}
        </p>

        {/* Seat info */}
        {listing.seatInfo && !compact && (
          <p className="text-white/40 text-xs">{listing.seatInfo}</p>
        )}

        {/* Date */}
        {listing.eventDate && (
          <p className="text-white/40 text-xs">
            {new Date(listing.eventDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          {isAuction ? (
            <div className="flex flex-col gap-0.5">
              <p className="text-white/40 text-xs">
                {listing.bidCount ? `${listing.bidCount} bid${listing.bidCount !== 1 ? 's' : ''}` : 'No bids yet'}
              </p>
              {listing.currentBid ? (
                <CoinAmount coins={listing.currentBid} />
              ) : listing.askingPriceCoins ? (
                <CoinAmount coins={listing.askingPriceCoins} />
              ) : null}
            </div>
          ) : (
            listing.askingPriceCoins ? <CoinAmount coins={listing.askingPriceCoins} /> : null
          )}

          {/* Timer (auction) or expiry (fixed) */}
          {isAuction && listing.auctionEndsAt && !isSold && (
            <AuctionTimer exchangeId={listing.id} endsAt={listing.auctionEndsAt} />
          )}
        </div>

        {/* Seller */}
        {!compact && (
          <p className="text-white/30 text-xs border-t border-sw-border pt-2">
            by <span className="text-white/50">{listing.sellerUsername}</span>
          </p>
        )}
      </div>
    </Link>
  )
}
