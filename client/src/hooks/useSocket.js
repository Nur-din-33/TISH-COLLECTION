'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

// Returns a singleton socket connection
export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
    });
  }
  return socketInstance;
};

// React hook to listen for real-time events
export const useSocket = (eventName, callback) => {
  const socket = getSocket();
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handler = (...args) => cbRef.current(...args);
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, socket]);

  return socket;
};

// Hook for admin: join admin room to get live order notifications
export const useAdminSocket = () => {
  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit('join-admin');
    return () => socket.disconnect();
  }, [socket]);

  return socket;
};
