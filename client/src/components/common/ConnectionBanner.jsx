import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';

const ConnectionBanner = () => {
  const { online, connected, socket } = useSocket();
  // Only show banner if the user has an active socket (i.e., is logged in)
  // and has been connected before but lost connection.
  // A 2-second grace period prevents flashing on initial page load.
  const [showBanner, setShowBanner] = useState(false);
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (connected) {
      setWasConnected(true);
      setShowBanner(false);
      return;
    }
    // No socket at all (not logged in) — never show banner
    if (!socket) {
      setShowBanner(false);
      return;
    }
    // Socket exists but not yet connected — wait grace period before showing
    const timer = setTimeout(() => {
      // Only show if we had a prior connection (avoids initial-load flash)
      if (wasConnected) setShowBanner(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [connected, socket, wasConnected]);

  if (!showBanner || (online && connected)) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        zIndex: 10000,
        left: '50%',
        top: '0.75rem',
        transform: 'translateX(-50%)',
        padding: '0.55rem 1rem',
        borderRadius: '999px',
        color: '#fff',
        background: online ? '#d97706' : '#dc2626',
        boxShadow: '0 8px 24px rgba(0,0,0,.35)',
        fontSize: '0.82rem',
        fontWeight: 700,
      }}
    >
      {online ? 'Reconnecting to the game…' : 'You are offline — your game state is safe'}
    </div>
  );
};

export default ConnectionBanner;
