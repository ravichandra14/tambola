import { motion } from 'framer-motion';

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const CLAIM_LABELS = {
  earlyFive: 'E5', topLine: 'TL', middleLine: 'ML', bottomLine: 'BL', fullHouse: 'FH',
};

const LeaderboardPanel = ({ entries = [], title = 'Leaderboard' }) => {
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  return (
    <div className="card">
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', marginBottom: '0.875rem' }}>
        🏆 {title}
      </h3>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#475569', fontSize: '0.875rem' }}>
          No scores yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '320px', overflowY: 'auto' }}>
          {sorted.map((entry, idx) => {
            const rank = idx + 1;
            const isTop = rank <= 3;
            return (
              <motion.div
                key={entry.player?._id || entry.player || idx}
                className={`leaderboard-row ${isTop ? `top-${rank}` : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Rank */}
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: rank <= 3 ? '1.25rem' : '0.9rem', color: '#64748b' }}>
                  {RANK_MEDALS[rank] || `#${rank}`}
                </div>

                {/* Player */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, hsl(${(entry.username?.charCodeAt(0) ?? 0) * 10 % 360}, 70%, 50%), hsl(${(entry.username?.charCodeAt(0) ?? 0) * 10 % 360}, 70%, 35%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.75rem'
                  }}>
                    {entry.username?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.username}
                    </div>
                    {entry.claimsWon?.length > 0 && (
                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                        {entry.claimsWon.map((c) => (
                          <span key={c} className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                            {CLAIM_LABELS[c] || c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#d97706' : '#6366f1', fontSize: '1.1rem' }}>
                  {entry.score}
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 400, fontFamily: 'Inter' }}>pts</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPanel;
