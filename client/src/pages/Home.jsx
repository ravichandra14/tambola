import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { createRoom } from '../api/rooms';
import { FiPlus, FiUsers, FiBarChart2, FiClock, FiStar } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import Sidebar from '../components/common/Sidebar';

const StatCard = ({ icon: Icon, label, value, color = '#6366f1' }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</div>
      </div>
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.4s ease' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#e2e8f0', margin: '0 0 0.375rem' }}>
            Welcome back, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p style={{ color: '#64748b' }}>Ready to play some Tambola?</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease' }}>
          <StatCard icon={FiBarChart2} label="Total Score" value={user?.totalScore ?? 0} color="#6366f1" />
          <StatCard icon={FiUsers} label="Games Played" value={user?.gamesPlayed ?? 0} color="#a855f7" />
          <StatCard icon={FiStar} label="Games Hosted" value={user?.gamesHosted ?? 0} color="#f59e0b" />
          <StatCard icon={GiTrophy} label="Claims Won" value={user?.claimsWon ?? 0} color="#22c55e" />
        </div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', animation: 'fadeInUp 0.6s ease' }}>
          {/* Create Room */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(30,42,74,0.8))', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🎮</div>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0, fontSize: '1.1rem' }}>Host a Game</h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Create a room and invite players</p>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Set up a game room, configure points, and call numbers in manual or auto mode.
            </p>
            <button id="create-room-btn" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreateRoom} disabled={creatingRoom}>
              {creatingRoom ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</> : <><FiPlus size={18} /> Create Room</>}
            </button>
          </div>

          {/* Join Room */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(30,42,74,0.8))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🎫</div>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0, fontSize: '1.1rem' }}>Join a Game</h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Enter a room code to play</p>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Got a room code? Enter it below to join the game and get your Tambola ticket.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="join-code-input"
                className="input-field"
                style={{ flex: 1 }}
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                maxLength={6}
              />
              <button id="join-room-btn" className="btn-primary" onClick={handleJoinRoom} disabled={joiningRoom}>
                <FiUsers size={18} /> Join
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', animation: 'fadeInUp 0.7s ease' }}>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }} onClick={() => navigate('/history')}>
            <FiClock size={16} /> View History
          </button>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }} onClick={() => navigate('/leaderboard')}>
            <FiBarChart2 size={16} /> Leaderboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
