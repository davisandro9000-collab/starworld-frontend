import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import { getMatchTicketListings, buyTicketListing } from '../../api/football';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  open: boolean;
  onClose: () => void;
  matchId: string;
}

export default function TicketResaleModal({ open, onClose, matchId }: Props) {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const { data: listings, isLoading } = useQuery({
    queryKey: ['ticket-listings', matchId],
    queryFn: () => getMatchTicketListings(matchId),
    enabled: open,
  });

  const buyMutation = useMutation({
    mutationFn: (listingId: string) => buyTicketListing(listingId, crypto.randomUUID()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-listings', matchId] });
      alert('Ticket purchased! Coins deducted.');
    },
  });

  if (!user) return <Modal open={open} onClose={onClose} title="Login Required"><p>Please login to buy tickets.</p></Modal>;
  if (isLoading) return <Modal open={open} onClose={onClose} title="Loading..."><Spinner /></Modal>;

  return (
    <Modal open={open} onClose={onClose} title="Resale Tickets">
      {listings?.length === 0 && <p>No tickets available for resale.</p>}
      <div className="space-y-3">
        {listings?.map(listing => (
          <div key={listing.id} className="bg-sw-card-2 p-3 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-white font-medium">{listing.priceCoins} coins</p>
              <p className="text-white/60 text-sm">Seat: {listing.seatInfo || 'General'}</p>
              <p className="text-white/40 text-xs">Seller: {listing.seller.username}</p>
            </div>
            <button
              onClick={() => buyMutation.mutate(listing.id)}
              disabled={buyMutation.isPending}
              className="btn-gold text-sm px-3 py-1"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}