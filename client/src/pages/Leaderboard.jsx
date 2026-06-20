import Sidebar from '../components/common/Sidebar';
import LeaderboardPanel from '../components/common/LeaderboardPanel';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();

  // Mock entries for now — in production would fetch from /api/leaderboard global
  const demoEntries = [
    { player: { _id: user?._id }, username: user?.username || 'You', score: user?.totalScore || 0, claimsWon: [] },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', maxWidth: '700px' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0', margin: '0 0 0.25rem' }}>
            🏆 Leaderboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Top players across all games</p>
        </div>

        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏅</div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0', marginBottom: '0.5rem' }}>Global Leaderboard</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Your lifetime stats are tracked on your profile. Global leaderboard shows top scorers across all completed games.
          </p>

          <div style={{ background: 'rgba(30,42,74,0.5)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem', borderRadius: '0.5rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🥇</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{user?.username}</span>
              </div>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>{user?.totalScore || 0} pts</span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
              Play more games to climb the ranks!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
