import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setSocket((current) => {
        current?.disconnect();
        return null;
      });
      setConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const backendUrl = import.meta.env.VITE_API_URL || '/';

    const nextSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.4,
    });

    setSocket(nextSocket);
    nextSocket.on('connect', () => setConnected(true));
    nextSocket.on('disconnect', () => setConnected(false));
    nextSocket.on('connect_error', () => setConnected(false));

    return () => {
      nextSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  const emit = useCallback((event, data, acknowledge) => {
    if (!socket?.connected) {
      acknowledge?.({ success: false, error: 'Connection unavailable' });
      return false;
    }
    socket.emit(event, data, acknowledge);
    return true;
  }, [socket]);

  const on = useCallback((event, handler) => {
    socket?.on(event, handler);
    return () => socket?.off(event, handler);
  }, [socket]);

  const off = useCallback((event, handler) => socket?.off(event, handler), [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, online, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
