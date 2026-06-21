import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { createRoom } from '../api/rooms';
import { FiPlus, FiUsers, FiBarChart2, FiClock, FiStar, FiArrowRight } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import Sidebar from '../components/common/Sidebar';

const StatCard = ({ icon: Icon, label, value, color = '#6366f1' }) => (
  <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
    <div style={{
      width: 44, height: 44, borderRadius: '12px',
      background: `${color}22`,
      border: `1px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningRoom, setJoiningRoom] = useState(false);

  const handleCreateRoom = async () => {
    setCreatingRoom(true);
    try {
      const res = await createRoom({});
      toast.success(`Room ${res.data.room.roomCode} created!`);
      navigate(`/host?room=${res.data.room.roomCode}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return toast.error('Enter a room code');
    navigate(`/play?code=${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem', animation: 'fadeInUp 0.4s ease' }}>
          {/* Mobile spacer for hamburger button */}
          <div style={{ height: '0' }} className="mobile-top-spacer" />
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
            color: '#e2e8f0', margin: '0 0 0.35rem',
            paddingLeft: '0',
          }}>
            Welcome back, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Ready to play some Tambola?</p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.875rem',
          marginBottom: '1.75rem',
          animation: 'fadeInUp 0.5s ease',
        }}
          className="stats-grid"
        >
          <StatCard icon={FiBarChart2} label="Total Score" value={user?.totalScore ?? 0} color="#6366f1" />
          <StatCard icon={FiUsers} label="Games Played" value={user?.gamesPlayed ?? 0} color="#a855f7" />
          <StatCard icon={FiStar} label="Games Hosted" value={user?.gamesHosted ?? 0} color="#f59e0b" />
          <StatCard icon={GiTrophy} label="Claims Won" value={user?.claimsWon ?? 0} color="#22c55e" />
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
          animation: 'fadeInUp 0.6s ease',
        }}>
          {/* Host a Game */}
          <div className="card" style={{
            background: 'linear-gradient(145deg, rgba(99,102,241,0.12), rgba(30,42,74,0.85))',
            border: '1px solid rgba(99,102,241,0.22)',
            padding: '1.5rem',
            cursor: 'default',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
              }}>🎮</div>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: '0 0 0.2rem', fontSize: '1.1rem' }}>Host a Game</h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Create a room and invite players</p>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.65 }}>
              Set up a game room, configure points, and call numbers in manual or auto mode.
            </p>
            <button
              id="create-room-btn"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }}
              onClick={handleCreateRoom}
              disabled={creatingRoom}
            >
              {creatingRoom
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</>
                : <><FiPlus size={18} /> Create Room</>
              }
            </button>
          </div>

          {/* Join a Game */}
          <div className="card" style={{
            background: 'linear-gradient(145deg, rgba(168,85,247,0.1), rgba(30,42,74,0.85))',
            border: '1px solid rgba(168,85,247,0.2)',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 6px 20px rgba(168,85,247,0.4)',
              }}>🎫</div>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: '0 0 0.2rem', fontSize: '1.1rem' }}>Join a Game</h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Enter a room code to play</p>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.65 }}>
              Got a room code? Enter it below to join the game and get your Tambola ticket.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="join-code-input"
                className="input-field"
                style={{ flex: 1, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em', fontSize: '1rem' }}
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                maxLength={6}
              />
              <button
                id="join-room-btn"
                className="btn-primary"
                onClick={handleJoinRoom}
                disabled={joiningRoom}
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', flexShrink: 0 }}
              >
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', animation: 'fadeInUp 0.7s ease' }}>
          <button className="btn-outline" style={{ fontSize: '0.875rem' }} onClick={() => navigate('/history')}>
            <FiClock size={15} /> View History
          </button>
          <button className="btn-outline" style={{ fontSize: '0.875rem' }} onClick={() => navigate('/leaderboard')}>
            <FiBarChart2 size={15} /> Leaderboard
          </button>
        </div>
      </main>

      {/* Mobile hamburger top spacing style */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-top-spacer { height: 3rem !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
