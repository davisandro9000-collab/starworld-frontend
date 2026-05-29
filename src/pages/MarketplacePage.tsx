import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExchangeListings } from '../api/ticket.api';
import { useTicketStore } from '../features/tickets/ticketStore';
import ExchangeListingCard from '../features/tickets/ExchangeListing';
import CreateListingModal from '../features/tickets/CreateListingModal';
import Spinner from '../components/ui/Spinner';
import { useAuthStore } from '../stores/authStore';

const FILTERS = [
  { label: 'All',     value: 'all'     },
  { label: 'Fixed',   value: 'fixed'   },
  { label: 'Auction', value: 'auction' },
] as const;

export default function MarketplacePage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    listings, filterType, setListings, setFilterType,
    createModalOpen, setCreateModalOpen
  } = useTicketStore();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['exchange-listings', filterType, page],
    queryFn: () => getExchangeListings({
      type: filterType === 'all' ? undefined : filterType,
      page,
      limit: 12,
    }),
    enabled: !!accessToken,  // ✅ only fetch when user is authenticated
    staleTime: 30_000,
  });

  useEffect(() => {
    if (data) setListings(data.listings, data.total, data.page);
  }, [data, setListings]);

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">
            Ticket <span className="text-gold-gradient">Marketplace</span>
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Buy and sell concert tickets with coins</p>
        </div>
        {accessToken && (
          <button className="btn-gold" onClick={() => setCreateModalOpen(true)}>
            + List a Ticket
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setFilterType(f.value); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filterType === f.value
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-sw-border bg-sw-card text-white/50 hover:border-sw-border-2 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
        {data && (
          <span className="ml-auto text-white/30 text-sm self-center">
            {data.total} listing{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="card p-10 text-center space-y-3">
          <p className="text-white/40">Failed to load listings.</p>
          <button className="btn-outline" onClick={() => refetch()}>Retry</button>
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-16 text-center space-y-4">
          <p className="text-5xl">🎫</p>
          <p className="font-heading font-semibold text-white">No listings yet</p>
          <p className="text-white/40 text-sm">Be the first to list a ticket on the marketplace.</p>
          {accessToken && (
            <button className="btn-gold mx-auto" onClick={() => setCreateModalOpen(true)}>
              + List a Ticket
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {listings.map(l => (
              <ExchangeListingCard key={l.id} listing={l} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                className="btn-outline px-4 py-2 text-sm disabled:opacity-30"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Prev
              </button>
              <span className="self-center text-white/40 text-sm">
                {page} / {totalPages}
              </span>
              <button
                className="btn-outline px-4 py-2 text-sm disabled:opacity-30"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Create modal */}
      <CreateListingModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => { setCreateModalOpen(false); refetch(); }}
      />
    </div>
  );
}