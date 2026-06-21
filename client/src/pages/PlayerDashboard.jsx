import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { joinRoom } from '../api/rooms';
import { getMyTicket } from '../api/games';
import Sidebar from '../components/common/Sidebar';
import TambolaTicket from '../components/player/TambolaTicket';
import NumberBoard from '../components/player/NumberBoard';
import ClaimButtons from '../components/player/ClaimButtons';
import LeaderboardPanel from '../components/common/LeaderboardPanel';
import Chat from '../components/common/Chat';
import Modal from '../components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiBarChart2, FiMessageCircle } from 'react-icons/fi';

const PlayerDashboard = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket, emit } = useSocket();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [game, setGame] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [highlightNew, setHighlightNew] = useState(null);
  const [claimedPrizes, setClaimedPrizes] = useState({});
  const [wonClaims, setWonClaims] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [finalScoreboard, setFinalScoreboard] = useState([]);
  // Mobile side panel tab
  const [sideTab, setSideTab] = useState('leaderboard');

  const audioCtxRef = useRef(null);

  const playCallSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) { navigate('/'); return; }
    setGame(null); setTicket(null); setCalledNumbers([]); setCurrentNumber(null);
    setHighlightNew(null); setClaimedPrizes({}); setWonClaims([]); setLeaderboard([]);
    setChatMessages([]); setJoined(false); setGameStatus('waiting');
    setShowWinnerModal(false); setWinnerInfo(null); setShowFinalModal(false); setFinalScoreboard([]);

    const join = async () => {
      try {
        const res = await joinRoom(code);
        setRoom(res.data.room);
        setJoined(true);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to join room');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    join();
  }, [code, navigate]);

  useEffect(() => {
    if (!socket || !code || !joined) return;
    emit('join_room', { roomCode: code, isHost: false });

    const onRoomJoined = (data) => {
      setRoom(data.room); setGameStatus(data.room.status);
      if (data.ticket) setTicket(data.ticket);
      if (data.game) {
        setGame(data.game);
        setCalledNumbers(data.game.calledNumbers || []);
        setCurrentNumber(data.game.currentNumber);
        setClaimedPrizes(data.game.claimedPrizes || {});
        setGameStatus(data.game.status);
      }
      if (data.chatHistory) setChatMessages(data.chatHistory);
    };

    const onGameStarted = async (data) => {
      setGame(data.game); setGameStatus('active');
      setLeaderboard(data.leaderboard || []);
      toast.success('Game has started! 🎯');
      try {
        const res = await getMyTicket(data.game._id);
        setTicket(res.data.ticket);
      } catch (_) {}
    };

    const onNumberCalled = (data) => {
      setCalledNumbers(data.calledNumbers || []);
      setCurrentNumber(data.number);
      setHighlightNew(data.number);
      playCallSound();
      setTimeout(() => setHighlightNew(null), 1000);
    };

    const onClaimApproved = (data) => {
      setLeaderboard(data.leaderboard || []);
      if (data.claim.player._id === user?._id || data.claim.player === user?._id) {
        setWonClaims((prev) => [...prev, data.claim.claimType]);
        setClaimedPrizes((prev) => ({ ...prev, [data.claim.claimType]: true }));
        toast.success(`Your ${data.claim.claimType} claim was approved! +${data.claim.pointsAwarded} pts 🎉`, { duration: 5000 });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setClaimedPrizes((prev) => ({ ...prev, [data.claim.claimType]: true }));
      }
    };

    const onClaimRejected = (data) => {
      const isMe = data.claim.player._id === user?._id || data.claim.player === user?._id;
      if (isMe) toast.error(`Your ${data.claim.claimType} claim was rejected`, { icon: '❌' });
    };

    const onWinnerAnnounced = (data) => {
      setWinnerInfo(data); setShowWinnerModal(true);
      if (data.winner?._id === user?._id || data.winner === user?._id) {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
      }
      setTimeout(() => setShowWinnerModal(false), 5000);
    };

    const onGamePaused = () => { setGameStatus('paused'); toast('Game paused by host ⏸️', { icon: '⏸️' }); };
    const onGameResumed = () => { setGameStatus('active'); toast.success('Game resumed! ▶️'); };
    const onGameEnded = (data) => {
      setGameStatus('ended');
      setFinalScoreboard(data.finalScoreboard || []);
      setShowFinalModal(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    };
    const onPlayerRemoved = (data) => {
      toast.error(data.message || 'You have been removed from the room');
      setTimeout(() => navigate('/'), 2000);
    };
    const onPlayerJoined = (data) => { toast(`${data.player?.username} joined`, { icon: '👋' }); };

    socket.on('room_joined', onRoomJoined);
    socket.on('game_started', onGameStarted);
    socket.on('number_called', onNumberCalled);
    socket.on('claim_approved', onClaimApproved);
    socket.on('claim_rejected', onClaimRejected);
    socket.on('winner_announced', onWinnerAnnounced);
    socket.on('game_paused', onGamePaused);
    socket.on('game_resumed', onGameResumed);
    socket.on('game_ended', onGameEnded);
    socket.on('player_removed', onPlayerRemoved);
    socket.on('player_joined', onPlayerJoined);

    return () => {
      socket.off('room_joined', onRoomJoined);
      socket.off('game_started', onGameStarted);
      socket.off('number_called', onNumberCalled);
      socket.off('claim_approved', onClaimApproved);
      socket.off('claim_rejected', onClaimRejected);
      socket.off('winner_announced', onWinnerAnnounced);
      socket.off('game_paused', onGamePaused);
      socket.off('game_resumed', onGameResumed);
      socket.off('game_ended', onGameEnded);
      socket.off('player_removed', onPlayerRemoved);
      socket.off('player_joined', onPlayerJoined);
    };
  }, [socket, code, joined, emit, user]);

  const isActive = gameStatus === 'active';
  const isPaused = gameStatus === 'paused';
  const isWaiting = gameStatus === 'waiting';
  const isEnded = gameStatus === 'ended';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3 }} />
      <p style={{ color: '#64748b', fontWeight: 500 }}>Joining room...</p>
    </div>
  );

  const statusBadgeClass = isActive ? 'badge-green' : isPaused ? 'badge-yellow' : isEnded ? 'badge-red' : 'badge-blue';
  const statusLabel = isActive ? '🟢 Live' : isPaused ? '⏸️ Paused' : isEnded ? '🔴 Ended' : '⏳ Waiting';

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="page-main">
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ paddingTop: '0' }} className="header-content">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', color: '#e2e8f0', margin: '0 0 0.3rem' }}>
              🎯 Playing Tambola
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Room</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#818cf8', letterSpacing: '0.1em', fontSize: '0.95rem' }}>{room?.roomCode}</span>
              <span className={`badge ${statusBadgeClass}`}>{statusLabel}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.78rem' }}>
                <FiUsers size={13} /> {room?.players?.length || 0}
              </div>
            </div>
          </div>

          {/* Current number */}
          {(isActive || isPaused) && currentNumber && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNumber}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320 }}
                style={{ textAlign: 'center', flexShrink: 0 }}
              >
                <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current</div>
                <div className="current-number-display" style={{ width: 72, height: 72, fontSize: '1.75rem' }}>
                  {currentNumber}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ── Waiting state ── */}
        {isWaiting && (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(30,42,74,0.8))' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem', animation: 'float 3s ease-in-out infinite' }}>⏳</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.3rem)' }}>Waiting for host to start...</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>You're in! Get ready for your ticket once the game begins.</p>
            <Chat roomCode={room?.roomCode} initialMessages={chatMessages} />
          </div>
        )}

        {/* ── Game layout ── */}
        {(isActive || isPaused || isEnded) && (
          <>
            {/* Desktop: two-column grid */}
            <div className="player-game-grid">
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <TambolaTicket ticket={ticket} calledNumbers={calledNumbers} highlightNew={highlightNew} />
                <NumberBoard calledNumbers={calledNumbers} currentNumber={currentNumber} />
                {!isEnded && (
                  <ClaimButtons
                    gameId={game?._id}
                    claimedPrizes={claimedPrizes}
                    wonClaims={wonClaims}
                    pointConfig={room?.pointConfig || game?.pointConfig}
                  />
                )}
              </div>

              {/* Right column — desktop only */}
              <div className="player-side-panel-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <LeaderboardPanel entries={leaderboard} />
                <Chat roomCode={room?.roomCode} initialMessages={chatMessages} />
              </div>
            </div>

            {/* Mobile side panel with tabs */}
            <div className="player-side-panel-mobile" style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', background: 'rgba(26,26,46,0.8)', borderRadius: '0.875rem 0.875rem 0 0', border: '1px solid rgba(99,102,241,0.14)', borderBottom: 'none', overflow: 'hidden' }}>
                <button
                  className={`mobile-tab-btn ${sideTab === 'leaderboard' ? 'active' : ''}`}
                  onClick={() => setSideTab('leaderboard')}
                >
                  <FiBarChart2 size={15} /> Leaderboard
                </button>
                <button
                  className={`mobile-tab-btn ${sideTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setSideTab('chat')}
                >
                  <FiMessageCircle size={15} /> Chat
                </button>
              </div>
              <div style={{ border: '1px solid rgba(99,102,241,0.14)', borderTop: 'none', borderRadius: '0 0 0.875rem 0.875rem', overflow: 'hidden' }}>
                {sideTab === 'leaderboard'
                  ? <LeaderboardPanel entries={leaderboard} />
                  : <Chat roomCode={room?.roomCode} initialMessages={chatMessages} />
                }
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Winner toast banner ── */}
      <AnimatePresence>
        {showWinnerModal && winnerInfo && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            style={{
              position: 'fixed', top: '1.25rem', left: '50%', transform: 'translateX(-50%)',
              zIndex: 100,
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '1px solid rgba(251,191,36,0.5)',
              borderRadius: '1rem', padding: '0.875rem 1.75rem',
              textAlign: 'center', minWidth: '260px', maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(251,191,36,0.2)',
            }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>🏆</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>
              {winnerInfo.winner?.username} won {winnerInfo.claimType}!
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem' }}>+{winnerInfo.points} points</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Final Scoreboard Modal ── */}
      <Modal isOpen={showFinalModal} onClose={() => setShowFinalModal(false)} title="🏆 Game Over — Final Results" maxWidth="500px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
          {[...finalScoreboard].sort((a, b) => b.score - a.score).map((entry, idx) => (
            <div key={idx} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem', borderRadius: '0.625rem',
              background: entry.username === user?.username ? 'rgba(99,102,241,0.15)' : idx === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(30,42,74,0.5)',
              border: `1px solid ${entry.username === user?.username ? 'rgba(99,102,241,0.4)' : idx === 0 ? 'rgba(251,191,36,0.3)' : 'rgba(99,102,241,0.1)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{['🥇', '🥈', '🥉'][idx] || `#${idx + 1}`}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {entry.username} {entry.username === user?.username ? '(You)' : ''}
                </span>
              </div>
              <span style={{ color: idx === 0 ? '#fbbf24' : '#6366f1', fontWeight: 700 }}>{entry.score} pts</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }} onClick={() => { setShowFinalModal(false); navigate('/'); }}>
          Back to Home
        </button>
      </Modal>

      <style>{`
        .header-content { padding-top: 0; }
        @media (max-width: 768px) {
          .header-content { padding-top: 2.75rem; }
        }
        /* Desktop: 2-column */
        .player-game-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 1.1rem;
        }
        .player-side-panel-mobile { display: none; }
        .player-side-panel-desktop { display: flex; }

        @media (max-width: 900px) {
          .player-game-grid { grid-template-columns: 1fr; }
          .player-side-panel-mobile { display: block; }
          .player-side-panel-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PlayerDashboard;
