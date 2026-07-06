import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

let socket = null;

export function connectSocket(userId) {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
  });

  socket.on('connect', function () {
    socket.emit('join', userId);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}