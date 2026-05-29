import { io, Socket } from 'socket.io-client';

let userSocket: Socket | null = null;

export const getUserSocket = (token: string): Socket => {
  if (!userSocket) {
    userSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
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