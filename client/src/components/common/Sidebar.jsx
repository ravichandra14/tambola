import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  FiHome, FiClock, FiBarChart2,
  FiUser, FiLogOut, FiWifi, FiWifiOff, FiMenu, FiX
} from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';

const navItems = [
  { to: '/', icon: FiHome, label: 'Home' },
  { to: '/leaderboard', icon: FiBarChart2, label: 'Leaderboard' },
  { to: '/history', icon: FiClock, label: 'History' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

/* ── Desktop sidebar content ─────────────────────────────── */
const SidebarContent = ({ user, connected, onLogout, onClose }) => (
  <>
    {/* Logo */}
    <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', flexShrink: 0,
          boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
        }}>
          🎯
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#e2e8f0' }}>
            Tambola
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Housie Online</div>
        </div>
      </div>
      {/* Close button (mobile drawer only) */}
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: '4px' }}>
          <FiX size={20} />
        </button>
      )}
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    {/* Footer */}
    <div style={{ padding: '0.875rem 0.75rem', borderTop: '1px solid rgba(99,102,241,0.12)' }}>
      {/* Connection indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(15,15,26,0.6)' }}>
        {connected
          ? <><FiWifi size={13} color="#4ade80" /><span style={{ fontSize: '0.73rem', color: '#4ade80', fontWeight: 500 }}>Connected</span></>
          : <><FiWifiOff size={13} color="#f87171" /><span style={{ fontSize: '0.73rem', color: '#f87171', fontWeight: 500 }}>Offline</span></>
        }
      </div>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', padding: '0.5rem', borderRadius: '0.625rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, color: 'white', fontSize: '0.875rem', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.username}
          </div>
          <div style={{ color: '#475569', fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="sidebar-item"
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', marginTop: '2px' }}
      >
        <FiLogOut size={17} />
        <span>Logout</span>
      </button>
    </div>
  </>
);

/* ── Main Sidebar component ──────────────────────────────── */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────── */}
      <aside className="sidebar">
        <SidebarContent user={user} connected={connected} onLogout={handleLogout} onClose={null} />
      </aside>

      {/* ── Mobile Hamburger Button ──────────────── */}
      <button
        className="hamburger-btn"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation"
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 70 }}
      >
        <FiMenu size={20} />
      </button>

      {/* ── Mobile Drawer Overlay ────────────────── */}
      {drawerOpen && (
        <div
          className="mobile-drawer-overlay open"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              user={user}
              connected={connected}
              onLogout={handleLogout}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ────────────────── */}
      <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={label}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          className="bottom-nav-item"
          onClick={handleLogout}
          aria-label="Logout"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
