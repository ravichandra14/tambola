import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitClaim } from '../../api/claims';
import { FiCheck, FiLock } from 'react-icons/fi';

const CLAIM_TYPES = [
  { key: 'earlyFive', label: 'Early Five', desc: 'First 5 numbers matched', icon: '5️⃣' },
  { key: 'topLine', label: 'Top Line', desc: 'All top row matched', icon: '⬆️' },
  { key: 'middleLine', label: 'Middle Line', desc: 'All middle row matched', icon: '➡️' },
  { key: 'bottomLine', label: 'Bottom Line', desc: 'All bottom row matched', icon: '⬇️' },
  { key: 'fullHouse', label: 'Full House', desc: 'All 15 numbers matched', icon: '🏠' },
];

const ClaimButtons = ({ gameId, claimedPrizes = {}, wonClaims = [], pointConfig = {} }) => {
  const [claiming, setClaiming] = useState({});

  const handleClaim = async (claimType) => {
    if (claiming[claimType]) return;
    setClaiming((prev) => ({ ...prev, [claimType]: true }));

    try {
      await submitClaim({ gameId, claimType });
      toast.success(`${claimType} claim submitted! Waiting for host approval...`, { icon: '🎯' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit claim';
      toast.error(msg, { icon: '❌' });
    } finally {
      setClaiming((prev) => ({ ...prev, [claimType]: false }));
    }
  };

  return (
    <div className="card">
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>
        🎯 Submit Claims
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {CLAIM_TYPES.map(({ key, label, desc, icon }) => {
          const isWon = wonClaims.includes(key);
          const isTaken = claimedPrizes[key] && !isWon;
          const points = pointConfig[key] || 0;

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: isWon
                  ? 'rgba(34,197,94,0.1)'
                  : isTaken
                  ? 'rgba(239,68,68,0.05)'
                  : 'rgba(30,42,74,0.5)',
                border: isWon
                  ? '1px solid rgba(34,197,94,0.3)'
                  : isTaken
                  ? '1px solid rgba(239,68,68,0.2)'
                  : '1px solid rgba(99,102,241,0.1)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{icon}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                  {points > 0 && (
                    <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>+{points} pts</span>
                  )}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', paddingLeft: '1.5rem' }}>{desc}</div>
              </div>

              {isWon ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontWeight: 600, fontSize: '0.875rem' }}>
                  <FiCheck size={16} /> Won!
                </div>
              ) : isTaken ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 600, fontSize: '0.875rem' }}>
                  <FiLock size={14} /> Taken
                </div>
              ) : (
                <button
                  id={`claim-btn-${key}`}
                  className="claim-btn available"
                  onClick={() => handleClaim(key)}
                  disabled={claiming[key]}
                >
                  {claiming[key] ? '...' : 'Claim'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClaimButtons;
