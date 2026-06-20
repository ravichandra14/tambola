import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getGameHistory } from '../api/history';
import toast from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiCalendar, FiEye, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';

const CLAIM_LABELS = { earlyFive: 'Early Five', topLine: 'Top Line', middleLine: 'Middle Line', bottomLine: 'Bottom Line', fullHouse: 'Full House' };

const GameHistory = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameDetail, setGameDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getHistory(page);
        setGames(res.data.games);
        setPagination(res.data.pagination);
      } catch (err) {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  const handleView = async (game) => {
    setSelectedGame(game);
    setDetailLoading(true);
    try {
      const res = await getGameHistory(game._id);
      setGameDetail(res.data);
    } catch (err) {
      toast.error('Failed to load game details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!gameDetail) return;
    const doc = new jsPDF();
    const { game, leaderboard } = gameDetail;

    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('Tambola Game Results', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Room Code: ${game.roomCode}`, 20, 35);
    doc.text(`Date: ${new Date(game.startedAt).toLocaleDateString()}`, 20, 45);
    doc.text(`Players: ${game.playerCount}`, 20, 55);
    doc.text(`Numbers Called: ${game.calledNumbers?.length || 0}`, 20, 65);

    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241);
    doc.text('Final Leaderboard', 20, 80);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
    sorted.forEach((entry, idx) => {
      doc.text(`${idx + 1}. ${entry.username} — ${entry.score} pts (${entry.claimsWon?.join(', ') || 'none'})`, 20, 95 + idx * 10);
    });

    doc.save(`tambola-${game.roomCode}-${new Date(game.startedAt).toLocaleDateString()}.pdf`);
    toast.success('PDF exported!');
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return '—';
    const diff = Math.floor((new Date(end) - new Date(start)) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0', margin: '0 0 0.25rem' }}>
            Game History
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Your past Tambola games and results</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : games.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
            <h3 style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>No games yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Host or play a game to see history here</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
              Start Playing
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {games.map((game, idx) => (
                <motion.div
                  key={game._id}
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                      🎯
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em' }}>
                          {game.roomCode}
                        </span>
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Completed</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiCalendar size={12} /> {new Date(game.startedAt).toLocaleDateString()}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiUsers size={12} /> {game.playerCount} players
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiClock size={12} /> {formatDuration(game.startedAt, game.endedAt)}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          📞 {game.calledNumbers?.length || 0} numbers called
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    onClick={() => handleView(game)}
                  >
                    <FiEye size={15} /> View Details
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button className="btn-outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <span style={{ display: 'flex', alignItems: 'center', color: '#64748b', padding: '0 0.75rem', fontSize: '0.875rem' }}>
                  {page} / {pagination.pages}
                </span>
                <button className="btn-outline" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Game Detail Modal */}
      <Modal isOpen={!!selectedGame} onClose={() => { setSelectedGame(null); setGameDetail(null); }} title={`Game ${selectedGame?.roomCode}`} maxWidth="560px">
        {detailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : gameDetail ? (
          <div>
            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Date', value: new Date(gameDetail.game.startedAt).toLocaleDateString() },
                { label: 'Duration', value: formatDuration(gameDetail.game.startedAt, gameDetail.game.endedAt) },
                { label: 'Players', value: gameDetail.game.playerCount },
                { label: 'Numbers Called', value: gameDetail.game.calledNumbers?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'rgba(30,42,74,0.5)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Winners / Claims */}
            {gameDetail.claims.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>Winners</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {gameDetail.claims.map((claim) => (
                    <div key={claim._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{claim.player?.username}</span>
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{CLAIM_LABELS[claim.claimType] || claim.claimType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>Final Leaderboard</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {[...gameDetail.leaderboard].sort((a, b) => b.score - a.score).map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', background: 'rgba(30,42,74,0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{['🥇', '🥈', '🥉'][idx] || `#${idx + 1}`}</span>
                    <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{entry.username}</span>
                  </div>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>{entry.score} pts</span>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportPDF}>
              <FiDownload size={16} /> Export as PDF
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default GameHistory;
