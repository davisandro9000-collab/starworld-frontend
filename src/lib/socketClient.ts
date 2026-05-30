import { io, Socket } from 'socket.io-client';

// HARDCODED PRODUCTION URL – never Netlify
const SOCKET_URL = 'https://starworld-backend-production.up.railway.app';

let userSocket: Socket | null = null;

export const getUserSocket = (token: string): Socket => {
  if (!userSocket) {
    userSocket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
      autoConnect: false,
    });
  }
  return userSocket;
};

export const disconnectUserSocket = () => {
  if (userSocket) {
    userSocket.disconnect();
    userSocket = null;
  }
};