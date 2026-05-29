import { create } from 'zustand'
import { ExchangeListing, AuctionBid } from '../../api/ticket.api'

interface TicketStore {
  // Marketplace listings
  listings: ExchangeListing[]
  total: number
  page: number
  filterType: 'all' | 'fixed' | 'auction'
  setListings: (listings: ExchangeListing[], total: number, page: number) => void
  setFilterType: (type: 'all' | 'fixed' | 'auction') => void

  // Active listing detail
  activeListing: ExchangeListing | null
  activeBids: AuctionBid[]
  setActiveListing: (listing: ExchangeListing | null) => void
  setActiveBids: (bids: AuctionBid[]) => void
  updateActiveBid: (bid: AuctionBid) => void

  // My listings
  myListings: ExchangeListing[]
  setMyListings: (listings: ExchangeListing[]) => void

  // Create listing modal
  createModalOpen: boolean
  setCreateModalOpen: (open: boolean) => void
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  listings: [],
  total: 0,
  page: 1,
  filterType: 'all',
  setListings: (listings, total, page) => set({ listings, total, page }),
  setFilterType: (filterType) => set({ filterType }),

  activeListing: null,
  activeBids: [],
  setActiveListing: (activeListing) => set({ activeListing }),
  setActiveBids: (activeBids) => set({ activeBids }),
  updateActiveBid: (bid) => {
    const bids = get().activeBids
    const exists = bids.findIndex(b => b.id === bid.id)
    if (exists >= 0) {
      const updated = [...bids]
      updated[exists] = bid
      set({ activeBids: updated })
    } else {
      // New bid — prepend and mark previous winning as false
      const updated = bids.map(b => ({ ...b, isWinning: false }))
      set({ activeBids: [bid, ...updated] })
    }
  },

  myListings: [],
  setMyListings: (myListings) => set({ myListings }),

  createModalOpen: false,
  setCreateModalOpen: (createModalOpen) => set({ createModalOpen }),
}))
