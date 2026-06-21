import { useSocket } from '../../context/SocketContext';

const ConnectionBanner = () => {
  const { online, connected } = useSocket();
  if (online && connected) return null;

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
