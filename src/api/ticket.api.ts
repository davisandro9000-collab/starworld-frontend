import { api } from './axios'

export interface TicketEvent {
  id: string
  ticketmasterId: string
  eventName: string
  artistName: string
  celebrityId?: string
  venue: string
  city: string
  country: string
  eventDate: string
  imageUrl?: string
  ticketUrl?: string
  priceMin?: number
  priceMax?: number
  currency: string
}

export interface ExchangeListing {
  id: string
  sellerId: string
  sellerUsername: string
  ticketListingId?: string
  eventName: string
  eventDate?: string
  seatInfo?: string
  quantity: number
  listingType: 'fixed' | 'auction'
  askingPriceCoins?: number
  ticketImageUrl?: string
  description?: string
  status: 'active' | 'sold' | 'cancelled' | 'expired'
  buyerId?: string
  expiresAt: string
  createdAt: string
  currentBid?: number
  bidCount?: number
  auctionEndsAt?: string
  reserveMet?: boolean
}

export interface AuctionBid {
  id: string
  exchangeId: string
  bidderId: string
  bidderUsername: string
  bidCoins: number
  isWinning: boolean
  createdAt: string
}

export interface CreateListingPayload {
  ticketListingId?: string
  eventName: string
  eventDate?: string
  seatInfo?: string
  quantity: number
  listingType: 'fixed' | 'auction'
  askingPriceCoins?: number
  startingBidCoins?: number
  reservePriceCoins?: number
  auctionDurationHours?: number
  description?: string
  ticketImageUrl?: string
}

// Events
export async function getTicketEvents(params?: {
  celebrity?: string; city?: string; page?: number
}): Promise<{ events: TicketEvent[]; total: number }> {
  const { data } = await api.get('/tickets/events', { params })
  return data
}

export async function getTicketEvent(id: string): Promise<TicketEvent> {
  const { data } = await api.get(`/tickets/events/${id}`)
  return data
}

// Exchange listings
export async function getExchangeListings(params?: {
  type?: 'fixed' | 'auction' | 'all'; status?: string; page?: number; limit?: number
}): Promise<{ listings: ExchangeListing[]; total: number; page: number }> {
  const { data } = await api.get('/tickets/exchange', { params })
  return data
}

export async function getExchangeListing(id: string): Promise<ExchangeListing> {
  const { data } = await api.get(`/tickets/exchange/${id}`)
  return data
}

export async function createListing(payload: CreateListingPayload): Promise<ExchangeListing> {
  const { data } = await api.post('/tickets/exchange', payload)
  return data
}

export async function buyListing(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(`/tickets/exchange/${id}/buy`)
  return data
}

export async function cancelListing(id: string): Promise<void> {
  await api.delete(`/tickets/exchange/${id}`)
}

// Auction
export async function placeBid(exchangeId: string, bidCoins: number): Promise<AuctionBid> {
  const { data } = await api.post(`/tickets/exchange/${exchangeId}/bid`, { bidCoins })
  return data
}

export async function getAuctionBids(exchangeId: string): Promise<AuctionBid[]> {
  const { data } = await api.get(`/tickets/exchange/${exchangeId}/bids`)
  return data
}

// My listings / purchases
export async function getMyListings(): Promise<ExchangeListing[]> {
  const { data } = await api.get('/tickets/my-listings')
  return data
}

export async function getMyPurchases(): Promise<ExchangeListing[]> {
  const { data } = await api.get('/tickets/my-purchases')
  return data
}

// Ticket game
export async function enterTicketGame(offerId: string): Promise<{ sessionId: string }> {
  const { data } = await api.post('/tickets/game/enter', { offerId })
  return data
}

export async function sendTap(sessionId: string, clientTimestamp: number): Promise<void> {
  await api.post(`/tickets/game/${sessionId}/tap`, { clientTimestamp })
}
