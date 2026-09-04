import { io } from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost'
  ? `http://localhost:5000`
  : window.location.origin;

let socket = null;
const listeners = new Map();

export function connectSocket() {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function onSocketEvent(event, callback) {
  if (!socket) connectSocket();

  // Track listeners for cleanup
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(callback);

  socket.on(event, callback);
}

export function offSocketEvent(event, callback) {
  if (!socket) return;
  socket.off(event, callback);

  if (listeners.has(event)) {
    const cbs = listeners.get(event).filter(cb => cb !== callback);
    if (cbs.length === 0) listeners.delete(event);
    else listeners.set(event, cbs);
  }
}

export function emitSocketEvent(event, data) {
  if (!socket) connectSocket();
  socket.emit(event, data);
}

export function getSocket() {
  return socket;
}
