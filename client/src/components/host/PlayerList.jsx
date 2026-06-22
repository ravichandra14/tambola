import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { FiUserX } from 'react-icons/fi';

const PlayerList = ({ players = [], hostId, roomCode, gameActive = false }) => {
  const { emit } = useSocket();
  const [removing, setRemoving] = useState(null);

  const handleRemove = async (playerId, username) => {
    if (!window.confirm(`Remove ${username} from the room?`)) return;
    setRemoving(playerId);
    try {
      emit('remove_player', { roomCode, playerId });
      toast.success(`${username} removed`);
    } catch (err) {
      toast.error('Failed to remove player');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          👥 Players
        </h3>
        <span className="badge badge-blue">{players.length}</span>
      </div>

      {players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>
          No players yet — share the room code!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
          {players.map((entry) => {
            const player = entry.user || entry;
            const isHost = player._id === hostId;
            const isOnline = Boolean(entry.connected);
            return (
              <div
                key={player._id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  background: isOnline ? 'rgba(30,42,74,0.5)' : 'rgba(15,15,26,0.6)',
                  border: `1px solid ${isOnline ? 'rgba(99,102,241,0.08)' : 'rgba(239,68,68,0.12)'}`,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Avatar with online/offline ring */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `linear-gradient(135deg, hsl(${(player.username?.charCodeAt(0) ?? 0) * 10 % 360}, 70%, 50%), hsl(${(player.username?.charCodeAt(0) ?? 0) * 10 % 360}, 70%, 35%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.8rem',
                      opacity: isOnline ? 1 : 0.5,
                    }}>
                      {player.username?.[0]?.toUpperCase()}
                    </div>
                    {/* Status dot */}
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 9, height: 9, borderRadius: '50%',
                      background: isOnline ? '#4ade80' : '#475569',
                      border: '1.5px solid #0f0f1a',
                      animation: isOnline ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                    }} />
                  </div>
                  <div>
                    <div style={{ color: isOnline ? '#e2e8f0' : '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{player.username}</div>
                    <div style={{ color: isOnline ? '#4ade80' : '#ef4444', fontSize: '0.68rem', fontWeight: 500 }}>
                      {isOnline ? '● Online' : '○ Offline'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isHost && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Host</span>}
                  {!isHost && !gameActive && (
                    <button
                      onClick={() => handleRemove(player._id, player.username)}
                      disabled={removing === player._id}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem', display: 'flex', alignItems: 'center', opacity: removing === player._id ? 0.5 : 1 }}
                      title="Remove player"
                    >
                      <FiUserX size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerList;
