import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { getRoomByCode } from '../api/rooms';
import { startGame } from '../api/games';
import Sidebar from '../components/common/Sidebar';
import NumberCaller from '../components/host/NumberCaller';
import PlayerList from '../components/host/PlayerList';
import PointConfig from '../components/host/PointConfig';
import ClaimsPanel from '../components/host/ClaimsPanel';
import NumberBoard from '../components/player/NumberBoard';
import LeaderboardPanel from '../components/common/LeaderboardPanel';
import Chat from '../components/common/Chat';
import Modal from '../components/common/Modal';
import { FiCopy, FiPlay, FiShare2 } from 'react-icons/fi';

const HostDashboard = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket, emit, connected } = useSocket();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [claims, setClaims] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [finalScoreboard, setFinalScoreboard] = useState([]);

  const audioCtxRef = useRef(null);

  const playCallSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch { /* Optional browser feature unavailable. */ }
  };

  const playWinSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      
      const playTone = (freq, type, startTime, duration, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0 },    // C5
        { f: 659.25, t: 0.12 }, // E5
        { f: 783.99, t: 0.24 }, // G5
        { f: 1046.50, t: 0.36 } // C6
      ];
      notes.forEach((note, index) => {
        const isLast = index === notes.length - 1;
        const duration = isLast ? 0.8 : 0.15;
        playTone(note.f, 'square', now + note.t, duration, 0.08);
        playTone(note.f, 'sawtooth', now + note.t, duration, 0.08);
      });
    } catch { /* Optional browser feature unavailable. */ }
  };

  const playGameOverSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      
      const playTone = (freq, type, startTime, duration, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      notes.forEach((freq, i) => {
        playTone(freq, 'sine', now + i * 0.06, 0.3, 0.15);
        playTone(freq * 2, 'triangle', now + i * 0.06, 0.3, 0.05);
      });
    } catch { /* */ }
  };

  const roomCode = searchParams.get('room');

  useEffect(() => {
    if (!roomCode) { navigate('/'); return; }
    setGame(null); setCalledNumbers([]); setCurrentNumber(null);
    setClaims([]); setLeaderboard([]); setChatMessages([]);
    setStarting(false); setShowFinalModal(false); setFinalScoreboard([]);

    const fetchRoom = async () => {
      try {
        const res = await getRoomByCode(roomCode);
        if (res.data.room.host._id !== user?._id) {
          toast.error('You are not the host of this room!');
          navigate(`/play?code=${roomCode}`);
          return;
        }
        setRoom(res.data.room);
        setPlayers(res.data.room.players || []);
      } catch (err) {
        toast.error('Room not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomCode, navigate, user]);

  useEffect(() => {
    if (!socket || !roomCode) return;
    if (!connected) return;
    emit('join_room', { roomCode }, (result) => {
      if (!result?.success) toast.error(result?.error || 'Unable to rejoin room');
    });

    const onRoomJoined = (data) => {
      setRoom(data.room); setPlayers(data.room.players || []);
      if (data.game) { setGame(data.game); setCalledNumbers(data.game.calledNumbers || []); setCurrentNumber(data.game.currentNumber); }
      if (data.chatHistory) setChatMessages(data.chatHistory);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
      if (data.claims) setClaims(data.claims);
    };
    const onPresenceChanged = (data) => {
      if (data.players) setPlayers(data.players);
      else setPlayers((prev) => prev.map((entry) => (entry.user?._id || entry.user) === data.playerId
        ? { ...entry, connected: data.connected, lastSeenAt: data.lastSeenAt }
        : entry));
    };
    const onPlayerJoined = (data) => { setPlayers(data.players || []); toast(`${data.player?.username} joined!`, { icon: '👋' }); };
    const onPlayerLeft = (data) => { setPlayers((prev) => prev.filter((p) => (p.user?._id || p._id) !== data.playerId)); if (!data.removed) toast('Player left', { icon: '👋' }); };
    const onNumberCalled = (data) => {
      setCalledNumbers(data.calledNumbers || []);
      setCurrentNumber(data.number);
      setGame((current) => current ? {
        ...current,
        currentNumber: data.number,
        calledNumbers: data.calledNumbers || [],
        remainingNumbers: current.remainingNumbers
          ? current.remainingNumbers.slice(1)
          : Array(data.remaining).fill(0),
        _remaining: data.remaining,
      } : current);
      playCallSound();
    };
    const onClaimSubmitted = (data) => { setClaims((prev) => [...prev, data.claim]); toast(`${data.claim?.player?.username} submitted ${data.claim?.claimType} claim!`, { icon: '🎯' }); };
    const onClaimApproved = (data) => { setClaims((prev) => prev.filter((c) => c._id !== data.claim._id)); setLeaderboard(data.leaderboard || []); };
    const onClaimRejected = (data) => { setClaims((prev) => prev.filter((c) => c._id !== data.claim._id)); };
    const onGameStarted = (data) => {
      setGame(data.game);
      setRoom((prev) => prev ? { ...prev, status: 'active' } : prev);
    };
    const onGamePaused = () => setGame((g) => g ? { ...g, status: 'paused' } : g);
    const onGameResumed = () => setGame((g) => g ? { ...g, status: 'active' } : g);
    const onGameEnded = (data) => {
      setGame((g) => g ? { ...g, status: 'ended' } : g);
      setFinalScoreboard(data.finalScoreboard || []);
      setShowFinalModal(true);
      playGameOverSound();
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    };
    const onWinnerAnnounced = (data) => {
      playWinSound();
      toast(`🏆 ${data.winner?.username} won ${data.claimType}! (+${data.points} pts)`, { duration: 5000, icon: '🎉' });
    };
    const onAllNumbersCalled = () => {
      toast('All 90 numbers have been called!', { icon: '✅', duration: 5000 });
      setGame((g) => g ? { ...g, _remaining: 0 } : g);
    };

    socket.on('room_joined', onRoomJoined);
    socket.on('presence_changed', onPresenceChanged);
    socket.on('player_joined', onPlayerJoined);
    socket.on('player_left', onPlayerLeft);
    socket.on('number_called', onNumberCalled);
    socket.on('claim_submitted', onClaimSubmitted);
    socket.on('claim_approved', onClaimApproved);
    socket.on('claim_rejected', onClaimRejected);
    socket.on('game_started', onGameStarted);
    socket.on('game_paused', onGamePaused);
    socket.on('game_resumed', onGameResumed);
    socket.on('game_ended', onGameEnded);
    socket.on('winner_announced', onWinnerAnnounced);
    socket.on('all_numbers_called', onAllNumbersCalled);

    return () => {
      socket.off('room_joined', onRoomJoined);
      socket.off('presence_changed', onPresenceChanged);
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_left', onPlayerLeft);
      socket.off('number_called', onNumberCalled);
      socket.off('claim_submitted', onClaimSubmitted);
      socket.off('claim_approved', onClaimApproved);
      socket.off('claim_rejected', onClaimRejected);
      socket.off('game_started', onGameStarted);
      socket.off('game_paused', onGamePaused);
      socket.off('game_resumed', onGameResumed);
      socket.off('game_ended', onGameEnded);
      socket.off('winner_announced', onWinnerAnnounced);
      socket.off('all_numbers_called', onAllNumbersCalled);
    };
  }, [socket, roomCode, emit, connected]);

  const handleStartGame = async () => {
    if (!room?._id) return;
    setStarting(true);
    try {
      const res = await startGame(room._id);
      setGame(res.data.game);
      setRoom((prev) => prev ? { ...prev, status: 'active' } : prev);
      toast.success('Game started! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room?.roomCode || '');
    toast.success('Room code copied!');
  };

  const handleShareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join my Tambola game!', text: `Use code ${room?.roomCode} to join!` });
      } catch { /* Optional browser feature unavailable. */ }
    } else {
      handleCopyCode();
    }
  };

  const handleClaimsUpdate = (claimId) => {
    setClaims((prev) => prev.filter((c) => c._id !== claimId));
  };

  const isWaiting = !game || game?.status === 'waiting';
  const isActive = game?.status === 'active' || game?.status === 'paused';
  const isEnded = game?.status === 'ended';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3 }} />
      <p style={{ color: '#64748b', fontWeight: 500 }}>Loading room...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="page-main">
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="host-header-left">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', color: '#e2e8f0', margin: '0 0 0.35rem' }}>
              🎮 Host Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Room Code:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)', borderRadius: '0.625rem', padding: '0.3rem 0.875rem' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#818cf8', letterSpacing: '0.18em', fontSize: '1rem' }}>
                  {room?.roomCode}
                </span>
                <button id="copy-code-btn" onClick={handleCopyCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '2px' }}>
                  <FiCopy size={15} />
                </button>
                {/* Share button (native share on mobile) */}
                <button onClick={handleShareCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '2px' }}>
                  <FiShare2 size={15} />
                </button>
              </div>
              <span className={`badge ${room?.status === 'active' ? 'badge-green' : room?.status === 'paused' ? 'badge-yellow' : 'badge-blue'}`}>
                {room?.status || 'waiting'}
              </span>
            </div>
          </div>

          {isWaiting && players.length > 0 && (
            <button id="start-game-btn" className="btn-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '1rem', flexShrink: 0 }} onClick={handleStartGame} disabled={starting}>
              <FiPlay size={18} />
              {starting ? 'Starting...' : 'Start Game'}
            </button>
          )}
        </div>

        {/* ── Main Grid ── */}
        <div className="host-game-grid">
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {isActive || isEnded ? (
              <>
                <NumberBoard calledNumbers={calledNumbers} currentNumber={currentNumber} />
                <LeaderboardPanel entries={leaderboard} />
              </>
            ) : (
              <>
                <PointConfig room={room} onUpdate={setRoom} />
                <div className="card" style={{ textAlign: 'center', padding: '2.25rem 1.5rem' }}>
                  {players.length === 0 ? (
                    <>
                      <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem', animation: 'float 3s ease-in-out infinite' }}>⏳</div>
                      <h3 style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '0.5rem' }}>Waiting for players...</h3>
                      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Share the room code{' '}
                        <strong style={{ color: '#818cf8', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.1em' }}>{room?.roomCode}</strong>{' '}
                        to invite players
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }}>🚀</div>
                      <h3 style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '0.5rem' }}>
                        {players.length} player{players.length > 1 ? 's' : ''} ready!
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Click "Start Game" to begin</p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {(isActive || isEnded) && <NumberCaller game={game} room={room} onGameUpdate={setGame} />}
            <PlayerList players={players} hostId={user?._id} roomCode={room?.roomCode} gameActive={isActive || isEnded} />
            {(isActive || isEnded) && <ClaimsPanel claims={claims} onClaimsUpdate={handleClaimsUpdate} />}
            <Chat roomCode={room?.roomCode} initialMessages={chatMessages} />
          </div>
        </div>
      </main>

      {/* ── Final Scoreboard Modal ── */}
      <Modal isOpen={showFinalModal} onClose={() => setShowFinalModal(false)} title="🏆 Game Over — Final Results" maxWidth="500px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
          {finalScoreboard.sort((a, b) => b.score - a.score).map((entry, idx) => (
            <div key={idx} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem', borderRadius: '0.625rem',
              background: idx === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(30,42,74,0.5)',
              border: `1px solid ${idx === 0 ? 'rgba(251,191,36,0.3)' : 'rgba(99,102,241,0.1)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{['🥇', '🥈', '🥉'][idx] || `#${idx + 1}`}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{entry.username}</span>
              </div>
              <span style={{ color: idx === 0 ? '#fbbf24' : '#6366f1', fontWeight: 700 }}>{entry.score} pts</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }} onClick={() => navigate('/history')}>
          View Full History
        </button>
      </Modal>

      <style>{`
        .host-header-left { padding-top: 0; }
        @media (max-width: 768px) {
          .host-header-left { padding-top: 2.75rem; }
        }
        /* Desktop: 2-column */
        .host-game-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 1.25rem;
        }
        @media (max-width: 900px) {
          .host-game-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HostDashboard;
