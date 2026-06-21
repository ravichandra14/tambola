import { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import LeaderboardPanel from '../components/common/LeaderboardPanel';
import { getLeaderboard } from '../api/leaderboard';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((response) => setEntries(response.data.entries))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: '700px' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0', margin: '0 0 0.25rem' }}>
            🏆 Global Leaderboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Lifetime rankings from completed games</p>
        </div>
        {loading ? <div className="spinner" /> : <LeaderboardPanel entries={entries} />}
      </main>
    </div>
  );
};

export default Leaderboard;
