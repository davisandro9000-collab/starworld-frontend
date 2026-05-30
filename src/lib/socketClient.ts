// src/lib/socketClient.ts
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let userSocket: Socket | null = null;

export const getUserSocket = (token: string): Socket => {
  if (!userSocket) {
    // If SOCKET_URL is empty, connect to current origin
    const url = SOCKET_URL || undefined;
    userSocket = io(url, {
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