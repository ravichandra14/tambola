import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { approveClaim, rejectClaim } from '../../api/claims';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const CLAIM_LABELS = {
  earlyFive: 'Early Five',
  topLine: 'Top Line',
  middleLine: 'Middle Line',
  bottomLine: 'Bottom Line',
  fullHouse: 'Full House',
};

const CLAIM_ICONS = {
  earlyFive: '5️⃣',
  topLine: '⬆️',
  middleLine: '➡️',
  bottomLine: '⬇️',
  fullHouse: '🏠',
};

const ClaimsPanel = ({ claims = [], onClaimsUpdate }) => {
  const [processing, setProcessing] = useState({});

  const handleApprove = async (claimId) => {
    setProcessing((p) => ({ ...p, [claimId]: 'approving' }));
    try {
      await approveClaim(claimId);
      toast.success('Claim approved! 🎉');
      onClaimsUpdate?.(claimId, 'approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve claim');
    } finally {
      setProcessing((p) => ({ ...p, [claimId]: null }));
    }
  };

  const handleReject = async (claimId) => {
    setProcessing((p) => ({ ...p, [claimId]: 'rejecting' }));
    try {
      await rejectClaim(claimId);
      toast('Claim rejected', { icon: '❌' });
      onClaimsUpdate?.(claimId, 'rejected');
    } catch (err) {
      toast.error('Failed to reject claim');
    } finally {
      setProcessing((p) => ({ ...p, [claimId]: null }));
    }
  };

  const pendingClaims = claims.filter((c) => c.status === 'pending');

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          📋 Pending Claims
        </h3>
        {pendingClaims.length > 0 && (
          <span className="badge badge-yellow">{pendingClaims.length} pending</span>
        )}
      </div>

      {pendingClaims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#475569' }}>
          <FiClock size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
          <p style={{ fontSize: '0.875rem' }}>No pending claims</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <AnimatePresence>
            {pendingClaims.map((claim) => (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{CLAIM_ICONS[claim.claimType]}</span>
                      <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                        {CLAIM_LABELS[claim.claimType]}
                      </span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                      by <strong style={{ color: '#cbd5e1' }}>{claim.player?.username}</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {new Date(claim.submittedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    id={`approve-${claim._id}`}
                    className="btn-success"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                    onClick={() => handleApprove(claim._id)}
                    disabled={!!processing[claim._id]}
                  >
                    <FiCheck size={14} />
                    {processing[claim._id] === 'approving' ? '...' : 'Approve'}
                  </button>
                  <button
                    id={`reject-${claim._id}`}
                    className="btn-danger"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                    onClick={() => handleReject(claim._id)}
                    disabled={!!processing[claim._id]}
                  >
                    <FiX size={14} />
                    {processing[claim._id] === 'rejecting' ? '...' : 'Reject'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ClaimsPanel;
