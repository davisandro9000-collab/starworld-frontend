// src/lib/socketClient.ts
import { io, Socket } from 'socket.io-client';

const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
// Direct Railway backend URL – WebSockets cannot be proxied by Netlify
const SOCKET_URL = isProd
  ? 'https://starworld-backend-production.up.railway.app'
  : 'http://localhost:3001';

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