import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext';

const ConnectionBanner = () => {
  const { online, connected, socket } = useSocket();
  // Use a ref so the setTimeout closure always reads the latest value
  const hasEverConnected = useRef(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (connected) {
      hasEverConnected.current = true;
      setShow(false);
      return;
    }

    // No socket → user not logged in → never show
    if (!socket) {
      setShow(false);
      return;
    }

    // Socket exists but disconnected.
    // Wait 1.5s grace period so brief reconnects don't flash the banner.
    // Only show if we've been connected at least once (avoids initial-load flash).
    const timer = setTimeout(() => {
      if (hasEverConnected.current) setShow(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [connected, socket]); // ← no 'hasEverConnected' dep (it's a ref, not state)

  if (!show) return null;

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
        padding: '0.55rem 1.1rem',
        borderRadius: '999px',
        color: '#fff',
        background: online ? '#d97706' : '#dc2626',
        boxShadow: '0 8px 24px rgba(0,0,0,.4)',
        fontSize: '0.82rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.85 }} />
      {online ? 'Reconnecting to the game…' : 'You are offline — your game state is safe'}
    </div>
  );
};

export default ConnectionBanner;
