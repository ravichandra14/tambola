import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  FiHome, FiGrid, FiUsers, FiClock, FiBarChart2,
  FiUser, FiLogOut, FiWifi, FiWifiOff
} from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';

const navItems = [
  { to: '/', icon: FiHome, label: 'Home' },
  { to: '/leaderboard', icon: FiBarChart2, label: 'Leaderboard' },
  { to: '/history', icon: FiClock, label: 'Game History' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            🎯
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0' }}>
              Tambola
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Housie Online</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Connection status */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(99,102,241,0.12)' }}>
        {/* Connection indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(15,15,26,0.5)' }}>
          {connected
            ? <><FiWifi size={14} color="#4ade80" /><span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Connected</span></>
            : <><FiWifiOff size={14} color="#f87171" /><span style={{ fontSize: '0.75rem', color: '#f87171' }}>Offline</span></>
          }
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: 'white', fontSize: '0.875rem', flexShrink: 0
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
