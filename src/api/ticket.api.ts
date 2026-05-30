import { api } from './axios';

export interface TicketEvent {
  id: string;
  ticketmasterId: string;
  eventName: string;
  artistName: string;
  celebrityId?: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  eventDate: string | null;
  imageUrl: string | null;
  ticketUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
}

export interface ExchangeListing {
  id: string;
  sellerId: string;
  sellerUsername: string;
  sellerAvatarUrl?: string;
  eventName: string;
  eventDate?: string;
  seatInfo?: string;
  quantity: number;
  listingType: 'fixed' | 'auction';
  askingPriceCoins?: number;
  startingBidCoins?: number;
  currentBid?: number;
  bidCount?: number;
  auctionEndsAt?: string;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  description?: string;
  ticketImageUrl?: string;
}

export interface CreateListingPayload {
  listingType: 'fixed' | 'auction';
  eventName: string;
  eventDate?: string;
  seatInfo?: string;
  quantity: number;
  askingPriceCoins?: number;
  startingBidCoins?: number;
  auctionDurationHours?: number;
  description?: string;
  ticketImageUrl?: string;
}

export async function getTicketEvents(page = 1, limit = 20, celebrityId?: string): Promise<{ events: TicketEvent[], total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (celebrityId) params.append('celebrityId', celebrityId);
  const { data } = await api.get(`/tickets/events?${params.toString()}`);
  return data;
}

export async function getExchangeListings(params: { type?: string; page?: number; limit?: number }) {
  const { data } = await api.get('/tickets/exchange', { params });
  return data; // { listings, total, page, totalPages }
}

export async function getExchangeListing(id: string) {
  const { data } = await api.get(`/tickets/exchange/${id}`);
  return data.listing;
}

export async function createListing(payload: CreateListingPayload) {
  const { data } = await api.post('/tickets/exchange', payload);
  return data.listing;
}

export async function buyFixedPrice(exchangeId: string) {
  const { data } = await api.post(`/tickets/exchange/${exchangeId}/buy`, {});
  return data;
}

export async function placeBid(exchangeId: string, bidCoins: number) {
  const { data } = await api.post(`/tickets/exchange/${exchangeId}/bid`, { bidCoins });
  return data.bid;
}

export async function cancelListing(exchangeId: string) {
  const { data } = await api.delete(`/tickets/exchange/${exchangeId}`);
  return data;
}

export async function getMyListings() {
  const { data } = await api.get('/tickets/my-listings');
  return data.listings;
}

export async function getMyPurchases() {
  const { data } = await api.get('/tickets/my-purchases');
  return data.purchases;
}