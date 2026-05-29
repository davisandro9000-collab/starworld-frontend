// src/hooks/useSocketEvents.ts
import { useEffect } from 'react';
import { getUserSocket, disconnectUserSocket } from '../lib/socketClient';
import { useAuthStore } from '../stores/authStore';
import { useNotifStore, AppNotification } from '../stores/notifStore';

export const useSocketEvents = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const addNotification = useNotifStore((state) => state.addNotification);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getUserSocket(accessToken);
    socket.connect();

    // Helper to create a notification object matching AppNotification
    const createNotif = (
      title: string,
      body: string,
      type: string,
      priority: 'high' | 'normal' | 'low' = 'normal',
      accentColor?: string
    ): AppNotification => ({
      id: Date.now().toString(),
      type,
      title,
      body,
      priority,
      accentColor,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // --- Live feed (global winner announcements)
    socket.on('live_feed', (data: { winnerName: string; prizeName: string; starName: string }) => {
      console.log('🎉 Live feed:', data);
      addNotification(
        createNotif(
          'Someone won!',
          `${data.winnerName} won ${data.prizeName} from ${data.starName}!`,
          'live_feed',
          'normal',
          '#FFD700'
        )
      );
    });

    // --- Auction updates (when you are in the auction room)
    socket.on('auction_update', (data: { exchangeId: string; currentBid: number; leader: string; timeRemaining: number }) => {
      console.log('💰 Auction update:', data);
      addNotification(
        createNotif(
          'Auction update',
          `New bid: ${data.currentBid} coins`,
          'auction',
          'normal',
          '#00E5FF'
        )
      );
    });

    // --- Leaderboard updates (optional – you can store in a separate store)
    socket.on('leaderboard_update', (data: Array<{ username: string; totalCoins: number }>) => {
      console.log('🏆 Leaderboard update:', data);
      // Example: update a leaderboard store if you have one
    });

    // --- Ticket game offer (when you win a cash prize)
    socket.on('ticket_game_offer', (data: { offerId: string; prize: any; expiresAt: string }) => {
      console.log('🎮 Ticket game offer:', data);
      addNotification(
        createNotif(
          'Ticket game offer!',
          `You won a cash prize! Wager it for a concert ticket?`,
          'ticket_game_offer',
          'high',
          '#E5E4E2'
        )
      );
    });

    // --- Ticket game start (when a match is found)
    socket.on('ticket_game_start', (data: { sessionId: string; opponentName: string; prizeDetails: any; serverTimestamp: number }) => {
      console.log('⚔️ Ticket game started:', data);
      // You could navigate to the game page or show a modal here
    });

    // --- Ticket game result
    socket.on('ticket_game_result', (data: { winnerId: string; sessionId: string }) => {
      console.log('🏁 Ticket game result:', data);
      const userId = useAuthStore.getState().user?.id;
      const isWinner = data.winnerId === userId;
      addNotification(
        createNotif(
          isWinner ? 'You won!' : 'You lost',
          'The ticket game has ended.',
          'ticket_game_result',
          'high',
          isWinner ? '#22C55E' : '#EF4444'
        )
      );
    });

    // --- Coin update (when balance changes)
    socket.on('coin_update', (data: { newBalance: number }) => {
      console.log('🪙 Coin update:', data);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({ ...currentUser, coinBalance: data.newBalance });
      }
    });

    // Cleanup on unmount or token change
    return () => {
      socket.off('live_feed');
      socket.off('auction_update');
      socket.off('leaderboard_update');
      socket.off('ticket_game_offer');
      socket.off('ticket_game_start');
      socket.off('ticket_game_result');
      socket.off('coin_update');
      disconnectUserSocket();
    };
  }, [accessToken, addNotification, setUser]);
};