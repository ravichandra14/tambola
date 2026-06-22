import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitClaim } from '../../api/claims';
import { FiCheck, FiLock } from 'react-icons/fi';

const CLAIM_TYPES = [
  { key: 'earlyFive', label: 'Early 5', desc: 'First 5 matched', icon: '5️⃣', color: '#6366f1' },
  { key: 'topLine', label: 'Top Line', desc: 'Top row complete', icon: '⬆️', color: '#8b5cf6' },
  { key: 'middleLine', label: 'Middle', desc: 'Middle row complete', icon: '➡️', color: '#a855f7' },
  { key: 'bottomLine', label: 'Bottom', desc: 'Bottom row complete', icon: '⬇️', color: '#3b82f6' },
  { key: 'fullHouse', label: 'Full House', desc: 'All 15 matched', icon: '🏠', color: '#f59e0b' },
];

const ClaimButtons = ({ gameId, claimedPrizes = {}, wonClaims = [], pointConfig = {}, disabled = false }) => {
  const [claiming, setClaiming] = useState({});

  const handleClaim = async (claimType) => {
    if (claiming[claimType] || disabled) return;
    setClaiming((prev) => ({ ...prev, [claimType]: true }));
    try {
      await submitClaim({ gameId, claimType });
      toast.success(`${claimType} claim submitted! Waiting for host...`, { icon: '🎯' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit claim';
      toast.error(msg, { icon: '❌' });
    } finally {
      setClaiming((prev) => ({ ...prev, [claimType]: false }));
    }
  };

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', marginBottom: '0.875rem', fontSize: '1rem' }}>
        🎯 Submit Claims
      </h3>

      {/* Mobile: 2-column grid | Desktop: 1-column list */}
      <div className="claims-grid">
        {CLAIM_TYPES.map(({ key, label, desc, icon, color }) => {
          const isWon = wonClaims.includes(key);
          const isTaken = claimedPrizes[key] && !isWon;
          const points = pointConfig[key] || 0;
          const isClaiming = claiming[key];

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '0.625rem',
                background: isWon
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.06))'
                  : isTaken
                    ? 'rgba(239,68,68,0.06)'
                    : `linear-gradient(135deg, ${color}10, rgba(30,42,74,0.5))`,
                border: isWon
                  ? '1px solid rgba(34,197,94,0.3)'
                  : isTaken
                    ? '1px solid rgba(239,68,68,0.2)'
                    : `1px solid ${color}28`,
                transition: 'all 0.2s',
              }}
            >
              {/* Top row: icon + label + points */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.875rem' }}>{label}</span>
                </div>
                {points > 0 && (
                  <span className="badge badge-yellow" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>+{points}pts</span>
                )}
              </div>

              {/* Desc row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569', fontSize: '0.72rem' }}>{desc}</span>

                {/* Action button / status */}
                {isWon ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4ade80', fontWeight: 700, fontSize: '0.8rem' }}>
                    <FiCheck size={14} /> Won!
                  </div>
                ) : isTaken ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f87171', fontWeight: 600, fontSize: '0.8rem' }}>
                    <FiLock size={13} /> Taken
                  </div>
                ) : (
                  <button
                    id={`claim-btn-${key}`}
                    onClick={() => handleClaim(key)}
                    disabled={isClaiming || disabled}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: (isClaiming || disabled) ? 'rgba(30,42,74,0.5)' : `linear-gradient(135deg, ${color}, ${color}cc)`,
                      color: (isClaiming || disabled) ? '#64748b' : 'white',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: (isClaiming || disabled) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      minHeight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      flexShrink: 0,
                    }}
                  >
                    {disabled ? '📶' : isClaiming ? '...' : 'Claim!'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .claims-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .claims-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          .claims-grid > div:last-child:nth-child(odd) {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
};

export default ClaimButtons;
