import { useState } from 'react';
import { getUserSocket } from '../../lib/socketClient';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

export const RealTimeTest = () => {
  const [auctionId, setAuctionId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const token = useAuthStore((state) => state.accessToken);
  const socket = token ? getUserSocket(token) : null;

  const joinAuction = () => {
    if (!auctionId.trim() || !socket) return;
    socket.emit('join_auction', auctionId);
    setJoinedRoom(auctionId);
    console.log(`Joined auction room: ${auctionId}`);
  };

  const leaveAuction = () => {
    if (!joinedRoom || !socket) return;
    socket.emit('leave_auction', joinedRoom);
    setJoinedRoom(null);
    console.log(`Left auction room: ${joinedRoom}`);
  };

  if (!socket) return null;

  return (
    <div className="p-4 bg-stake-card rounded-lg">
      <h3 className="text-white font-bold mb-2">Socket.IO Test Panel</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Auction ID"
          value={auctionId}
          onChange={(e) => setAuctionId(e.target.value)}
          className="bg-stake-dark text-white px-3 py-1 rounded"
        />
        <Button onClick={joinAuction} variant="gold" size="sm">Join Auction</Button>
        {joinedRoom && <Button onClick={leaveAuction} variant="outline" size="sm">Leave</Button>}
      </div>
      {joinedRoom && <p className="text-green-400 text-sm mt-2">Listening to auction: {joinedRoom}</p>}
    </div>
  );
};