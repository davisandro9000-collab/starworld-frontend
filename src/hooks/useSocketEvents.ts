// src/hooks/useSocketEvents.ts
import { useEffect } from 'react';
import { getUserSocket, disconnectUserSocket } from '../lib/socketClient';
import { useAuthStore } from '../stores/authStore';
import { useNotifStore, AppNotification } from '../stores/notifStore';
import { useCoinStore } from '../stores/coinStore';

export const useSocketEvents = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const addNotification = useNotifStore((state) => state.addNotification);
  const setBalance = useCoinStore((state) => state.setBalance);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getUserSocket(accessToken);
    socket.connect();

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

    socket.on('live_feed', (data) => {
      console.log('🎉 Live feed:', data);
      addNotification(createNotif(
        'Someone won!',
        `${data.winnerName} won ${data.prizeName} from ${data.starName}!`,
        'live_feed',
        'normal',
        '#FFD700'
      ));
    });

    socket.on('auction_update', (data) => {
      console.log('💰 Auction update:', data);
      addNotification(createNotif(
        'Auction update',
        `New bid: ${data.currentBid} coins`,
        'auction',
        'normal',
        '#00E5FF'
      ));
    });

    socket.on('leaderboard_update', (data) => {
      console.log('🏆 Leaderboard update:', data);
    });

    socket.on('ticket_game_offer', (data) => {
      console.log('🎮 Ticket game offer:', data);
      addNotification(createNotif(
        'Ticket game offer!',
        `You won a cash prize! Wager it for a concert ticket?`,
        'ticket_game_offer',
        'high',
        '#E5E4E2'
      ));
    });

    socket.on('ticket_game_start', (data) => {
      console.log('⚔️ Ticket game started:', data);
    });

    socket.on('ticket_game_result', (data) => {
      console.log('🏁 Ticket game result:', data);
      const userId = useAuthStore.getState().user?.id;
      const isWinner = data.winnerId === userId;
      addNotification(createNotif(
        isWinner ? 'You won!' : 'You lost',
        'The ticket game has ended.',
        'ticket_game_result',
        'high',
        isWinner ? '#22C55E' : '#EF4444'
      ));
    });

    socket.on('coin_update', (data) => {
      console.log('🪙 Coin update:', data);
      setBalance(data.newBalance);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({ ...currentUser, coinBalance: data.newBalance });
      }
    });

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
  }, [accessToken, addNotification, setUser, setBalance]);
};