import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import toast from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';
import { FiEdit2, FiCheck, FiBarChart2, FiUsers, FiStar } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';

const AVATAR_EMOJIS = ['🎯', '🎲', '🎳', '🎰', '🃏', '🎱', '🏆', '⭐', '🔥', '💎', '🚀', '👑'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🎯');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) return toast.error('Username cannot be empty');
    setSaving(true);
    try {
      const res = await updateProfile({ username: username.trim(), avatar: selectedAvatar });
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { icon: FiBarChart2, label: 'Total Score', value: user?.totalScore ?? 0, color: '#6366f1' },
    { icon: FiUsers, label: 'Games Played', value: user?.gamesPlayed ?? 0, color: '#a855f7' },
    { icon: FiStar, label: 'Games Hosted', value: user?.gamesHosted ?? 0, color: '#f59e0b' },
    { icon: GiTrophy, label: 'Claims Won', value: user?.claimsWon ?? 0, color: '#22c55e' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0', margin: '0 0 0.25rem' }}>
            Your Profile
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage your account and view your stats</p>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(30,42,74,0.8))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', border: '3px solid rgba(99,102,241,0.4)',
                boxShadow: '0 0 30px rgba(99,102,241,0.3)',
              }}>
                {user?.avatar || '🎯'}
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.375rem' }}>Username</label>
                    <input
                      className="input-field"
                      style={{ maxWidth: '280px' }}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Avatar</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {AVATAR_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setSelectedAvatar(emoji)}
                          style={{
                            width: 44, height: 44, borderRadius: '50%', fontSize: '1.25rem',
                            cursor: 'pointer', border: selectedAvatar === emoji ? '2px solid #6366f1' : '2px solid transparent',
                            background: selectedAvatar === emoji ? 'rgba(99,102,241,0.2)' : 'rgba(30,42,74,0.5)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <button className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleSave} disabled={saving}>
                      <FiCheck size={16} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-outline" onClick={() => { setEditing(false); setUsername(user?.username || ''); setSelectedAvatar(user?.avatar || '🎯'); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.375rem' }}>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#e2e8f0', margin: 0 }}>
                      {user?.username}
                    </h2>
                    <button
                      id="edit-profile-btn"
                      className="btn-outline"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setEditing(true)}
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>{user?.email}</p>
                  <p style={{ color: '#475569', fontSize: '0.75rem' }}>
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Statistics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Profile;
