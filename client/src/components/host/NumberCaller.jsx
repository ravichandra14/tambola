import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { callNumber, pauseGame, resumeGame, endGame } from '../../api/games';
import { updateRoom } from '../../api/rooms';
import { useSocket } from '../../context/SocketContext';
import { FiPlay, FiPause, FiSquare, FiSkipForward, FiZap } from 'react-icons/fi';

const NumberCaller = ({ game, room, onGameUpdate, onRoomUpdate }) => {
  const { socket, emit } = useSocket();
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(room?.numberCallingMode === 'auto');
  const [autoRunning, setAutoRunning] = useState(false);
  const [interval, setIntervalVal] = useState(room?.autoInterval || 5);
  const [currentDisplay, setCurrentDisplay] = useState(game?.currentNumber || null);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => setCurrentDisplay(data.number);
    socket.on('number_called', handler);
    return () => socket.off('number_called', handler);
  }, [socket]);

  const handleCallNext = async () => {
    if (!game?._id || loading) return;
    setLoading(true);
    try {
      emit('call_number', { roomCode: room.roomCode, gameId: game._id });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuto = async () => {
    if (autoRunning) {
      emit('stop_auto_call', { gameId: game._id });
      setAutoRunning(false);
      toast('Auto-calling stopped', { icon: '⏸️' });
    } else {
      // Update interval setting
      await updateRoom(room._id, { numberCallingMode: 'auto', autoInterval: interval });
      emit('start_auto_call', { roomCode: room.roomCode, gameId: game._id });
      setAutoRunning(true);
      toast(`Auto-calling every ${interval}s`, { icon: '⚡' });
    }
  };

  const handlePause = async () => {
    if (autoRunning) {
      emit('stop_auto_call', { gameId: game._id });
      setAutoRunning(false);
    }
    try {
      await pauseGame(game._id);
      onGameUpdate?.({ ...game, status: 'paused' });
      toast('Game paused', { icon: '⏸️' });
    } catch (err) {
      toast.error('Failed to pause game');
    }
  };

  const handleResume = async () => {
    try {
      await resumeGame(game._id);
      onGameUpdate?.({ ...game, status: 'active' });
      toast('Game resumed!', { icon: '▶️' });
    } catch (err) {
      toast.error('Failed to resume game');
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('Are you sure you want to end the game?')) return;
    if (autoRunning) {
      emit('stop_auto_call', { gameId: game._id });
      setAutoRunning(false);
    }
    try {
      await endGame(game._id);
      toast.success('Game ended!');
    } catch (err) {
      toast.error('Failed to end game');
    }
  };

  const isActive = game?.status === 'active';
  const isPaused = game?.status === 'paused';
  const remaining = game?.remainingNumbers?.length ?? (90 - (game?.calledNumbers?.length ?? 0));

  return (
    <div className="card">
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>
        📞 Number Caller
      </h3>

      {/* Current number display */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <AnimatePresence mode="wait">
          {currentDisplay ? (
            <motion.div
              key={currentDisplay}
              className="current-number-display"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {currentDisplay}
            </motion.div>
          ) : (
            <div className="current-number-display" style={{ background: 'rgba(30,42,74,0.8)', boxShadow: 'none', color: '#475569', fontSize: '1.5rem' }}>
              —
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(30,42,74,0.5)', borderRadius: '0.5rem', padding: '0.625rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6366f1' }}>
            {game?.calledNumbers?.length ?? 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Called</div>
        </div>
        <div style={{ background: 'rgba(30,42,74,0.5)', borderRadius: '0.5rem', padding: '0.625rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
            {remaining}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Remaining</div>
        </div>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`btn-outline`}
          style={{
            flex: 1, fontSize: '0.8rem', padding: '0.5rem',
            background: !autoMode ? 'rgba(99,102,241,0.15)' : 'transparent',
            borderColor: !autoMode ? '#6366f1' : 'rgba(99,102,241,0.3)',
            color: !autoMode ? '#818cf8' : '#64748b'
          }}
          onClick={() => { setAutoMode(false); if (autoRunning) { emit('stop_auto_call', { gameId: game._id }); setAutoRunning(false); } }}
        >
          Manual
        </button>
        <button
          className="btn-outline"
          style={{
            flex: 1, fontSize: '0.8rem', padding: '0.5rem',
            background: autoMode ? 'rgba(99,102,241,0.15)' : 'transparent',
            borderColor: autoMode ? '#6366f1' : 'rgba(99,102,241,0.3)',
            color: autoMode ? '#818cf8' : '#64748b'
          }}
          onClick={() => setAutoMode(true)}
        >
          Auto
        </button>
      </div>

      {/* Auto interval */}
      {autoMode && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.375rem' }}>Interval</div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {[3, 5, 10, 15].map((sec) => (
              <button
                key={sec}
                onClick={() => setIntervalVal(sec)}
                style={{
                  flex: 1, padding: '0.375rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: interval === sec ? 'rgba(99,102,241,0.2)' : 'rgba(30,42,74,0.5)',
                  borderColor: interval === sec ? '#6366f1' : 'rgba(99,102,241,0.15)',
                  color: interval === sec ? '#818cf8' : '#64748b',
                }}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {isActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {!autoMode ? (
            <button
              id="call-next-btn"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
              onClick={handleCallNext}
              disabled={loading || remaining === 0}
            >
              <FiSkipForward size={18} />
              {remaining === 0 ? 'All Called!' : 'Call Next Number'}
            </button>
          ) : (
            <button
              id="auto-call-btn"
              className={autoRunning ? 'btn-danger' : 'btn-primary'}
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', background: autoRunning ? 'linear-gradient(135deg,#ef4444,#dc2626)' : undefined }}
              onClick={handleToggleAuto}
              disabled={remaining === 0}
            >
              <FiZap size={18} />
              {autoRunning ? `Stop Auto (${interval}s)` : `Start Auto (${interval}s)`}
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-outline" style={{ flex: 1, padding: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.875rem' }} onClick={handlePause}>
              <FiPause size={16} /> Pause
            </button>
            <button className="btn-danger" style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem' }} onClick={handleEnd}>
              End Game
            </button>
          </div>
        </div>
      )}

      {isPaused && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-success" style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={handleResume}>
            <FiPlay size={16} /> Resume
          </button>
          <button className="btn-danger" style={{ flex: 1, padding: '0.75rem', fontSize: '0.875rem' }} onClick={handleEnd}>
            End Game
          </button>
        </div>
      )}
    </div>
  );
};

export default NumberCaller;
